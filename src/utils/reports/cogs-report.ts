import {
  IIndexedPackageData,
  IIndexedRichOutgoingTransferData,
  IPackageFilter,
  IPluginState,
  IRichDestinationData,
  ITransferFilter,
} from "@/interfaces";
import { primaryDataLoader } from "@/modules/data-loader/data-loader.module";
import { ReportsMutations, ReportType } from "@/store/page-overlay/modules/reports/consts";
import {
  IReportConfig,
  IReportData,
  IReportsState,
} from "@/store/page-overlay/modules/reports/interfaces";
import { ActionContext } from "vuex";
import { getIsoDateFromOffset, todayIsodate } from "../date";

interface ICogsReportFormFilters {
  cogsDateGt: string;
  cogsDateLt: string;
}

export const cogsFormFiltersFactory: () => ICogsReportFormFilters = () => ({
  cogsDateGt: todayIsodate(),
  cogsDateLt: todayIsodate(),
});

export function addCogsReport({
  reportConfig,
  cogsFormFilters,
}: {
  reportConfig: IReportConfig;
  cogsFormFilters: ICogsReportFormFilters;
}) {
  const packageFilter: IPackageFilter = {};
  const transferFilter: ITransferFilter = {};

  packageFilter.packagedDateGt = cogsFormFilters.cogsDateGt;
  packageFilter.packagedDateLt = cogsFormFilters.cogsDateLt;

  transferFilter.estimatedArrivalDateGt = cogsFormFilters.cogsDateGt;
  transferFilter.estimatedArrivalDateLt = cogsFormFilters.cogsDateLt;

  reportConfig[ReportType.COGS] = {
    packageFilter,
    transferFilter,
    fields: null,
  };
}

export async function maybeLoadCogsReportData({
  ctx,
  reportData,
  reportConfig,
}: {
  ctx: ActionContext<IReportsState, IPluginState>;
  reportData: IReportData;
  reportConfig: IReportConfig;
}) {
  if (!reportConfig[ReportType.COGS]) {
    throw new Error("Bad config");
  }

  const { packageFilter, transferFilter } = reportConfig[ReportType.COGS] as {
    packageFilter: IPackageFilter;
    transferFilter: ITransferFilter;
  };

  ctx.commit(ReportsMutations.SET_STATUS, { statusMessage: "Loading packages..." });

  let packages: IIndexedPackageData[] = [];

  try {
    packages = [...packages, ...(await primaryDataLoader.activePackages())];
  } catch (e) {
    ctx.commit(ReportsMutations.SET_STATUS, {
      statusMessage: "Failed to load active packages.",
    });
  }

  try {
    packages = [...packages, ...(await primaryDataLoader.inactivePackages())];
  } catch (e) {
    ctx.commit(ReportsMutations.SET_STATUS, {
      statusMessage: "Failed to load inactive packages.",
    });
  }

  packages = packages.filter((pkg) => {
    // if (packageFilter.packagedDateLt) {
    //   if (pkg.PackagedDate > packageFilter.packagedDateLt) {
    //     return false;
    //   }
    // }

    // if (packageFilter.packagedDateEq) {
    //   if (!pkg.PackagedDate.startsWith(packageFilter.packagedDateEq)) {
    //     return false;
    //   }
    // }

    // if (packageFilter.packagedDateGt) {
    //   if (pkg.PackagedDate < packageFilter.packagedDateGt) {
    //     return false;
    //   }
    // }

    return true;
  });

  let richOutgoingTransfers: IIndexedRichOutgoingTransferData[] = [];

  try {
    richOutgoingTransfers = [
      ...richOutgoingTransfers,
      ...(await primaryDataLoader.outgoingTransfers()),
    ];
  } catch (e) {
    ctx.commit(ReportsMutations.SET_STATUS, {
      statusMessage: "Failed to load outgoing transfers.",
    });
  }

  try {
    richOutgoingTransfers = [
      ...richOutgoingTransfers,
      ...(await primaryDataLoader.outgoingInactiveTransfers()),
    ];
  } catch (e) {
    ctx.commit(ReportsMutations.SET_STATUS, {
      statusMessage: "Failed to load outgoing inactive transfers.",
    });
  }

  // Assumption: a transfer will not sit around for 90 days
  const createdDateBufferGt = getIsoDateFromOffset(
    -90,
    transferFilter.estimatedDepartureDateGt as string
  );
  const createdDateBufferLt = getIsoDateFromOffset(
    90,
    transferFilter.estimatedDepartureDateLt as string
  );
  const departureDateBufferGt = (transferFilter.estimatedDepartureDateGt as string).split("T")[0];
  const departureDateBufferLt = getIsoDateFromOffset(
    1,
    transferFilter.estimatedDepartureDateLt as string
  ).split("T")[0];
  richOutgoingTransfers = richOutgoingTransfers.filter((richOutgoingTransfer) => {
    if (richOutgoingTransfer.CreatedDateTime < createdDateBufferGt) {
      return false;
    }

    if (richOutgoingTransfer.CreatedDateTime > createdDateBufferLt) {
      return false;
    }
    return true;
  });

  for (const transfer of richOutgoingTransfers) {
    transfer.outgoingDestinations = (await primaryDataLoader.transferDestinations(transfer.Id))
      .map((x) => ({ ...x, packages: [] }))
      .filter((destination) => {
        if (!destination.ShipmentTypeName.includes("Wholesale")) {
          return false;
        }

        if (destination.EstimatedDepartureDateTime < departureDateBufferGt) {
          return false;
        }

        if (destination.EstimatedDepartureDateTime > departureDateBufferLt) {
          return false;
        }

        return true;
      });
  }

  // TODO parallelize
  for (const transfer of richOutgoingTransfers) {
    for (const destination of transfer.outgoingDestinations as IRichDestinationData[]) {
      destination.packages = await primaryDataLoader.destinationPackages(destination.Id);
    }
  }

  reportData[ReportType.COGS] = {
    packages,
    packageCostCalculationData: [],
    richOutgoingTransfers,
  };
}

import { MessageType, SHEETS_API_MESSAGE_TIMEOUT_MS, SheetTitles } from "@/consts";
import {
  IIndexedDestinationPackageData,
  IIndexedPackageData,
  IIndexedRichOutgoingTransferData,
  IPackageFilter,
  IPluginState,
  IRichDestinationData,
  ISpreadsheet,
  ITransferFilter,
} from "@/interfaces";
import { clientBuildManager } from "@/modules/client-build-manager.module";
import { DataLoader, getDataLoaderByLicense } from "@/modules/data-loader/data-loader.module";
import { facilityManager } from "@/modules/facility-manager.module";
import { messageBus } from "@/modules/message-bus.module";
import { toastManager } from "@/modules/toast-manager.module";
import store from "@/store/page-overlay/index";
import { ReportsMutations, ReportType } from "@/store/page-overlay/modules/reports/consts";
import {
  IReportConfig,
  IReportData,
  IReportsState,
} from "@/store/page-overlay/modules/reports/interfaces";
import { ActionContext } from "vuex";
import { getIsoDateFromOffset, todayIsodate } from "../date";
import {
  extractChildPackageTagQuantityUnitSetsFromHistory,
  extractInitialPackageQuantityAndUnitFromHistoryOrError,
} from "../history";
import {
  getDelimiterSeparatedValuesOrError,
  getLabelOrError,
  getSourcePackageTags,
} from "../package";
import {
  addRowsRequestFactory,
  alternatingRowStyleRequestFactory,
  autoResizeDimensionsRequestFactory,
  extractSheetIdOrError,
  freezeTopRowRequestFactory,
  hideColumnsRequestFactory,
  styleTopRowRequestFactory,
} from "../sheets";
import { appendSpreadsheetValues, readSpreadsheet, writeDataSheet } from "../sheets-export";

interface ICogsReportFormFilters {
  cogsDateGt: string;
  cogsDateLt: string;
  licenseOptions: string[];
  licenses: string[];
}

export const cogsV2FormFiltersFactory: () => ICogsReportFormFilters = () => ({
  cogsDateGt: todayIsodate(),
  cogsDateLt: todayIsodate(),
  licenseOptions: facilityManager.cachedFacilities.map((x) => x.licenseNumber),
  licenses: facilityManager.cachedFacilities
    .map((x) => x.licenseNumber)
    .filter((x) => x.startsWith("PR-") || x.startsWith("AU-P")),
});

export function addCogsV2Report({
  reportConfig,
  cogsV2FormFilters,
}: {
  reportConfig: IReportConfig;
  cogsV2FormFilters: ICogsReportFormFilters;
}) {
  const packageFilter: IPackageFilter = {};
  const transferFilter: ITransferFilter = {};

  const licenses: string[] = cogsV2FormFilters.licenses;

  packageFilter.packagedDateGt = cogsV2FormFilters.cogsDateGt;
  packageFilter.packagedDateLt = cogsV2FormFilters.cogsDateLt;

  transferFilter.estimatedDepartureDateGt = cogsV2FormFilters.cogsDateGt;
  transferFilter.estimatedDepartureDateLt = cogsV2FormFilters.cogsDateLt;

  reportConfig[ReportType.COGS_V2] = {
    packageFilter,
    transferFilter,
    licenses,
    fields: null,
  };
}

export function getCogsV2CacheKey({
  licenses,
  departureDateLt,
  departureDateGt,
}: {
  licenses: string[];
  departureDateGt: string;
  departureDateLt: string;
}): string {
  return `COGS_V2_DATA__${licenses.join(",")}__${departureDateGt}__${departureDateLt}`;
}

export async function loadAndCacheCogsV2Data({
  ctx,
  licenses,
  departureDateLt,
  departureDateGt,
}: {
  ctx: ActionContext<IReportsState, IPluginState>;
  licenses: string[];
  departureDateGt: string;
  departureDateLt: string;
}): Promise<{
  packages: IIndexedPackageData[];
  richOutgoingTransfers: IIndexedRichOutgoingTransferData[];
  scopedAncestorPackageMap: Map<string, IIndexedPackageData>;
  scopedProductionBatchPackageMap: Map<string, IIndexedPackageData>;
  fullPackageLabelMap: Map<string, IIndexedPackageData>;
  fullProductionBatchMap: Map<string, IIndexedPackageData>;
}> {
  const COGS_V2_CACHE_KEY = getCogsV2CacheKey({ licenses, departureDateGt, departureDateLt });

  let dataLoader: DataLoader | null = null;

  // @ts-ignore
  let packages: IIndexedPackageData[] = [];
  let richOutgoingTransfers: IIndexedRichOutgoingTransferData[] = [];

  // @ts-ignore
  const cachedValue = globalThis[COGS_V2_CACHE_KEY];

  if (cachedValue) {
    packages = cachedValue.packages;
    richOutgoingTransfers = cachedValue.richOutgoingTransfers;
  } else {
    for (const license of licenses) {
      ctx.commit(ReportsMutations.SET_STATUS, {
        statusMessage: { text: `Loading ${license} packages...`, level: "success" },
      });

      dataLoader = await getDataLoaderByLicense(license);

      await dataLoader.activePackages().then(
        (pkgs) => (packages = packages.concat(pkgs)),
        (e) => {
          ctx.commit(ReportsMutations.SET_STATUS, {
            statusMessage: {
              text: `Failed to load active packages. (${license})`,
              level: "warning",
            },
          });
          throw e;
        }
      );

      await dataLoader.onHoldPackages().then(
        (pkgs) => (packages = packages.concat(pkgs)),
        (e) => {
          ctx.commit(ReportsMutations.SET_STATUS, {
            statusMessage: {
              text: `Failed to load on hold packages. (${license})`,
              level: "warning",
            },
          });
          throw e;
        }
      );

      await dataLoader.inactivePackages().then(
        (pkgs) => (packages = packages.concat(pkgs)),
        (e) => {
          ctx.commit(ReportsMutations.SET_STATUS, {
            statusMessage: {
              text: `Failed to load inactive packages. (${license})`,
              level: "warning",
            },
          });
          throw e;
        }
      );

      await dataLoader.inTransitPackages().then(
        (pkgs) => (packages = packages.concat(pkgs)),
        (e) => {
          ctx.commit(ReportsMutations.SET_STATUS, {
            statusMessage: {
              text: `Failed to load in transit packages. (${license})`,
              level: "warning",
            },
          });
          throw e;
        }
      );
    }

    for (const license of licenses) {
      ctx.commit(ReportsMutations.SET_STATUS, {
        statusMessage: { text: `Loading ${license} transfers...`, level: "success" },
      });

      dataLoader = await getDataLoaderByLicense(license);
      try {
        const outgoingTransfers = await dataLoader.outgoingTransfers();
        richOutgoingTransfers = [...richOutgoingTransfers, ...outgoingTransfers];
      } catch (e) {
        ctx.commit(ReportsMutations.SET_STATUS, {
          statusMessage: { text: "Failed to load outgoing transfers.", level: "warning" },
        });
        throw e;
      }

      try {
        const rejectedTransfers = await dataLoader.rejectedTransfers();
        richOutgoingTransfers = [...richOutgoingTransfers, ...rejectedTransfers];
      } catch (e) {
        ctx.commit(ReportsMutations.SET_STATUS, {
          statusMessage: { text: "Failed to load rejected transfers.", level: "warning" },
        });
        throw e;
      }

      try {
        const outgoingInactiveTransfers = await dataLoader.outgoingInactiveTransfers();
        richOutgoingTransfers = [...richOutgoingTransfers, ...outgoingInactiveTransfers];
      } catch (e) {
        ctx.commit(ReportsMutations.SET_STATUS, {
          statusMessage: { text: "Failed to load outgoing inactive transfers.", level: "warning" },
        });
        throw e;
      }
    }

    let filter1initial = richOutgoingTransfers.length;

    // Apply wide filter to transfers before loading destinations
    // createdAt < LT, and lastModified > GT
    richOutgoingTransfers = richOutgoingTransfers.filter(
      (x) => x.LastModified > departureDateGt && x.CreatedDateTime < departureDateLt
    );

    console.log(
      `Filtered out ${filter1initial - richOutgoingTransfers.length} transfers on first filter`
    );

    ctx.commit(ReportsMutations.SET_STATUS, {
      statusMessage: { text: "Loading destinations....", level: "success" },
    });

    const richOutgoingTransferDestinationRequests: Promise<any>[] = [];

    for (const transfer of richOutgoingTransfers) {
      richOutgoingTransferDestinationRequests.push(
        getDataLoaderByLicense(transfer.LicenseNumber).then((dataLoader) =>
          dataLoader.transferDestinations(transfer.Id).then((destinations) => {
            transfer.outgoingDestinations = destinations;
          })
        )
      );

      if (richOutgoingTransferDestinationRequests.length % 250 === 0) {
        await Promise.allSettled(richOutgoingTransferDestinationRequests);

        ctx.commit(ReportsMutations.SET_STATUS, {
          statusMessage: {
            text: `Loaded ${richOutgoingTransferDestinationRequests.length} destinations....`,
            level: "success",
          },
          prependMessage: false,
        });
      }
    }

    await Promise.allSettled(richOutgoingTransferDestinationRequests);

    ctx.commit(ReportsMutations.SET_STATUS, {
      statusMessage: {
        text: `Loaded ${richOutgoingTransferDestinationRequests.length} destinations`,
        level: "success",
      },
      prependMessage: false,
    });

    let filter2initial = richOutgoingTransfers.length;
    let filter2initialSubcount = richOutgoingTransfers
      .map((x) => (x.outgoingDestinations || []).length)
      .reduce((a, b) => a + b, 0);

    // Apply rough filter again to destinations based on ETD
    // etd < LT, and etd > GT
    richOutgoingTransfers = richOutgoingTransfers
      .map((x) => {
        x.outgoingDestinations = (x.outgoingDestinations || []).filter(
          (y) =>
            y.ShipmentTypeName.includes("Wholesale") &&
            y.EstimatedArrivalDateTime >= departureDateGt &&
            y.EstimatedArrivalDateTime <= departureDateLt
        );

        return x;
      })
      .filter((z) => (z.outgoingDestinations || []).length > 0);

    console.log(
      `Filtered out ${filter2initial - richOutgoingTransfers.length} transfers and ${
        filter2initialSubcount -
        richOutgoingTransfers
          .map((x) => (x.outgoingDestinations || []).length)
          .reduce((a, b) => a + b, 0)
      } destinations on second filter`
    );

    ctx.commit(ReportsMutations.SET_STATUS, {
      statusMessage: { text: "Loading manifest packages...", level: "success" },
    });

    const packageRequests: Promise<any>[] = [];

    // Load manifest packages for all transfers
    for (const transfer of richOutgoingTransfers) {
      for (const destination of transfer.outgoingDestinations || ([] as IRichDestinationData[])) {
        packageRequests.push(
          getDataLoaderByLicense(transfer.LicenseNumber).then((dataLoader) =>
            dataLoader.destinationPackages(destination.Id).then((destinationPackages) => {
              destination.packages = destinationPackages;
            })
          )
        );

        if (packageRequests.length % 50 === 0) {
          await Promise.allSettled(packageRequests);

          ctx.commit(ReportsMutations.SET_STATUS, {
            statusMessage: {
              text: `Loaded ${packageRequests.length} manifests....`,
              level: "success",
            },
            prependMessage: false,
          });
        }
      }
    }

    ctx.commit(ReportsMutations.SET_STATUS, {
      statusMessage: {
        text: `Loaded ${packageRequests.length} manifests containing ${richOutgoingTransfers
          .map((x) =>
            (x.outgoingDestinations || [])
              .map((x) => x.packages?.length || 0)
              .reduce((a, b) => a + b, 0)
          )
          .flat()
          .reduce((a, b) => a + b, 0)} packages`,
        level: "success",
      },
    });
  }

  const fullPackageLabelMap = new Map<string, IIndexedPackageData>(
    packages.map((pkg) => [pkg.Label, pkg])
  );
  const fullProductionBatchMap = new Map<string, IIndexedPackageData>(
    packages
      .filter((pkg) => !!pkg.ProductionBatchNumber)
      .map((pkg) => [pkg.ProductionBatchNumber, pkg])
  );

  // Keyed by label
  const scopedAncestorPackageMap: Map<string, IIndexedPackageData> = new Map();

  // Keyed by production batch
  const scopedProductionBatchPackageMap: Map<string, IIndexedPackageData> = new Map();

  for (const transfer of richOutgoingTransfers) {
    for (const destination of transfer.outgoingDestinations || []) {
      for (const manifestPkg of destination.packages || []) {
        const sourcePackageLabels: string[] = await getSourcePackageTags(manifestPkg);

        if (sourcePackageLabels.length !== 1) {
          console.error(`${sourcePackageLabels.length} manifest pkg source packages`);
        }

        const buffer: IIndexedPackageData[] = [];

        for (const label of sourcePackageLabels) {
          if (fullPackageLabelMap.has(label)) {
            buffer.push(fullPackageLabelMap.get(label)!);
          } else {
            console.error(
              `Unable to match source package label ${label} for manifest pkg ${manifestPkg.PackageLabel}`
            );
          }
        }

        while (buffer.length > 0) {
          let target = buffer.pop()!;

          scopedAncestorPackageMap.set(target.Label, target);

          if (target.ProductionBatchNumber.length > 0) {
            scopedProductionBatchPackageMap.set(target.ProductionBatchNumber, target);
            continue;
          }

          const targetSourcePackageLabels = await getSourcePackageTags(target);

          for (const label of targetSourcePackageLabels) {
            if (fullPackageLabelMap.has(label)) {
              buffer.push(fullPackageLabelMap.get(label)!);
            } else {
              console.error(
                `Unable to match upstream source package label ${label} for pkg ${manifestPkg.PackageLabel}`
              );
            }
          }
        }

        // const sourceProductionBatchNumbers: string[] = matchedSourcePackages.map((pkg) =>
        //   pkg.ProductionBatchNumber.length > 0
        //     ? [pkg.ProductionBatchNumber]
        //     : pkg.SourceProductionBatchNumbers.split(",").map((x) => x.trim())
        // );

        // const scopedSourceProductionBatchPackages: IIndexedPackageData[] =
        //   sourceProductionBatchNumbers
        //     .filter((x) => fullProductionBatchMap.has(x))
        //     .map((x) => fullProductionBatchMap.get(x)!);

        // // Add to both maps
        // scopedSourceProductionBatchPackages.map((pkg) =>
        //   scopedAncestorPackageMap.set(pkg.Label, pkg)
        // );
        // scopedSourceProductionBatchPackages.map((pkg) =>
        //   scopedProductionBatchPackageMap.set(pkg.ProductionBatchNumber, pkg)
        // );
      }
    }
  }

  const historyPromises: Promise<any>[] = [];

  for (const pkg of scopedAncestorPackageMap.values()) {
    if (pkg.history !== undefined) {
      continue;
    }

    const dataLoader = await getDataLoaderByLicense(pkg.LicenseNumber);

    historyPromises.push(
      dataLoader.packageHistoryByPackageId(pkg.Id).then((result) => {
        pkg.history = result;
      })
    );

    if (historyPromises.length % 100 === 0) {
      await Promise.allSettled(historyPromises);

      ctx.commit(ReportsMutations.SET_STATUS, {
        statusMessage: {
          text: `Loaded ${historyPromises.length} package histories....`,
          level: "success",
        },
        prependMessage: false,
      });
    }
  }

  await Promise.allSettled(historyPromises);

  ctx.commit(ReportsMutations.SET_STATUS, {
    statusMessage: {
      text: `Loaded ${historyPromises.length} package histories`,
      level: "success",
    },
  });

  const updatedCachedValue = {
    packages,
    richOutgoingTransfers,
    scopedAncestorPackageMap,
    scopedProductionBatchPackageMap,
    fullPackageLabelMap,
    fullProductionBatchMap,
  };

  // @ts-ignore
  globalThis[COGS_V2_CACHE_KEY] = {
    packages,
    richOutgoingTransfers,
  };

  return updatedCachedValue;
}

export async function updateCogsV2MasterCostSheet({
  ctx,
  reportConfig,
}: {
  ctx: ActionContext<IReportsState, IPluginState>;
  reportConfig: IReportConfig;
}) {
  try {
    if (!reportConfig[ReportType.COGS_V2]) {
      throw new Error("Cogs report must be selected");
    }

    const { transferFilter, licenses } = reportConfig[ReportType.COGS_V2]!;

    const [departureDateGt] = transferFilter.estimatedDepartureDateGt!.split("T");
    const [departureDateLt] = getIsoDateFromOffset(
      1,
      transferFilter.estimatedDepartureDateLt!
    ).split("T");

    let {
      richOutgoingTransfers,
      scopedAncestorPackageMap,
      fullPackageLabelMap,
      fullProductionBatchMap,
      scopedProductionBatchPackageMap,
    } = await loadAndCacheCogsV2Data({
      ctx,
      licenses,
      departureDateGt,
      departureDateLt,
    });

    // Load data sheet

    clientBuildManager.assertValues(["MASTER_PB_COST_SHEET_URL"]);

    const spreadsheetId = extractSheetIdOrError(
      clientBuildManager.clientConfig!.values!["MASTER_PB_COST_SHEET_URL"]
    );

    const response: { data: { result: { values: any[][] } } } = await readSpreadsheet({
      spreadsheetId,
      sheetName: SheetTitles.MASTER_WORKSHEET,
    });

    // Ignore header
    const currentSheetLabels = new Set(response.data.result.values.slice(1).map((row) => row[1]));
    const requiredSheetLabels = new Set(
      [...scopedProductionBatchPackageMap.values()].map((pkg) => getLabelOrError(pkg))
    );

    const rows = [];

    for (const label of requiredSheetLabels) {
      if (!currentSheetLabels.has(label)) {
        const pkg = scopedAncestorPackageMap.get(label)!;

        // License
        // Package Tag
        // Production Batch Number
        // PB Total Cost
        // Cost from Previous PB
        // Item Name
        // Initial Quantity
        // UoM
        // Packaged Date
        // Approx Cost per Piece
        // Approx Cost per Unit
        // Pieces per Unit

        rows.push([
          pkg.LicenseNumber,
          pkg.Label,
          pkg.ProductionBatchNumber,
          "",
          "",
          pkg.Item.Name,
          ...extractInitialPackageQuantityAndUnitFromHistoryOrError(pkg.history!),
          // pkg.UnitOfMeasureAbbreviation,
          pkg.PackagedDate,
        ]);
      }
    }

    await appendSpreadsheetValues({
      spreadsheetId,
      range: `'${SheetTitles.MASTER_WORKSHEET}'!A:L`,
      values: rows,
    });

    toastManager.openToast(
      `The master worksheet was updated with ${rows.length} new production batches`,
      {
        title: "Master worksheet updated",
        autoHideDelay: 2000,
        variant: "primary",
        appendToast: true,
        toaster: "ttt-toaster",
        solid: true,
      }
    );
  } catch (e) {
    toastManager.openToast((e as Error).toString(), {
      title: "Failed to update master worksheet",
      autoHideDelay: 30000,
      variant: "danger",
      appendToast: true,
      toaster: "ttt-toaster",
      solid: true,
    });
  }
}

async function computeIsConnected(
  pkg: IIndexedPackageData,
  scopedAncestorPackageMap: Map<string, IIndexedPackageData>
): Promise<[boolean, string]> {
  let buffer: IIndexedPackageData[] = [pkg];

  while (buffer.length > 0) {
    const target = buffer.pop()!;

    if (target.ProductionBatchNumber.length > 0) {
      continue;
    }

    const sourcePackageLabels: string[] = await getSourcePackageTags(target);

    for (const label of sourcePackageLabels) {
      if (!scopedAncestorPackageMap.has(label)) {
        return [false, `${label} missing from package map`];
      }

      const matchedPkg = scopedAncestorPackageMap.get(label)!;

      buffer.push(matchedPkg);
    }
  }

  return [true, ""];
}

function computeIsEligibleForItemOptimization(
  pkg: IIndexedDestinationPackageData,
  sourcePackage: IIndexedPackageData,
  scopedProductionBatchPackageMap: Map<string, IIndexedPackageData>
): [boolean, string] {
  // sourcePackage might itself be the production batch
  const sourceProductionBatchNumbers: string[] =
    sourcePackage.ProductionBatchNumber.length > 0
      ? [sourcePackage.ProductionBatchNumber]
      : getDelimiterSeparatedValuesOrError(sourcePackage.SourceProductionBatchNumbers);

  if (sourceProductionBatchNumbers.length !== 1) {
    return [false, `Invalid production batch nubmers: ${sourceProductionBatchNumbers}`];
  }

  const [sourceProductBatchNumber] = sourceProductionBatchNumbers;

  const sourceProductionBatch = scopedProductionBatchPackageMap.get(sourceProductBatchNumber);

  if (!sourceProductionBatch) {
    return [false, `${sourcePackage.SourceProductionBatchNumbers} missing from PB map`];
  }

  if (sourceProductionBatch.Item.Name !== pkg.ProductName) {
    return [false, `Item mismatch: ${sourceProductionBatch.Item.Name} <=> ${pkg.ProductName}`];
  }

  return [true, ``];
}

export async function maybeLoadCogsV2ReportData({
  ctx,
  reportData,
  reportConfig,
}: {
  ctx: ActionContext<IReportsState, IPluginState>;
  reportData: IReportData;
  reportConfig: IReportConfig;
}) {
  if (!reportConfig[ReportType.COGS_V2]) {
    return;
  }

  // packageFilter and transferFilter will have identical dates
  const { transferFilter, licenses } = reportConfig[ReportType.COGS_V2]!;

  const [departureDateGt] = transferFilter.estimatedDepartureDateGt!.split("T");
  const [departureDateLt] = getIsoDateFromOffset(1, transferFilter.estimatedDepartureDateLt!).split(
    "T"
  );

  let {
    richOutgoingTransfers,
    scopedAncestorPackageMap,
    scopedProductionBatchPackageMap,
    fullProductionBatchMap,
    fullPackageLabelMap,
  } = await loadAndCacheCogsV2Data({
    ctx,
    licenses,
    departureDateGt,
    departureDateLt,
  });

  const auditData = {};
  const worksheetMatrix: any[][] = [];
  const cogsMatrix: any[][] = [];

  clientBuildManager.assertValues(["MASTER_PB_COST_SHEET_URL"]);

  const spreadsheetId = extractSheetIdOrError(
    clientBuildManager.clientConfig!.values!["MASTER_PB_COST_SHEET_URL"]
  );

  const response: { data: { result: { values: any[][] } } } = await readSpreadsheet({
    spreadsheetId,
    sheetName: SheetTitles.MASTER_WORKSHEET,
  });

  response.data.result.values.map((row) => worksheetMatrix.push(row));

  cogsMatrix.push(
    [
      "License",
      "Manifest #",
      "Package Tag",
      "Source Package Tags",
      "Source Production Batch",
      "Item",
      "Quantity",
      "Units",
      "Package COGS",
      "Unit COGS",
      "Status",
      "Note",
    ].map((x) => x.padStart(8).padEnd(8))
  );

  for (const transfer of richOutgoingTransfers) {
    const manifestNumber = transfer.ManifestNumber;

    for (const destination of transfer.outgoingDestinations || []) {
      for (const manifestPkg of destination.packages || []) {
        const sourcePackageLabels: string[] = await getSourcePackageTags(manifestPkg);

        if (sourcePackageLabels.length !== 1) {
          cogsMatrix.push([
            manifestPkg.LicenseNumber,
            manifestNumber,
            getLabelOrError(manifestPkg),
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "FAIL",
            `Invalid src package count: ${sourcePackageLabels.length}`,
          ]);
          continue;
        }

        const [sourcePackageLabel] = sourcePackageLabels;

        if (!scopedAncestorPackageMap.has(sourcePackageLabel)) {
          cogsMatrix.push([
            manifestPkg.LicenseNumber,
            manifestNumber,
            getLabelOrError(manifestPkg),
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "FAIL",
            `Missing src package: ${sourcePackageLabel}`,
          ]);
          continue;
        }

        const sourcePackage: IIndexedPackageData =
          scopedAncestorPackageMap.get(sourcePackageLabel)!;

        let note = "";
        let costEquation = `=0`;
        let status = "INITIAL";

        const [isConnected, isConnectedMessage] = await computeIsConnected(
          sourcePackage,
          scopedAncestorPackageMap
        );
        const [isEligibleForItemOptimization, isEligibleForItemOptimizationMesage] =
          computeIsEligibleForItemOptimization(
            manifestPkg,
            sourcePackage,
            scopedProductionBatchPackageMap
          );

        if (isEligibleForItemOptimization) {
          // If item matches, just perform a direct package comparison
          const sourceProductionBatch: IIndexedPackageData = scopedProductionBatchPackageMap.get(
            sourcePackage.ProductionBatchNumber.length > 0
              ? sourcePackage.ProductionBatchNumber
              : sourcePackage.SourceProductionBatchNumbers
          )!;

          if (sourceProductionBatch.history === undefined) {
            status = "FAIL";
            note = `Src PB ${sourceProductionBatch.Label} is missing history`;
          } else {
            const initialProductionBatchQuantity =
              extractInitialPackageQuantityAndUnitFromHistoryOrError(
                sourceProductionBatch.history!
              );

            const optimizationMultiplier =
              manifestPkg.ShippedQuantity / initialProductionBatchQuantity[0];

            const vlookupCostExpression = `VLOOKUP("${getLabelOrError(sourceProductionBatch)}", '${
              SheetTitles.WORKSHEET
            }'!B:L, 3, FALSE)`;

            const vlookupQuantityAdjustMultiplierExpression = `(${
              initialProductionBatchQuantity[0]
            } / VLOOKUP("${getLabelOrError(sourceProductionBatch)}", '${
              SheetTitles.WORKSHEET
            }'!B:L, 6, FALSE))`;

            costEquation = `=${optimizationMultiplier} * ${vlookupCostExpression} * ${vlookupQuantityAdjustMultiplierExpression}`;

            note = "Used optimization";
            status = "SUCCESS";
          }
        } else if (isConnected) {
          // Is connected, walk up package tree recursively

          try {
            let connectedMultiplierBuffer: [IIndexedPackageData, string, number][] = [
              [sourcePackage, manifestPkg.PackageLabel, 1],
            ];
            let finalBuffer: [IIndexedPackageData, number][] = [];

            while (connectedMultiplierBuffer.length > 0) {
              const [target, childLabel, currentMultiplier] = connectedMultiplierBuffer.pop()!;

              if (target.history === undefined) {
                status = "FAIL";
                note = `${target.Label} is missing history`;
                break;
              }

              const initialProductionBatchQuantity =
                extractInitialPackageQuantityAndUnitFromHistoryOrError(target.history!);

              const childPackageQuantity = extractChildPackageTagQuantityUnitSetsFromHistory(
                target.history!
              ).find((x) => x[0] === childLabel);

              if (!childPackageQuantity) {
                status = "FAIL";
                note = `Unable to extract ${childLabel} in ${target.Label} history`;
                break;
              }

              const newMultiplier =
                currentMultiplier * (childPackageQuantity[1] / initialProductionBatchQuantity[0]);

              if (target.ProductionBatchNumber) {
                // Push onto final buffer
                finalBuffer.push([target, newMultiplier]);
              } else {
                // Push back onto queue and recurse
                const sourcePackageLabels = await getSourcePackageTags(target);

                for (const label of sourcePackageLabels) {
                  const source = scopedAncestorPackageMap.get(label);

                  if (!source) {
                    status = "FAIL";
                    note = `Unable to find ${label} in scopedAncestorPackageMap`;
                    break;
                  }

                  connectedMultiplierBuffer.push([source, target.Label, newMultiplier]);
                }
              }

              if (status === "FAIL") {
                break;
              }
            }

            if (status === "INITIAL") {
              costEquation =
                "=" +
                finalBuffer
                  .map(([pkg, multiplier]) => {
                    const initialProductionBatchQuantity =
                      extractInitialPackageQuantityAndUnitFromHistoryOrError(pkg.history!);

                    const vlookupCostExpression = `VLOOKUP("${getLabelOrError(pkg)}", '${
                      SheetTitles.WORKSHEET
                    }'!B:L, 3, FALSE)`;

                    const vlookupQuantityAdjustMultiplierExpression = `(${
                      initialProductionBatchQuantity[0]
                    } / VLOOKUP("${getLabelOrError(pkg)}", '${
                      SheetTitles.WORKSHEET
                    }'!B:L, 6, FALSE))`;

                    return `(${multiplier} * ${vlookupCostExpression} * ${vlookupQuantityAdjustMultiplierExpression})`;
                  })
                  .join(" + ");

              note = "Walked graph";
              status = "SUCCESS";
            }
          } catch (e) {
            note = `Failed to walk graph, ${e}`;
            status = "FAIL";
          }
        } else {
          note = `No eligible strategy - ${isEligibleForItemOptimizationMesage} /// ${isConnectedMessage}`;
          status = "FAIL";
        }

        const sourceProductionBatch: string =
          sourcePackage.ProductionBatchNumber.length > 0
            ? sourcePackage.ProductionBatchNumber
            : sourcePackage.SourceProductionBatchNumbers;

        // "License",
        // "Manifest #",
        // "Package Tag",
        // "Source Package Tags",
        // "Source Production Batch",
        // "Item",
        // "Quantity",
        // "Units",
        // "Package COGS",
        // "Unit COGS",
        // "Note",
        cogsMatrix.push([
          manifestPkg.LicenseNumber,
          manifestNumber,
          getLabelOrError(manifestPkg),
          manifestPkg.SourcePackageLabels,
          sourceProductionBatch,
          manifestPkg.ProductName,
          manifestPkg.ShippedQuantity,
          manifestPkg.ShippedUnitOfMeasureAbbreviation,
          costEquation,
          `=INDIRECT(ADDRESS(ROW(), COLUMN()-1)) / ${manifestPkg.ShippedQuantity}`,
          status,
          note,
        ]);
      }
    }
  }

  reportData[ReportType.COGS_V2] = {
    auditData,
    worksheetMatrix,
    cogsMatrix,
  };
}

export async function createCogsV2SpreadsheetOrError({
  reportData,
  reportConfig,
}: {
  reportData: IReportData;
  reportConfig: IReportConfig;
}): Promise<ISpreadsheet> {
  if (!store.state.pluginAuth?.authState?.license) {
    throw new Error("Invalid authState");
  }

  if (!reportData[ReportType.COGS_V2]) {
    throw new Error("Missing COGS data");
  }

  const sheetTitles = [SheetTitles.OVERVIEW, SheetTitles.WORKSHEET, SheetTitles.MANIFEST_COGS];

  const response: {
    data: {
      success: boolean;
      result: ISpreadsheet;
    };
  } = await messageBus.sendMessageToBackground(
    MessageType.CREATE_SPREADSHEET,
    {
      title: `COGS - ${todayIsodate()}`,
      sheetTitles,
    },
    undefined,
    SHEETS_API_MESSAGE_TIMEOUT_MS
  );

  if (!response.data.success) {
    throw new Error("Unable to create COGS sheet");
  }

  let formattingRequests: any = [
    addRowsRequestFactory({
      sheetId: sheetTitles.indexOf(SheetTitles.OVERVIEW),
      length: 20,
    }),
    styleTopRowRequestFactory({
      sheetId: sheetTitles.indexOf(SheetTitles.OVERVIEW),
      horizontalAlignment: "LEFT",
    }),
  ];

  const { worksheetMatrix, cogsMatrix, auditData } = reportData[ReportType.COGS_V2]!;

  const worksheetSheetId = sheetTitles.indexOf(SheetTitles.WORKSHEET);
  const manifestSheetId = sheetTitles.indexOf(SheetTitles.MANIFEST_COGS);

  formattingRequests = [
    ...formattingRequests,
    // Worksheet
    addRowsRequestFactory({ sheetId: worksheetSheetId, length: worksheetMatrix.length }),
    styleTopRowRequestFactory({ sheetId: worksheetSheetId }),
    freezeTopRowRequestFactory({ sheetId: worksheetSheetId }),
    alternatingRowStyleRequestFactory({ sheetId: worksheetSheetId }),
    // Manifest COGS
    addRowsRequestFactory({ sheetId: manifestSheetId, length: cogsMatrix.length }),
    styleTopRowRequestFactory({ sheetId: manifestSheetId }),
    freezeTopRowRequestFactory({ sheetId: manifestSheetId }),
    alternatingRowStyleRequestFactory({ sheetId: manifestSheetId }),
    hideColumnsRequestFactory({ sheetId: manifestSheetId, startIndex: 9, endIndex: 11 }),
  ];

  await messageBus.sendMessageToBackground(
    MessageType.BATCH_UPDATE_SPREADSHEET,
    {
      spreadsheetId: response.data.result.spreadsheetId,
      requests: formattingRequests,
    },
    undefined,
    SHEETS_API_MESSAGE_TIMEOUT_MS
  );

  const [departureDateGt] =
    reportConfig[ReportType.COGS_V2]!.transferFilter.estimatedDepartureDateGt!.split("T")!;
  // This value is shown in the sheet. Technically the LT date is Lt + 1 since we are using
  // ISO string comparators, but we should show the date selected in the form
  const [readableDepartureDateLt] =
    reportConfig[ReportType.COGS_V2]!.transferFilter.estimatedDepartureDateLt!.split("T")!;
  const [departureDateLt] = getIsoDateFromOffset(
    1,
    reportConfig[ReportType.COGS_V2]!.transferFilter.estimatedDepartureDateLt!
  ).split("T");

  await messageBus.sendMessageToBackground(
    MessageType.WRITE_SPREADSHEET_VALUES,
    {
      spreadsheetId: response.data.result.spreadsheetId,
      range: `'${SheetTitles.OVERVIEW}'`,
      values: [
        [],
        [],
        ["", `Date range`, `${departureDateGt}-${readableDepartureDateLt}`],
        [],
        ["", `Total Source Production Batches`, `=COUNTUNIQUE('${SheetTitles.WORKSHEET}'!B2:B)`],
        [
          "",
          `Total Source Production Batches w/ $0 cost`,
          `=COUNTIF('${SheetTitles.WORKSHEET}'!D2:D, 0) + COUNTIF('${SheetTitles.WORKSHEET}'!D2:D, "")`,
        ],
        [],
        ["", `Total Wholesale Manifests`, `=COUNTUNIQUE('${SheetTitles.MANIFEST_COGS}'!B2:B)`],
        ["", `Total Manifest Packages`, `=COUNTUNIQUE('${SheetTitles.MANIFEST_COGS}'!C2:C)`],
        [
          "",
          `Total Manifest Packages w/ $0 COGS`,
          `=COUNTIF('${SheetTitles.MANIFEST_COGS}'!H2:H, 0)`,
        ],
        [
          "",
          `Total Manifest Packages w/ FAIL status`,
          `=COUNTIF('${SheetTitles.MANIFEST_COGS}'!J2:J, "FAIL")`,
        ],
        [],
        ...Object.entries(auditData).map(([key, value]) => [key, JSON.stringify(value)]),
      ],
    },
    undefined,
    SHEETS_API_MESSAGE_TIMEOUT_MS
  );

  store.commit(`reports/${ReportsMutations.SET_STATUS}`, {
    statusMessage: { text: `Writing worksheet data...`, level: "success" },
  });

  await writeDataSheet({
    spreadsheetId: response.data.result.spreadsheetId,
    spreadsheetTitle: SheetTitles.WORKSHEET,
    data: worksheetMatrix,
    options: {
      pageSize: 5000,
      valueInputOption: "USER_ENTERED",
      maxParallelRequests: 1,
    },
  });

  store.commit(`reports/${ReportsMutations.SET_STATUS}`, {
    statusMessage: { text: `Writing manifest data...`, level: "success" },
  });

  await writeDataSheet({
    spreadsheetId: response.data.result.spreadsheetId,
    spreadsheetTitle: SheetTitles.MANIFEST_COGS,
    data: cogsMatrix,
    options: {
      pageSize: 5000,
      valueInputOption: "USER_ENTERED",
      maxParallelRequests: 1,
    },
  });

  store.commit(`reports/${ReportsMutations.SET_STATUS}`, {
    statusMessage: { text: `Resizing sheets...`, level: "success" },
  });

  let resizeRequests: any[] = [
    autoResizeDimensionsRequestFactory({
      sheetId: sheetTitles.indexOf(SheetTitles.OVERVIEW),
      dimension: "COLUMNS",
    }),
  ];

  resizeRequests = [
    ...resizeRequests,
    autoResizeDimensionsRequestFactory({
      sheetId: worksheetSheetId,
    }),
    autoResizeDimensionsRequestFactory({
      sheetId: manifestSheetId,
    }),
  ];

  // This is incredibly slow for huge sheets, don't wait for it to finish
  messageBus.sendMessageToBackground(
    MessageType.BATCH_UPDATE_SPREADSHEET,
    {
      spreadsheetId: response.data.result.spreadsheetId,
      requests: resizeRequests,
    },
    undefined,
    SHEETS_API_MESSAGE_TIMEOUT_MS
  );

  await messageBus.sendMessageToBackground(
    MessageType.WRITE_SPREADSHEET_VALUES,
    {
      spreadsheetId: response.data.result.spreadsheetId,
      range: `'${SheetTitles.OVERVIEW}'`,
      values: [[`Created with Track & Trace Tools @ ${Date().toString()}`]],
    },
    undefined,
    SHEETS_API_MESSAGE_TIMEOUT_MS
  );

  return response.data.result;
}

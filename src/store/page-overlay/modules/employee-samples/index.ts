import { PackageState } from "@/consts";
import { IIndexedPackageData, IMetrcEmployeeData, IPluginState } from "@/interfaces";
import { primaryDataLoader } from "@/modules/data-loader/data-loader.module";
import { LRU } from "@/utils/cache";
import { getIsoDateFromOffset, todayIsodate } from "@/utils/date";
import {
  getAllocatedSamplesFromPackageHistoryOrError,
  getEstimatedNumberOfSamplesRemaining,
  getSampleAllocationFromAllocationDataOrNull,
} from "@/utils/employee";
import { ActionContext } from "vuex";
import { EmployeeSamplesActions, EmployeeSamplesGetters, EmployeeSamplesMutations } from "./consts";
import { IEmployeeSamplesState, IHistoryAllocationData } from "./interfaces";

const inMemoryState = {
  loadInflight: false,
  employees: [],
  availableSamples: [],
  availableSamplePackages: [],
  modifiedSamplePackages: [],
  recordedAllocationBuffer: [],
  pendingAllocationBuffer: [],
  startDate: getIsoDateFromOffset(-180).split("T")[0],
  endDate: todayIsodate(),
};

const persistedState = {};

const defaultState: IEmployeeSamplesState = {
  ...inMemoryState,
  ...persistedState,
};

export const employeeSamplesModule = {
  state: () => defaultState,
  mutations: {
    [EmployeeSamplesMutations.UPDATE_DATA](
      state: IEmployeeSamplesState,
      payload: {
        employees?: IMetrcEmployeeData[];
        availableSamplePackages?: IIndexedPackageData[];
        modifiedSamplePackages?: IIndexedPackageData[];
      }
    ) {
      for (const [key, value] of Object.entries(payload)) {
        // @ts-ignore
        state[key] = value;
      }
    },
  },
  getters: {
    [EmployeeSamplesGetters.EMPLOYEE_SAMPLES_GETTER]: (
      state: IEmployeeSamplesState,
      getters: any,
      rootState: any,
      rootGetters: any
    ) => {
      // return state.data
    },
  },
  actions: {
    [EmployeeSamplesActions.LOAD_OBJECTS]: async (
      ctx: ActionContext<IEmployeeSamplesState, IPluginState>,
      data: any
    ) => {
      let packages: IIndexedPackageData[] = [];
      let employees: IMetrcEmployeeData[] = [];

      ctx.state.loadInflight = true;

      const promises: Promise<any>[] = [
        primaryDataLoader.activePackages().then((result) => {
          packages = [...packages, ...result];
        }),
        primaryDataLoader.inactivePackages().then((result) => {
          packages = [...packages, ...result];
        }),
        primaryDataLoader.employees().then((result) => {
          employees = result;
        }),
      ];

      await Promise.allSettled(promises);

      // Only consider packages recieved from a separate facility
      packages = packages.filter((pkg) => (pkg.ReceivedFromManifestNumber ?? "").length > 0);

      ctx.state.employees = employees;
      ctx.state.availableSamples = [];

      ctx.state.availableSamplePackages = packages.filter(
        (pkg) => pkg.IsTradeSample && pkg.Quantity > 0 && pkg.PackageState === PackageState.ACTIVE
      );

      // TODO: recalculate this on change
      for (const pkg of ctx.state.availableSamplePackages) {
        const sampleCount = getEstimatedNumberOfSamplesRemaining(pkg);

        for (let i = 0; i < sampleCount; ++i) {
          ctx.state.availableSamples.push({
            pkg,
            quantity: Math.floor(pkg.Quantity / sampleCount),
          });
        }
      }

      ctx.state.modifiedSamplePackages = packages
        .filter((pkg) => pkg.IsTradeSample && pkg.LastModified >= ctx.state.startDate)
        // Sorted in received order
        .sort((a, b) => a.ReceivedDateTime!.localeCompare(b.ReceivedDateTime!));

      ctx.state.modifiedSamplePackages.map((pkg) => {
        promises.push(
          primaryDataLoader.packageHistoryByPackageId(pkg.Id).then((history) => {
            pkg.history = history;
          })
        );
      });

      await Promise.allSettled(promises);

      ctx.state.loadInflight = false;
    },
    [EmployeeSamplesActions.ALLOCATE_SAMPLES]: async (
      ctx: ActionContext<IEmployeeSamplesState, IPluginState>,
      data: any
    ) => {
      console.log("Allocate");

      if (!ctx.state.modifiedSamplePackages.length) {
        console.error("Zero allocations");
      }

      ctx.state.pendingAllocationBuffer = [];
      ctx.state.recordedAllocationBuffer = [];

      const employeeLRU = new LRU<IMetrcEmployeeData>(ctx.state.employees);

      const allocationDataList: IHistoryAllocationData[] = [];

      if (ctx.state.modifiedSamplePackages.length === 0) {
        console.log("Zero modified packages");
      }

      for (const pkg of ctx.state.modifiedSamplePackages) {
        for (const allocationData of getAllocatedSamplesFromPackageHistoryOrError(pkg)) {
          allocationDataList.push(allocationData);
        }
      }

      allocationDataList.sort((a, b) => (a.isodate > b.isodate ? 1 : -1));

      for (const allocationData of allocationDataList) {
        const employee = employeeLRU.elements.find(
          (x) =>
            parseInt(x.License.Number, 10) === parseInt(allocationData.employeeLicenseNumber, 10)
        );

        if (!employee) {
          console.error(
            `No match for employee with license # ${allocationData.employeeLicenseNumber} (${allocationData.employeeName}) (${allocationData.packageLabel})`
          );
          continue;
        }

        employeeLRU.touch(employee);

        const allocation = getSampleAllocationFromAllocationDataOrNull(
          employeeLRU.elements,
          ctx.state.modifiedSamplePackages,
          allocationData
        );

        if (!allocation) {
          console.error(`Unable to generate allocation`);
          continue;
        }

        ctx.state.recordedAllocationBuffer.push(allocation);
      }

      while (true) {
        if (ctx.state.availableSamples.length === 0) {
          break;
        }

        const nextSample = ctx.state.availableSamples.shift();

        for (const employee of employeeLRU.elementsReversed) {
          // TODO
        }
      }
    },
  },
};

export const employeeSamplesReducer = (state: IEmployeeSamplesState): IEmployeeSamplesState => {
  return {
    ...state,
    ...inMemoryState,
  };
};

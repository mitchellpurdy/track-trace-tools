import { BackgroundTaskState, ChromeStorageKeys, DEBUG_ATTRIBUTE, VUEX_KEY } from "@/consts";
import {
  IAccountSettings,
  IContactData,
  IMetrcStatusData,
  IPluginState,
  IRootState,
  ITrackedInteractions,
} from "@/interfaces";
import { isDevelopment } from "@/modules/environment.module";
import { MutationType } from "@/mutation-types";
import { CsvUpload } from "@/types";
import Vue from "vue";
import Vuex from "vuex";
import VuexPersistence from "vuex-persist";
import { announcementsModule, announcementsReducer } from "./modules/announcements";
import { clientModule, clientReducer } from "./modules/client";
import { createPackageCsvModule, createPackageCsvReducer } from "./modules/create-package-csv";
import { employeeSamplesModule, employeeSamplesReducer } from "./modules/employee-samples";
import { explorerModule, explorerReducer } from "./modules/explorer";
import { flagsModule, flagsReducer } from "./modules/flags/index";
import { graphModule, graphReducer } from "./modules/graph";
import { listingModule, listingReducer } from "./modules/listing";
import { packageHistoryModule, packageHistoryReducer } from "./modules/package-history";
import { packageSearchModule, packageSearchReducer } from "./modules/package-search";
import { plantSearchModule, plantSearchReducer } from "./modules/plant-search";
import { pluginAuthModule, pluginAuthReducer } from "./modules/plugin-auth/index";
import {
  promoteImmaturePlantsBuilderModule,
  promoteImmaturePlantsBuilderReducer,
} from "./modules/promote-immature-plants-builder";
import { reportsModule, reportsReducer } from "./modules/reports";
import { searchModule, searchReducer } from "./modules/search";
import { settingsModule, settingsReducer } from "./modules/settings";
import { SettingsActions } from "./modules/settings/consts";
import {
  splitPackageBuilderModule,
  splitPackageBuilderReducer,
} from "./modules/split-package-builder";
import { tagSearchModule, tagSearchReducer } from "./modules/tag-search";
import { transferBuilderModule, transferBuilderReducer } from "./modules/transfer-builder/index";
import {
  transferPackageSearchModule,
  transferPackageSearchReducer,
} from "./modules/transfer-package-search";
import { transferSearchModule, transferSearchReducer } from "./modules/transfer-search";

// Taken from https://gist.github.com/Myeris/3f13b42f6764ded6640cef693d9d1987
const vuexLocal = {
  key: VUEX_KEY,
  storage: window.localStorage,
};

// Firefox doesn't like this
// const vuexLocalForage = {
//   key: VUEX_KEY,
//   storage: localforage,
//   asyncStorage: true
// };

const vuexShared = {
  reducer: (state: IPluginState) => ({
    ...state,
    pluginAuth: pluginAuthReducer(state.pluginAuth),
    announcements: announcementsReducer(state.announcements),
    client: clientReducer(state.client),
    search: searchReducer(state.search),
    transferBuilder: transferBuilderReducer(state.transferBuilder),
    packageSearch: packageSearchReducer(state.packageSearch),
    explorer: explorerReducer(state.explorer),
    plantSearch: plantSearchReducer(state.plantSearch),
    transferSearch: transferSearchReducer(state.transferSearch),
    tagSearch: tagSearchReducer(state.tagSearch),
    flags: flagsReducer(state.flags),
    splitPackageBuilder: splitPackageBuilderReducer(state.splitPackageBuilder),
    promoteImmaturePlantsBuilder: promoteImmaturePlantsBuilderReducer(
      state.promoteImmaturePlantsBuilder
    ),
    listing: listingReducer(state.listing),
    settings: settingsReducer(state.settings),
    packageHistory: packageHistoryReducer(state.packageHistory),
    reports: reportsReducer(state.reports),
    employeeSamples: employeeSamplesReducer(state.employeeSamples),
    createPackageCsv: createPackageCsvReducer(state.createPackageCsv),
    transferPackageSearch: transferPackageSearchReducer(state.transferPackageSearch),
    graph: graphReducer(state.graph),
  }),
};

const vuexPersistence = new VuexPersistence({
  ...vuexLocal,
  ...vuexShared,
  // https://github.com/championswimmer/vuex-persist/blob/57d79b4a526ca12cafe7341613d8382621a0d704/src/index.ts#L229
  // saveState(key: string, state: {}, storage: Storage | undefined): void {
  //   return storage!.setItem(key, JSON.stringify(state));
  // },
});

Vue.use(Vuex);

const defaultState: IRootState = {
  accountEnabled: false,
  accountSettings: {
    backupBuilderSubmits: true,
  },
  contactData: null,
  currentVersion: null,
  credentials: null,
  debugMode: false,
  demoMode: false,
  mockDataMode: false,
  errorMessage: null,
  builderModalOpen: null,
  flashMessage: null,
  flashMessageTimeout: null,
  loadingMessage: null,
  muteAnalytics: isDevelopment(),
  searchModalView: null,
  metrcStatusData: null,
  trackedInteractions: {
    dismissedCsvBuilderPopover: false,
    dismissedBuilderPopover: false,
    dismissedToolboxPopover: false,
    dismissedReportsPopover: false,
    dismissedFacilityPopover: false,
    dismissedSearchPopover: false,
    dismissedQuickScriptsPopover: false,
    dismissedBugReportsPopover: false,
    dismissedSnapshotPopover: false,
  },
  backgroundTasks: {
    finalizeSalesReceiptsState: BackgroundTaskState.IDLE,
    finalizeSalesReceiptsLicense: null,
    finalizeSalesReceiptsStopIsodate: null,
    finalizeSalesReceiptsReadout: null,
    finalizeSalesReceiptsRunningTotal: 0,
    voidTagsState: BackgroundTaskState.IDLE,
    finalizeSalesReceiptsConsecutiveErrorTotal: 0,
    voidTagsLicense: null,
    voidTagsStartTag: null,
    voidTagsEndTag: null,
    voidTagsLastAttemptedTag: null,
    voidTagsReadout: null,
    voidTagsRunningTotal: 0,
    voidTagsConsecutiveErrorTotal: 0,
  },
};

const vuexStore = new Vuex.Store<IPluginState>({
  // Modules will set their own default state
  state: defaultState as IPluginState,
  mutations: {
    // [MutationType.RESET_STATE](state: IRootState) {
    //   Object.assign(state, defaultState);
    // },
    [MutationType.SET_CURRENT_VERSION](state: IRootState, version: string) {
      state.currentVersion = version;
    },
    [MutationType.SET_CONTACT_DATA](state: IRootState, contactData: IContactData) {
      state.contactData = {
        ...contactData,
      };
    },
    [MutationType.UPDATE_ACCOUNT_SETTINGS](state: IRootState, accountSettings: IAccountSettings) {
      state.accountSettings = {
        ...accountSettings,
      };
    },
    [MutationType.UPDATE_TRACKED_INTERACTIONS](
      state: IRootState,
      trackedInteractions: ITrackedInteractions
    ) {
      state.trackedInteractions = {
        ...trackedInteractions,
      };
    },
    [MutationType.RESET_TRACKED_INTERACTIONS](state: IRootState) {
      state.trackedInteractions = defaultState.trackedInteractions;
    },
    [MutationType.SET_DEMO_MODE](state: IRootState, demoMode: boolean) {
      state.demoMode = demoMode;
    },
    [MutationType.SET_MOCK_DATA_MODE](state: IRootState, mockDataMode: boolean) {
      state.mockDataMode = mockDataMode;
    },
    [MutationType.SET_DEBUG_MODE](state: IRootState, debugMode: boolean) {
      state.debugMode = debugMode;

      // Synchronously propagate to attribute
      document.body.setAttribute(DEBUG_ATTRIBUTE, debugMode.toString());
    },
    [MutationType.SET_MUTE_ANALYTICS](state: IRootState, muteAnalytics: boolean) {
      state.muteAnalytics = muteAnalytics;
    },
    [MutationType.SET_BUILDER_MODAL_DISPLAY_STATE](
      state: IRootState,
      builderModalOpen: CsvUpload | null
    ) {
      state.builderModalOpen = builderModalOpen;
    },
    [MutationType.SET_ACCOUNT_ENABLED](state: IRootState, accountEnabled: boolean) {
      state.accountEnabled = accountEnabled;
    },
    /* eslint-disable-next-line no-warning-comments */
    // TODO remove
    [MutationType.UPDATE_METRC_STATUS_DATA](
      state: IRootState,
      metrcStatusData: IMetrcStatusData | null
    ) {
      state.metrcStatusData = metrcStatusData;
    },
    [MutationType.UPDATE_CREDENTIALS](state: IRootState, credentials: string | null) {
      state.credentials = credentials;
    },
  },
  getters: {
    authState: (state) => state.pluginAuth?.authState || null,
    // packagesUrl: (state) =>
    //   state.pluginAuth?.authState?.license
    //     ? `/industry/${state.pluginAuth?.authState?.license}/packages`
    //     : null,
  },
  actions: {},
  modules: {
    transferBuilder: {
      namespaced: true,
      ...transferBuilderModule,
    },
    pluginAuth: {
      namespaced: true,
      ...pluginAuthModule,
    },
    packageSearch: {
      namespaced: true,
      ...packageSearchModule,
    },
    packageHistory: {
      namespaced: true,
      ...packageHistoryModule,
    },
    plantSearch: {
      namespaced: true,
      ...plantSearchModule,
    },
    transferSearch: {
      namespaced: true,
      ...transferSearchModule,
    },
    tagSearch: {
      namespaced: true,
      ...tagSearchModule,
    },
    flags: {
      namespaced: true,
      ...flagsModule,
    },
    splitPackageBuilder: {
      namespaced: true,
      ...splitPackageBuilderModule,
    },
    promoteImmaturePlantsBuilder: {
      namespaced: true,
      ...promoteImmaturePlantsBuilderModule,
    },
    listing: {
      namespaced: true,
      ...listingModule,
    },
    reports: {
      namespaced: true,
      ...reportsModule,
    },
    search: {
      namespaced: true,
      ...searchModule,
    },
    settings: {
      namespaced: true,
      ...settingsModule,
    },
    explorer: {
      namespaced: true,
      ...explorerModule,
    },
    employeeSamples: {
      namespaced: true,
      ...employeeSamplesModule,
    },
    createPackageCsv: {
      namespaced: true,
      ...createPackageCsvModule,
    },
    client: {
      namespaced: true,
      ...clientModule,
    },
    announcements: {
      namespaced: true,
      ...announcementsModule,
    },
    transferPackageSearch: {
      namespaced: true,
      ...transferPackageSearchModule,
    },
    graph: {
      namespaced: true,
      ...graphModule,
    },
  },
  plugins: [vuexPersistence.plugin],
});

try {
  chrome.storage.local.get(ChromeStorageKeys.SETTINGS).then((result) => {
    const persistedSettings = result[ChromeStorageKeys.SETTINGS];

    if (!persistedSettings) {
      return;
    }

    // If persisted settings are older, don't bother using
    if (vuexStore.state.settings.persistTimestamp > persistedSettings.persistTimestamp) {
      console.log("Persisted settings too old");
      return;
    }

    // Only load if the STORED flag is set
    if (!persistedSettings.writeSettingsToChromeStorage) {
      console.log("Persist disabled");
      return;
    }

    console.log("Inserting persisted settings");

    vuexStore.dispatch(`settings/${SettingsActions.UPDATE_SETTINGS}`, persistedSettings);
  });
} catch (e) {
  console.error(e);
}
// }

export default vuexStore;

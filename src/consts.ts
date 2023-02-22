// export const AMPLITUDE_API_KEY = "d8942f92e0928f9d52d13846c97d353d";
export const AMPLITUDE_API_KEY = "13b63639e3682c360d938c2ebb900252";

export const TTT_LIGHT_MODE = "ttt-light-mode";
export const TTT_DARK_MODE = "ttt-dark-mode";
export const TTT_SNOWFLAKES = "ttt-snowflakes";

export enum ChromeStorageKeys {
  OAUTH_USER_DATA = "OAUTH_USER_DATA",
  INITIAL_OPTIONS_PATH = "INITIAL_OPTIONS_PATH",
}

export enum ToolkitView {
  ADD_PACKAGE_NOTE = "ADD_PACKAGE_NOTE",
  CREATE_CSV = "CREATE_CSV",
  REORDER_TAGS = "REORDER_TAGS",
  SETTINGS = "SETTINGS",
  VOID_TAGS = "VOID_TAGS",
  SCREENSHOT = "SCREENSHOT",
  FINALIZE_SALES = "FINALIZE_SALES",
  MANAGE_ACCOUNT = "MANAGE_ACCOUNT",
}

export enum TaskType {
  NOOP = "NOOP",
  NOOP_NETWORK = "NOOP_NETWORK",
  ADD_PACKAGE_NOTE = "ADD_PACKAGE_NOTE",
  VOID_TAGS = "VOID_TAGS",
  REORDER_TAGS = "REORDER_TAGS",
}

export const METRC_INT_SUFFIX_CHARCOUNT = 8;
export const METRC_TAG_REGEX_PATTERN = `[A-Z0-9]{24}`;
export const METRC_TAG_REGEX = new RegExp(`^${METRC_TAG_REGEX_PATTERN}$`);
export const WEIGHT_NUMBER_REGEX = new RegExp(/^[0-9,]*\.?[0-9]*$/);
export const DOLLAR_NUMBER_REGEX = new RegExp(/^\$?[0-9,]*\.?[0-9]*$/);

export const JOB_QUEUE_KEY = "ttt-job-queue";

// These have specific handlers that must be defined in background.js

export enum MessageType {
  // Specific handlers
  APPEND_SPREADSHEET_VALUES = "APPEND_SPREADSHEET_VALUES",
  ASYNC_STORAGE_CLEAR = "CLEAR",
  ASYNC_STORAGE_GET_ITEM = "GET_ITEM",
  ASYNC_STORAGE_KEY = "KEY",
  ASYNC_STORAGE_LENGTH = "LENGTH",
  ASYNC_STORAGE_REMOVE_ITEM = "REMOVE_ITEM",
  ASYNC_STORAGE_SET_ITEM = "SET_ITEM",
  BATCH_UPDATE_SPREADSHEET = "BATCH_UPDATE_SPREADSHEET",
  BATCH_UPDATE_SPREADSHEET_VALUES = "BATCH_UPDATE_SPREADSHEET_VALUES",
  CAPTURE_AND_UPLOAD_SCREENSHOT = "CAPTURE_AND_UPLOAD_SCREENSHOT",
  CHECK_PERMISSIONS = "CHECK_PERMISSIONS",
  CHECK_OAUTH = "CHECK_OAUTH",
  CREATE_SPREADSHEET = "CREATE_SPREADSHEET",
  EXPIRE_AUTH_TOKEN = "EXPIRE_AUTH_TOKEN",
  GET_EXTENSION_URL = "GET_EXTENSION_URL",
  GET_OAUTH_USER_INFO_OR_ERROR = "GET_OAUTH_USER_INFO_OR_ERROR",
  INDEX_PACKAGES = "INDEX_PACKAGES",
  INDEX_TAGS = "INDEX_TAGS",
  INDEX_TRANSFERS = "INDEX_TRANSFERS",
  KEEPALIVE = "KEEPALIVE",
  OPEN_CONNECT_STANDALONE = "OPEN_CONNECT_STANDALONE",
  OPEN_OPTIONS_PAGE = "OPEN_OPTIONS_PAGE",
  PAGELOAD = "PAGELOAD",
  SEARCH_PACKAGES = "SEARCH_PACKAGES",
  SEARCH_TAGS = "SEARCH_TAGS",
  SEARCH_TRANSFERS = "SEARCH_TRANSFERS",
  SET_USER_ID = "SET_USER_ID",
  SET_USER_PROPERTIES = "SET_USER_PROPERTIES",
  UPDATE_UNINSTALL_URL = "UPDATE_UNINSTALL_URL",
  UPLOAD_SCREENSHOT = "UPLOAD_SCREENSHOT",
  WRITE_SPREADSHEET_VALUES = "WRITE_SPREADSHEET_VALUES",
  // Generic logging events:
  ACCOUNT_PERMISSIONS_GRANTED = "ACCOUNT_PERMISSIONS_GRANTED",
  BUILDER_BATCH_ACCEPTED = "BUILDER_BATCH_ACCEPTED",
  BUILDER_BATCH_FAILED = "BUILDER_BATCH_FAILED",
  BUILDER_DATA_ERROR = "BUILDER_DATA_ERROR",
  BUILDER_ENGAGEMENT = "BUILDER_ENGAGEMENT",
  BUILDER_ERROR_READOUT = "BUILDER_ERROR_READOUT",
  BUILDER_EVENT = "BUILDER_EVENT",
  BUILDER_PAGE_ERROR = "BUILDER_PAGE_ERROR",
  BUILDER_PAGE_SUCCESS = "BUILDER_PAGE_SUCCESS",
  BUILDER_PROJECT_CANCELLED = "BUILDER_PROJECT_CANCELLED",
  BUILDER_PROJECT_FINISHED = "BUILDER_PROJECT_FINISHED",
  BUILDER_SUBMIT = "BUILDER_SUBMIT",
  CHANGED_FACILITY = "CHANGED_FACILITY",
  CLICK = "CLICK",
  CLICKED_DASHBOARD_CARD_LINK = "CLICKED_DASHBOARD_CARD_LINK",
  CLICKED_DOWNLOAD_LAB_TEST_BUTTON = "CLICKED_DOWNLOAD_LAB_TEST_BUTTON",
  CLICKED_DOWNLOAD_MANIFEST_BUTTON = "CLICKED_DOWNLOAD_MANIFEST_BUTTON",
  CLICKED_INLINE_TOOLS_BUTTON = "CLICKED_INLINE_TOOLS_BUTTON",
  CLICKED_PRINT_LAB_TEST_BUTTON = "CLICKED_PRINT_LAB_TEST_BUTTON",
  CLICKED_PRINT_MANIFEST_BUTTON = "CLICKED_PRINT_MANIFEST_BUTTON",
  CLICKED_QUICK_PACKAGE = "CLICKED_QUICK_PACKAGE",
  CLICKED_QUICK_TRANSFER = "CLICKED_QUICK_TRANSFER",
  CLICKED_QUICK_TRANSFER_TEMPLATE = "CLICKED_QUICK_TRANSFER_TEMPLATE",
  CLICKED_RECENT_PACKAGE_QUERY = "CLICKED_RECENT_PACKAGE_QUERY",
  CLICKED_RECENT_PLANT_QUERY = "CLICKED_RECENT_PLANT_QUERY",
  CLICKED_RECENT_TRANSFER_QUERY = "CLICKED_RECENT_TRANSFER_QUERY",
  CLICKED_SCREENSHOT_BUTTON = "CLICKED_SCREENSHOT_BUTTON",
  CLICKED_SEARCH_PACKAGE_BUTTON = "CLICKED_SEARCH_PACKAGE_BUTTON",
  CLICKED_SEARCH_TRANSFER_BUTTON = "CLICKED_SEARCH_TRANSFER_BUTTON",
  CLICKED_TOOLKIT_DOWNLOAD_BUTTON = "CLICKED_TOOLKIT_DOWNLOAD_BUTTON",
  CLICKED_TOOLKIT_DOWNLOAD_LAB_TEST_BUTTON = "CLICKED_TOOLKIT_DOWNLOAD_LAB_TEST_BUTTON",
  CLICKED_TOOLKIT_PRINT_BUTTON = "CLICKED_TOOLKIT_PRINT_BUTTON",
  CLICKED_TOOLKIT_PRINT_LAB_TEST_BUTTON = "CLICKED_TOOLKIT_PRINT_LAB_TEST_BUTTON",
  CLICKED_TOOLKIT_VIEW_LAB_TEST_BUTTON = "CLICKED_TOOLKIT_VIEW_LAB_TEST_BUTTON",
  CLICKED_TOOLKIT_VIEW_MANIFEST_BUTTON = "CLICKED_TOOLKIT_VIEW_MANIFEST_BUTTON",
  CLICKED_VIEW_LAB_TEST_BUTTON = "CLICKED_VIEW_LAB_TEST_BUTTON",
  CLICKED_VIEW_MANIFEST_BUTTON = "CLICKED_VIEW_MANIFEST_BUTTON",
  CLOSED_BUILDER = "CLOSED_BUILDER",
  CONTEXT_MENU_SELECT = "CONTEXT_MENU_SELECT",
  COPIED_TEXT = "COPIED_TEXT",
  CSV_AUTOFILL_ERROR = "CSV_AUTOFILL_ERROR",
  CSV_AUTOFILL_FILL = "CSV_AUTOFILL_FILL",
  CSV_AUTOFILL_UPLOAD = "CSV_AUTOFILL_UPLOAD",
  CSV_BUILDER_ENGAGEMENT = "CSV_BUILDER_ENGAGEMENT",
  DETECTED_METRC_ERROR_PAGE = "DETECTED_METRC_ERROR_PAGE",
  DOWNLOADED_CSVS = "DOWNLOADED_CSVS",
  DOWNLOADED_SINGLE_CSV = "DOWNLOADED_SINGLE_CSV",
  DOWNLOAD_REPORT = "DOWNLOAD_REPORT",
  ENTERED_PACKAGE_SEARCH_QUERY = "ENTERED_PACKAGE_SEARCH_QUERY",
  ENTERED_PLANT_SEARCH_QUERY = "ENTERED_PLANT_SEARCH_QUERY",
  ENTERED_TRANSFER_SEARCH_QUERY = "ENTERED_TRANSFER_SEARCH_QUERY",
  FACILITY_PICKER_ENGAGEMENT = "FACILITY_PICKER_ENGAGEMENT",
  FINALIZED_SALES_ERROR = "FINALIZED_SALES_ERROR",
  FINALIZED_SALES_RECEIPTS = "FINALIZED_SALES_RECEIPTS",
  FINALIZED_SALES_SUCCESS = "FINALIZED_SALES_SUCCESS",
  GENERATED_REPORT = "GENERATED_REPORT",
  GENERATE_PACKAGE_HISTORY = "GENERATE_PACKAGE_HISTORY",
  GENERATE_PACKAGE_HISTORY_ERROR = "GENERATE_PACKAGE_HISTORY_ERROR",
  GENERATE_PACKAGE_HISTORY_SUCCESS = "GENERATE_PACKAGE_HISTORY_SUCCESS",
  INTEGRITY_ERROR = "INTEGRITY_ERROR",
  MATCHED_BLACKLIST_HOSTNAME = "MATCHED_BLACKLIST_HOSTNAME",
  OPENED_BUILDER = "OPENED_BUILDER",
  OPENED_CONTEXT_MENU = "OPENED_CONTEXT_MENU",
  OPENED_CSV_BUILDER = "OPENED_CSV_BUILDER",
  OPENED_METRC_MODAL = "OPENED_METRC_MODAL",
  OPENED_PACKAGE_HISTORY_FROM_TOOLKIT_SEARCH = "OPENED_PACKAGE_HISTORY_FROM_TOOLKIT_SEARCH",
  PERMISSIONS_ADDED = "PERMISSIONS_ADDED",
  RAN_QUICK_SCRIPT = "RAN_QUICK_SCRIPT",
  REFRESH_PACKAGE_RESULTS = "REFRESH_PACKAGE_RESULTS",
  REFRESH_TRANSFER_RESULTS = "REFRESH_TRANSFER_RESULTS",
  REORDERED_TAGS = "REORDERED_TAGS",
  SELECTED_PACKAGE = "SELECTED_PACKAGE",
  SELECTED_PACKAGE_FILTER = "SELECTED_PACKAGE_FILTER",
  SELECTED_PLANT = "SELECTED_PLANT",
  SELECTED_PLANT_FILTER = "SELECTED_PLANT_FILTER",
  SELECTED_TAG = "SELECTED_TAG",
  SELECTED_TAG_FILTER = "SELECTED_TAG_FILTER",
  SELECTED_TRANSFER = "SELECTED_TRANSFER",
  SELECTED_TRANSFER_FILTER = "SELECTED_TRANSFER_FILTER",
  SELECTED_VIEW = "SELECTED_VIEW",
  SPLIT_PACKAGE_FROM_TOOLKIT_SEARCH = "SPLIT_PACKAGE_FROM_TOOLKIT_SEARCH",
  STARTED_FINALIZE_BACKGROUND_JOB = "STARTED_FINALIZE_BACKGROUND_JOB",
  STARTED_SPLIT_PACKAGE_FROM_INLINE_BUTTON = "STARTED_SPLIT_PACKAGE_FROM_INLINE_BUTTON",
  STARTED_TRANSFER_FROM_INLINE_BUTTON = "STARTED_TRANSFER_FROM_INLINE_BUTTON",
  STARTED_TRANSFER_FROM_TOOLKIT_SEARCH = "STARTED_TRANSFER_FROM_TOOLKIT_SEARCH",
  STARTED_VOID_TAGS_BACKGROUND_JOB = "STARTED_VOID_TAGS_BACKGROUND_JOB",
  STOPPED_FINALIZE_BACKGROUND_JOB = "STOPPED_FINALIZE_BACKGROUND_JOB",
  STOPPED_VOID_TAGS_BACKGROUND_JOB = "STOPPED_VOID_TAGS_BACKGROUND_JOB",
  TEXT_BUFFER = "TEXT_BUFFER",
  TTT_MANAGEMENT_EVENT = "TTT_MANAGEMENT_EVENT",
  UPDATED_ACCOUNT_SETTINGS = "UPDATED_ACCOUNT_SETTINGS",
  UPDATED_SETTINGS = "UPDATED_SETTINGS",
  UPDATED_VERSION = "UPDATED_VERSION",
  VIEWED_BUILDER_BACKUPS = "VIEWED_BUILDER_BACKUPS",
  VIEWED_DOCUMENTS = "VIEWED_DOCUMENTS",
  VIEWED_SETTINGS = "VIEWED_SETTINGS",
  VIEWED_STANDALONE_PAGE = "VIEWED_STANDALONE_PAGE",
  VOIDED_TAGS = "VOIDED_TAGS",
  VOID_TAGS = "VOID_TAGS",
  VOID_TAGS_ERROR = "VOID_TAGS_ERROR",
  VOID_TAGS_SUCCESS = "VOID_TAGS_SUCCESS",
}

export const DEXIE_DB_NAME: string = "track-trace-tools";
export const DEXIE_DB_VERSION: number = 1;
// NOTE: updates to this requires a db delete()
export const DEXIE_PACKAGE_TABLE_NAME: string = "packages";
export const DEXIE_TRANSFER_TABLE_NAME: string = "transfers";
export const DEXIE_TAG_TABLE_NAME: string = "tags";
export const DEXIE_PACKAGE_SCHEMA: string = "&Id, License, Label, TagMatcher";
export const DEXIE_TRANSFER_SCHEMA: string = "&Id, License, TagMatcher";
export const DEXIE_TAG_SCHEMA: string = "&Id, License, Label, TagMatcher";

export enum PackageState {
  DEPARTED_FACILITY = "DEPARTED_FACILITY",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  IN_TRANSIT = "IN_TRANSIT",
}

export enum PlantState {
  VEGETATIVE = "VEGETATIVE",
  FLOWERING = "FLOWERING",
  INACTIVE = "INACTIVE",
}

export enum TagState {
  AVAILABLE = "AVAILABLE",
  USED = "USED",
  VOIDED = "VOIDED",
}

export enum HarvestState {
  ACTIVE = "ACTIVE",
  ONHOLD = "ONHOLD",
  INACTIVE = "INACTIVE",
}

export enum TransferState {
  INCOMING = "INCOMING",
  INCOMING_INACTIVE = "INCOMING_INACTIVE",
  OUTGOING = "OUTGOING",
  OUTGOING_INACTIVE = "OUTGOING_INACTIVE",
  REJECTED = "REJECTED",
}

export enum LandingPage {
  DEFAULT = "DEFAULT",
  TRANSFERS = "TRANSFERS",
  TRANSFER_HUB = "TRANSFER_HUB",
  PACKAGES = "PACKAGES",
  PLANTS = "PLANTS",
}

export enum PackageFilterIdentifiers {
  Label = "Label",
  SourceHarvestNames = "SourceHarvestNames",
  SourcePackageLabels = "SourcePackageLabels",
  ItemName = "Item.Name",
  ItemStrainName = "Item.StrainName",
  ItemProductCategoryName = "Item.ProductCategoryName",
  LocationName = "LocationName",
}

export enum PlantFilterIdentifiers {
  Label = "Label",
  StrainName = "StrainName",
  LocationName = "LocationName",
}

export enum TransferFilterIdentifiers {
  ManifestNumber = "ManifestNumber",
}

export enum TagFilterIdentifiers {
  Label = "Label",
}

export const DEBUG_ATTRIBUTE = "debug";

export const TRACK_TRACE_TOOLS_STANDALONE_PAGE = "index.html";

export enum ModalType {
  CSV = "CSV",
  SEARCH = "SEARCH",
  BUILDER = "BUILDER",
  DEBUG = "DEBUG",
  DOCUMENT = "DOCUMENT",
  PROMO = "PROMO",
}

export enum ModalAction {
  OPEN = "OPEN",
  CLOSE = "CLOSE",
}

export enum CsvType {
  PLANTS_LOCATION = "PLANTS_LOCATION",
  PLANTS_HARVEST = "PLANTS_HARVEST",
}

export enum SearchModalView {
  PACKAGE_SEARCH = "PACKAGE_SEARCH",
  TRANSFER_SEARCH = "TRANSFER_SEARCH",
  TAG_SEARCH = "TAG_SEARCH",
}

export enum BuilderView {
  DEFAULT = "DEFAULT",
  BACKUP_LIST = "BACKUP_LIST",
}

export enum BuilderType {
  ADJUST_PACKAGE = "ADJUST_PACKAGE",
  CREATE_HARVEST_PACKAGE = "CREATE_HARVEST_PACKAGE",
  CREATE_IMMATURE_PLANTS_FROM_MOTHER = "CREATE_IMMATURE_PLANTS_FROM_MOTHER",
  CREATE_IMMATURE_PLANT_PACKAGES_FROM_MOTHER_PLANT = "CREATE_IMMATURE_PLANT_PACKAGES_FROM_MOTHER_PLANT",
  CREATE_IMMATURE_PLANT_PACKAGES_FROM_MOTHER_PLANT_BATCH = "CREATE_IMMATURE_PLANT_PACKAGES_FROM_MOTHER_PLANT_BATCH",
  CREATE_TRANSFER = "CREATE_TRANSFER",
  CREATE_TRANSFER_TEMPLATE = "CREATE_TRANSFER_TEMPLATE",
  CREATE_ITEMS = "CREATE_ITEMS",
  DESTROY_PLANTS = "DESTROY_PLANTS",
  FINISH_PACKAGES = "FINISH_PACKAGES",
  HARVEST_PLANTS = "HARVEST_PLANTS",
  MANICURE_PLANTS = "MANICURE_PLANTS",
  MERGE_PACKAGES = "MERGE_PACKAGES",
  MOVE_PLANTS = "MOVE_PLANTS",
  PROMOTE_IMMATURE_PLANTS = "PROMOTE_IMMATURE_PLANTS",
  REMEDIATE_PACKAGE = "REMEDIATE_PACKAGE",
  SPLIT_PACKAGE = "SPLIT_PACKAGE",
  UNPACK_IMMATURE_PLANTS = "UNPACK_IMMATURE_PLANTS",
  PACK_IMMATURE_PLANTS = "PACK_IMMATURE_PLANTS",
  MOVE_PACKAGES = "MOVE_PACKAGES",
  REPLACE_PLANT_TAGS = "REPLACE_PLANT_TAGS",
  REPLACE_PLANT_BATCH_TAGS = "REPLACE_PLANT_BATCH_TAGS",
}

export enum BackgroundTaskState {
  IDLE = "IDLE",
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

const DATA_LOAD_MAX_PAGES: number = 1;
export const DATA_LOAD_PAGE_SIZE: number = 10000;
export const DATA_LOAD_MAX_COUNT: number = DATA_LOAD_PAGE_SIZE * DATA_LOAD_MAX_PAGES;
export const DATA_LOAD_MAX_ITERATION_FAILSAFE: number = 100;
export const DATA_LOAD_FETCH_TIMEOUT_MS: number = 3 * 60 * 1000;

export const PLANTABLE_ITEM_CATEGORY_NAMES = [
  // Note: this was to match an inconsistency in the plural.
  // There's no apparent penalty for having both.
  "Immature Plant",
  "Immature Plants",
  "Clone - Cutting",
  "Clone - Tissue Culture",
  "Seeds",
  "Seeds (each)",
];

export const PLANT_BATCH_TYPES = [
  { text: "Clones", value: "Clone" },
  { text: "Seeds", value: "Seed" },
];

export const GROWTH_PHASES = [
  // { text: "Vegetative", value: "Vegetative" },
  { text: "Flowering", value: "Flowering" },
];

export enum MetrcStatus {
  UP = "UP",
  SLOW = "SLOW",
  DEGRADED = "DEGRADED",
  DOWN = "DOWN",
}

export enum Level {
  L0 = "L0",
  L1 = "L1",
  L2 = "L2",
  L3 = "L3",
}

export const ALASKA_METRC_HOSTNAME = "ak.metrc.com";
export const CALIFORNIA_METRC_HOSTNAME = "ca.metrc.com";
export const COLORADO_METRC_HOSTNAME = "co.metrc.com";
export const DC_METRC_HOSTNAME = "dc.metrc.com";
export const LOUISIANA_METRC_HOSTNAME = "la.metrc.com";
export const MAINE_METRC_HOSTNAME = "me.metrc.com";
export const MARYLAND_METRC_HOSTNAME = "md.metrc.com";
export const MASSACHUSETS_METRC_HOSTNAME = "ma.metrc.com";
export const MICHIGAN_METRC_HOSTNAME = "mi.metrc.com";
export const MISSOURI_METRC_HOSTNAME = "mo.metrc.com";
export const MONTANA_METRC_HOSTNAME = "mt.metrc.com";
export const NEVADA_METRC_HOSTNAME = "nv.metrc.com";
export const OHIO_METRC_HOSTNAME = "oh.metrc.com";
export const OKLAHOMA_METRC_HOSTNAME = "ok.metrc.com";
export const OREGON_METRC_HOSTNAME = "or.metrc.com";
export const WEST_VIRGINIA_METRC_HOSTNAME = "wv.metrc.com";
export const TESTING_AZ_METRC_HOSTNAME = "testing-az.metrc.com";

export const METRC_HOSTNAMES_LACKING_LAB_PDFS: string[] = [];

export const VUEX_KEY = "vuex";

export enum IdbKeyPiece {
  TRANSFER_MODAL_HTML = "transfer_modal_html",
  TRANSFER_MODAL_HTML_TIMESTAMP = "transfer_modal_html_timestamp",
  PACKAGE_MODAL_HTML = "package_modal_html",
  PACKAGE_MODAL_HTML_TIMESTAMP = "package_modal_html_timestamp",
  TRANSFER_TEMPLATE_MODAL_HTML = "transfer_template_modal_html",
  TRANSFER_TEMPLATE_MODAL_HTML_TIMESTAMP = "transfer_template_modal_html_timestamp",
}

export const METRC_INDUSTRY_LICENSE_PATH_REGEX: RegExp = /\/industry\/([^\/]+)(\/.+)/;

export const STRAIN_TESTING_STATUS_OPTIONS: { text: string; value: string }[] = [
  {
    text: "None",
    value: "None",
  },
  {
    text: "In House",
    value: "InHouse",
  },
  {
    text: "Third Party",
    value: "ThirdParty",
  },
];

export enum TabKey {
  PLANTS_PLANTBATCHES_ACTIVE = "plants_plantbatches_active",
  PLANTS_PLANTBATCHES_INACTIVE = "plants_plantbatches_inactive",
  PlANTS_PLANTS_VEGETATIVE = "plants_plants_vegetative",
  PlANTS_PLANTS_FLOWERING = "plants_plants_flowering",
  PlANTS_PLANTS_ONHOLD = "plants_plants_onhold",
  PlANTS_PLANTS_INACTIVE = "plants_plants_inactive",
  PlANTS_PLANTS_ADDITIVE = "plants_plants_additives",
  PlANTS_PLANTS_WASTE = "plants_plants_waste",
  PlANTS_HARVESTED_ACTIVE = "plants_harvested_active",
  PlANTS_HARVESTED_ONHOLD = "plants_harvested_onhold",
  PlANTS_HARVESTED_INACTIVE = "plants_harvested_inactive",
  PACKAGES_ACTIVE = "packages_active",
  PACKAGES_ONHOLD = "packages_onhold",
  PACKAGES_INACTIVE = "packages_inactive",
  PACKAGES_INTRANSIT = "packages_intransit",
  TRANSFERS_INCOMING = "transfers_incoming",
  TRANSFERS_OUTGOING = "transfers_outgoing",
  TRANSFERS_REJECTED = "transfers_rejected",
  SALES_ACTIVE = "sales_active",
  SALES_INACTIVE = "sales_inactive",
  TAGS_AVAILABLE = "tags_available",
  TAGS_USED = "tags_used",
  TAGS_VOIDED = "tags_voided",
}

export enum HistoryTreeNodeType {
  OWNED_PACKAGE = "OWNED_PACKAGE",
  UNOWNED_PACKAGE = "UNOWNED_PACKAGE",
}

export enum PackageTabLabel {
  ACTIVE = "Active",
  ON_HOLD = "On Hold",
  INACTIVE = "Inactive",
  IN_TRANSIT = "In Transit",
}

export enum SalesTabLabel {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

export enum TagsTabLabel {
  AVAILABLE = "Available",
  USED = "Used",
  VOIDED = "Voided",
}

export enum PlantsTabLabel {
  IMMATURE = "Immature",
  ON_HOLD = "On Hold",
  VEGETATIVE = "Vegetative",
  FLOWERING = "Flowering",
  HARVESTED = "Harvested",
  INACTIVE = "Inactive",
  ADDITIVE = "Additive",
  WASTE = "Waste",
}

export enum TransfersTabLabel {
  INCOMING = "Incoming",
  OUTGOING = "Outgoing",
  REJECTED = "Rejected",
  INACTIVE = "Inactive",
}

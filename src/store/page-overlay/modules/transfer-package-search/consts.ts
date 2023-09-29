export enum TransferPackageSearchState {
  INITIAL = "INITIAL",
  INFLIGHT = "INFLIGHT",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR"
}

export enum TransferPackageSearchAlgorithm {
  OLD_TO_NEW = "OLD_TO_NEW",
  NEW_TO_OLD = "NEW_TO_OLD"
}

export enum TransferPackageSearchMutations {
  TRANSFER_PACKAGE_SEARCH_MUTATION = "TRANSFER_PACKAGE_SEARCH_MUTATION",
}

export enum TransferPackageSearchGetters {
  TRANSFER_PACKAGE_SEARCH_GETTER = "TRANSFER_PACKAGE_SEARCH_GETTER",
}

export enum TransferPackageSearchActions {
  TRANSFER_PACKAGE_SEARCH_ACTION = "TRANSFER_PACKAGE_SEARCH_ACTION",
  EXECUTE_SEARCH = "EXECUTE_SEARCH",
  STOP_SEARCH = "STOP_SEARCH",
  RESET_SEARCH = "RESET_SEARCH",
  UPDATE_SEARCH_PARAMETERS = "UPDATE_SEARCH_PARAMETERS"
}

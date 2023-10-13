export enum GraphMutations {
  GRAPH_MUTATION = "GRAPH_MUTATION",
}

export enum GraphGetters {
  GRAPH_GETTER = "GRAPH_GETTER",
}

export enum GraphActions {
  LOAD_AND_RENDER = "LOAD_AND_RENDER",
  SET_SEARCH_QUERY = "SET_SEARCH_QUERY",
  SET_HOVERED_NODE = "SET_HOVERED_NODE",
  SELECT_NODE = "SELECT_NODE",
  HANDLE_EVENT = "HANDLE_EVENT"
}

export enum GraphRenderAlgorithm {
  RANDOM = "RANDOM",
  DATE_SORT = "DATE_SORT",
}

export enum GraphStatus {
  INITIAL = "INITIAL",
  INFLIGHT = "INFLIGHT",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

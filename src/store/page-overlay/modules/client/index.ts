import { IPluginState } from "@/interfaces";
import { t3RequestManager } from "@/modules/t3-request-manager.module";
import { toastManager } from "@/modules/toast-manager.module";
import { ActionContext } from "vuex";
import { ClientActions, ClientGetters, ClientMutations } from "../client/consts";
import { IClientState } from "../client/interfaces";

const inMemoryState = {};

const persistedState = {
  clientName: null,
  values: {},
};

const defaultState: IClientState = {
  ...inMemoryState,
  ...persistedState,
};

export const clientModule = {
  state: () => defaultState,
  mutations: {
    [ClientMutations.CLIENT_MUTATION](state: IClientState, data: any) {
      // state.data = data;
    },
  },
  getters: {
    [ClientGetters.CLIENT_GETTER]: (
      state: IClientState,
      getters: any,
      rootState: any,
      rootGetters: any
    ) => {
      // return state.data
    },
  },
  actions: {
    [ClientActions.UPDATE_CLIENT_VALUES]: async (
      ctx: ActionContext<IClientState, IPluginState>,
      data: { notify?: boolean } = {}
    ) => {
      if (!ctx.rootState.settings.licenseKey) {
        ctx.state.clientName = null;
        ctx.state.values = {};
        return;
      }

      const { clientName, values } = await t3RequestManager.loadClientDataOrError(
        ctx.rootState.settings.licenseKey
      );

      if (data.notify && !clientName) {
        toastManager.openToast(`This license key is invalid.`, {
          title: "License Key Error",
          autoHideDelay: 5000,
          variant: "danger",
          appendToast: true,
          toaster: "ttt-toaster",
          solid: true,
        });
      }

      ctx.state.clientName = clientName;
      ctx.state.values = values;
    },
  },
};

export const clientReducer = (state: IClientState): IClientState => {
  return {
    ...state,
    ...inMemoryState,
  };
};
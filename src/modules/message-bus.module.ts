import { MessageType } from "@/consts";
import { IAtomicService, IBusEvent, IBusMessageOptions } from "@/interfaces";
import store from "@/store/page-overlay/index";
import { debugLogFactory } from "@/utils/debug";
import * as Sentry from "@sentry/browser";
import { v4 } from "uuid";

const debugLog = debugLogFactory("message-bus.module.ts");

class MessageBus implements IAtomicService {
  handlers: Map<string, Function> = new Map();

  async init() {}

  async sendMessageToBackground<T>(
    type: MessageType,
    data: any = [],
    options: IBusMessageOptions = {}
  ): Promise<any> {
    // Options are collected here for *all* message types
    options.muteAnalytics = store.state.muteAnalytics;

    try {
      const uuid = v4();

      const responsePromise = new Promise((resolve, reject) => {
        this.handlers.set(uuid, resolve);

        const id = setTimeout(() => reject("Background message send timed out"), 5000);

        this.handlers.set(uuid, (event: any) => {
          clearTimeout(id);
          resolve(event);
        });
      });

      responsePromise
        .catch((e) => {
          console.error("Failed to send message to background (reject)", type);

          Sentry.captureException(e, { tags: { type } });
        })
        .finally(() => this.handlers.delete(uuid));

      const event: IBusEvent = {
        uuid,
        message: {
          type,
          data,
          options,
        },
      };

      chrome.runtime.sendMessage(event, (response: IBusEvent) => {
        this.handleResponseFromBackground(response);
      });

      return responsePromise;
    } catch (e) {
      // This is usually triggered in development when reloading the extension between page refreshes.
      console.error("Failed to send message to background (catch)", type);

      Sentry.captureException(e, { tags: { type } });
    }
  }

  private handleResponseFromBackground(event: IBusEvent) {
    if (!!event.uuid) {
      const handler = this.handlers.get(event.uuid);

      if (handler) {
        handler(event.message);
      }

      this.handlers.delete(event.uuid);
    }
  }
}

export let messageBus = new MessageBus();

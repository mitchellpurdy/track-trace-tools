import { IAtomicService, IXlsxFile } from "@/interfaces";
import { IAnnouncementData } from "@/store/page-overlay/modules/announcements/interfaces";
import { AxiosError } from "axios";
import { authManager } from "./auth-manager.module";
import { customAxios } from "./fetch-manager.module";

// const BASE_URL = isDevelopment() ? "http://127.0.0.1:5000/" : "https://api.trackandtrace.tools/";
const BASE_URL = "https://api.trackandtrace.tools/";

const CLIENT_KEY_PATH = "client";
const VERIFY_TEST_PATH = "verify/test";
const FACILITIES_PATH = "facilities";
const ANNOUNCEMENTS_PATH = "announcements";
const T3PLUS_PATH = "plus_users/status";
const FLAGS_PATH = "flags";
const GOOGLE_MAPS_DIRECTIONS = "metrc/directions";
const GENERATE_REPORT_PATH = "reports/generate";
const DOWNLOAD_REPORT_PATH = "reports/download";
const EMAIL_REPORT_PATH = "reports/email";

const DEFAULT_POST_HEADERS = {
  "Content-Type": "application/json",
};
const DEFAULT_GET_HEADERS = {};

class T3RequestManager implements IAtomicService {
  async init() {}

  async loadClientDataOrError(clientKey: string): Promise<{
    clientName: string | null;
    values: { [key: string]: any };
  }> {
    try {
      const response = await customAxios(BASE_URL + CLIENT_KEY_PATH, {
        method: "POST",
        headers: DEFAULT_POST_HEADERS,
        body: JSON.stringify({ client_key: clientKey }),
      });

      const { client_name, values } = response.data;

      if (!client_name) {
        throw new Error("Missing client_name");
      }

      if (!values) {
        throw new Error("Missing values");
      }

      return {
        clientName: client_name,
        values,
      };
    } catch (e) {
      // Only overwrite values if server explicitly indicates a 401
      if (e instanceof AxiosError && e.response?.status === 401) {
        return {
          clientName: null,
          values: {},
        };
      }

      throw new Error("Error fetching client values. Declining to override.");
    }
  }

  async loadT3plus(): Promise<any[]> {
    const authState = await authManager.authStateOrError();

    const response = await customAxios(BASE_URL + T3PLUS_PATH, {
      method: "POST",
      headers: DEFAULT_POST_HEADERS,
      body: JSON.stringify({ metrc_username: authState.identity }),
    });

    return response.data;
  }

  async loadFlags(): Promise<{ [key: string]: string }> {
    const response = await customAxios(BASE_URL + FLAGS_PATH, {
      method: "POST",
      headers: DEFAULT_POST_HEADERS,
    });

    return response.data;
  }

  async loadDirections({
    origin,
    destination,
  }: {
    origin: string;
    destination: string;
  }): Promise<{ directions: string }> {
    const response = await customAxios(BASE_URL + GOOGLE_MAPS_DIRECTIONS, {
      method: "POST",
      headers: DEFAULT_POST_HEADERS,
      body: JSON.stringify({
        origin,
        destination,
      }),
    });

    return response.data;
  }

  async generateAndDownloadReport({ xlsxFile }: { xlsxFile: IXlsxFile }) {
    const response = await customAxios(BASE_URL + GENERATE_REPORT_PATH, {
      method: "POST",
      headers: DEFAULT_POST_HEADERS,
      body: JSON.stringify(xlsxFile),
      responseType: "json",
    });

    window.open(`${BASE_URL}${DOWNLOAD_REPORT_PATH}/${response.data.report_id}`, "_blank");

    return response;
  }

  async generateAndEmailReport({ xlsxFile, email }: { xlsxFile: IXlsxFile; email: string }) {
    const response = await customAxios(BASE_URL + GENERATE_REPORT_PATH, {
      method: "POST",
      headers: DEFAULT_POST_HEADERS,
      body: JSON.stringify(xlsxFile),
      responseType: "json",
    });

    const emailResponse = fetch(BASE_URL + EMAIL_REPORT_PATH, {
      method: "POST",
      headers: DEFAULT_POST_HEADERS,
      body: JSON.stringify({
        email,
        report_id: response.data.report_id,
      }),
    });

    return emailResponse;
  }

  async loadAnnouncements(): Promise<IAnnouncementData[]> {
    const response = await customAxios(BASE_URL + ANNOUNCEMENTS_PATH, {
      method: "GET",
      headers: DEFAULT_GET_HEADERS,
    });

    return response.data;
  }

  async upsertFacilities(licenses: string[]) {
    const data = {
      hostname: window.location.hostname,
      licenses,
    };

    return customAxios(BASE_URL + FACILITIES_PATH, {
      method: "POST",
      headers: DEFAULT_POST_HEADERS,
      body: JSON.stringify(data),
    });
  }

  async testVerify() {
    const cookies = await authManager.cookies();

    const data = {
      cookies,
      domain: window.location.hostname,
    };

    console.log(data);

    return customAxios(BASE_URL + VERIFY_TEST_PATH, {
      method: "POST",
      headers: DEFAULT_POST_HEADERS,
      body: JSON.stringify(data),
    });
  }
}

export const t3RequestManager = new T3RequestManager();

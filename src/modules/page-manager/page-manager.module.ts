import {
  DEBUG_ATTRIBUTE,
  MessageType,
  ModalAction,
  ModalType,
  PackageFilterIdentifiers,
  PlantFilterIdentifiers,
  TagFilterIdentifiers,
  TransferFilterIdentifiers,
} from "@/consts";
import { DarkModeState, IAtomicService, SnowflakeState } from "@/interfaces";
import { toastManager } from "@/modules/toast-manager.module";
import { MutationType } from "@/mutation-types";
import store from "@/store/page-overlay/index";
import { debugLogFactory } from "@/utils/debug";
import _ from "lodash";
import { timer } from "rxjs";
import { analyticsManager } from "../analytics-manager.module";
import { authManager } from "../auth-manager.module";
import { metrcModalManager } from "../metrc-modal-manager.module";
import { modalManager } from "../modal-manager.module";
import {
  PACKAGE_TAB_REGEX,
  PLANTS_TAB_REGEX,
  REPORTS_TAB_REGEX,
  SALES_TAB_REGEX,
  TAG_TAB_REGEX,
  TRANSFER_HUB_REGEX,
  TRANSFER_TAB_REGEX,
  TRANSFER_TEMPLATE_TAB_REGEX,
} from "./consts";
import {
  addButtonsToPackageTableImpl,
  addButtonsToTransferTableImpl,
  modifyTransferModalImpl,
} from "./inline-widget-utils";
import {
  clickLogoutDismissImpl,
  clickRefreshLinksImpl,
  controlSnowflakeAnimationImpl,
  getVisibleAnimationContainerImpl,
  interceptViewManifestButtonImpl,
  setPaginationImpl,
  suppressAnimationContainerImpl,
} from "./metrc-utils";
import {
  acquirePackageFilterElementsImpl,
  acquirePlantFilterElementsImpl,
  acquireTransferFilterElementsImpl,
  applyPackageFilterImpl,
  applyPlantFilterImpl,
  applyTagFilterImpl,
  applyTransferFilterImpl,
  readPackageFiltersImpl,
  readTagFiltersImpl,
  readTransferFiltersImpl,
  resetFilterElementReferencesImpl,
  resetMetrcPackageFiltersImpl,
  resetMetrcPlantFiltersImpl,
  resetMetrcTagFiltersImpl,
  resetMetrcTransferFiltersImpl,
  setPackageFilterImpl,
  setPlantFilterImpl,
  setTagFilterImpl,
  setTransferFilterImpl,
} from "./search-utils";
import {
  controlDarkModeImpl,
  controlLogoutBarImpl,
  setExpandedClassImpl,
  togglePageVisibilityClassesImpl,
} from "./style-utils";
import {
  activeTabOrNullImpl,
  clickTabStartingWithImpl,
  isTabActiveImpl,
  managePackageTabsImpl,
  managePlantTabsImpl,
  manageSalesTabsImpl,
  manageTagsTabsImpl,
  manageTransfersTabsImpl,
} from "./tab-utils";

const debugLog = debugLogFactory("page-manager.module.ts");

class PageManager implements IAtomicService {
  textBuffer: string = "";

  suppressAnimationContainerTimeout: any = null;

  plantsTabs: NodeList = [] as any;
  selectedPlantTab: HTMLElement | null = null;

  packageTabs: NodeList = [] as any;
  selectedPackageTab: HTMLElement | null = null;

  transferTabs: NodeList = [] as any;
  selectedTransferTab: HTMLElement | null = null;

  salesTabs: NodeList = [] as any;

  tagTabs: NodeList = [] as any;
  selectedTagTab: HTMLElement | null = null;

  paginationOptions: NodeList = [] as any;
  extendButton: HTMLElement | null = null;
  snowflakeCanvas: HTMLElement | null = null;
  sessionTimeoutAlert: HTMLElement | null = null;
  sessionTimeoutBar: HTMLElement | null = null;
  tttTransferButton: HTMLElement | null = null;
  tttNewPackageButton: HTMLElement | null = null;
  quickTransferButton: HTMLElement | null = null;
  quickTransferTemplateButton: HTMLElement | null = null;
  quickPackageButton: HTMLElement | null = null;
  packageToolsButton: HTMLElement | null = null;
  reportToolsButton: HTMLElement | null = null;
  transferToolsButton: HTMLElement | null = null;
  plantToolsButton: HTMLElement | null = null;
  visiblePaginationSizeSelector: HTMLElement | null = null;
  viewManifestButton: HTMLElement | null = null;
  replacementManifestButton: HTMLElement | null = null;

  animationContainers: HTMLElement[] = [];

  activeModal: HTMLElement | null = null;

  // Transfer Modal

  addMoreButton: HTMLElement | null = null;
  addMoreInput: HTMLElement | null = null;
  packageTagInputContainer: HTMLElement | null = null;

  // Plant Search
  plantSearchComponent: HTMLElement | null = null;

  plantLabelFilterInput: HTMLInputElement | null = null;
  plantLabelFilterSelect: HTMLElement | null = null;
  plantLabelApplyFiltersButton: HTMLButtonElement | null = null;

  plantStrainNameFilterInput: HTMLInputElement | null = null;
  plantStrainNameApplyFiltersButton: HTMLButtonElement | null = null;

  plantLocationNameFilterInput: HTMLInputElement | null = null;
  plantLocationNameApplyFiltersButton: HTMLButtonElement | null = null;

  plantClearFiltersButton: HTMLButtonElement | null = null;

  // Package Search

  packageSearchComponent: HTMLElement | null = null;

  packageLabelFilterInput: HTMLInputElement | null = null;
  packageLabelFilterSelect: HTMLElement | null = null;
  packageLabelApplyFiltersButton: HTMLButtonElement | null = null;

  packageSourceHarvestNameFilterInput: HTMLInputElement | null = null;
  packageSourceHarvestNameApplyFiltersButton: HTMLButtonElement | null = null;

  packageSourcePackageLabelFilterInput: HTMLInputElement | null = null;
  packageSourcePackageLabelApplyFiltersButton: HTMLButtonElement | null = null;

  packageItemNameFilterInput: HTMLInputElement | null = null;
  packageItemNameApplyFiltersButton: HTMLButtonElement | null = null;

  packageItemStrainNameFilterInput: HTMLInputElement | null = null;
  packageItemStrainNameApplyFiltersButton: HTMLButtonElement | null = null;

  packageItemProductCategoryNameFilterInput: HTMLInputElement | null = null;
  packageItemProductCategoryNameApplyFiltersButton: HTMLButtonElement | null = null;

  packageLocationNameFilterInput: HTMLInputElement | null = null;
  packageLocationNameApplyFiltersButton: HTMLButtonElement | null = null;

  packageClearFiltersButton: HTMLButtonElement | null = null;

  // Transfer Search

  transferManifestNumberFilterInput: HTMLInputElement | null = null;
  transferManifestNumberFilterSelect: HTMLElement | null = null;
  transferManifestNumberApplyFiltersButton: HTMLButtonElement | null = null;

  transferClearFiltersButton: HTMLButtonElement | null = null;

  // Tag Search

  tagNumberFilterInput: HTMLInputElement | null = null;
  tagNumberFilterSelect: HTMLElement | null = null;
  tagNumberApplyFiltersButton: HTMLButtonElement | null = null;

  tagClearFiltersButton: HTMLButtonElement | null = null;

  // Prevents recurring method from overrunning itself
  paused: boolean = false;

  refresh: Promise<void> = Promise.resolve();
  refreshResolve: any;

  async init() {
    // this.manageLoginRedirect();
    this.manageRecoveryLinks();

    this.setEventHandlers();

    this.initializeDebug();

    try {
      await authManager.authStateOrError();
    } catch (e) {
      return;
    }

    // addRobotoToHead();

    this.cycleRefreshPromise();

    // These are references which are not expected to be dynamic in nature
    this.snowflakeCanvas = document.querySelector("canvas") as HTMLElement | null;
    this.packageTabs = document.querySelectorAll("#packages_tabstrip li.k-item") as NodeList;
    this.plantsTabs = document.querySelectorAll("#plants_tabstrip li.k-item") as NodeList;
    this.transferTabs = document.querySelectorAll("#transfers_tabstrip li.k-item") as NodeList;
    this.salesTabs = document.querySelectorAll("#sales_tabstrip li.k-item") as NodeList;
    this.tagTabs = document.querySelectorAll("#tags_tabstrip li.k-item") as NodeList;
    this.plantsTabs = document.querySelectorAll("#plants_tabstrip li.k-item") as NodeList;

    // Eagerly modify
    timer(0, 2500).subscribe(() => this.modifyPageAtInterval());

    const debouncedHandler = _.debounce(() => this.modifyPageOnDomChange(), 100);

    const observer = new MutationObserver(() => debouncedHandler());

    observer.observe(document.body, { subtree: true, childList: true });
  }

  pauseFor(pauseMs: number) {
    this.paused = true;

    setTimeout(() => (this.paused = false), pauseMs);
  }

  cycleRefreshPromise(): void {
    this.refreshResolve && this.refreshResolve();
    this.refresh = new Promise((resolve, reject) => {
      this.refreshResolve = resolve;
    });
  }

  /**
   * Shared method for emulating a mutex for methods that use native event dispatch
   */
  clickSettleDelay() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  initializeDebug() {
    timer(0, 1000).subscribe(() => {
      // This works! Use for scanner
      // console.log(document.activeElement);
      // try {
      //   // @ts-ignore
      //   document.activeElement.value = "jake";
      // } catch (e) {
      //   console.error(e);
      // }

      // Phase out Task Queue, remove from settings
      store.commit(MutationType.PURGE_TASK_QUEUE);

      if (window.location.hash === "#debug") {
        document.body.setAttribute(DEBUG_ATTRIBUTE, "true");
      }

      const currentDebugAttribute: string | null = document.body.getAttribute(DEBUG_ATTRIBUTE);
      const currentDebugState: string = store.state.debugMode.toString();

      if (currentDebugAttribute === currentDebugState) {
        // No change
        return;
      } else if (!["true", "false"].includes(currentDebugAttribute || "")) {
        // Attribute has not yet been set
        document.body.setAttribute(DEBUG_ATTRIBUTE, currentDebugState);
        return;
      } else {
        // Update state from attribute
        store.commit(MutationType.SET_DEBUG_MODE, currentDebugAttribute === "true");
      }
    });
  }

  flushTextBuffer() {
    // Flush text buffer
    analyticsManager.track(MessageType.TEXT_BUFFER, {
      textBuffer: this.textBuffer,
    });

    this.textBuffer = "";
  }

  setEventHandlers() {
    // This only informs us of how the users are spending time on Metrc
    // without disclosing sensitive information.
    document.addEventListener("click", (e: MouseEvent) => {
      if (e.target && e.isTrusted) {
        if (this.textBuffer.length > 0) {
          this.flushTextBuffer();
        }

        try {
          let targetText = null;
          let targetClassName = null;
          let clientX = e.clientX;
          let clientY = e.clientY;
          let windowWidth = window.innerWidth;
          let windowHeight = window.innerHeight;

          // Don't allow large strings
          try {
            // @ts-ignore
            targetText = e.target.innerText.trim().slice(0, 100);
          } catch (err) {}

          try {
            // @ts-ignore
            targetClassName = e.target.className;
          } catch (err) {}

          analyticsManager.track(MessageType.CLICK, {
            targetText,
            targetClassName,
            clientX,
            clientY,
            windowWidth,
            windowHeight,
          });
        } catch (err) {}
      }
    });

    document.addEventListener("keyup", (e: KeyboardEvent) => {
      this.textBuffer += e.key;

      if (this.textBuffer.length > 500) {
        this.flushTextBuffer();
      }
    });
  }

  async modifyPageAtInterval() {
    if (this.paused) {
      return;
    }

    this.paused = true;

    try {
      // TODO much of this can be moved into observer handler
      if (!this.extendButton) {
        this.extendButton = document.querySelector("#extend_session") as HTMLElement | null;
      }

      if (!this.sessionTimeoutAlert) {
        this.sessionTimeoutAlert = document.querySelector(
          "#session_timeout_alert"
        ) as HTMLElement | null;
      }

      if (!this.sessionTimeoutBar) {
        this.sessionTimeoutBar = document.querySelector("#session_timeout") as HTMLElement | null;
      }

      if (!this.visiblePaginationSizeSelector) {
        this.visiblePaginationSizeSelector = document.querySelector(
          ".k-state-active .k-pager-sizes .k-dropdown-wrap"
        );
      }

      // TODO move this into property
      const userAlerts = document.querySelector("#user-alerts");
      if (userAlerts) {
        // @ts-ignore
        userAlerts.style["max-height"] = "150px";
        // @ts-ignore
        userAlerts.style["overflow-y"] = "auto";
      }

      this.activeModal = document.querySelector("div.k-widget.k-window");

      // TODO the methods should read the store directly
      if (store.state.settings?.preventLogout) {
        await this.clickLogoutDismiss();
      }

      if (store.state.settings) {
        this.controlLogoutBar(store.state.settings.preventLogout);
        this.controlSnowflakeAnimation(store.state.settings.snowflakeState);
        this.controlDarkMode(store.state.settings.darkModeState);
      }
      this.togglePageVisibilityClasses();

      if (window.location.pathname.match(PACKAGE_TAB_REGEX)) {
        await this.managePackageTabs();
        this.acquirePackageFilterElements();

        this.addButtonsToPackageTable();
      }

      if (window.location.pathname.match(TRANSFER_TAB_REGEX)) {
        await this.manageTransfersTabs();
        this.acquireTransferFilterElements();
        this.readTransferFilters();

        this.interceptViewManifestButton();

        this.addButtonsToTransferTable();

        // Transfer subtable for packages should get these too
        // This MUST occur after the transfer buttons are added
        this.addButtonsToPackageTable();
      }

      if (window.location.pathname.match(TRANSFER_HUB_REGEX)) {
        this.interceptViewManifestButton();
      }

      if (window.location.pathname.match(TRANSFER_TEMPLATE_TAB_REGEX)) {
      }

      if (window.location.pathname.match(TAG_TAB_REGEX)) {
        await this.manageTagsTabs();
        this.acquireTagFilterElements();
        this.readTagFilters();
      }

      if (window.location.pathname.match(SALES_TAB_REGEX)) {
        await this.manageSalesTabs();
      }

      if (window.location.pathname.match(PLANTS_TAB_REGEX)) {
        await this.managePlantTabs();
        this.acquirePlantFilterElements();
      }

      if (window.location.pathname.match(REPORTS_TAB_REGEX)) {
      }

      await this.modifyTransferModal();

      await this.setPagination();
    } finally {
      this.paused = false;

      this.cycleRefreshPromise();
    }
  }

  async modifyPageOnDomChange() {
    this.modifyPageAtInterval();

    this.updatePromoModal();

    metrcModalManager.maybeAddWidgetsAndListenersToModal();
  }

  getVisibleAnimationContainer(expectedText: string) {
    return getVisibleAnimationContainerImpl(expectedText);
  }

  isTabActive(tab: any) {
    return isTabActiveImpl(tab);
  }

  activeTabOrNull(tabList: NodeList) {
    return activeTabOrNullImpl(tabList);
  }

  suppressAnimationContainer() {
    return suppressAnimationContainerImpl();
  }

  async manageRecoveryLinks() {
    // If the page is 500 or 404, add a simple link to get them home

    // This needs to wait a bit for the toaster to initialize, otherwise the messages don't show
    await timer(1000);

    const h1 = document.querySelector("h1");
    const h2 = document.querySelector("h2");

    if (h1?.innerText.toUpperCase().includes("SERVER ERROR")) {
      if (h2?.innerText.toUpperCase().includes("404 - FILE OR DIRECTORY NOT FOUND")) {
        // 404
        toastManager.openToast(`Click here to go back to your Metrc homepage`, {
          title: "Page Not Found",
          autoHideDelay: 30000,
          variant: "danger",
          appendToast: true,
          toaster: "ttt-toaster",
          solid: true,
          href: window.location.origin,
        });

        analyticsManager.track(MessageType.DETECTED_METRC_ERROR_PAGE, { type: "Not found" });
      }

      if (h2?.innerText.toUpperCase().includes("RUNTIME ERROR")) {
        // 500
        toastManager.openToast(`Metrc might be down`, {
          title: "Server Error",
          autoHideDelay: 30000,
          variant: "danger",
          appendToast: true,
          toaster: "ttt-toaster",
          solid: true,
        });
        toastManager.openToast(`Click here to go back to your Metrc homepage`, {
          title: "Server Error",
          autoHideDelay: 30000,
          variant: "danger",
          appendToast: true,
          toaster: "ttt-toaster",
          solid: true,
          href: window.location.origin,
        });

        analyticsManager.track(MessageType.DETECTED_METRC_ERROR_PAGE, { type: "Server error" });
      }
    }
  }

  async addButtonsToPackageTable() {
    return addButtonsToPackageTableImpl();
  }

  async interceptViewManifestButton() {
    return interceptViewManifestButtonImpl();
  }

  async addButtonsToTransferTable() {
    return addButtonsToTransferTableImpl();
  }

  modifyTransferModal() {
    return modifyTransferModalImpl();
  }

  async clickTabStartingWith(
    tabList: NodeList,
    tabText: string,
    previousTabText: string | null = null,
    /**
     * Positive integer
     *
     * 1 means it must be the previously seen node
     * 2 means it was seen two nodes ago
     */
    previousTabTextOffset: number | null = null
  ) {
    return clickTabStartingWithImpl(tabList, tabText, previousTabText, previousTabTextOffset);
  }

  async acquirePlantFilterElements() {
    return acquirePlantFilterElementsImpl();
  }

  async acquirePackageFilterElements() {
    return acquirePackageFilterElementsImpl();
  }

  async acquireTransferFilterElements() {
    return acquireTransferFilterElementsImpl();
  }

  async acquireTagFilterElements() {
    return acquirePackageFilterElementsImpl();
  }

  readPackageFilters() {
    return readPackageFiltersImpl();
  }

  readTransferFilters() {
    return readTransferFiltersImpl();
  }

  readTagFilters() {
    return readTagFiltersImpl();
  }

  async setPlantFilter(plantFilterIdentifier: PlantFilterIdentifiers, value: string) {
    return setPlantFilterImpl(plantFilterIdentifier, value);
  }

  async setPackageFilter(packageFilterIdentifier: PackageFilterIdentifiers, value: string) {
    return setPackageFilterImpl(packageFilterIdentifier, value);
  }

  async setTransferFilter(transferFilterIdentifier: TransferFilterIdentifiers, value: string) {
    return setTransferFilterImpl(transferFilterIdentifier, value);
  }

  async setTagFilter(tagFilterIdentifier: TagFilterIdentifiers, value: string) {
    return setTagFilterImpl(tagFilterIdentifier, value);
  }

  applyPlantFilter(plantFilterIdentifier: PlantFilterIdentifiers) {
    return applyPlantFilterImpl(plantFilterIdentifier);
  }

  applyPackageFilter(packageFilterIdentifier: PackageFilterIdentifiers) {
    return applyPackageFilterImpl(packageFilterIdentifier);
  }

  applyTransferFilter(transferFilterIdentifier: TransferFilterIdentifiers) {
    return applyTransferFilterImpl(transferFilterIdentifier);
  }

  applyTagFilter(tagFilterIdentifier: TagFilterIdentifiers) {
    return applyTagFilterImpl(tagFilterIdentifier);
  }

  // Clicks the Metrc reset button - everything is wiped out
  async resetMetrcPlantFilters() {
    return resetMetrcPlantFiltersImpl();
  }

  // Clicks the Metrc reset button - everything is wiped out
  async resetMetrcPackageFilters() {
    return resetMetrcPackageFiltersImpl();
  }

  // Clicks the Metrc reset button - everything is wiped out
  async resetMetrcTransferFilters() {
    return resetMetrcTransferFiltersImpl();
  }

  // Clicks the Metrc reset button - everything is wiped out
  async resetMetrcTagFilters() {
    return resetMetrcTagFiltersImpl();
  }

  // When a tab changes, we need to wipe out the references and reacquire them
  async resetFilterElementReferences() {
    return resetFilterElementReferencesImpl();
  }

  // This should be done exactly once per pageload, once the element is found
  async setPagination() {
    return setPaginationImpl();
  }

  async clickLogoutDismiss() {
    return clickLogoutDismissImpl();
  }

  controlSnowflakeAnimation(state: SnowflakeState) {
    return controlSnowflakeAnimationImpl(state);
  }

  controlDarkMode(state: DarkModeState) {
    return controlDarkModeImpl(state);
  }

  togglePageVisibilityClasses() {
    return togglePageVisibilityClassesImpl();
  }

  controlLogoutBar(hide: boolean) {
    return controlLogoutBarImpl(hide);
  }

  async managePlantTabs() {
    return managePlantTabsImpl();
  }

  async managePackageTabs() {
    return managePackageTabsImpl();
  }

  async manageTransfersTabs() {
    return manageTransfersTabsImpl();
  }

  async manageSalesTabs() {
    return manageSalesTabsImpl();
  }

  async manageTagsTabs() {
    return manageTagsTabsImpl();
  }

  setExpandedClass() {
    return setExpandedClassImpl();
  }

  clickRefreshLinks() {
    return clickRefreshLinksImpl();
  }

  updatePromoModal() {
    if (document.querySelector("#spinnerBackground")) {
      modalManager.dispatchModalEvent(ModalType.PROMO, ModalAction.OPEN, {});
    } else {
      modalManager.dispatchModalEvent(ModalType.PROMO, ModalAction.CLOSE, {});
    }
  }
}

export let pageManager = new PageManager();
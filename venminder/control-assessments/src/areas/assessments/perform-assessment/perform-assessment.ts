import { computedFrom, inject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { AssessmentService } from "services/assessment-service";
import { CreateNewAssessmentRequest } from "services/models/assessments/create-new-assessment-request";
import { OrderItem } from "services/models/service-orders/order-item";
import { Template } from "services/models/templates/template";
import { OrderService } from "services/order-service";
import { TemplateService } from "services/template-service";
import { LiteralColumn } from "shared-from-dcdev/resources/features/vm-grid-v2/configuration/gridColumns";
import { VmGridDataManaged } from "shared-from-dcdev/resources/features/vm-grid-v2/data/vm-data-managed";
import { VmGridPagination } from "shared-from-dcdev/resources/features/vm-grid-v2/data/vm-data-pagination";
import type { IVmGridConfig } from "shared-from-dcdev/resources/features/vm-grid-v2/interfaces/vm-grid-interfaces";
import { TemplateStatus } from "../../../shared/enums/template-statuses";

class OrderInfoGridData extends VmGridDataManaged {
  constructor() {
    super([], new VmGridPagination(1, 0, 0, 0, 0, 25));
  }
}

class OrderInfoData {
  constructor(public orderData: string = "") {}

  static create(
    item: OrderInfoData = null,
    preserveNull = false
  ): OrderInfoData {
    return item == null
      ? preserveNull
        ? null
        : new OrderInfoData()
      : new OrderInfoData(item.orderData);
  }
}

export class PerformAssessment {
  redirecting = false;
  gridConfig: IVmGridConfig | undefined;
  orderInfoLoaded = false;
  selectedTemplateItem: Template = null;
  templateDropdownItems: Template[] = [];
  customDropdownItems: Template[] = [];
  readonly pageTitle = "Perform Assessment";
  readonly gridData = new OrderInfoGridData();
  private orderId: string = null;
  private orderData: OrderInfoData[] = [];
  private orderDetails: OrderItem = null;

  @computedFrom("selectedTemplateItem")
  get isTemplateSelected(): boolean {
    return this.selectedTemplateItem != null;
  }

  constructor(
    @inject(Router) private readonly router: Router,
    @inject(OrderService) private readonly orderService: OrderService,
    @inject(TemplateService) private readonly templateService: TemplateService,
    @inject(AssessmentService)
    private readonly assessmentService: AssessmentService
  ) {}

  async activate(data): Promise<void> {
    this.orderId = decodeURIComponent(data.orderId);

    const assessmentExists = await this.assessmentService.doesAssessmentExist(
      this.orderId
    );

    if (assessmentExists) {
      this.navigateToCompleteAssessment(this.orderId);
    } else {
      await this.loadOrderInfo();
      await this.loadDropdownItems();
    }
  }

  /** Selects item from matched templates dropdown list */
  templateItemSelected($event): void {
    this.selectedTemplateItem = this.templateDropdownItems.find(
      (template: Template) => {
        return template.templateTitle === $event;
      }
    );
  }

  /** Selects item from custom templates dropdown list */
  customTemplateSelected($event): void {
    this.selectedTemplateItem = this.customDropdownItems.find(
      (template: Template) => {
        return template.templateTitle === $event;
      }
    );
  }

  /** Navigates to New Template page on button press */
  createTemplate(): void {
    this.router.navigate(`/templates/template-builder/template-new`);
  }

  /** Triggered on Perform Review button press */
  performReview(): void {
    const orderDetailItem = this.orderDetails.orderDetailItems[0];
    const newAssessment = new CreateNewAssessmentRequest(
      this.orderId,
      orderDetailItem.orderType,
      orderDetailItem.orderLevel,
      orderDetailItem.vendorName,
      orderDetailItem.productNames,
      orderDetailItem.isVendorLevel,
      this.orderDetails.organization,
      this.selectedTemplateItem.templateTitle
    );

    this.assessmentService.createAssessment(newAssessment).then(() => {
      this.navigateToCompleteAssessment(this.orderId);
    });
  }

  /** Populates order information from provided order id */
  private async loadOrderInfo(): Promise<void> {
    this.orderInfoLoaded = false;
    this.gridConfig = this.prepareTemplateGrid();
    this.orderDetails = await this.orderService.getOrderDetails(this.orderId);

    const spaces = "&nbsp;&nbsp;&nbsp;";
    this.orderData = [
      new OrderInfoData(
        `${spaces}Order Date:${spaces}${new Date(
          this.orderDetails.orderDetailItems[0].orderDate
        ).toLocaleDateString()}`
      ),
      new OrderInfoData(
        `${spaces}Type:${spaces}${this.orderDetails.orderDetailItems[0].orderType}`
      ),
      new OrderInfoData(
        `${spaces}Status:${spaces}${this.orderDetails.orderDetailItems[0].status}`
      ),
      new OrderInfoData(
        `${spaces}Company/Vendor:${spaces}${this.orderDetails.orderDetailItems[0].vendorName}`
      ),
    ];

    this.gridData
      .init({
        data: this.orderData,
        config: this.gridConfig,
        userSettings: null,
        dynamicColumns: [],
      })
      .set({});

    this.orderInfoLoaded = true;
  }

  /** Populates dropdown items from filtered template list */
  private async loadDropdownItems(): Promise<void> {
    const allTemplateList = await this.templateService.getTemplateList();
    const publishedTemplateList = allTemplateList.filter(
      (template: Template) => {
        return template.status === TemplateStatus.Published;
      }
    );

    this.templateDropdownItems = publishedTemplateList.filter(
      (template: Template) => {
        return (
          template.templateType ===
          this.orderDetails.orderDetailItems[0].orderType
        );
      }
    );

    this.customDropdownItems = publishedTemplateList.filter(
      (template: Template) => {
        return template.templateType === "Custom";
      }
    );
  }

  /** Loads template grid */
  private prepareTemplateGrid(): IVmGridConfig {
    const gridConfig: IVmGridConfig = {
      ID: "orderInfoGrid",
      ColumnDefinitions: [
        new LiteralColumn(
          "orderData",
          "minmax(300px, 2fr)",
          "Order Information"
        ).SetDefaults({ AllowSorting: false }),
      ],
      NoResultsMessage: "No Order Information",
    };

    return gridConfig;
  }

  /** Redirects router to complete assessment with parameters */
  private navigateToCompleteAssessment(orderId: string) {
    this.router.navigate(
      "/assessments/complete-assessment/" + encodeURIComponent(orderId)
    );
  }
}

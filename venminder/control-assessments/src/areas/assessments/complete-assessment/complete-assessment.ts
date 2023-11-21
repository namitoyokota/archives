import { DialogService } from "aurelia-dialog";
import { EventAggregator } from "aurelia-event-aggregator";
import { computedFrom, inject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { AssessmentService } from "services/assessment-service";
import { DataLibraryService } from "services/data-library-service";
import { AssessmentData } from "services/models/assessments/assessment-data";
import { AssessmentSection } from "services/models/assessments/assessment-section";
import { AssessmentSectionControl } from "services/models/assessments/assessment-section-control";
import { SaveDataLibraryRequest } from "services/models/data-library/save-data-library-request";
import { OrderDetail } from "services/models/service-orders/order-detail";
import { OrderItem } from "services/models/service-orders/order-item";
import { SubHeader } from "services/models/templates/sub-header";
import { TemplateSection } from "services/models/templates/template-section";
import { OrderService } from "services/order-service";
import { RatingService } from "services/rating-service";
import { MessageDialog } from "shared/dialogs/message-dialog";
import { MessageDialogModel } from "shared/dialogs/message-dialog-models";
import { DropdownDisplayTypes } from "shared/enums/dropdown-display-types";
import { EventNames } from "shared/event-names";
import { CompareObjects } from "shared/helpers/compare-objects";
import { AnswerOption } from "shared/models/answer-option";
import { DynamicControl } from "shared/models/dynamic-control";
import { SectionSubHeaderModel } from "shared/models/section-sub-header-model";
import { SectionRatings } from "../models/ratings";

export class CompleteAssessment {
  model: AssessmentData = new AssessmentData();
  listOfSections: DynamicControl[] = [];
  previousListOfSections: DynamicControl[] = [];
  orderInfo: Map<string, string> = new Map<string, string>();
  private orderId = "";
  private orderDetails: OrderItem = null;
  private readonly sectionRatings = Object.values(SectionRatings);

  @computedFrom("template")
  get canSave(): boolean {
    return this.model?.assessmentTemplate?.trim().length !== 0;
  }

  constructor(
    @inject(Router) private readonly router: Router,
    @inject(DialogService) public readonly dialogService: DialogService,
    @inject(EventAggregator) private readonly ea: EventAggregator,
    @inject(DataLibraryService)
    private readonly dataLibraryService: DataLibraryService,
    @inject(AssessmentService)
    private readonly assessmentService: AssessmentService,
    @inject(OrderService) private readonly orderService: OrderService,
    @inject(RatingService) private readonly ratingService: RatingService
  ) {}

  async activate(data): Promise<void> {
    this.orderId = decodeURIComponent(data.orderId);
    if (this.orderId) {
      this.loadOrder();
    } else {
      this.navigateToTemplateList();
    }

    this.assessmentService
      .getAssessment(this.orderId)
      .then((assessmentData) => {
        if (assessmentData.assessmentKey) {
          this.model = assessmentData;
          this.loadAssessment();
        } else {
          this.navigateToTemplateList();
        }
      });
  }

  /** Saves review and navigates to template list on button click */
  async saveAndClose(): Promise<void> {
    this.saveAssessment();
    this.navigateToTemplateList();
  }

  /** Marks review as complete on button click */
  async markAsComplete(): Promise<void> {
    if (this.isAssessmentValid()) {
      this.model.assessmentDate = new Date();
      this.model.isCompleted = true;

      await this.saveAssessment();
      await this.saveDataLibrary();
    } else {
      this.openErrorDialog();
    }
  }

  /** Opens preview of the HTML on button click */
  async preview(): Promise<void> {
    await this.saveAssessment();

    const previewHtml = await this.assessmentService.previewAssessment(
      this.model.assessmentKey
    );
    window.open("about:blank", "_blank").document.write(previewHtml);
  }

  /** Saves assessment with corresponding template info */
  async saveAssessment(): Promise<void> {
    if (
      !CompareObjects.areEqual(this.listOfSections, this.previousListOfSections)
    ) {
      this.calculateAllSectionRatings();

      if (this.model.vendor) {
        this.parseListOfSections();
        await this.assessmentService.saveAssessment(this.model);

        this.previousListOfSections = CompareObjects.deepCopy(
          this.listOfSections
        );
      }
    }
  }

  /**
   * Calculates and updates the rating for provided section
   * (This method is also used by section component)
   */
  public async calculateSectionRating(
    section: AssessmentSection
  ): Promise<void> {
    const score = this.calculateSectionScore(section);

    // Get and update rating
    await this.ratingService
      .getSectionRating(score)
      .then((ratingName) => {
        const rating = this.sectionRatings.find((r) => r.name === ratingName);
        section.sectionRatingScore = rating ? rating.id : SectionRatings.NA.id;
        section.errors = [];

        this.parseListOfSections();
      })
      .catch((error: string) => {
        section.errors = [error];
      });
  }

  /**
   * Turns list of sections back to assessment data object
   * (This method is also used by section component)
   */
  public parseListOfSections(): void {
    this.model.assessmentSections = this.listOfSections.map(
      (section: DynamicControl) => {
        return new AssessmentSection(
          section.model.sectionRatingScore,
          section.model.subHeaders.map((subHeader) => {
            return new SubHeader(subHeader.model.sortId, subHeader.model.value);
          }),
          section.model.controls.map((control) => control.model.model),
          section.model.id,
          section.model.sectionTitle,
          section.model.hasSectionRating
        );
      }
    );
  }

  /** Loads order details from id */
  private async loadOrder(): Promise<void> {
    this.orderDetails = await this.orderService.getOrderDetails(this.orderId);
    const orderItem: OrderDetail = this.orderDetails.orderDetailItems[0];

    // Basic Info
    this.orderInfo = new Map<string, string>([
      ["Client", this.orderDetails.organization],
      ["SLA Days", orderItem.slaDays.toString()],
      ["Order Date", new Date(orderItem.orderDate).toLocaleDateString()],
      ["Rush", orderItem.rush],
      ["Order Type", orderItem.orderType],
      ["Review Level", orderItem.orderLevel],
      ["Status", this.orderDetails.status],
      ["Client Specialist", this.orderDetails.clientSpecialist],
      ["Due Date", new Date(this.orderDetails.dueDate).toLocaleDateString()],
    ]);

    // BCA, CSA, or SOC Information
    if (["BCA", "CSA", "SOC"].includes(orderItem.orderTypeAbbreviation)) {
      this.orderInfo.set(
        orderItem.orderTypeAbbreviation + " Information",
        orderItem.reportType
      );
    }

    // SOC Information
    if (orderItem.orderTypeAbbreviation === "SOC") {
      this.orderInfo.set("", orderItem.subReportType);
    }

    // Information Information
    this.orderInfo.set("Important Information", orderItem.importantInformation);
  }

  /** Load already saved assessment data */
  private loadAssessment(): void {
    this.listOfSections = this.model.assessmentSections
      .sort((a, b) => (a.id > b.id ? 1 : -1))
      .map((assessmentSection: AssessmentSection) => {
        const section = this.generateDynamicSection(assessmentSection);

        section.model.controls =
          this.generateDynamicControls(assessmentSection);
        section.model.subHeaders =
          this.generateDynamicSubHeaders(assessmentSection);

        return section;
      });

    this.previousListOfSections = CompareObjects.deepCopy(this.listOfSections);
  }

  /** Returns a section as dynamic control */
  private generateDynamicSection(section: AssessmentSection): DynamicControl {
    return new DynamicControl(
      "section/section",
      section.id,
      new AssessmentSection(
        section.sectionRatingScore,
        [],
        [],
        section.id,
        section.sectionTitle,
        section.hasSectionRating
      )
    );
  }

  /** Returns a list of controls as dynamic controls */
  private generateDynamicControls(
    section: AssessmentSection
  ): DynamicControl[] {
    return section.controls.map((sectionControl) => {
      const control = new DynamicControl(
        "control",
        sectionControl.sortId,
        new DynamicControl(
          DropdownDisplayTypes.find(
            (x) => x.displayType === sectionControl.displayType
          ).type,
          sectionControl.sortId,
          new AssessmentSectionControl(
            sectionControl.narrative,
            sectionControl.answers,
            sectionControl.sortId,
            sectionControl.enableGroupControls,
            sectionControl.groupControls,
            sectionControl.name,
            sectionControl.question,
            sectionControl.description,
            sectionControl.displayType,
            sectionControl.tags,
            sectionControl.answerOptions
          )
        )
      );

      control.model.model.sectionId = section.id;
      control.model.model.isEditable = true;

      return control;
    });
  }

  /** Returns a list of headers as dynamic controls */
  private generateDynamicSubHeaders(
    section: TemplateSection | AssessmentSection
  ): DynamicControl[] {
    return section.subHeaders.map((h) => {
      return new DynamicControl(
        "subheader",
        h.sortId,
        new SectionSubHeaderModel(h.sortId, section.id, h.value)
      );
    });
  }

  /** Calculates section rating for all sections */
  private calculateAllSectionRatings(): void {
    this.listOfSections.forEach((section: DynamicControl) => {
      const previousSection = this.previousListOfSections.find(
        (s) => s.sortId === section.sortId
      );

      const answerChanged = !CompareObjects.areEqual(
        section.model.controls,
        previousSection.model.controls
      );
      if (answerChanged) {
        this.calculateSectionRating(section.model);
      }
    });
  }

  /** Calculates score for a section */
  private calculateSectionScore(section: AssessmentSection): number {
    let earnedScore = 0;
    let possibleScore = 0;

    section.controls.forEach((control: DynamicControl) => {
      const controlModel: AssessmentSectionControl = control.model.model;

      // Calculate possible score
      switch (controlModel.displayType) {
        case "CHECKBOX":
          controlModel.answerOptions
            .filter((f) => f.calculateScore)
            .forEach((a) => (possibleScore += a.score));
          break;
        case "RADIO_YES_NO":
        case "RADIO_MENTIONED":
        case "DROPDOWN":
        default:
          possibleScore += Math.max(
            ...controlModel.answerOptions
              .filter((f) => f.calculateScore)
              .map((options: AnswerOption) => options.score)
          );
          break;
      }

      // Calculate earned score
      controlModel.answerOptions
        .filter((f) => f.calculateScore)
        .forEach((answerOption: AnswerOption) => {
          if (controlModel.answers.contains(answerOption.id.toString())) {
            earnedScore += answerOption.score;
          }
        });
    });

    return (
      Math.round((earnedScore / possibleScore) * 100 + Number.EPSILON) / 100
    );
  }

  /** Checks if assessment is valid */
  private isAssessmentValid(): boolean {
    let isValid = true;

    // Validate Sections
    this.listOfSections.map((section: DynamicControl) => {
      // Rating
      if (section.model.hasSectionRating) {
        const invalidRating =
          section.model.sectionRatingScore === null ||
          section.model.sectionRatingScore === SectionRatings.NA.id;

        if (invalidRating) {
          this.ea.publish(
            EventNames.Assessments.SECTION_RATING_INVALID + section.sortId
          );

          isValid = false;
        }
      }

      // Controls
      section.model.controls.map((control) => {
        const controlModel: AssessmentSectionControl = control.model.model;
        const noAnswer = !controlModel.answers?.length;
        if (noAnswer) {
          this.ea.publish(
            EventNames.Assessments.CONTROL_INVALID +
              ":" +
              section.sortId +
              ":" +
              control.sortId
          );

          isValid = false;
        }
      });
    });

    // Validate Overall Rating
    const invalidOverallRating = this.model.overallRatingScore === null;
    if (invalidOverallRating) {
      this.ea.publish(EventNames.Assessments.OVERALL_RATING_INVALID);

      isValid = false;
    }

    // TODO: Validate Overall Rating Type
    // const overallRatingType = this.model.overallRatingType;
    // if (overallRatingType === null) {
    //   this.ea.publish(EventNames.Assessments.OVERALL_RATING_TYPE_INVALID);

    //   isValid = false;
    // }

    return isValid;
  }

  /** Open not all all fields are filled error dialog */
  private openErrorDialog(): void {
    this.dialogService.open({
      viewModel: MessageDialog,
      model: new MessageDialogModel(
        "Unable to Complete",
        "Please fill out all of the controls before marking complete."
      ),
    });
  }

  /** Redirects route to template list */
  private navigateToTemplateList(): void {
    this.router.navigate("/templates/templates-tab/template-list");
  }

  /** Saves data library from control sections */
  private async saveDataLibrary(): Promise<void> {
    const data: SaveDataLibraryRequest[] = [];
    this.listOfSections.map((x) => {
      const controlData = x.model;
      controlData.controls.map((y) => {
        data.push(
          new SaveDataLibraryRequest(
            this.model.vendor,
            this.model.products[0],
            y.model.model.name,
            y.model.model.question,
            y.model.model.displayType
          )
        );
      });
    });

    await this.dataLibraryService.saveDataLibrary(data);
  }
}

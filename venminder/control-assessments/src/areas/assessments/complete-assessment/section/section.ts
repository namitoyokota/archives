import { ControlNarrativeModel } from "areas/assessments/models/control-narrative-model";
import { Rating } from "areas/assessments/models/rating";
import { SectionRatings } from "areas/assessments/models/ratings";
import { DialogService } from "aurelia-dialog";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { bindable, BindingEngine, Disposable, inject } from "aurelia-framework";
import { AssessmentSection } from "services/models/assessments/assessment-section";
import { AssessmentSectionControl } from "services/models/assessments/assessment-section-control";
import { DropdownDisplayTypes } from "shared/enums/dropdown-display-types";
import { EventNames } from "shared/event-names";
import { CompareObjects } from "shared/helpers/compare-objects";
import { DynamicControl } from "shared/models/dynamic-control";
import { CompleteAssessment } from "../complete-assessment";
import { ControlNarrativeDialog } from "./control-narrative-dialog/control-narrative-dialog";

export class AssessmentSectionComponent {
  @bindable model: AssessmentSection = null;

  private scoreSubscription: Disposable;
  private errorSubscription: Disposable;

  controlsAndSubheaders: DynamicControl[] = [];
  sectionRatings: Rating[] = [];
  selectedRating: Rating = null;
  disableRating = false;
  subheaderIndexes: number[] = [];
  errors: string[] = [];
  ratingErrorMsg = "";

  private caretButtonClicked: Subscription = null;
  private errorListener: Subscription = null;

  constructor(
    @inject(CompleteAssessment)
    private readonly completeAssessment: CompleteAssessment,
    @inject(EventAggregator) private readonly ea: EventAggregator,
    @inject(DialogService) private readonly dialogService: DialogService,
    @inject(BindingEngine) private bindingEngine: BindingEngine
  ) {}

  attached(): void {
    this.loadControlAndSubheaders();
    this.loadRatings();

    if (!this.model.hasSectionRating) {
      this.ratingSelected(SectionRatings.NA.id);
      this.disableRating = true;
    }

    this.listenToError();
    this.listenToCaretClick();
    this.attachSubscriptions();
  }

  detached(): void {
    this.errorListener?.dispose();
    this.errorListener = null;

    this.caretButtonClicked?.dispose();
    this.caretButtonClicked = null;

    this.detachSubscriptions();
  }

  /** Calculates rating for this section */
  recalculateRating(): void {
    this.completeAssessment.calculateSectionRating(this.model);
  }

  /** Subscribes to error event for invalid section rating */
  private listenToError(): void {
    this.errorListener = this.ea.subscribe(
      EventNames.Assessments.SECTION_RATING_INVALID + this.model.id,
      () => {
        this.ratingErrorMsg = "Please complete this rating.";
      }
    );
  }

  private attachSubscriptions(): void {
    this.scoreSubscription = this.bindingEngine
      .propertyObserver(this.model, "sectionRatingScore")
      .subscribe((newValue) => {
        this.ratingSelected(newValue);
      });

    this.errorSubscription = this.bindingEngine
      .propertyObserver(this.model, "errors")
      .subscribe((newValue) => {
        this.errors = newValue;
      });
  }

  /** Subscribes to caret button clicked event */
  private listenToCaretClick(): void {
    if (this.caretButtonClicked == null) {
      this.caretButtonClicked = this.ea.subscribe(
        `${EventNames.Controls.CARET_BUTTON_CLICKED}:${this.model.id}`,
        (model: AssessmentSectionControl) => {
          const controlModel: AssessmentSectionControl =
            CompareObjects.deepCopy(model);
          controlModel.isSingleControlEdit = true;
          this.dialogService
            .open({
              viewModel: ControlNarrativeDialog,
              model: new ControlNarrativeModel(
                controlModel,
                this.model.sectionTitle
              ),
            })
            .whenClosed((response) => {
              if (!response.wasCancelled) {
                const updatedControlModel = response.output;
                updatedControlModel.isSingleControlEdit = false;

                const itemIndex = this.controlsAndSubheaders.findIndex(
                  (x) => x.model.sortId == updatedControlModel.sortId
                );
                const controlType = DropdownDisplayTypes.find(
                  (x) => x.displayType == updatedControlModel.displayType
                );
                this.controlsAndSubheaders[itemIndex].model =
                  new DynamicControl(
                    controlType.type,
                    updatedControlModel.sortId,
                    updatedControlModel
                  );
              }
            });
        }
      );
    }
  }

  private detachSubscriptions(): void {
    this.scoreSubscription.dispose();
    this.errorSubscription.dispose();
  }

  private loadControlAndSubheaders(): void {
    this.controlsAndSubheaders = [
      ...this.model.controls,
      ...this.model.subHeaders,
    ].sort((a, b) => (a.sortId > b.sortId ? 1 : -1));

    this.controlsAndSubheaders.forEach((item, index) => {
      if (item.type === "subheader") {
        this.subheaderIndexes.push(index);
      }
    });
  }

  /** Loads possible selections for the rating dropdown */
  private loadRatings(): void {
    this.sectionRatings = Object.values(SectionRatings);

    this.selectedRating =
      this.sectionRatings[
        this.sectionRatings.findIndex(
          (x) => x.id == this.model.sectionRatingScore
        )
      ];
  }

  /** Triggered on dropdown rating select */
  private ratingSelected($event): void {
    this.model.sectionRatingScore = $event;
    this.completeAssessment.parseListOfSections();

    this.selectedRating = this.sectionRatings.find(
      (rating) => rating.id === this.model.sectionRatingScore
    );

    this.ratingErrorMsg = "";
  }
}

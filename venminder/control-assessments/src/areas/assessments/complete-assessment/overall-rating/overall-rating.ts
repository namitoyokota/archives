import { Rating } from "areas/assessments/models/rating";
import { RatingType } from "areas/assessments/models/rating-type";
import { RatingTypes } from "areas/assessments/models/rating-types";
import {
  OverallRatings,
  SectionRatings,
} from "areas/assessments/models/ratings";
import { inject } from "aurelia-dependency-injection";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { bindable, BindingEngine, Disposable } from "aurelia-framework";
import { AssessmentData } from "services/models/assessments/assessment-data";
import { AssessmentSection } from "services/models/assessments/assessment-section";
import { EventNames } from "shared/event-names";

export class OverallRating {
  @bindable model: AssessmentData = null;

  overallRatings: Rating[] = [];
  selectedRating: Rating = null;
  overallRatingTypes: RatingType[] = [];
  selectedRatingType: RatingType = null;
  selectedSectionRatings: Map<string, string> = new Map<string, string>();
  errorMsg = "";

  private sectionRatings: Rating[] = [];
  private modelSubscription: Disposable;
  private errorListener: Subscription = null;

  constructor(
    @inject(BindingEngine) private bindingEngine: BindingEngine,
    @inject(EventAggregator) private readonly ea: EventAggregator
  ) {}

  attached(): void {
    this.loadOverallRatings();
    this.loadSectionRatings();
    this.loadOverallRatingTypes();

    this.overallRatingSelected(this.model.overallRatingScore);
    this.updateSectionRatings(this.model.assessmentSections);

    // Listen to assessment sections change
    this.modelSubscription = this.bindingEngine
      .propertyObserver(this.model, "assessmentSections")
      .subscribe((newValue) => {
        this.updateSectionRatings(newValue);
      });

    this.listenToError();
  }

  detached() {
    this.modelSubscription.dispose();

    if (this.errorListener != null) {
      this.errorListener.dispose();
      this.errorListener = null;
    }
  }

  /** Triggered on when overall rating selected */
  overallRatingSelected($event: number): void {
    this.model.overallRatingScore = $event;

    this.selectedRating = this.overallRatings.find(
      (rating: Rating) => rating.id === this.model.overallRatingScore
    );

    this.errorMsg = "";
  }

  /** Sets overall rating type of assessment */
  setOverallRatingType($event: boolean): void {
    // TODO: add after new property added to class
    // this.model.includeRiskProfile = $event;
    // this.selectedRatingType = this.overallRatingTypes.find(
    //   (ratingType: RatingType) =>
    //     ratingType.id === this.model.includeRiskProfile
    // );
  }

  /** Loads all possible overall ratings to select from */
  private loadOverallRatings(): void {
    this.overallRatings = Object.values(OverallRatings);
  }

  /** Loads all possible overall rating types to select from */
  private loadOverallRatingTypes(): void {
    this.overallRatingTypes = Object.values(RatingTypes);
  }

  /** Loads all possible section ratings to select from */
  private loadSectionRatings(): void {
    this.sectionRatings = Object.values(SectionRatings);
  }

  /** Subscribes to error event from the event aggregator */
  private listenToError(): void {
    this.errorListener = this.ea.subscribe(
      EventNames.Assessments.OVERALL_RATING_INVALID,
      () => {
        this.errorMsg = "Please complete this rating.";
      }
    );
  }

  /** Loads ratings from each section into a map */
  private updateSectionRatings(assessmentSections: AssessmentSection[]): void {
    assessmentSections.forEach((section: AssessmentSection) => {
      if (section.hasSectionRating) {
        const selectedRating = this.sectionRatings.find(
          (rating: Rating) => rating.id === section.sectionRatingScore
        );

        const displayText = selectedRating?.displayText
          ? selectedRating.displayText
          : "";
        this.selectedSectionRatings.set(section.sectionTitle, displayText);
      }
    });
  }
}

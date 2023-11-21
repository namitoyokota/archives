import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { bindable, bindingMode, inject } from "aurelia-framework";
import { EventNames } from "shared/event-names";
import { SectionSubHeaderModel } from "shared/models/section-sub-header-model";

export class SectionSubheader {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) value: string;
  @bindable model: SectionSubHeaderModel = null;

  subHeaderErrors: string[] = [];

  private hasModel = false;
  private eventInvalid: Subscription = null;

  constructor(@inject(EventAggregator) private readonly ea: EventAggregator) {}

  attached(): void {
    this.hasModel = this.model != null;

    if (this.hasModel) {
      this.value = this.model.value;
    }

    this.attachSubscriptions();
  }

  detached(): void {
    this.detachSubscriptions();
  }

  changeText(): void {
    this.value = this.value == null ? "" : this.value.trim();
    if (this.model.value !== this.value) {
      this.dataModelChanged();
    }
  }

  private attachSubscriptions(): void {
    if (this.eventInvalid == null) {
      this.eventInvalid = this.ea.subscribe(
        `${EventNames.Templates.SUBHEADER_INVALID}:${this.model.sectionId}:${this.model.sortId}`,
        () => {
          if (!this.model.validSubHeader) {
            this.subHeaderErrors = [];
            this.subHeaderErrors.push("Subheader is required");
          } else {
            this.subHeaderErrors = [];
          }
        }
      );
    }
  }

  private detachSubscriptions(): void {
    if (this.eventInvalid != null) {
      this.eventInvalid.dispose();
      this.eventInvalid = null;
    }
  }

  private dataModelChanged(): void {
    this.model.value = this.value;
    this.ea.publish(
      `${EventNames.Templates.SECTIONS_SUBHEADER}:${this.model.sectionId}`,
      this.model
    );
  }
}

import { bindable } from "aurelia-framework";
import { SectionSubHeaderModel } from "shared/models/section-sub-header-model";

export class AssessmentSectionSubheader {
  @bindable model: SectionSubHeaderModel = null;
  @bindable isFirst: boolean;
}

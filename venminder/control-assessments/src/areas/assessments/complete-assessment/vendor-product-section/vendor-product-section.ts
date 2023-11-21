import { bindable } from "aurelia-framework";
import { AssessmentData } from "services/models/assessments/assessment-data";
import { ProductItem } from "services/models/assessments/product-item";
import { VendorItem } from "services/models/assessments/vendor-item";

export class VendorProductSection {
  @bindable model: AssessmentData = null;

  attached(): void {
    if (!this.model.vendor) {
      this.model.vendor = new VendorItem();
    }
    if (this.model.products.length == 0) {
      this.model.products.push(new ProductItem());
    }
  }
}

import { IActionContext } from "shared-from-dcdev/resources/features/vm-grid-v2/interfaces/vm-grid-interfaces";
import { addressFormatting } from "../../formatting";

export class Address {
  context: IActionContext;
  formattedAddress = '';

  activate(context: IActionContext) {
    this.context = context;
    this.formattedAddress = addressFormatting.Format(this.context.Row, this.context.Column, null);
  }
}

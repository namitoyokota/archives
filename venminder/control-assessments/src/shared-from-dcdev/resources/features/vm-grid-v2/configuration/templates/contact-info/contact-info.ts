import { isNull } from "lodash";
import { isNullOrWhitespace } from "shared-from-dcdev/shared/utilities/globals";
import { IActionContext, IFormatTextValueConverter } from "shared-from-dcdev/resources/features/vm-grid-v2/interfaces/vm-grid-interfaces";
import { contactInfoFormatting } from "../../formatting";

export class ContactInfo {
  context: IActionContext;
  formattedAddress = '';

  activate(context: IActionContext) {
    this.context = context;
    this.formattedAddress = contactInfoFormatting.Format(this.context.Row, null, null);
  }
}

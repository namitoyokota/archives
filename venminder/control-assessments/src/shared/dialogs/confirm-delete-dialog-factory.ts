import { ConfirmDialogModel } from "shared-from-dcdev/shared/dialogs/confirm-dialog/confirm-dialog-model";

export class ConfirmDeleteDialogFactory {
  static create(typeName: string): ConfirmDialogModel {
    const model = new ConfirmDialogModel();
    model.dialogMessage = `<p>`;
    model.dialogMessage += `Are you sure that you want to delete this ${typeName}? Once you remove the ${typeName}, it will be gone for good. `;
    model.dialogMessage += `</p>`;
    model.dialogTitle = "Are you sure?";
    model.okText = "Continue";
    model.showConfirmation = false;
    return model;
  }

  static createVerbose(typeName: string, moreInfo: string): ConfirmDialogModel {
    const model = ConfirmDeleteDialogFactory.create(typeName);
    model.dialogMessage += `<p>${moreInfo}</p>`;
    return model;
  }

  static createBase(dialogMessage: string): ConfirmDialogModel {
    const model = new ConfirmDialogModel();
    model.dialogMessage = `<p>`;
    model.dialogMessage += dialogMessage;
    model.dialogMessage += `</p>`;
    model.dialogTitle = "Are you sure?";
    model.okText = "Continue";
    model.showConfirmation = false;
    return model;
  }
}

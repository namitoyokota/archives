import { MenuState } from "@venminder/vm-library";

export class VmCommandMenu {
  menuState: MenuState;
  menuElement: HTMLElement;

  constructor() {}

  activate(model) {
    this.menuState = model;
  }

  attached() {
    this.menuState.render(this.menuState);
  }

  selectCommandItem(commandItem) {
    this.menuState.methods.click({
      commandItem,
      eventID: this.menuState.data.eventID,
      row: this.menuState.data.row,
    });
  }
}

import type { MenuState } from '@venminder/vm-library';
import { IActionCommandConfig } from '../interfaces/vm-grid-interfaces';

export class VmCommandMenu {
  menuState: MenuState;

  activate(model: MenuState): void {
    this.menuState = model;
  }

  attached(): void {
    this.menuState.render();
  }

  selectItem(commandItem: IActionCommandConfig): void {
    this.menuState.methods.onClick({
      commandItem,
      row: this.menuState.data.row,
    });
  }
}

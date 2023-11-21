import type { IActionContext } from "shared-from-dcdev/resources/features/vm-grid-v2/interfaces/vm-grid-interfaces";

export class StringArray {
  context: IActionContext;
  formattedStringArray = '&mdash;';

  activate(context: IActionContext) {
    this.context = context;

    let arr = this.context.Row[this.context.Column.ColumnName];

    if (arr && arr.length > 0) {
      arr = arr.map(p => `<li>${p}</li>`);
      this.formattedStringArray = `<ul class="m-l-lg">${arr.join('')}</ul>`;
    }
  }
}

import type { IActionContext } from "shared-from-dcdev/resources/features/vm-grid-v2/interfaces/vm-grid-interfaces";

export class MappedArray {
  context: IActionContext;
  formattedMappedArray = '&mdash;';

  activate(context: IActionContext) {
    this.context = context;

    let arr = this.context.Row[this.context.Column.ColumnName];

    if (arr && arr.length > 0) {
      const name = this.context.Column.MappedPropName;

      arr = arr.map(p => `<li>${p[name]}</li>`);
      this.formattedMappedArray = `<ul class="m-l-lg">${arr.join('')}</ul>`;
    }
  }
}

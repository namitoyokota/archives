import { PLATFORM } from 'aurelia-pal';
import { IActionCommandConfig, IActionContext } from '../../../interfaces/vm-grid-interfaces';

export class ActionEllipsis {
  private context: IActionContext;

  activate(context: IActionContext): void {
    this.context = context;
  }

  open($event: PointerEvent): void {
    this.context.ContextMenu.open({
      y: $event.clientY,
      x: $event.clientX,
        component: PLATFORM.moduleName('shared-from-dcdev/resources/features/vm-grid-v2/command-menu/vm-command-menu', 'global'),
      data: {
        commandItems: this.context.Column.CommandItems.filter((item) => {
          return !item.checkVisibility || item.checkVisibility(this.context.Row);
        }),
        row: this.context.Row,
      },
      methods: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onClick: (params: { commandItem: IActionCommandConfig; row: any }) => {
          if (this.context.Column.ActionComplete) {
            this.context.Column.ActionComplete({
              command: params.commandItem,
              row: params.row,
            });
          } else {
            throw new Error("'Clicked' event not implemented.");
          }

          this.context.ContextMenu.close();
        },
      },
    });
  }
}

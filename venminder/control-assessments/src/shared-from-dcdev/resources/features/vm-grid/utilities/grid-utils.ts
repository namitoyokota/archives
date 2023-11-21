import type { IActionContext, IVmGridConfig } from '../interfaces/vm-grid-interfaces';

export function getGridRowStyle(config: IVmGridConfig) {
    const columns = config.ColumnDefinitions.map(column => {
        return column.Width || '1fr';
    }).join(' ');
    return `grid-template-columns: ${columns};`;
}

export function dynamicConfig(boolean: boolean, config: any[]): any[] {
    if (boolean) {
        return config
    } else {
        return []
    }
}

export const bindingContext = {
    BindingContext: (row, column): IActionContext => {
        return {
            row: row,
            column: column
        }
    }
};
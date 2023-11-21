export class VMContextMenu {
    component: string;
    data?: any;
    isOpen?: boolean;
    methods?: any;
    x?: number;
    y?: number;
    render?: (menu?: VMContextMenu) => void;

    constructor(params: VMContextMenu = {} as VMContextMenu) {
        const { component = '', data = null, isOpen = false, x = 0, y = 0, methods = {} } = params;

        this.component = component;
        this.data = data;
        this.isOpen = isOpen;
        this.x = x;
        this.y = y;
        this.methods = methods;
    }
}

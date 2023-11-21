export class TreeNode {
    item?: TreeNodeItem;
    children?: TreeNode[];
    selectable?: boolean;
    leaf?: boolean;
    needData?: boolean;
    empty?: boolean;
    constructor(params = {} as TreeNode) {
        const {
            item,
            children = [],
            selectable = true,
            leaf = false,
            needData = false,
            empty = false
        } = params;

        this.item = item;
        this.children = children.map((child) => new TreeNode(child));
        this.selectable = selectable;
        this.leaf = leaf;
        this.needData = needData;
        this.empty = empty;
    }

    getChildren?() {
        return (this.children);
    }
}

export class TreeNodeItem {
    id?: string;
    parentId?: string;
    label?: string;
    type?: string;
    data?: any;
    constructor(params = {} as TreeNodeItem) {
        const {
            id,
            parentId,
            label,
            type,
            data,
        } = params;

        this.id = id;
        this.parentId = parentId;
        this.type = type;
        this.label = label;
        this.data = data;
    }
}

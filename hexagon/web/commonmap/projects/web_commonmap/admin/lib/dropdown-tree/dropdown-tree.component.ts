import { Component, OnInit, Input, EventEmitter, Output, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTree, MatTreeNestedDataSource } from '@angular/material/tree';
import { DropdownTreeTranslationTokens } from './dropdown-tree.translation';
import { TreeNode, TreeNodeItem } from '@galileo/web_commonmap/_common';

class MyTreeNode extends TreeNode {
    selected?: boolean;
    children?: MyTreeNode[];
    parent?: MyTreeNode;
    isLoading?: boolean;
    constructor(params = {} as MyTreeNode) {
        const {
            selected = false,
            children = [],
            parent = null,
            isLoading = false
        } = params;

        super(params);

        this.selected = selected
        this.isLoading = isLoading;
        const temp = children;
        this.children = [];
        if (temp?.length > 0) {
            for (const child of temp) {
                const newChild = new MyTreeNode(child);
                newChild.parent = this;
                this.children.push(newChild);
            }
        }
    }
}

@Component({
    selector: 'hxgn-commonmap-dropdown-tree',
    templateUrl: 'dropdown-tree.component.html',
    styleUrls: ['dropdown-tree.component.scss']
})

export class DropdownTreeComponent implements OnInit, OnChanges {
    @Input() source: TreeNode[] = [];
    @Input() value: TreeNodeItem | TreeNodeItem[];
    @Input() multiSelect = false;
    @Input() placeholder: string;
    @Input() showEmptyNode = true;
    @Input() dataRequestCallback: any;
    @Output() selectionChanged: EventEmitter<TreeNodeItem | TreeNodeItem[]> = new EventEmitter<TreeNodeItem | TreeNodeItem[]>();

    /**  Expose translation tokens to html template */
    tokens: typeof DropdownTreeTranslationTokens = DropdownTreeTranslationTokens;

    transStrings = {};

    treeSource: MyTreeNode[] = [];

    treeControl = new NestedTreeControl<MyTreeNode>(node => node.getChildren());
    dataSource = new MatTreeNestedDataSource<MyTreeNode>();

    selNodeItems: TreeNodeItem[];

    selectedNodes: MyTreeNode[] = [];
    selectedNodesStr: string = null;

    emptyTreeNode = new MyTreeNode({empty: true, leaf: true, selectable: false});

    isLoading = false;

    constructor() {
    }

    ngOnInit() {
        this.selectedNodes = [];
        this.treeSource = [];
        this.initSelectedNodes();
        this.initTreeNodes();
        this.dataSource.data = this.treeSource;

        this.updateSelectedTreeNodesList();

        for (const selTreeNode of this.selectedNodes) {
            let parent = selTreeNode.parent;
            while (parent) {
                this.treeControl.expand(parent);
                parent = parent.parent;
            }
        }

        this.treeControl.expansionModel.changed.subscribe(async change => {
            if (change?.added?.length > 0) {
                const treeNode = change.added[0];
                if (this.dataRequestCallback && !treeNode.leaf) {
                    if (treeNode.needData) {
                        treeNode.isLoading = true;
                        this.isLoading = true;
                        const childTreeNodes = await this.dataRequestCallback(treeNode.item);
                        treeNode.isLoading = false;
                        this.isLoading = false;
                        if (childTreeNodes?.length > 0) {
                            const children = [];
                            for (const node of childTreeNodes) {
                                const myTreeNode = this.createMyTreeNode(node);
                                children.push(myTreeNode);
                            }
                            treeNode.children = children;
                            this.updateSelectedProps(treeNode);
                            const temp = this.dataSource.data.slice();
                            this.dataSource.data = null;
                            this.dataSource.data = temp;
                        } else {
                            treeNode.children = [this.emptyTreeNode];
                            const temp = this.dataSource.data.slice();
                            this.dataSource.data = null;
                            this.dataSource.data = temp;
                        }
                        treeNode.needData = false;
                    } else if (treeNode.children.length === 0) {
                        treeNode.children = [this.emptyTreeNode];
                        const temp = this.dataSource.data.slice();
                        this.dataSource.data = null;
                        this.dataSource.data = temp;
                    }
                }
            }
          });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.source) {
            this.selectedNodes = [];
            this.treeSource = [];
            this.selectedNodesStr = null;
            if (changes.source.currentValue) {
                this.initSelectedNodes();
                this.initTreeNodes();
                this.dataSource.data = this.treeSource;
            } 
        }
        
        if (changes.value) {
            this.selectedNodes = [];
            this.selectedNodesStr = null;
            if (changes.value.currentValue) {
                this.initSelectedNodes();
                for (const node of this.treeSource) {
                    this.updateSelectedProps(node);
                }
            }
        }

        this.updateSelectedTreeNodesList();
        for (const selTreeNode of this.selectedNodes) {
            let parent = selTreeNode.parent;
            while (parent) {
                this.treeControl.expand(parent);
                parent = parent.parent;
            }
        }
    }

    hasChild = (_: number, node: MyTreeNode) => node.needData || (this.showEmptyNode && !node.leaf) ||
            (!this.showEmptyNode && !!node.children && node.children.length > 0);

    isSelectable = (_: number, node: MyTreeNode) => true;

    initSelectedNodes() {
        this.selNodeItems = [];
        if (this.multiSelect) {
            if (this.value) {
                this.selNodeItems = this.value as TreeNodeItem[];
            }
        } else {
            if (this.value) {
                this.selNodeItems = [this.value as TreeNodeItem];
            }
        }
    }
    initTreeNodes() {
        if (this.source) {
            for (const treeNode of this.source) {
                const myTreeNode = this.createMyTreeNode(treeNode);
                this.treeSource.push(myTreeNode);
            }
        }

    }

    createMyTreeNode(treeNode: TreeNode) {
        let retNode: MyTreeNode;
        retNode = new MyTreeNode(treeNode);
        this.updateSelectedProps(retNode);

        return (retNode);
    }

    updateSelectedProps(treeNode: MyTreeNode) {
        this.setSelectedProps(treeNode, this.isNodeSelected(treeNode), true);
        if (!treeNode.selected) {
            if (treeNode.children?.length > 0) {
                for (const childNode of treeNode.children) {
                    this.updateSelectedProps(childNode);
                }
            }
        }
    }

    setSelectedProps(treeNode: MyTreeNode, selected: boolean, recursive = false) {
        if (treeNode.selectable) {
            treeNode.selected = selected;
            this.selectedNodes.push(treeNode);
        }

        if (recursive) {
            if (treeNode.children?.length > 0) {
                for (const childNode of treeNode.children) {
                    this.setSelectedProps(childNode, selected, true);
                }
            }
        }
    }


    isNodeSelected(treeNode: TreeNode) {
        let selected = false;
        if (this.selNodeItems?.length > 0) {
            const temp = this.selNodeItems.find((node) => node.id === treeNode.item?.id && node.parentId === treeNode.item?.parentId);
            selected = !!temp;
        }
        return (selected);
    }

    findTreeNode(nodeItem: TreeNodeItem, startTreeNode: TreeNode) {
        let retNode: TreeNode;
        if (startTreeNode?.item === nodeItem) {
            retNode = startTreeNode;
        } else if (startTreeNode.children?.length > 0) {
            for (const childNode of startTreeNode.children) {
                retNode = this.findTreeNode(nodeItem, childNode);
                if (retNode) {
                    break;
                }
            }
        }

        return (retNode);
    }

    /** Whether all the descendants of the node are selected. */
    descendantsAllSelected(node: MyTreeNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected = descendants.length > 0 && descendants.every(child => {
            return !child.selectable || child.selected;
        });
        return descAllSelected;
    }

    /** Whether part of the descendants are selected */
    descendantsPartiallySelected(node: MyTreeNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some(child => !child.selectable || child.selected);
        return result && !this.descendantsAllSelected(node);
    }

    /** Whether all the descendants of the node are queayable. */
    descendantsAllQueryable(node: MyTreeNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const descAllQueryable = descendants.length > 0 && descendants.every(child => {
            return child.item.data.Queryable;
        });
        return descAllQueryable;
    }

    parentTreeNodeChanged(event: any, node: MyTreeNode) {
        node.selected = event.checked;
        node.selected ? this.setSelectedProps(node, true, true) : this.setSelectedProps(node, false, true);

        // Force update for the parent
        // descendants.forEach(child => this.checklistSelection.isSelected(child));
        this.checkAllParentsSelection(node);
        this.updateSelectedTreeNodesList();
        this.selectionChanged.emit(this.selectedNodes.map((selNode) => selNode.item));
    }

    leafTreeNodeChanged(event: any, node: MyTreeNode, menuTrigger) {
        node.selected = event.checked;
        if (!this.multiSelect) {
            if (node.selected) {
                if (this.selectedNodes?.length > 0) {
                    this.selectedNodes[0].selected = false;
                }
                this.selectedNodes = [node];
                this.selectedNodesStr = node.item.label;
                this.selectionChanged.emit(node.item);
                if (menuTrigger) {
                    menuTrigger.closeMenu();
                }
            } else {
                this.selectedNodes.slice(0, 1);
                this.selectedNodesStr = null;
                this.selectionChanged.emit(null);
            }
        } else {
            let idx;
            if (node.selected) {
                this.selectedNodes.push(node);
            } else {
                const temp = this.selectedNodes.find((selNode, index) => {
                    idx = index;
                    return (selNode === node);
                });
                if (temp) {
                    this.selectedNodes.splice(idx, 1);
                }
            }
            this.checkAllParentsSelection(node);
            this.updateSelectedTreeNodesList();

            this.selectionChanged.emit(this.selectedNodes.map((selNode) => selNode.item));
        }

    }

    updateSelectedTreeNodesList() {
        this.selectedNodes = [];
        for (const treeNode of this.treeSource) {
            this.setSelectedTreeNodesList(treeNode);
        }
        if (this.selectedNodes?.length > 0) {
            this.selectedNodesStr = this.selectedNodes.map((selNode) => selNode.item.label).join(',');
        } else {
            this.selectedNodesStr = null;
        }
    }

    setSelectedTreeNodesList(treeNode: MyTreeNode) {
        let searchChildren = false;

        if (treeNode.selected) {
            if (!treeNode.item.data.Queryable) {
                if (treeNode.children?.length > 0 && this.descendantsAllQueryable(treeNode)) {
                    // Since the parent is not queryable but its children are, need to set the selection list 
                    // based on the children so that GetFeatureInfo can be used.
                    searchChildren = true;
                } else {
                    this.selectedNodes.push(treeNode);
                }
            } else {
                this.selectedNodes.push(treeNode);
            }
        } else {
            searchChildren = true;
        }

        if (searchChildren) {
            if (treeNode.children?.length > 0) {
                for (const child of treeNode.children) {
                    this.setSelectedTreeNodesList(child);
                }
            }
        }
    }


    /* Checks all the parents when a leaf node is selected/unselected */
    checkAllParentsSelection(node: MyTreeNode) {
        let parent = node.parent;
        while (parent) {
            this.checkRootNodeSelection(parent);
            parent = parent.parent;
        }
    }

    /** Check root node checked state and change it accordingly */
    checkRootNodeSelection(node: MyTreeNode) {
        if (node.selectable) {
            const descAllSelected = this.descendantsAllSelected(node);
            if (node.selected && !descAllSelected) {
                node.selected = false;
            } else if (!node.selected && descAllSelected) {
                node.selected = true;
            }
        }
    }

    stopPropagation(event: any) {
        event.stopPropagation();
    }
}

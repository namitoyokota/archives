import { Component, OnInit, Input, EventEmitter, Output, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonmapAdminService } from '../admin.service';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { HxDRLayerExplorerTranslationTokens } from './hxdr-layer-explorer.translation';
import { TreeNode, TreeNodeItem } from '@galileo/web_commonmap/_common';
import { MapLayer$v1, HxDRFolder, HxDRLayer, HxDRLayerInfo } from '@galileo/web_commonmap/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export class HxDRLayerTreeNode {
    name: string;
    children?: HxDRLayerTreeNode[];
    data?: any;
    selected: boolean;
}

@Component({
    selector: 'hxgn-commonmap-hxdr-layer-explorer',
    templateUrl: 'hxdr-layer-explorer.component.html',
    styleUrls: ['hxdr-layer-explorer.component.scss']
})

export class HxDRLayerExplorerComponent implements OnInit, OnChanges, OnDestroy {
    @Input() mapLayer: MapLayer$v1; 
    @Input() layerInfo: HxDRLayerInfo;
    @Input() selectedLayer: HxDRLayer;
    @Input() isNew = false;
    @Input() placeholder: string; 

    @Output() selectionChanged: EventEmitter<HxDRLayer> = new EventEmitter<HxDRLayer>();

    /**  Expose translation tokens to html template */
    tokens: typeof HxDRLayerExplorerTranslationTokens = HxDRLayerExplorerTranslationTokens;

    preFetchTokensList = [
        this.tokens.noLayersAvailable,
        this.tokens.hxdrCatalogTreeNode,
        this.tokens.hxdrProjectsTreeNode,
        this.tokens.hxdrMyAssetsProjectTreeNode
    ];

    transStrings = {};

    treeControl = new NestedTreeControl<HxDRLayerTreeNode>(node => node.children);
    dataSource = new MatTreeNestedDataSource<HxDRLayerTreeNode>();
    treeSource: TreeNode[] = [];
    dataRequestCallback: any;

    selectedNode: TreeNodeItem;

    private destroy$ = new Subject<boolean>();

    constructor(private mapAdminSvc: CommonmapAdminService) {
    }

    ngOnInit() {
        this.initLocalization();

        this.mapAdminSvc.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });

        if (this.layerInfo) {
            this.createTreeDataSource();
            if (this.selectedLayer) {
                this.selectedNode = new TreeNodeItem ({
                    id: this.selectedLayer.id,
                    parentId: this.selectedLayer.folderId,
                    label: this.selectedLayer.label,
                    data: this.selectedLayer
                });
            }
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.layerInfo) {
            if (changes.layerInfo.currentValue) {
                this.createTreeDataSource();
                if (this.selectedLayer) {
                    this.selectedNode = new TreeNodeItem ({
                        id: this.selectedLayer.id,
                        parentId: this.selectedLayer.folderId,
                        label: this.selectedLayer.label,
                        data: this.selectedLayer
                    });
                } else {
                    this.selectedNode = null;
                }
            } else {
                this.treeSource = [];
                this.selectedNode = null;
            }
        }

        if (changes.selectedLayer) {
            if (changes.selectedLayer.currentValue) {
                this.selectedNode = new TreeNodeItem ({
                    id: this.selectedLayer.id,
                    parentId: this.selectedLayer.folderId,
                    label: this.selectedLayer.label,
                    data: this.selectedLayer
                });
            } else {
                this.selectedNode = null;
            }
        }
    
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    createTreeDataSource() {
        this.treeSource = [];

        let item = new TreeNodeItem({
            id: this.transStrings[this.tokens.hxdrCatalogTreeNode],
            label: this.transStrings[this.tokens.hxdrCatalogTreeNode],
        });
        const rootCatTreeNode = new TreeNode({
            item: item,
            selectable: false
        });

        item = new TreeNodeItem({
            id: this.transStrings[this.tokens.hxdrMyAssetsProjectTreeNode],
            label: this.transStrings[this.tokens.hxdrMyAssetsProjectTreeNode],
        });
        const rootMyAssetsProjTreeNode = new TreeNode({
            item: item,
            selectable: false
        });

        item = new TreeNodeItem({
            id: this.transStrings[this.tokens.hxdrProjectsTreeNode],
            label: this.transStrings[this.tokens.hxdrProjectsTreeNode],
        });
        const rootProjTreeNode = new TreeNode({
            item: item,
            selectable: false
        });

        for (const col of this.layerInfo.collections) {
            if (col.layers.length > 0) {
                item = new TreeNodeItem({
                    id: col.id,
                    label: col.title,
                    data: col
                });
                const treeNode = new TreeNode({
                    item: item,
                    selectable: false
                });

                for (const layer of col.layers) {
                    item = new TreeNodeItem({
                        id: layer.id,
                        label: layer.label,
                        data: layer 
                    });
                    const childTreeNode = new TreeNode({
                        item: item,
                        selectable: true,
                        leaf: true
                    });
                    treeNode.children.push(childTreeNode);
                }
                rootCatTreeNode.children.push(treeNode);
            }
        }
        if (rootCatTreeNode.children?.length > 0) {
            this.treeSource.push(rootCatTreeNode);
        }

        let childNodes = this.createTreeNodesFromFolder(this.layerInfo.myAssetsProject.rootFolder);
        if (childNodes?.length > 0) {
            rootMyAssetsProjTreeNode.children = childNodes;
        }

        if (rootMyAssetsProjTreeNode.children?.length > 0) {
            this.treeSource.push(rootMyAssetsProjTreeNode);
        }

        for (const proj of this.layerInfo.projects) {
            childNodes = this.createTreeNodesFromFolder(proj.rootFolder);
            if (childNodes.length > 0) {
                item = new TreeNodeItem({
                    id: proj.id,
                    label: proj.name,
                });
                const treeNode = new TreeNode({
                    item: item,
                    selectable: false
                });
                treeNode.children = childNodes;
                rootProjTreeNode.children.push(treeNode);
            }
        }
        if (rootProjTreeNode.children?.length > 0) {
            this.treeSource.push(rootProjTreeNode);
        }
    }

    createTreeNodesFromFolder(folder: HxDRFolder) {
        const treeNodes = [];
        if (folder?.layers) {
            for (const layer of folder.layers) {
                const item = new TreeNodeItem({
                    id: layer.id,
                    parentId: layer.folderId,
                    label: layer.label,
                    data: layer
                });
                const treeNode = new TreeNode({
                    item: item,
                    selectable: true,
                    leaf: true
                });
                treeNodes.push(treeNode);
            }
   
        }
        if (folder?.folders) {
            for (const subFolder of folder.folders) {
                if (!subFolder.queried) {
                    const item = new TreeNodeItem({
                        id: subFolder.id,
                        label: subFolder.name,
                        data: -1
                    });
                    const treeNode = new TreeNode({
                        item: item,
                        selectable: false,
                        needData: true
                    });
                    treeNodes.push(treeNode);
        
                } else {
                    const subNodes = this.createTreeNodesFromFolder(subFolder);
                    const item = new TreeNodeItem({
                        id: subFolder.id,
                        label: subFolder.name,
                    });
                    const treeNode = new TreeNode({
                        item: item,
                        selectable: false
                    });
                    treeNode.children = subNodes;
                    treeNodes.push(treeNode);
                }
            }
        }

        return(treeNodes);
    }


    treeNodeChanged(node: TreeNodeItem) {
        if (!node) {
            this.selectionChanged.emit(null);
        } else {
            this.selectionChanged.emit(node.data);
        }
    }

    /** Set up routine for localization. */
    private initLocalization() {
        this.mapAdminSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
            this.transStrings = response;
        });
    }
}

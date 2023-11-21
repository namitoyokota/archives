import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { trigger, style, animate, transition, state } from '@angular/animations';

import * as LayoutAdapter from '@galileo/web_commonlayoutmanager/adapter';
import { Context$v1, Block$v1, ViewStatus$v1 } from '@galileo/web_commonlayoutmanager/adapter';
import { NavigationService } from '../../main-menu/navigation.service';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'hxgn-layout-compiler-render',
    templateUrl: './render.component.html',
    styleUrls: ['./render.component.scss'],
    animations: [
        trigger(
            'enterSlideInAnimation', [
            transition(':enter', [
                style({ transform: 'translateX(0)', opacity: 0 }),
                animate('800ms', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                style({ transform: 'translateX(0)', opacity: 1, display: 'none' })
            ])
        ]
        ),
        trigger(
            'hideShowBaseStateAnimation', [
            state('true', style({ transform: 'translateX(0)', opacity: 1, display: 'flex' })),
            state('false', style({ transform: 'translateX(0)', opacity: 0, display: 'none' })),
            transition('false => true', animate(800))
        ]
        )
    ]
})
export class RenderComponent implements OnChanges, OnDestroy {

    /** the tab to render*/
    @Input() tab: LayoutAdapter.Tab$v1;

    /** Id of the current screen */
    @Input() screenId: string;

    /** If of the current workspace id */
    @Input() workspaceId: string;

    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input('isMenuOpen') 
    set setIsMenuOpen(isOpen: boolean) {
        if (isOpen) {
            this.expandView(null);
        }

        this.isMenuOpen = isOpen;
    }

    /** True if menu is open */
    isMenuOpen = false;

    /** Block type */
    BlockType: typeof LayoutAdapter.BlockType$v1 = LayoutAdapter.BlockType$v1;
    /** Current block */
    block: LayoutAdapter.Block$v1 = null;
    /** Active tab id */
    activeTabId: string = null;

    /** The base context */
    baseContext: Context$v1;

    /** The current viewStatus */
    ViewStatus: typeof ViewStatus$v1 = ViewStatus$v1;

    /** Id of the view block that is expanded */
    expandedBlockId: string;

    private activeStates: Map<string, string> = new Map<string, string>();
    private stateBlockMapping: Map<string, string> = new Map<string, string>();

    constructor(
        private layoutCompiler: LayoutAdapter.LayoutCompilerAdapterService,
        private mainMenuService: NavigationService
    ) { }

    /**
     * Filter the view blocks by state
     */
    filterViewBlocksByState(blocks: LayoutAdapter.Block$v1[], stateId: string = null) {
        let blockIds: string[] = [];

        for (const block of blocks) {
            if (!stateId) {
                // Filter on base state
                blockIds.push(block.id);

                if (block.blocks.length) {
                    // Look at child blocks
                    blockIds = blockIds.concat(this.filterViewBlocksByState(block.blocks, stateId));
                }

            } else {
                // A state is being filter on
                if (block.isDynamicSpace && block.states.length) {
                    // Look for state blocks
                    const foundState = block.states.find(item => {
                        return item.id === stateId;
                    });

                    if (foundState && foundState.blocks.length) {
                        blockIds = blockIds.concat(this.filterViewBlocksByState(foundState.blocks));
                    }
                } else if (block.blocks.length) {
                    blockIds = blockIds.concat(this.filterViewBlocksByState(block.blocks, stateId));
                }
            }
        }

        return blockIds;
    }

    /**
     * On destroy life cycle hook
     */
    ngOnDestroy() {
        this.layoutCompiler.purgeWorkspaceComponents();
    }

    /**
     * On Changes life cycle hook
     */
    async ngOnChanges(changes: SimpleChanges) {
        if (changes.setIsMenuOpen.previousValue !== undefined &&
            changes.setIsMenuOpen.currentValue !== changes.setIsMenuOpen.previousValue) {
            return;
        }

        // Clear state selection
        this.activeStates = new Map<string, string>();
        this.stateBlockMapping = new Map<string, string>();

        if ((!this.activeTabId || this.activeTabId !== this.tab.id) && this.tab?.blocks) {

            this.resetBaseStateBlocks(this.tab.blocks); // Make sure the base state is displayed first
            await this.layoutCompiler.loadTabModulesAsync(this.tab);

            const initBlockIds = this.filterViewBlocksByState(this.tab.blocks);
            const initViewBlocks = this.tab.viewBlocks.filter((item) => {
                return !!initBlockIds.find(id => id === item.blockId);
            });

            // Base context
            this.baseContext = new Context$v1({
                workspaceId: this.workspaceId,
                screenId: this.screenId,
                tabId: this.tab.id
            } as Context$v1);

            // Tell the feature adapters to load the views
            this.layoutCompiler.loadManifestViews(initViewBlocks, this.baseContext);
        }
    }

    /** Reset the base blocks */
    resetBaseStateBlocks(blocks: LayoutAdapter.Block$v1[]) {
        // Need to make sure all dynamic spaces have the base state's blocks set
        for (const block of blocks) {
            if (block.isDynamicSpace) {
                block.blocks = block.states[0].blocks;
            } else {
                this.resetBaseStateBlocks(block.blocks);
            }
        }
    }

    /**
     * Temp method to trigger showing a state
     * This will be replaced with real logic when triggers are fully added
     */
    async rightClick(block: LayoutAdapter.Block$v1) {
        /* eslint-disable-next-line */
        event.stopPropagation();
        // Get view data
        // const view = await this.layoutCompiler.getViewFromIdAsync(block.id);

        // if (view && view.triggerDynamicSpace) {
        //     const activeState = this.activeStates.get(this.stateBlockMapping.get(view.stateToDisplayId));

        //     // Show the correct state
        //     this.activeStates.set(this.stateBlockMapping.get(view.stateToDisplayId), view.stateToDisplayId);

        //     // Get only the new views that need injection
        //     const initBlockIds = this.filterViewBlocksByState(this.tab.blocks, view.stateToDisplayId);
        //     const initViewBlocks = this.tab.viewBlocks.filter((item) => {
        //         return !!initBlockIds.find(id => id === item.blockId);
        //     });

        //     // Wait for the blocks to draw
        //     setTimeout(() => {
        //         this.layoutCompiler.loadManifestViews(initViewBlocks);
        //     });
        // }
    }

    /** Clear the selected event */
    clearSelectedState(stateId: string) {
        /* eslint-disable-next-line */
        event.stopPropagation();

        if (stateId) {
            this.activeStates.delete(this.stateBlockMapping.get(stateId));
        }
    }

    /** Create the state block mapping */
    createStateBlockMapping(block: LayoutAdapter.Block$v1) {
        if (block.states.length) {
            for (const blockState of block.states) {
                this.stateBlockMapping.set(blockState.id, block.id);
            }
        }
    }

    /** Get the block state id */
    getBlockStateId(blockId: string) {
        return this.activeStates.get(blockId);
    }

    /**
     * Given a block id returns the view settings.
     * @param blockId The block id to used for setting look up
     */
    getView(blockId: string): LayoutAdapter.View$v1 {
        const foundViewBlock = this.tab.viewBlocks.find(viewBlock => viewBlock.blockId === blockId);
        if (foundViewBlock) {
            return foundViewBlock.view;
        }

        return null;
    }

    /**
     * Function used to track a block in a ngFor loop
     */
    trackByBlock(index, item: Block$v1) {
        return item.id;
    }

    /**
     * Returns the context id from block id
     */
    getContextId(blockId: string): string {
        const context = new Context$v1(this.baseContext);
        context.blockId = blockId;

        return context.id();
    }

    /**
     * Expand the view to take up the whole tab
     */
    expandView(blockId: string): void {
        //this.expandedView = ref;

        if (this.isMenuOpen && blockId) {
            this.mainMenuService.toggleMainMenu();
        }

        if (this.expandedBlockId === blockId) {
            this.expandedBlockId = null
        } else {
            this.expandedBlockId = blockId;
            
            
        }

        window.dispatchEvent(new Event('resize'));
    }

}

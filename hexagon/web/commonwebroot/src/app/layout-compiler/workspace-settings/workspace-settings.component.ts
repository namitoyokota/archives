import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';
import { CommonWindowCommunicationService } from '@galileo/web_common-http';
import { LayoutCompilerAdapterService, PhysicalWorkspace$v1, Workspace$v1 } from '@galileo/web_commonlayoutmanager/adapter';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';

import { LayoutCompilerService } from '../layout-compiler.service';

/**
 * All possible translation tokens for this component
 */
export enum TranslationTokens {
    changeWorkspace = 'commonwebroot-main.component.changeWorkspace',
    openWorkspaceScreensMsg = 'commonwebroot-main.component.openWorkspaceScreensMsg',
    changePreset = 'commonwebroot-main.component.changePreset',
    screenDash = 'commonwebroot-main.component.screenDash'
}

/**
 * Object that is passed from a child window to the master window
 * when the selected workspace changes
 */
export interface ChangeWorkspaceMsg {
    /** Id of the workspace that is now selected */
    workspaceId: string;

    /** Should multiscreen workspaces span tabs */
    openWorkspaceScreens: boolean;
}

@Component({
// eslint-disable-next-line @angular-eslint/component-selector
    selector: 'hxgn-commonwebroot-workspace-settings',
    templateUrl: 'workspace-settings.component.html',
    styleUrls: ['workspace-settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkspaceSettingsComponent implements OnInit, OnDestroy {

    /** The default physical workspace */
    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input('defaultPhysicalWorkspace')
    set setDefaultPhysicalWorkspace(pw: PhysicalWorkspace$v1) {
        this.defaultPhysicalWorkspace.next(pw);
    }

    /** The default physical workspace */
    defaultPhysicalWorkspace = new BehaviorSubject<PhysicalWorkspace$v1>(null);

    /** Reference to the angular selection component */
    @ViewChild('workspaceselection', { static: true }) workSpaceSelection: MatSelect;

    /** The id of the default workspace */
    defaultWorkspaceId: string;

    /** The id of the default physical workspace */
    defaultPhysicalWorkspaceId: string;

    /** List of workspaces that can be changed between */
    workspaces: Workspace$v1[] = [];

    /** List of physical workspaces that can be changed between */
    physicalWorkspaces: PhysicalWorkspace$v1[] = [];

    /** The currently selected workspace */
    selectedWorkspace: Workspace$v1;

    /** The currently selected physical workspace */
    selectedPhysicalWorkspace: PhysicalWorkspace$v1;

    /** Expose TranslationTokens to the HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    private readonly messageKey = 'CHANGE_WORKSPACE';

    private destroy$: Subject<boolean> = new Subject<boolean>();

    private workspaceLoaded = false;

    constructor(
        private layoutAdapterSrv: LayoutCompilerAdapterService,
        public layoutSrv: LayoutCompilerService,
        private windowCommSrv: CommonWindowCommunicationService,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute
    ) { }

    /**
     * On component init life cycle event
     */
    async ngOnInit() {

        // Wait for the physical workspace to be set
        await this.defaultPhysicalWorkspace.asObservable().pipe(
            filter(pw => !!pw),
            first()
        ).toPromise();

        this.layoutSrv.workspaceChange$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(async (workspaceId) => {
            const workspaceManifest = await this.layoutAdapterSrv.getWorkspacesAsync();
            this.physicalWorkspaces = workspaceManifest.physicalWorkspaces;
            this.defaultPhysicalWorkspaceId = this.defaultPhysicalWorkspace.getValue().id;

            if (!workspaceId && !this.workspaceLoaded) {
                // First time loading
                if (workspaceManifest) {
                    this.defaultWorkspaceId = this.defaultPhysicalWorkspace.getValue().defaultWorkspacePresetId;

                    this.workspaces = [].concat(workspaceManifest.workspaces);

                    this.selectedWorkspace = this.workspaces.find(item => item.id === this.defaultWorkspaceId);
                    this.selectedPhysicalWorkspace = this.defaultPhysicalWorkspace.getValue();

                    this.workSpaceSelection.value = this.selectedWorkspace.id;

                }
            } else if (workspaceId) {
                if (workspaceManifest) {
                    this.defaultWorkspaceId = this.selectedPhysicalWorkspace.defaultWorkspacePresetId;
                    this.workspaces = [].concat(workspaceManifest.workspaces);

                    this.selectedWorkspace = this.workspaces.find(item => item.id === workspaceId);

                    this.workSpaceSelection.value = this.selectedWorkspace.id;

                    this.selectedPhysicalWorkspace = this.physicalWorkspaces.find(p => p.id === this.selectedWorkspace.physicalWorkspaceId);
                }
            }

            // Sort the workspaces
            this.sortWorkspaceList();

            this.cdr.detectChanges();
            this.cdr.markForCheck();
        });

        if (!this.windowCommSrv.isChildWindow()) {
            this.setUpChildChangeWorkspaceListener();
        }

        const workspaceID = this.route.snapshot.queryParamMap.get('workspace');
        if (workspaceID) {
            this.layoutSrv.workspaceChange$.next(workspaceID);
        }
    }

    /**
     * On component destroy life cycle event
     */
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * Event that is raised when the selected workspace changes
     * @param selectionEvent Angular selection event
     */
    workspaceSelectionChange(selectionEvent: any) {
        this.changeSelectedWorkspace(selectionEvent.value);
    }

    private changeSelectedWorkspace(id: string) {
        if (!this.windowCommSrv.isChildWindow()) {
            this.layoutSrv.workspaceChange$.next(id);
        } else {
            // Tell parent window to change the workspace
            this.windowCommSrv.messageMaster({
                contextId: this.messageKey,
                handleId: null,
                data: {
                    workspaceId: id,
                    openWorkspaceScreens: this.layoutSrv.openWorkspaceScreens
                }
            });
        }
    }

    /**
     * Method that is called when the open workspace screen toggle value is changed
     * @param event Angular slide toggle event object
     */
    onChange(event: MatSlideToggleChange) {
        this.layoutSrv.openWorkspaceScreens = event.checked;
    }

    /**
     * Set the workspace preset to the default based on the newly selected physical workspace
     */
    physicalWorkspaceSelectionChange(event: MatSelectChange) {
        this.selectedPhysicalWorkspace = this.physicalWorkspaces.find(p => p.id === event.value);
        const defaultWorkspaceId = this.selectedPhysicalWorkspace.defaultWorkspacePresetId;
        this.changeSelectedWorkspace(defaultWorkspaceId);
    }

    /**
     * Returns filter list of workspace presets
     */
    getWorkspacePresetList(): Workspace$v1[] {
        return this.workspaces.filter(w =>  w.physicalWorkspaceId === this.selectedPhysicalWorkspace.id);
    }

    /**
     * Listen to messages from child windows
     */
    private setUpChildChangeWorkspaceListener() {
        this.windowCommSrv.receiveMessage$
        .pipe(filter(msg => msg.contextId === this.messageKey))
        .subscribe((msg: any) => {
            this.layoutSrv.openWorkspaceScreens = msg.data.openWorkspaceScreens;
            this.layoutSrv.workspaceChange$.next(msg.data.workspaceId);
        });
    }

    /**
     * Sort the workspace list
     */
    private sortWorkspaceList(): void {
        if (this.physicalWorkspaces.length) {
            this.physicalWorkspaces.sort((a, b) => {
                return a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase() ? 1 : -1;
            });
        }
    }
}

import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    CommonfeatureflagsAdapterService$v1,
    FeatureFlag$v2,
    FeatureFlagGroupsMenuComponent,
    FeedbackDialogComponent,
    ProxyMethod,
} from '@galileo/web_commonfeatureflags/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';

import { FeatureFlags } from './feature-flags';
import { TestClass } from './test.class';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    @ViewChild('flagsEditor') flagsEditorRef: FeatureFlagGroupsMenuComponent;

    featureFlags: typeof FeatureFlags = FeatureFlags;

    ifOnTestText: string;

    tenantId = '1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a';

    dirty = false;

    constructor(
        private dialog: MatDialog,
        private ffAdapter: CommonfeatureflagsAdapterService$v1,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) {
        this.localizationSrv.changeLanguageAsync('en');

        const test = new TestClass();

        // Example how to do a simple if flag is on
        if (this.ffAdapter.isActive(FeatureFlags.newFeature)) {
            this.ifOnTestText = 'I am a new feature';
        } else {
            this.ifOnTestText = 'I am the current feature';
        }
    }

    @ProxyMethod('saySomething_newFeature', FeatureFlags.newFeature)
    saySomething() {
        alert('Feature flag is off.');
    }

    saySomething_newFeature() { // Append feature flag enum token to the end of the method
        alert('Feature flag is on!');
    }

    flagsChanged(flags: FeatureFlag$v2[]) {
        // tslint:disable-next-line: no-console
        console.info('Active Flags', flags);
    }

    isDirty(flag: boolean) {
        // tslint:disable-next-line: no-console
        console.log('dirty flag', flag);
        this.dirty = flag;
    }

    isClean() {
        // tslint:disable-next-line: no-console
        console.log('cleaned flags');
    }

    completed() {
        // tslint:disable-next-line: no-console
        console.log('finished save');
    }

    reset() {
        const tenantId = this.tenantId;
        this.tenantId = null;
        setTimeout(() => this.tenantId = tenantId);
    }

    openFeedbackDialog(): void {
        this.dialog.open(FeedbackDialogComponent, {
            autoFocus: false,
            data: [
                new FeatureFlag$v2({
                    friendlyName: 'commonfeatureflags-main.component.warning'
                }),
                new FeatureFlag$v2({
                    friendlyName: 'commonfeatureflags-main.component.forceUpdate'
                })
            ],
            disableClose: true,
            panelClass: 'feedback-dialog'
        });
    }

    discard() {
        this.flagsEditorRef.cancel();
    }

    save() {
        this.flagsEditorRef.save();
    }
}

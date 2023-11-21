/*
* Public API Surface of commonfeatureflags-adapter
*/

export * from './lib/adapter.module';
export * from './lib/feature-flag-style.directive';
export * from './lib/feature-flag.directive';
export * from './lib/proxy-class.decorator';
export * from './lib/proxy-method.decorator';
export * from './lib/proxy.component';
export * from './lib/adapter.v1.service';
export * from './lib/feature-flag-global-editor/feature-flag-global-editor.module';
export * from './lib/feature-flag-global-editor/feature-flag-global-editor.component';
export * from './lib/feature-flag-tenant-editor/feature-flag-tenant-editor.module';
export * from './lib/feature-flag-tenant-editor/feature-flag-tenant-editor.component';
export * from './lib/feature-flag-groups-menu/feature-flag-groups-menu.module';
export * from './lib/feature-flag-groups-menu/feature-flag-groups-menu.component';

export * from './lib/feedback-dialog/feedback-dialog.component';
export * from './lib/feedback-dialog/feedback-dialog.module';

export {
    FeatureFlag$v2,
    FeatureFlags
} from '@galileo/web_commonfeatureflags/_common';

export { capabilityId } from '@galileo/web_commonfeatureflags/_common';

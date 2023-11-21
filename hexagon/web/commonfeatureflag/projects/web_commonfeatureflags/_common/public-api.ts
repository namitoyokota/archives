/*
* Public API Surface of commonfeatureflags-common
*/

export * from './lib/common.mailbox';
export * from './lib/injection.tokens';
export * from './lib/abstractions/feature-flag.v2';
export * from './lib/abstractions/display-group.v1';
export * from './lib/abstractions/edit-group.v1';
export * from './lib/abstractions/flag-state.v1';
export * from './lib/abstractions/global-states.v1';
export * from './lib/abstractions/group-state.v1';
export * from './lib/abstractions/scope.v1';
export * from './lib/abstractions/user-group-config';
export * from './lib/abstractions/feature-flag-editor-settings.v2';
export * from './lib/abstractions/change-notification.v1';
export * from './lib/feature-flags';
export * from './lib/translation-groups';
export * from './lib/abstractions/feedback-message.v1';
export * from './lib/abstractions/add-feedback-message.v1';

export const capabilityId = '@hxgn/commonfeatureflags';

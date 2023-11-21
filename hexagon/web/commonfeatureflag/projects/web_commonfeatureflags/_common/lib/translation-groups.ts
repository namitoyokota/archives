/**
 * List of translation groups
 */
 export enum TranslationGroup {
    core = 'commonfeatureflags-core', // Tokens that are in the capability manifest, notifications, view templates, feature flags, other config files
    main = 'commonfeatureflags-main', // Tokens that are needed by the main product: views, adapter components, injectable components
}

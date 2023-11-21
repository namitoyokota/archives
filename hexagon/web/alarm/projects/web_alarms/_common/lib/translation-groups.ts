/**
 * List of translation groups
 */
 export enum TranslationGroup {
    core = 'alarm-core', // Tokens that are in the capability manifest, notifications, view templates, feature flags, other config files
    main = 'alarm-main' // Tokens that are needed by the main product: views, adapter components, injectable components
}

/**
 * List of translation groups
 */
 export enum TranslationGroup {
    core = 'commonmap-core', // Tokens that are in the capability manifest, notifications, view templates, feature flags, other config files
    main = 'commonmap-main', // Tokens that are needed by the main product: views, adapter components, injectable components
    admin = 'commonmap-admin', // Tokens that are by the admin components only.
    shared = 'commonmap-shared', // Tokens that are shared between and main and admin
    waze =  'commonmap-waze'// Tokens used by waze map
}

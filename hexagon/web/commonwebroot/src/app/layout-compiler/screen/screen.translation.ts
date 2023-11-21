export enum ScreenTranslationTokens {
    layoutManager = 'commonwebroot-main.component.layoutManager',
    warningViewingDeprecatedVersionOfThisPage = 'commonwebroot-main.component.warningViewingDeprecatedVersionOfThisPage',
    reloadPage = 'commonwebroot-main.component.reloadPage',
    dismiss = 'commonwebroot-main.component.dismiss',
    adminView = 'commonwebroot-main.component.adminView',
    about = 'commonwebroot-main.component.about',
    help = 'commonwebroot-main.component.help'
}

export interface ScreenTranslatedTokens {
    /** About translated string */
    about: string;

    /** Help translated string */
    help: string;
}

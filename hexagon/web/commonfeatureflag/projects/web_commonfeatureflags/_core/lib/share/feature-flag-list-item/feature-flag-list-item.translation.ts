export enum FeatureFlagListItemTranslationTokens {
    disabled = 'commonfeatureflags-main.component.disabled',
    enabled = 'commonfeatureflags-main.component.enabled',
    flagIdAlt = 'commonfeatureflags-main.component.flagIdAlt',
    overrideToolTip = 'commonfeatureflags-main.component.overrideToolTipMsg',
    scopeToolTip = 'commonfeatureflags-main.component.scopeToolTipMsg',
    scopeToolTipLevel = 'commonfeatureflags-main.component.scopeToolTipMsgLevel',
    softwareUpdateTooltip = 'commonfeatureflags-main.component.softwareUpdateTooltip'
}

export interface FeatureFlagListItemTranslatedTokens {
    overrideToolTip: string;
    scopeToolTip: string;
    scopeToolTipLevel: string;
    softwareUpdateTooltip: string;
}

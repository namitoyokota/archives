import { NotificationSettings$v1 } from '@galileo/web_commonnotifications/_common';

export interface CreationPreset {

    /** Description of created preset. */
    description: string;

    /** Name of created preset. */
    presetName: string;

    /** Existing template to create from. Can be either system, user defined, or blank template. */
    template: NotificationSettings$v1;
}
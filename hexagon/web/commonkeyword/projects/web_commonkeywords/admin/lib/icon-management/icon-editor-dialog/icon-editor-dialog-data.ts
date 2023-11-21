import { CompositeIcon$v1 } from '@galileo/web_commonkeywords/_common';

import { IconListType } from '../icon-library/icon-library.component';

/** Object that is used to transfer data to the icon editor dialog */
export interface IconEditorDialogData {
    /** The composite icon being edited */
    compositeIcon: CompositeIcon$v1;

    /** The maximum number of layers that can be added to the icon*/
    maxLayers: number;

    /** Translation token for the title */
    titleToken: string;

    /** Translation  token for the description */
    descriptionToken: string;

    /** If true then the close button will be shown */
    allowCancel: boolean;

    /** Optional friendly name to display on dialog */
    ruleFriendlyName?: string;

    iconType?: IconListType;
}

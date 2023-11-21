import { Injectable } from '@angular/core';

@Injectable()
export class IconManagementService {

    /** The selected primitive icon in the editor */
    selectedPrimitiveIconId: string;

    /** The index of the selected icon layer in the editor */
    selectedLayerIndex: number;

    /** The capability that is currently selected */
    selectedCapability: string;
}

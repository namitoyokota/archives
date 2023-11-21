/* eslint-disable @typescript-eslint/naming-convention */
import { bindingMode } from 'aurelia-framework';

export const BINDING_MODES = {
    FROM_VIEW: { defaultBindingMode: bindingMode.fromView },
    ONE_TIME: { defaultBindingMode: bindingMode.oneTime },
    TO_VIEW: { defaultBindingMode: bindingMode.toView },
    TWO_WAY: { defaultBindingMode: bindingMode.twoWay },
};

import type { IPopupViewModel } from "shared-from-dcdev/shared/components/popups/interfaces/popup-interfaces";

export abstract class PopupBase {
    protected model: IPopupViewModel;

    protected activate(model: IPopupViewModel) {
        this.model = model;
    }

    protected attached() {
        this.model.OnLoaded();
    }
}

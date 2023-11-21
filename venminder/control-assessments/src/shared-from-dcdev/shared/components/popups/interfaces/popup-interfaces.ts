interface IPopupEventArgs {
    Callback: any,
    View: string;
    Model: IPopupViewModel
}

interface IPopupViewModel {
    ActionNeeded?: boolean;
    ControlID: string;
    ContainerWidth: number;
    ContainerHeight: number;
    Left: number;
    Top: number;
    OnClose?(data?: any): any;
    OnLoaded?(): any;
    OnSave?: any;
    SmokeBackground?: boolean;
    Title: string;
    Data?: any
}

interface IPopupToggleModel {
    ContainerHeight?: number;
    ContainerWidth?: number;
    IsOverflow?: boolean;
    IsShow: boolean;
    Left?: number;
    Top?: number;
    ScreenHeight?: number;
    ScrollTop?: number;
    ScreenWidth?: number;
    ScrollLeft?: number;
    TransitionWithNoDuration?: boolean;
}

export { IPopupEventArgs, IPopupViewModel, IPopupToggleModel }

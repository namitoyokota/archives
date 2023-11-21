interface ICallbackEventArgs {
  ActionNeeded?: boolean;
  BgClass?: string;
  ControlID: string;
  Data?: any;
  FromOverlayClick?: boolean;
  FromScroll?: boolean;
  OnOverlayClose?: any;
  OnOverlayOpen?: any;
  SmokeBackground?: boolean;
  ZIndex?: number;
}

export { ICallbackEventArgs }

import { bindingMode } from 'aurelia-binding';

export class BindingModes {
  static readonly FROM_VIEW = { defaultBindingMode: bindingMode.fromView };
  static readonly ONE_TIME = { defaultBindingMode: bindingMode.oneTime };
  static readonly TO_VIEW = { defaultBindingMode: bindingMode.toView };
  static readonly TWO_WAY = { defaultBindingMode: bindingMode.twoWay };
}

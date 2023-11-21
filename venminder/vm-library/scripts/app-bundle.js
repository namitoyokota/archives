define('__dot_dot__/src/classes/index',["exports", "./vm-context-menu", "./vm-pager"], function (_exports, _vmContextMenu, _vmPager) {
  "use strict";

  _exports.__esModule = true;
  Object.keys(_vmContextMenu).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _vmContextMenu[key]) return;
    _exports[key] = _vmContextMenu[key];
  });
  Object.keys(_vmPager).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _vmPager[key]) return;
    _exports[key] = _vmPager[key];
  });
});;
define('__dot_dot__/src/classes/vm-context-menu',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMContextMenu = void 0;
  class VMContextMenu {
    constructor(params = {}) {
      const {
        component = '',
        data = null,
        isOpen = false,
        x = 0,
        y = 0,
        methods = {}
      } = params;
      this.component = component;
      this.data = data;
      this.isOpen = isOpen;
      this.x = x;
      this.y = y;
      this.methods = methods;
    }
  }
  _exports.VMContextMenu = VMContextMenu;
});;
define('__dot_dot__/src/classes/vm-pager',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMPager = void 0;
  class VMPager {
    constructor(params = {}) {
      const {
        currentPage = 0,
        endIndex = 0,
        pageSize = 0,
        sizeOptions = [25, 50, 100, 200],
        startIndex = 0,
        totalItems = 0,
        totalPages = 0
      } = params;
      this.currentPage = currentPage;
      this.endIndex = endIndex;
      this.pageSize = pageSize;
      this.sizeOptions = sizeOptions;
      this.startIndex = startIndex;
      this.totalItems = totalItems;
      this.totalPages = totalPages;
    }
  }
  _exports.VMPager = VMPager;
});;
define('__dot_dot__/src/constants/binding-modes',["exports", "aurelia-framework"], function (_exports, _aureliaFramework) {
  "use strict";

  _exports.__esModule = true;
  _exports.BINDING_MODES = void 0;
  const BINDING_MODES = {
    FROM_VIEW: {
      defaultBindingMode: _aureliaFramework.bindingMode.fromView
    },
    ONE_TIME: {
      defaultBindingMode: _aureliaFramework.bindingMode.oneTime
    },
    TO_VIEW: {
      defaultBindingMode: _aureliaFramework.bindingMode.toView
    },
    TWO_WAY: {
      defaultBindingMode: _aureliaFramework.bindingMode.twoWay
    }
  };
  _exports.BINDING_MODES = BINDING_MODES;
});;
define('__dot_dot__/src/constants/index',["exports", "./binding-modes"], function (_exports, _bindingModes) {
  "use strict";

  _exports.__esModule = true;
  Object.keys(_bindingModes).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _bindingModes[key]) return;
    _exports[key] = _bindingModes[key];
  });
});;
define('__dot_dot__/src/elements/index',["exports", "./vm-checkbox-picklist/vm-checkbox-picklist.component", "./vm-checkbox/vm-checkbox.component"], function (_exports, _vmCheckboxPicklist, _vmCheckbox) {
  "use strict";

  _exports.__esModule = true;
  Object.keys(_vmCheckboxPicklist).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _vmCheckboxPicklist[key]) return;
    _exports[key] = _vmCheckboxPicklist[key];
  });
  Object.keys(_vmCheckbox).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _vmCheckbox[key]) return;
    _exports[key] = _vmCheckbox[key];
  });
});;
define('__dot_dot__/src/elements/vm-alert/vm-alert.component',["exports", "tslib", "aurelia-framework", "../../constants/binding-modes", "../../enums/alert-icons.enum", "../../enums/alert-types.enum"], function (_exports, _tslib, _aureliaFramework, _bindingModes, _alertIcons, _alertTypes) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMAlertComponent = void 0;
  var VMAlertClasses;
  (function (VMAlertClasses) {
    VMAlertClasses["Hide"] = "vm-alert__hidden";
    VMAlertClasses["Large"] = "vm-alert__lg";
  })(VMAlertClasses || (VMAlertClasses = {}));
  let VMAlertComponent = class VMAlertComponent {
    constructor() {
      this.isLarge = false;
      this.showDismiss = false;
      this.showIcon = true;
      this.type = null;
      this.hasBeenDismissed = false;
    }
    get alertClasses() {
      const classes = [`vm-alert__${this.type}`];
      if (this.hasBeenDismissed) {
        classes.push(VMAlertClasses.Hide);
      }
      if (this.isLarge) {
        classes.push(VMAlertClasses.Large);
      }
      return classes.join(' ');
    }
    get iconClasses() {
      const classes = ['vm-alert--icon'];
      switch (this.type) {
        case _alertTypes.AlertTypes.Danger:
        case _alertTypes.AlertTypes.Warning:
          classes.push(_alertIcons.AlertIcons.Exclamation);
          break;
        case _alertTypes.AlertTypes.Info:
          classes.push(_alertIcons.AlertIcons.Info);
          break;
        case _alertTypes.AlertTypes.Success:
          classes.push(_alertIcons.AlertIcons.Check);
          break;
      }
      return classes.join(' ');
    }
  };
  _exports.VMAlertComponent = VMAlertComponent;
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMAlertComponent.prototype, "isLarge", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMAlertComponent.prototype, "showDismiss", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMAlertComponent.prototype, "showIcon", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", String)], VMAlertComponent.prototype, "type", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.computedFrom)('hasBeenDismissed', 'isLarge', 'type'), (0, _tslib.__metadata)("design:type", String), (0, _tslib.__metadata)("design:paramtypes", [])], VMAlertComponent.prototype, "alertClasses", null);
  (0, _tslib.__decorate)([(0, _aureliaFramework.computedFrom)('type'), (0, _tslib.__metadata)("design:type", String), (0, _tslib.__metadata)("design:paramtypes", [])], VMAlertComponent.prototype, "iconClasses", null);
  _exports.VMAlertComponent = VMAlertComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-alert'), (0, _tslib.__metadata)("design:paramtypes", [])], VMAlertComponent);
});;
define('text!__dot_dot__/src/elements/vm-alert/vm-alert.component.css',[],function(){return "vm-alert{align-items:center;border:1px solid;border-radius:5px;-moz-column-gap:7px;column-gap:7px;display:flex;font-size:13px;line-height:20px;padding:5px 15px;width:100%}vm-alert.vm-alert__danger{background-color:#fde1e0;border-color:#f0d5d3;color:#721c24}vm-alert.vm-alert__hidden{display:none}vm-alert.vm-alert__info{background-color:#dcecfc;border-color:#cbe4fb;color:#172b4a}vm-alert.vm-alert__success{background-color:#d4edda;border-color:#d2e6ce;color:#105242}vm-alert.vm-alert__warning{background-color:#fff3cd;border-color:#e2d7c3;color:#533f03}vm-alert.vm-alert__lg{font-size:16px;padding:15px 20px}vm-alert .vm-alert--icon{font-size:16px}vm-alert .vm-alert--text{flex:1}";});;
define('text!__dot_dot__/src/elements/vm-alert/vm-alert.component.html',[],function(){return "<template class=\"${alertClasses}\">\r\n    <require from=\"./vm-alert.component.css\"></require>\r\n\r\n    <i if.bind=\"showIcon\" class=\"vm-alert--icon ${iconClasses}\"></i>\r\n    <div class=\"vm-alert--text\">\r\n        <slot></slot>\r\n    </div>\r\n    <vm-button if.bind=\"showDismiss\" icon small click.call=\"hasBeenDismissed = true\">\r\n        <i class=\"fas fa-times\"></i>\r\n    </vm-button>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-badge/vm-badge.component',["exports", "tslib", "aurelia-framework", "../../constants/binding-modes"], function (_exports, _tslib, _aureliaFramework, _bindingModes) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMBadgeComponent = void 0;
  let VMBadgeComponent = class VMBadgeComponent {
    constructor() {
      this.type = null;
    }
  };
  _exports.VMBadgeComponent = VMBadgeComponent;
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", String)], VMBadgeComponent.prototype, "type", void 0);
  _exports.VMBadgeComponent = VMBadgeComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-badge'), (0, _tslib.__metadata)("design:paramtypes", [])], VMBadgeComponent);
});;
define('text!__dot_dot__/src/elements/vm-badge/vm-badge.component.css',[],function(){return "vm-badge{align-items:center;border-radius:50px;display:flex;font-size:12px;font-weight:700;height:20px;line-height:14px;padding:0 7px 0 6px;width:-moz-min-content;width:min-content}.vm-badge__danger,vm-badge[danger]{background-color:#d61100;color:#fff}.vm-badge__primary,vm-badge[primary]{background-color:#6666d2;color:#fff}.vm-badge__secondary,vm-badge[secondary]{background-color:#ebecf0}";});;
define('text!__dot_dot__/src/elements/vm-badge/vm-badge.component.html',[],function(){return "<template class=\"${type}\">\r\n    <require from=\"./vm-badge.component.css\"></require>\r\n\r\n    <slot></slot>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-breadcrumbs/vm-breadcrumbs.component',["exports", "tslib", "aurelia-event-aggregator", "aurelia-framework"], function (_exports, _tslib, _aureliaEventAggregator, _aureliaFramework) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMBreadcrumbsComponent = void 0;
  let VMBreadcrumbsComponent = class VMBreadcrumbsComponent {
    constructor(ea) {
      this.ea = ea;
      this.breadcrumbs = [];
      this.routerChildCompleteSub = null;
      this.routerCompleteSub = null;
    }
    created() {
      if (!this.routerCompleteSub) {
        this.routerCompleteSub = this.ea.subscribe("router:navigation:complete", event => {
          this.setBreadcrumbs(event.instruction);
        });
      }
      if (!this.routerChildCompleteSub) {
        this.routerChildCompleteSub = this.ea.subscribe("router:navigation:child:complete", event => {
          this.setBreadcrumbs(event.instruction);
        });
      }
    }
    detached() {
      var _a, _b;
      (_a = this.routerCompleteSub) === null || _a === void 0 ? void 0 : _a.dispose();
      this.routerCompleteSub = null;
      (_b = this.routerChildCompleteSub) === null || _b === void 0 ? void 0 : _b.dispose();
      this.routerChildCompleteSub = null;
    }
    setBreadcrumbs(navInstruction) {
      var _a, _b, _c, _d;
      if ((_a = navInstruction.viewPortInstructions.default) === null || _a === void 0 ? void 0 : _a.childNavigationInstruction) {
        while ((_b = navInstruction.viewPortInstructions.default) === null || _b === void 0 ? void 0 : _b.childNavigationInstruction) {
          navInstruction = navInstruction.viewPortInstructions.default.childNavigationInstruction;
          if ((_c = navInstruction.config.breadcrumbs) === null || _c === void 0 ? void 0 : _c.length) {
            this.breadcrumbs = navInstruction.config.breadcrumbs;
          }
        }
      } else {
        if ((_d = navInstruction.config.breadcrumbs) === null || _d === void 0 ? void 0 : _d.length) {
          this.breadcrumbs = navInstruction.config.breadcrumbs;
        }
      }
    }
  };
  _exports.VMBreadcrumbsComponent = VMBreadcrumbsComponent;
  _exports.VMBreadcrumbsComponent = VMBreadcrumbsComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-breadcrumbs'), (0, _tslib.__param)(0, (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator)), (0, _tslib.__metadata)("design:paramtypes", [_aureliaEventAggregator.EventAggregator])], VMBreadcrumbsComponent);
});;
define('text!__dot_dot__/src/elements/vm-breadcrumbs/vm-breadcrumbs.component.css',[],function(){return "vm-breadcrumbs{align-items:center;-moz-column-gap:13px;column-gap:13px;display:flex;font-size:16px;line-height:24px}vm-breadcrumbs .vm-breadcrumbs--breadcrumb{color:#20a281!important;font-weight:700;outline:none;text-decoration:none}vm-breadcrumbs .vm-breadcrumbs--breadcrumb:focus,vm-breadcrumbs .vm-breadcrumbs--breadcrumb:hover{text-decoration:underline}vm-breadcrumbs .vm-breadcrumbs--breadcrumb-divider{background-color:#a6b0bc;height:16px;transform:rotate(22deg);width:1px}";});;
define('text!__dot_dot__/src/elements/vm-breadcrumbs/vm-breadcrumbs.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-breadcrumbs.component.css\"></require>\r\n\r\n    <template repeat.for=\"breadcrumb of breadcrumbs\">\r\n        <template if.bind=\"!$last\">\r\n            <a if.bind=\"breadcrumb.name\" class=\"vm-breadcrumbs--breadcrumb\" route-href=\"route.bind: breadcrumb.name\">${breadcrumb.title}</a>\r\n            <a if.bind=\"breadcrumb.href\" class=\"vm-breadcrumbs--breadcrumb\" href.bind=\"breadcrumb.href\">${breadcrumb.title}</a>\r\n            <span class=\"vm-breadcrumbs--breadcrumb-divider\"></span>\r\n        </template>\r\n        <span else>${breadcrumb.title}</span>\r\n    </template>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-button/vm-button.component',["exports", "tslib", "aurelia-framework", "../../constants/binding-modes", "../../enums/vm-button-sizes.enum"], function (_exports, _tslib, _aureliaFramework, _bindingModes, _vmButtonSizes) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMButtonComponent = void 0;
  let VMButtonComponent = class VMButtonComponent {
    constructor() {
      this.click = null;
      this.isDisabled = false;
      this.size = _vmButtonSizes.VMButtonSizes.Medium;
      this.type = null;
    }
    get buttonClasses() {
      const buttonClasses = [];
      const classPrefix = 'vm-btn__';
      if (this.type) {
        buttonClasses.push(`${classPrefix}${this.type}`);
      }
      if (this.size !== _vmButtonSizes.VMButtonSizes.Medium) {
        buttonClasses.push(`${classPrefix}${this.size}`);
      }
      return buttonClasses.join(' ');
    }
    onClick($event) {
      if (!this.isDisabled && this.click) {
        this.click($event);
      }
    }
  };
  _exports.VMButtonComponent = VMButtonComponent;
  (0, _tslib.__decorate)([_aureliaFramework.bindable, (0, _tslib.__metadata)("design:type", Function)], VMButtonComponent.prototype, "click", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TO_VIEW), (0, _tslib.__metadata)("design:type", Object)], VMButtonComponent.prototype, "isDisabled", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", String)], VMButtonComponent.prototype, "size", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", String)], VMButtonComponent.prototype, "type", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.computedFrom)('size', 'type'), (0, _tslib.__metadata)("design:type", String), (0, _tslib.__metadata)("design:paramtypes", [])], VMButtonComponent.prototype, "buttonClasses", null);
  _exports.VMButtonComponent = VMButtonComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-button'), (0, _tslib.__metadata)("design:paramtypes", [])], VMButtonComponent);
});;
define('text!__dot_dot__/src/elements/vm-button/vm-button.component.css',[],function(){return ".vm-btn__approve,vm-button[approve] button{align-items:center;background-color:#4caf50;border:1px solid #4caf50;border-radius:5px;color:#fff;-moz-column-gap:10px;column-gap:10px;display:inline-flex;font-size:16px;height:40px;padding:0 15px;white-space:nowrap}.vm-btn__approve:hover,vm-button[approve] button:hover{cursor:pointer}.vm-btn__approve:disabled,vm-button[approve] button:disabled{cursor:not-allowed}.vm-btn__approve:focus,vm-button[approve] button:focus{outline:none}.vm-btn__approve:disabled,vm-button[approve] button:disabled{opacity:.4}.vm-btn__approve i,vm-button[approve] button i{line-height:25px}.vm-btn__approve:focus,.vm-btn__approve:hover:not(:disabled),vm-button[approve] button:focus,vm-button[approve] button:hover:not(:disabled){background-color:#449d48;border-color:#449d48}.vm-btn__deny,vm-button[deny] button{align-items:center;background-color:#d61100;border:1px solid #d61100;border-radius:5px;color:#fff;-moz-column-gap:10px;column-gap:10px;display:inline-flex;font-size:16px;height:40px;padding:0 15px;white-space:nowrap}.vm-btn__deny:hover,vm-button[deny] button:hover{cursor:pointer}.vm-btn__deny:disabled,vm-button[deny] button:disabled{cursor:not-allowed}.vm-btn__deny:focus,vm-button[deny] button:focus{outline:none}.vm-btn__deny:disabled,vm-button[deny] button:disabled{opacity:.4}.vm-btn__deny i,vm-button[deny] button i{line-height:25px}.vm-btn__deny:focus,.vm-btn__deny:hover:not(:disabled),vm-button[deny] button:focus,vm-button[deny] button:hover:not(:disabled){background-color:#c00f00;border-color:#c00f00}.vm-btn__icon,vm-button[icon] button{align-items:center;background-color:transparent;border:none;border-radius:5px;color:#172b4a;display:inline-flex;font-size:16px;height:40px;justify-content:center;white-space:nowrap;width:40px}.vm-btn__icon:hover,vm-button[icon] button:hover{cursor:pointer}.vm-btn__icon:disabled,vm-button[icon] button:disabled{cursor:not-allowed}.vm-btn__icon:focus,vm-button[icon] button:focus{outline:none}.vm-btn__icon:focus,.vm-btn__icon:hover:not(:disabled),vm-button[icon] button:focus,vm-button[icon] button:hover:not(:disabled){background-color:#ebecf0}.vm-btn__icon:disabled,vm-button[icon] button:disabled{opacity:.4}.vm-btn__primary,vm-button[primary] button{align-items:center;background-color:#20a281;border:1px solid #20a281;border-radius:5px;color:#fff;-moz-column-gap:10px;column-gap:10px;display:inline-flex;font-size:16px;height:40px;padding:0 15px;white-space:nowrap}.vm-btn__primary:hover,vm-button[primary] button:hover{cursor:pointer}.vm-btn__primary:disabled,vm-button[primary] button:disabled{cursor:not-allowed}.vm-btn__primary:focus,vm-button[primary] button:focus{outline:none}.vm-btn__primary:disabled,vm-button[primary] button:disabled{opacity:.4}.vm-btn__primary i,vm-button[primary] button i{line-height:25px}.vm-btn__primary:focus,.vm-btn__primary:hover:not(:disabled),vm-button[primary] button:focus,vm-button[primary] button:hover:not(:disabled){background-color:#18856b;border-color:#18856b}.vm-btn__secondary,vm-button[secondary] button{align-items:center;background-color:#fff;border:1px solid #c1c7d0;border-radius:5px;color:#172b4a;-moz-column-gap:10px;column-gap:10px;display:inline-flex;font-size:16px;height:40px;padding:0 15px;white-space:nowrap}.vm-btn__secondary:hover,vm-button[secondary] button:hover{cursor:pointer}.vm-btn__secondary:disabled,vm-button[secondary] button:disabled{cursor:not-allowed}.vm-btn__secondary:focus,vm-button[secondary] button:focus{outline:none}.vm-btn__secondary:disabled,vm-button[secondary] button:disabled{opacity:.4}.vm-btn__secondary i,vm-button[secondary] button i{line-height:25px}.vm-btn__secondary:focus,.vm-btn__secondary:hover:not(:disabled),vm-button[secondary] button:focus,vm-button[secondary] button:hover:not(:disabled){background-color:#ebecf0}.vm-btn__tertiary,vm-button[tertiary] button{align-items:center;background-color:transparent;border:none;color:#20a281;-moz-column-gap:5px;column-gap:5px;display:inline-flex;font-size:13px;padding:0;white-space:nowrap;width:-moz-fit-content;width:fit-content}.vm-btn__tertiary:hover,vm-button[tertiary] button:hover{cursor:pointer}.vm-btn__tertiary:disabled,vm-button[tertiary] button:disabled{cursor:not-allowed}.vm-btn__tertiary:focus,vm-button[tertiary] button:focus{outline:none}.vm-btn__tertiary:focus :not(i),.vm-btn__tertiary:hover:not(:disabled) :not(i),vm-button[tertiary] button:focus :not(i),vm-button[tertiary] button:hover:not(:disabled) :not(i){text-decoration:underline}.vm-btn__tertiary:disabled,vm-button[tertiary] button:disabled{opacity:.65}.vm-btn__tertiary:focus,.vm-btn__tertiary:hover:not(:disabled),vm-button[tertiary] button:focus,vm-button[tertiary] button:hover:not(:disabled){color:#18856b}.vm-btn__tertiary-navy,vm-button[tertiaryNavy] button{align-items:center;background-color:transparent;border:none;color:#172b4a;-moz-column-gap:5px;column-gap:5px;display:inline-flex;font-size:13px;padding:0;white-space:nowrap;width:-moz-fit-content;width:fit-content}.vm-btn__tertiary-navy:hover,vm-button[tertiaryNavy] button:hover{cursor:pointer}.vm-btn__tertiary-navy:disabled,vm-button[tertiaryNavy] button:disabled{cursor:not-allowed}.vm-btn__tertiary-navy:focus,vm-button[tertiaryNavy] button:focus{outline:none}.vm-btn__tertiary-navy:focus :not(i),.vm-btn__tertiary-navy:hover:not(:disabled) :not(i),vm-button[tertiaryNavy] button:focus :not(i),vm-button[tertiaryNavy] button:hover:not(:disabled) :not(i){text-decoration:underline}.vm-btn__tertiary-navy:disabled,vm-button[tertiaryNavy] button:disabled{opacity:.65}.vm-btn__lg,vm-button[large] button{padding:0 40px}.vm-btn__sm,vm-button[small] button{border-radius:4px;font-size:12px;height:25px;padding:0 12px}.vm-btn__sm i,vm-button[small] button i{line-height:12px}.vm-btn__sm.vm-btn__icon,vm-button[small] button.vm-btn__icon,vm-button[small][icon] button{width:25px}.vm-btn__xxl,vm-button[xxl] button{font-size:19px;height:55px;padding:0 200px}.vm-btn__xxl i,vm-button[xxl] button i{line-height:29px}";});;
define('text!__dot_dot__/src/elements/vm-button/vm-button.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-button.component.css\"></require>\r\n\r\n    <button type=\"button\" class.bind=\"buttonClasses\" click.delegate=\"onClick($event)\" disabled.bind=\"isDisabled\">\r\n        <slot></slot>\r\n    </button>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-checkbox-picklist/vm-checkbox-picklist.component',["exports", "tslib", "aurelia-framework", "../../constants/binding-modes"], function (_exports, _tslib, _aureliaFramework, _bindingModes) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMCheckboxPicklistComponent = void 0;
  let VMCheckboxPicklistComponent = class VMCheckboxPicklistComponent {
    constructor() {
      this.model = [];
      this.change = null;
      this.allSelected = false;
      this.selectedItems = [];
    }
    getCheckboxName(itemLabel, index) {
      return ['checkbox', ...itemLabel.toLowerCase().split(' '), index.toString()].join('-');
    }
    handleChange(e, index) {
      this.allSelected = this.model.length === this.selectedItems.length;
      const update = this.model.splice(0, this.model.length);
      if (e) {
        update[index].isSelected = !update[index].isSelected;
      }
      this.model.push(...update);
      if (this.change) {
        this.change(this.selectedItems);
      }
    }
    toggleAllSelected() {
      this.model.forEach(item => {
        item.isSelected = this.allSelected;
      });
      if (this.allSelected) {
        this.selectedItems = [...this.model];
      } else {
        this.selectedItems = [];
      }
      this.handleChange();
    }
    clear() {
      this.model.forEach(item => {
        item.isSelected = false;
      });
      this.selectedItems = [];
      this.handleChange();
    }
  };
  _exports.VMCheckboxPicklistComponent = VMCheckboxPicklistComponent;
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TWO_WAY), (0, _tslib.__metadata)("design:type", Array)], VMCheckboxPicklistComponent.prototype, "model", void 0);
  (0, _tslib.__decorate)([_aureliaFramework.bindable, (0, _tslib.__metadata)("design:type", Function)], VMCheckboxPicklistComponent.prototype, "change", void 0);
  _exports.VMCheckboxPicklistComponent = VMCheckboxPicklistComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-checkbox-picklist'), (0, _tslib.__metadata)("design:paramtypes", [])], VMCheckboxPicklistComponent);
});;
define('text!__dot_dot__/src/elements/vm-checkbox-picklist/vm-checkbox-picklist.component.css',[],function(){return "vm-checkbox-picklist{display:grid;row-gap:5px}vm-checkbox-picklist .vm-checklist-picklist--item{padding-left:10px}";});;
define('text!__dot_dot__/src/elements/vm-checkbox-picklist/vm-checkbox-picklist.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-checkbox-picklist.component.css\"></require>\r\n\r\n    <vm-checkbox name=\"vmPicklistSelectAllCheckbox\" checked.two-way=\"allSelected\" change.call=\"toggleAllSelected()\">Select All</vm-checkbox>\r\n    <div class=\"vm-checklist-picklist--item\" repeat.for=\"item of model\">\r\n        <vm-checkbox\r\n            name.bind=\"getCheckboxName(item.display, $index)\"\r\n            model.one-way=\"item\"\r\n            checked.two-way=\"selectedItems\"\r\n            change.call=\"handleChange($event, $index)\"\r\n        >\r\n            ${item.display}\r\n        </vm-checkbox>\r\n    </div>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-checkbox/vm-checkbox.component',["exports", "tslib", "aurelia-framework", "../../constants/binding-modes"], function (_exports, _tslib, _aureliaFramework, _bindingModes) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMCheckboxComponent = void 0;
  let VMCheckboxComponent = class VMCheckboxComponent {
    constructor() {
      this.isDisabled = false;
      this.name = null;
      this.change = null;
    }
    handleChange($event) {
      if (this.change) {
        try {
          this.change(Object.assign({
            $event,
            element: this
          }));
        } catch (error) {
          console.error(error);
        }
      }
    }
  };
  _exports.VMCheckboxComponent = VMCheckboxComponent;
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TWO_WAY), (0, _tslib.__metadata)("design:type", Object)], VMCheckboxComponent.prototype, "checked", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TO_VIEW), (0, _tslib.__metadata)("design:type", Object)], VMCheckboxComponent.prototype, "isDisabled", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMCheckboxComponent.prototype, "model", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", String)], VMCheckboxComponent.prototype, "name", void 0);
  (0, _tslib.__decorate)([_aureliaFramework.bindable, (0, _tslib.__metadata)("design:type", Function)], VMCheckboxComponent.prototype, "change", void 0);
  _exports.VMCheckboxComponent = VMCheckboxComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-checkbox'), (0, _tslib.__metadata)("design:paramtypes", [])], VMCheckboxComponent);
});;
define('text!__dot_dot__/src/elements/vm-checkbox/vm-checkbox.component.css',[],function(){return "vm-checkbox{display:flex;padding-left:23px;position:relative}vm-checkbox .vm-checkbox--input{left:0;margin:0!important;opacity:0;position:absolute;top:3px}vm-checkbox .vm-checkbox--input:checked+.vm-checkbox--label:before{background-color:#20a281;border-color:#20a281}vm-checkbox .vm-checkbox--input:checked+.vm-checkbox--label:after{color:#fff;content:\"\\f00c\";font-family:Font Awesome\\ 5 Pro;font-weight:400}vm-checkbox .vm-checkbox--input:checked:disabled+.vm-checkbox--label:before{background-color:#a6b0bc;border-color:#a6b0bc}vm-checkbox .vm-checkbox--input:disabled+.vm-checkbox--label{cursor:not-allowed;opacity:.4}vm-checkbox .vm-checkbox--input:focus:not(:checked)+.vm-checkbox--label:before,vm-checkbox .vm-checkbox--input:hover:not(:checked)+.vm-checkbox--label:before{background-color:#fafbfc}vm-checkbox .vm-checkbox--label{cursor:pointer;display:inline-block;font-weight:400;margin-bottom:0;min-height:20px;position:relative}vm-checkbox .vm-checkbox--label:before{background-color:#fff;border:1px solid #c1c7d0;border-radius:3px;content:\"\";display:inline-block;height:13px;left:-23px;position:absolute;top:3px;transition:border .15s ease-in-out,color .15s ease-in-out;width:13px}vm-checkbox .vm-checkbox--label:after{display:inline-block;font-size:11px;height:12px;left:-22px;position:absolute;top:2px;width:12px}";});;
define('text!__dot_dot__/src/elements/vm-checkbox/vm-checkbox.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-checkbox.component.css\"></require>\r\n\r\n    <input\r\n        id.bind=\"name\"\r\n        class=\"vm-checkbox--input\"\r\n        type=\"checkbox\"\r\n        checked.bind=\"checked\"\r\n        model.bind=\"model\"\r\n        disabled.bind=\"isDisabled\"\r\n        change.delegate=\"handleChange($event)\"\r\n    />\r\n    <label class=\"vm-checkbox--label\" for.bind=\"name\">\r\n        <slot></slot>\r\n    </label>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-context-menu/vm-context-menu.component',["exports", "tslib", "aurelia-framework", "rxjs", "rxjs/operators", "../../classes/vm-context-menu", "../../services/vm-context-menu.service"], function (_exports, _tslib, _aureliaFramework, _rxjs, _operators, _vmContextMenu, _vmContextMenu2) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMContextMenuComponent = void 0;
  const BASE_MARGIN = 15;
  let VMContextMenuComponent = class VMContextMenuComponent {
    constructor(service) {
      this.service = service;
      this.menuState = new _vmContextMenu.VMContextMenu();
      this.menuStyle = '';
      this.contextMenuClickSubscription = null;
    }
    attached() {
      this.serviceSubscription = this.service.getContextMenuState().subscribe(this.subscriptionHandler.bind(this));
      this.windowEventsSubscription = (0, _rxjs.merge)((0, _rxjs.fromEvent)(window, 'scroll'), (0, _rxjs.fromEvent)(window, 'resize')).pipe((0, _operators.filter)(() => this.menuState.isOpen)).subscribe(() => this.close());
    }
    detached() {
      this.contextMenuClickSubscription.unsubscribe();
      this.serviceSubscription.unsubscribe();
      this.windowEventsSubscription.unsubscribe();
    }
    subscriptionHandler(menuState) {
      const recursion = menuState.component === _aureliaFramework.PLATFORM.moduleName('./vm-context-menu.component', 'vm-library');
      try {
        if (recursion) {
          throw 'Context Menu cannot compose itself recursively.';
        }
      } catch (e) {
        console.error(e);
      }
      this.menuState = {
        ...menuState,
        component: recursion ? '' : menuState.component,
        render: () => {
          this.render();
        }
      };
    }
    render() {
      const offsetX = window.innerWidth - this.menuState.x - this.menuElementRef.offsetWidth;
      const offsetY = window.innerHeight - this.menuState.y - this.menuElementRef.offsetHeight;
      const left = this.menuState.x + (offsetX < 0 ? offsetX - BASE_MARGIN : 0);
      const top = this.menuState.y + (offsetY < 0 ? offsetY : 0);
      this.menuStyle = `top:${top}px;left:${left}px;`;
      this.contextMenuClickSubscription = (0, _rxjs.fromEvent)(this.contextMenuContainerRef, 'click').subscribe(e => {
        this.close(e);
      });
    }
    close(event) {
      if (!event || !event['target'].closest('.actionable-item')) {
        this.service.close();
        this.contextMenuClickSubscription.unsubscribe();
      }
    }
  };
  _exports.VMContextMenuComponent = VMContextMenuComponent;
  _exports.VMContextMenuComponent = VMContextMenuComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-context-menu'), (0, _tslib.__param)(0, (0, _aureliaFramework.inject)(_vmContextMenu2.VMContextMenuService)), (0, _tslib.__metadata)("design:paramtypes", [_vmContextMenu2.VMContextMenuService])], VMContextMenuComponent);
});;
define('text!__dot_dot__/src/elements/vm-context-menu/vm-context-menu.component.css',[],function(){return ".vm-context-menu--container{height:100vh;left:0;position:fixed;right:0;top:0;width:100vw;z-index:10000000000}.vm-context-menu--wrapper{background-color:#fff;border:1px solid #c1c7d0;border-radius:3px;box-shadow:0 3px 5px rgba(0,0,0,.25);position:absolute}";});;
define('text!__dot_dot__/src/elements/vm-context-menu/vm-context-menu.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-context-menu.component.css\"></require>\r\n\r\n    <div if.bind=\"menuState.isOpen\" class=\"vm-context-menu--container\" ref=\"contextMenuContainerRef\">\r\n        <div class=\"vm-context-menu--wrapper\" style.bind=\"menuStyle\" ref=\"menuElementRef\">\r\n            <compose view-model.bind=\"menuState.component\" model.bind=\"menuState\"></compose>\r\n        </div>\r\n    </div>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-dialog/vm-dialog-duotone/vm-dialog-duotone.component',["exports", "tslib", "aurelia-dialog", "aurelia-framework", "../../../constants/binding-modes", "../../../enums/alert-icons.enum", "../../../enums/alert-types.enum", "../../../enums/vm-button-types.enum"], function (_exports, _tslib, _aureliaDialog, _aureliaFramework, _bindingModes, _alertIcons, _alertTypes, _vmButtonTypes) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMDialogDuotoneComponent = void 0;
  let VMDialogDuotoneComponent = class VMDialogDuotoneComponent {
    constructor(dialog) {
      this.dialog = dialog;
      this.cancelLabel = 'Cancel';
      this.cancelShown = true;
      this.okDisabled = false;
      this.okLabel = 'Submit';
      this.okShown = true;
      this.okClick = null;
      this.type = _alertTypes.AlertTypes.Info;
      this.iconClass = '';
      this.headerClass = '';
      this.buttonType = _vmButtonTypes.VMButtonTypes.Primary;
    }
    bind() {
      this.iconClass = {
        [_alertTypes.AlertTypes.Danger]: _alertIcons.AlertIcons.Exclamation,
        [_alertTypes.AlertTypes.Warning]: _alertIcons.AlertIcons.Exclamation,
        [_alertTypes.AlertTypes.Info]: _alertIcons.AlertIcons.Info,
        [_alertTypes.AlertTypes.Success]: _alertIcons.AlertIcons.Check
      }[this.type];
      this.headerClass = `vm-dialog-duotone__${this.type}`;
      if (this.type === _alertTypes.AlertTypes.Danger) {
        this.buttonType = _vmButtonTypes.VMButtonTypes.Deny;
      }
    }
    attached() {
      const closeEle = document.querySelector('.vm-dialog-duotone--header button');
      closeEle === null || closeEle === void 0 ? void 0 : closeEle.focus();
    }
    cancel() {
      this.dialog.cancel();
    }
  };
  _exports.VMDialogDuotoneComponent = VMDialogDuotoneComponent;
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMDialogDuotoneComponent.prototype, "cancelLabel", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMDialogDuotoneComponent.prototype, "cancelShown", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TO_VIEW), (0, _tslib.__metadata)("design:type", Object)], VMDialogDuotoneComponent.prototype, "okDisabled", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMDialogDuotoneComponent.prototype, "okLabel", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMDialogDuotoneComponent.prototype, "okShown", void 0);
  (0, _tslib.__decorate)([_aureliaFramework.bindable, (0, _tslib.__metadata)("design:type", Function)], VMDialogDuotoneComponent.prototype, "okClick", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TO_VIEW), (0, _tslib.__metadata)("design:type", String)], VMDialogDuotoneComponent.prototype, "type", void 0);
  _exports.VMDialogDuotoneComponent = VMDialogDuotoneComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-dialog-duotone'), (0, _tslib.__param)(0, (0, _aureliaFramework.inject)(_aureliaDialog.DialogController)), (0, _tslib.__metadata)("design:paramtypes", [_aureliaDialog.DialogController])], VMDialogDuotoneComponent);
});;
define('text!__dot_dot__/src/elements/vm-dialog/vm-dialog-duotone/vm-dialog-duotone.component.css',[],function(){return "vm-dialog-duotone .vm-dialog-duotone--header{align-items:center;border-top-left-radius:10px;border-top-right-radius:10px;display:flex;height:140px;position:relative}vm-dialog-duotone .vm-dialog-duotone--header>vm-button{position:absolute;right:4px;top:4px}vm-dialog-duotone .vm-dialog-duotone--header>vm-button button{color:#a6b0bc}vm-dialog-duotone .vm-dialog-duotone__success{background-color:#d4edda;color:#105242}vm-dialog-duotone .vm-dialog-duotone__info{background-color:#dcecfc;color:#172b4a}vm-dialog-duotone .vm-dialog-duotone__warning{background-color:#fff3cd;color:#533f03}vm-dialog-duotone .vm-dialog-duotone__danger{background-color:#fde1e0;color:#d61100}vm-dialog-duotone .vm-dialog-duotone--title{align-items:center;display:flex;flex-direction:column;width:100%}vm-dialog-duotone .vm-dialog-duotone--title .vm-dialog-duotone--icon{font-size:2em;margin:16px}vm-dialog-duotone .vm-dialog .vm-dialog--body{padding-bottom:0}vm-dialog-duotone .vm-dialog .vm-dialog--footer{border-top:0;justify-content:center}";});;
define('text!__dot_dot__/src/elements/vm-dialog/vm-dialog-duotone/vm-dialog-duotone.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-dialog-duotone.component.css\"></require>\r\n    <require from=\"../../../resources/trap-keys-dialog\"></require>\r\n\r\n    <button class=\"sr-only tabstop top\" data-id=\"vm-dialog-duotone\" tabnav.bind=\"tabNavigate\">skip to modal</button>\r\n    <div class=\"vm-dialog vm-dialog-duotone\">\r\n        <div class=\"vm-dialog-duotone--header ${ headerClass }\">\r\n            <div class=\"vm-dialog-duotone--title\">\r\n                <i class=\"vm-dialog-duotone--icon ${ iconClass }\"></i>\r\n                <slot name=\"title\"></slot>\r\n            </div>\r\n            <vm-button icon click.call=\"cancel()\">\r\n                <i aria-hidden=\"true\" class=\"fas fa-times\"></i>\r\n                <span class=\"sr-only\">close</span>\r\n            </vm-button>\r\n        </div>\r\n\r\n        <div class=\"vm-dialog--body\">\r\n            <slot></slot>\r\n        </div>\r\n\r\n        <div class=\"vm-dialog--footer\">\r\n            <vm-button if.bind=\"cancelShown\" secondary click.call=\"cancel()\">\r\n                <span>${cancelLabel}</span>\r\n            </vm-button>\r\n            \r\n            <vm-button if.bind=\"okShown\" type.bind=\"buttonType\" click.call=\"okClick()\" is-disabled.to-view=\"okDisabled\">\r\n                <span>${okLabel}</span>\r\n            </vm-button>\r\n        </div>\r\n    </div>\r\n    <button class=\"sr-only tabstop bottom\" data-id=\"vm-dialog-duotone\" tabnav.bind=\"tabNavigate\">skip to modal</button>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-dialog/vm-dialog.component',["exports", "tslib", "aurelia-dialog", "aurelia-framework", "../../constants/binding-modes"], function (_exports, _tslib, _aureliaDialog, _aureliaFramework, _bindingModes) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMDialogComponent = void 0;
  let VMDialogComponent = class VMDialogComponent {
    constructor(dialog) {
      this.dialog = dialog;
      this.cancelLabel = 'Cancel';
      this.cancelShown = true;
      this.dialogTitle = '';
      this.isLarge = false;
      this.okDisabled = false;
      this.okLabel = 'Submit';
      this.okShown = true;
      this.okClick = null;
    }
    get largeClass() {
      return this.isLarge ? 'vm-dialog__lg' : '';
    }
    attached() {
      const closeEle = document.querySelector('.vm-dialog--header button');
      closeEle === null || closeEle === void 0 ? void 0 : closeEle.focus();
    }
    cancel() {
      this.dialog.cancel();
    }
  };
  _exports.VMDialogComponent = VMDialogComponent;
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMDialogComponent.prototype, "cancelLabel", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMDialogComponent.prototype, "cancelShown", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMDialogComponent.prototype, "dialogTitle", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMDialogComponent.prototype, "isLarge", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TO_VIEW), (0, _tslib.__metadata)("design:type", Object)], VMDialogComponent.prototype, "okDisabled", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMDialogComponent.prototype, "okLabel", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMDialogComponent.prototype, "okShown", void 0);
  (0, _tslib.__decorate)([_aureliaFramework.bindable, (0, _tslib.__metadata)("design:type", Function)], VMDialogComponent.prototype, "okClick", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.computedFrom)('isLarge'), (0, _tslib.__metadata)("design:type", String), (0, _tslib.__metadata)("design:paramtypes", [])], VMDialogComponent.prototype, "largeClass", null);
  _exports.VMDialogComponent = VMDialogComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-dialog'), (0, _tslib.__param)(0, (0, _aureliaFramework.inject)(_aureliaDialog.DialogController)), (0, _tslib.__metadata)("design:paramtypes", [_aureliaDialog.DialogController])], VMDialogComponent);
});;
define('text!__dot_dot__/src/elements/vm-dialog/vm-dialog.component.html',[],function(){return "<template>\r\n    <require from=\"../../resources/trap-keys-dialog\"></require>\r\n\r\n    <button class=\"sr-only tabstop top\" data-id=\"vm-dialog\" tabnav.bind=\"tabNavigate\">skip to modal</button>\r\n    <div class=\"vm-dialog ${largeClass}\">\r\n        <div class=\"vm-dialog--header\">\r\n            <span class=\"vm-dialog--title\">${dialogTitle}</span>\r\n            <vm-button icon click.call=\"cancel()\">\r\n                <i aria-hidden=\"true\" class=\"fas fa-times\"></i>\r\n                <span class=\"sr-only\">close</span>\r\n            </vm-button>\r\n        </div>\r\n\r\n        <div class=\"vm-dialog--body\">\r\n            <slot></slot>\r\n        </div>\r\n\r\n        <div class=\"vm-dialog--footer\">\r\n            <vm-button if.bind=\"cancelShown\" secondary click.call=\"cancel()\">\r\n                <span>${cancelLabel}</span>\r\n            </vm-button>\r\n            <vm-button if.bind=\"okShown\" primary click.call=\"okClick()\" is-disabled.to-view=\"okDisabled\">\r\n                <span>${okLabel}</span>\r\n            </vm-button>\r\n        </div>\r\n    </div>\r\n    <button class=\"sr-only tabstop bottom\" data-id=\"vm-dialog\" tabnav.bind=\"tabNavigate\">skip to modal</button>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-dropdown/vm-dropdown-item/vm-dropdown-item.component',["exports", "tslib", "aurelia-event-aggregator", "aurelia-framework", "../../../constants/binding-modes", "../../../enums/event-names.enum"], function (_exports, _tslib, _aureliaEventAggregator, _aureliaFramework, _bindingModes, _eventNames) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMDropdownItemComponent = void 0;
  let VMDropdownItemComponent = class VMDropdownItemComponent {
    constructor(ea) {
      this.ea = ea;
      this.isDisabled = false;
      this.isSelected = false;
      this.multiselect = false;
      this.onSelection = null;
    }
    itemSelected() {
      this.onSelection(this.value);
      if (!this.multiselect) {
        this.ea.publish(_eventNames.EventNames.VMDropdownClose);
      }
    }
  };
  _exports.VMDropdownItemComponent = VMDropdownItemComponent;
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TO_VIEW), (0, _tslib.__metadata)("design:type", Object)], VMDropdownItemComponent.prototype, "isDisabled", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TO_VIEW), (0, _tslib.__metadata)("design:type", Object)], VMDropdownItemComponent.prototype, "isSelected", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMDropdownItemComponent.prototype, "multiselect", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMDropdownItemComponent.prototype, "value", void 0);
  (0, _tslib.__decorate)([_aureliaFramework.bindable, (0, _tslib.__metadata)("design:type", Function)], VMDropdownItemComponent.prototype, "onSelection", void 0);
  _exports.VMDropdownItemComponent = VMDropdownItemComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-dropdown-item'), (0, _tslib.__param)(0, (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator)), (0, _tslib.__metadata)("design:paramtypes", [_aureliaEventAggregator.EventAggregator])], VMDropdownItemComponent);
});;
define('text!__dot_dot__/src/elements/vm-dropdown/vm-dropdown-item/vm-dropdown-item.component.css',[],function(){return ".vm-dropdown-item{align-items:center;background-color:#fff;border:none;border-top:1px solid #eff2f7;display:flex;font-size:16px;min-height:40px;outline:none!important;padding-left:13px;text-align:left;width:100%}.vm-dropdown-item:focus,.vm-dropdown-item:hover{background-color:#fafbfc;cursor:pointer}.vm-dropdown-item:disabled{opacity:.7}.vm-dropdown-item.vm-dropdown-item__selected{background-color:#eff2f7;font-weight:700}";});;
define('text!__dot_dot__/src/elements/vm-dropdown/vm-dropdown-item/vm-dropdown-item.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-dropdown-item.component.css\"></require>\r\n\r\n    <button\r\n        class=\"vm-dropdown-item ${isSelected ? 'vm-dropdown-item__selected' : ''} ${multiselect ? 'vm-dropdown-item__multiselect' : ''}\"\r\n        disabled.bind=\"isDisabled\"\r\n        type=\"button\"\r\n        click.delegate=\"itemSelected()\"\r\n    >\r\n        <vm-checkbox if.bind=\"multiselect\" checked.bind=\"isSelected\"></vm-checkbox>\r\n        <slot></slot>\r\n    </button>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-dropdown/vm-dropdown.component',["exports", "tslib", "aurelia-event-aggregator", "aurelia-framework", "../../constants/binding-modes", "../../enums/event-names.enum"], function (_exports, _tslib, _aureliaEventAggregator, _aureliaFramework, _bindingModes, _eventNames) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMDropdownComponent = void 0;
  let VMDropdownComponent = class VMDropdownComponent {
    constructor(ea, element) {
      this.ea = ea;
      this.element = element;
      this.allowSearch = false;
      this.displayText = '';
      this.isDisabled = false;
      this.placeholderText = 'Select';
      this.searchPlaceholderText = 'Search';
      this.onSearch = null;
      this.isOpen = false;
      this.searchText = null;
      this.clickListener = null;
      this.closeSub = null;
      this.keyupListener = null;
    }
    detached() {
      this.removeListeners();
    }
    isOpenChanged() {
      if (this.isOpen) {
        this.closeSub = this.ea.subscribe(_eventNames.EventNames.VMDropdownClose, () => {
          this.isOpen = false;
        });
        this.clickListener = function (event) {
          if (event.target !== this.element && !this.element.contains(event.target)) {
            this.isOpen = false;
          }
        }.bind(this);
        this.keyupListener = function (event) {
          if (event.key === 'Escape') {
            this.isOpen = false;
          }
        }.bind(this);
        window.addEventListener('click', this.clickListener);
        window.addEventListener('keyup', this.keyupListener);
      } else {
        if (this.allowSearch && this.searchText) {
          this.searchText = null;
          this.onSearch(this.searchText);
        }
        this.removeListeners();
      }
    }
    toggleDropdown($event) {
      if (!$event || $event.pointerType) {
        this.isOpen = !this.isDisabled && !this.isOpen;
      }
    }
    removeListeners() {
      var _a;
      (_a = this.closeSub) === null || _a === void 0 ? void 0 : _a.dispose();
      this.closeSub = null;
      if (this.clickListener) {
        window.removeEventListener('click', this.clickListener);
        this.clickListener = null;
      }
      if (this.keyupListener) {
        window.removeEventListener('keyup', this.keyupListener);
        this.keyupListener = null;
      }
    }
  };
  _exports.VMDropdownComponent = VMDropdownComponent;
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMDropdownComponent.prototype, "allowSearch", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TO_VIEW), (0, _tslib.__metadata)("design:type", Object)], VMDropdownComponent.prototype, "displayText", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TO_VIEW), (0, _tslib.__metadata)("design:type", Object)], VMDropdownComponent.prototype, "isDisabled", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMDropdownComponent.prototype, "placeholderText", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMDropdownComponent.prototype, "searchPlaceholderText", void 0);
  (0, _tslib.__decorate)([_aureliaFramework.bindable, (0, _tslib.__metadata)("design:type", Function)], VMDropdownComponent.prototype, "onSearch", void 0);
  (0, _tslib.__decorate)([_aureliaFramework.observable, (0, _tslib.__metadata)("design:type", Object)], VMDropdownComponent.prototype, "isOpen", void 0);
  _exports.VMDropdownComponent = VMDropdownComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-dropdown'), (0, _tslib.__param)(0, (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator)), (0, _tslib.__param)(1, (0, _aureliaFramework.inject)(Element)), (0, _tslib.__metadata)("design:paramtypes", [_aureliaEventAggregator.EventAggregator, Element])], VMDropdownComponent);
});;
define('text!__dot_dot__/src/elements/vm-dropdown/vm-dropdown.component.css',[],function(){return "vm-dropdown{display:block;position:relative;width:100%}vm-dropdown.vm-dropdown__open .vm-dropdown--items{visibility:visible}vm-dropdown .vm-dropdown--items{background-color:#fff;border:1px solid #20a281;border-bottom-left-radius:3px;border-bottom-right-radius:3px;border-top:none;max-height:241px;min-height:41px;overflow-y:auto;position:absolute;top:39px;visibility:hidden;width:100%;z-index:10}vm-dropdown .vm-dropdown--items::-webkit-scrollbar{width:13px}vm-dropdown .vm-dropdown--items::-webkit-scrollbar-thumb{background:#c1c7d0;border-radius:20px}vm-dropdown .vm-dropdown--items::-webkit-scrollbar-track{background:#ebecf0}vm-dropdown .vm-dropdown--items.vm-dropdown--items__searchable{top:61px}vm-dropdown .vm-dropdown--search,vm-dropdown .vm-dropdown--selector{align-items:center;background-color:#fff;-moz-column-gap:17px;column-gap:17px;font-size:16px;outline:none!important;width:100%}vm-dropdown .vm-dropdown--search:hover,vm-dropdown .vm-dropdown--selector:hover{cursor:pointer}vm-dropdown .vm-dropdown--search{border:1px solid #20a281;border-top-left-radius:3px;border-top-right-radius:3px;display:flex;padding:10px 17px 10px 10px}vm-dropdown .vm-dropdown--selector{border:1px solid #c1c7d0;border-radius:3px;display:grid;grid-template-columns:1fr min-content;height:40px;padding:0 17px 0 13px}vm-dropdown .vm-dropdown--selector:focus{border-color:#20a281}vm-dropdown .vm-dropdown--selector:disabled{background-color:#fafbfc;color:#a6b0bc;cursor:not-allowed}vm-dropdown .vm-dropdown--selector.vm-dropdown__open{border-bottom-left-radius:0;border-bottom-right-radius:0;border-color:#20a281}vm-dropdown .vm-dropdown--selector .vm-dropdown--selector-text{overflow:hidden;text-align:left;text-overflow:ellipsis;white-space:nowrap}vm-dropdown .vm-dropdown--selector .vm-dropdown--selector-text.vm-dropdown--placeholder{color:#a6b0bc}.has-error>vm-dropdown .vm-dropdown--items,.has-error>vm-dropdown .vm-dropdown--search,.has-error>vm-dropdown .vm-dropdown--selector:not(:disabled){border-color:#d61100!important}";});;
define('text!__dot_dot__/src/elements/vm-dropdown/vm-dropdown.component.html',[],function(){return "<template class=\"${ isOpen ? 'vm-dropdown__open' : '' }\">\r\n    <require from=\"./vm-dropdown.component.css\"></require>\r\n\r\n    <button\r\n        show.bind=\"!(isOpen && allowSearch)\"\r\n        class=\"vm-dropdown--selector ${isOpen ? 'vm-dropdown__open' : ''}\"\r\n        type=\"button\"\r\n        disabled.bind=\"isDisabled\"\r\n        click.delegate=\"toggleDropdown()\"\r\n    >\r\n        <span if.bind=\"displayText\" class=\"vm-dropdown--selector-text\" innerhtml.bind=\"displayText | sanitizeHTML\"></span>\r\n        <span else class=\"vm-dropdown--selector-text vm-dropdown--placeholder\">${placeholderText}</span>\r\n        <i class=\"fas fa-caret-down\"></i>\r\n    </button>\r\n    <button show.bind=\"isOpen && allowSearch\" class=\"vm-dropdown--search\" type=\"button\" click.delegate=\"toggleDropdown($event)\">\r\n        <vm-search\r\n            placeholder-text.to-view=\"searchPlaceholderText\"\r\n            show-icon.one-time=\"false\"\r\n            value.two-way=\"searchText\"\r\n            search-on-keypress.one-time=\"true\"\r\n            search.call=\"onSearch(searchText)\"\r\n            click.delegate=\"$event.stopPropagation()\"\r\n        ></vm-search>\r\n        <i class=\"fas fa-caret-down\"></i>\r\n    </button>\r\n\r\n    <div class=\"vm-dropdown--items ${allowSearch ? 'vm-dropdown--items__searchable' : ''}\">\r\n        <slot></slot>\r\n    </div>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-form/vm-form-field/vm-form-field.component',["exports", "tslib", "aurelia-framework", "rxjs", "rxjs/operators", "./../../../constants/binding-modes"], function (_exports, _tslib, _aureliaFramework, _rxjs, _operators, _bindingModes) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMFormFieldComponent = void 0;
  const elementSelectors = ['input', 'label', 'button', 'textarea', 'select'];
  let VMFormFieldComponent = class VMFormFieldComponent {
    constructor() {
      this.errorClass = '';
      this.errors$ = new _rxjs.BehaviorSubject({
        errors: []
      });
      this.errorSubscription$ = null;
      this.setErrors = errors => {
        this.errors$.next({
          errors
        });
      };
    }
    attached() {
      this.errorSubscription$ = this.errors$.pipe((0, _operators.debounce)(({
        errors
      }) => {
        return (0, _rxjs.timer)(errors.length ? 350 : 0);
      })).subscribe(({
        errors
      }) => {
        this.errors = errors;
        if (errors.length) {
          this.addClasses();
        } else {
          this.removeClasses();
        }
      });
    }
    clear() {
      this.setErrors([]);
    }
    detached() {
      var _a;
      (_a = this.errorSubscription$) === null || _a === void 0 ? void 0 : _a.unsubscribe();
    }
    addClasses() {
      this.field.querySelectorAll(elementSelectors.join(', ')).forEach(element => {
        element === null || element === void 0 ? void 0 : element.classList.add(this.errorClass);
      });
    }
    removeClasses() {
      this.field.querySelectorAll(elementSelectors.join(', ')).forEach(element => {
        element === null || element === void 0 ? void 0 : element.classList.remove(this.errorClass);
      });
    }
  };
  _exports.VMFormFieldComponent = VMFormFieldComponent;
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(), (0, _tslib.__metadata)("design:type", String)], VMFormFieldComponent.prototype, "name", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TWO_WAY), (0, _tslib.__metadata)("design:type", String)], VMFormFieldComponent.prototype, "class", void 0);
  _exports.VMFormFieldComponent = VMFormFieldComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-form-field')], VMFormFieldComponent);
});;
define('text!__dot_dot__/src/elements/vm-form/vm-form-field/vm-form-field.component.css',[],function(){return "vm-form-field{display:block;padding-bottom:.25em;padding-top:.5em}vm-form-field .vm-form-field--error{color:#d61100}vm-form-field .vm-checkbox-label.has-error:before,vm-form-field input.has-error,vm-form-field input:focus.has-error{border-color:#d61100}vm-form-field.vm-form-field--phone-number-area-code,vm-form-field.vm-form-field--phone-number-ext,vm-form-field.vm-form-field--phone-number-international,vm-form-field.vm-form-field--phone-number-prefix,vm-form-field.vm-form-field--phone-number-suffix,vm-form-field.vm-form-field--phone-number-type{display:inline-block;position:relative}vm-form-field.vm-form-field--phone-number-ext,vm-form-field.vm-form-field--phone-number-international,vm-form-field.vm-form-field--phone-number-prefix,vm-form-field.vm-form-field--phone-number-suffix,vm-form-field.vm-form-field--phone-number-type{padding-left:16px}vm-form-field.vm-form-field--phone-number-prefix:before,vm-form-field.vm-form-field--phone-number-suffix:before{content:\"-\";left:0;position:absolute;top:16px}vm-form-field.vm-form-field--phone-number-ext:before{content:\"x\";left:0;position:absolute;top:16px}vm-form-field.vm-form-field--phone-number-international{content:\"+\";left:0;position:absolute;top:16px}vm-form .vm-form-field--phone-number-label{display:block;margin-bottom:0;margin-top:0}";});;
define('text!__dot_dot__/src/elements/vm-form/vm-form-field/vm-form-field.component.html',[],function(){return "<template ref=\"field\" class=\"${ class }\">\r\n    <require from=\"./vm-form-field.component.css\"></require>\r\n    <slot></slot>\r\n    <div class=\"vm-form-field--error\" repeat.for=\"error of errors\">${ error }</div>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-form/vm-form-wizard/vm-form-wizard.component',["exports", "tslib", "aurelia-dependency-injection", "aurelia-dialog", "aurelia-framework"], function (_exports, _tslib, _aureliaDependencyInjection, _aureliaDialog, _aureliaFramework) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMFormWizardComponent = void 0;
  let VMFormWizardComponent = class VMFormWizardComponent {
    constructor(dialog) {
      this.dialog = dialog;
    }
    cancel() {
      this.dialog.cancel();
    }
  };
  _exports.VMFormWizardComponent = VMFormWizardComponent;
  _exports.VMFormWizardComponent = VMFormWizardComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-form-wizard'), (0, _tslib.__param)(0, (0, _aureliaDependencyInjection.inject)(_aureliaDialog.DialogController)), (0, _tslib.__metadata)("design:paramtypes", [_aureliaDialog.DialogController])], VMFormWizardComponent);
});;
define('text!__dot_dot__/src/elements/vm-form/vm-form-wizard/vm-form-wizard.component.css',[],function(){return ".vm-dialog{background-color:#fff;border-radius:10px;box-shadow:0 0 15px rgba(0,0,0,.15);width:600px}.vm-dialog.vm-dialog__lg{width:900px}.vm-dialog .vm-dialog--body{padding:25px}.vm-dialog .vm-dialog--footer,.vm-dialog .vm-dialog--header{align-items:center;display:flex;padding:0 25px}.vm-dialog .vm-dialog--footer{border-top:1px solid #c1c7d0;-moz-column-gap:15px;column-gap:15px;height:75px;justify-content:flex-end}.vm-dialog .vm-dialog--header{border-bottom:1px solid #c1c7d0;height:70px;justify-content:space-between}.vm-dialog .vm-dialog--header .vm-dialog--title{font-size:18px;font-weight:700}vm-form-wizard .vm-form-wizard{width:80vw}vm-form-wizard .vm-form-wizard .vm-form-wizard--header h2,vm-form-wizard .vm-form-wizard .vm-form-wizard--header h4{margin-bottom:4px;margin-top:4px}vm-form-wizard .vm-form-wizard .vm-form-wizard-content{display:flex}vm-form-wizard .vm-form-wizard .vm-form-wizard--nav{border:1px solid #c1c7d0;border-bottom:0;border-left:0;border-top:0;display:flex;padding-left:0;padding-right:0}vm-form-wizard .vm-form-wizard .vm-form-wizard--nav [slot=nav]{min-width:240px;width:100%}vm-form-wizard .vm-form-wizard .vm-form-wizard--body{display:flex;min-width:0;padding-left:12.5px;width:100%}vm-form-wizard .vm-form-wizard .vm-form-wizard--body [slot=body]{width:100%}";});;
define('text!__dot_dot__/src/elements/vm-form/vm-form-wizard/vm-form-wizard.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-form-wizard.component.css\"></require>\r\n\r\n    <div class=\"vm-dialog vm-form-wizard ${setLargeClass()}\">\r\n        <div class=\"vm-form-wizard--header vm-dialog--header\">\r\n        <slot name=\"header\"></slot>\r\n        <vm-button icon click.call=\"cancel()\">\r\n            <i class=\"fa fa-times\"></i>\r\n        </vm-button>\r\n        </div>\r\n    <div class=\"vm-form-wizard-content\">\r\n        <div class=\"vm-form-wizard--nav vm-dialog--body\">\r\n            <slot name=\"nav\"></slot>\r\n        </div>\r\n        <div class=\"vm-form-wizard--body vm-dialog--body\">\r\n            <slot name=\"body\"></slot>\r\n        </div>\r\n    </div>\r\n    <div class=\"vm-dialog--footer\">\r\n        <slot name=\"footer\"></slot>\r\n    </div>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-form/vm-form.component',["exports", "tslib", "aurelia-framework", "aurelia-validation", "lodash", "rxjs", "rxjs/operators", "../../constants/binding-modes"], function (_exports, _tslib, _aureliaFramework, _aureliaValidation, _lodash, _rxjs, _operators, _bindingModes) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMFormComponent = void 0;
  const VALIDATION_PROPERTY = '$valid';
  let VMFormComponent = class VMFormComponent {
    constructor(bindingEngine, factory) {
      this.bindingEngine = bindingEngine;
      this.errorClass = 'has-error';
      this.fields = [];
      this.change = null;
      this.changeSubscription = null;
      this.controller = null;
      this.dirty = [];
      this.observers = [];
      this.validateSubscription = null;
      this.watchChanges = true;
      this.controller = factory.createForCurrentScope();
      this.controller.validateTrigger = _aureliaValidation.validateTrigger.manual;
      this.change = new _rxjs.Subject();
    }
    attached() {
      (0, _lodash.set)(this.model, VALIDATION_PROPERTY, false);
      this.fields.forEach(field => {
        const fieldName = field.name;
        const fieldModel = (0, _lodash.get)(this.model, fieldName);
        if (fieldName) {
          if (fieldModel && Array.isArray(fieldModel)) {
            this.observers.push(this.bindingEngine.collectionObserver(fieldModel).subscribe(() => {
              return this.change.next({
                newVal: fieldModel,
                oldVal: null,
                fieldName: fieldName
              });
            }));
          }
          this.observers.push(this.bindingEngine.propertyObserver(this.model, fieldName).subscribe((newVal, oldVal) => {
            return this.change.next({
              newVal,
              oldVal,
              fieldName
            });
          }));
        }
        field.errorClass = this.errorClass;
      });
      this.controller.addObject(this.model, this.rules);
      this.validate();
      this.changeSubscription = this.change.pipe((0, _operators.tap)(change => {
        if (!this.dirty.includes(change.fieldName)) {
          this.dirty.push(change.fieldName);
        }
      }), (0, _operators.throttleTime)(150, undefined, {
        leading: true,
        trailing: true
      }), (0, _operators.mergeMap)(change => {
        this.update({
          value: change.newVal,
          field: change.fieldName
        });
        return (0, _rxjs.from)(this.controller.validate());
      })).subscribe(result => {
        if (this.watchChanges) {
          this.emit(result.valid);
          this.validate();
        } else {
          this.watchChanges = true;
        }
      });
      this.validateSubscription = this.controller.subscribe(cb => {
        if (cb.type === 'reset') {
          this.watchChanges = false;
          if (cb.instruction) {
            Object.keys(cb.instruction).forEach(key => {
              var _a;
              if ((_a = this.model) === null || _a === void 0 ? void 0 : _a[key]) {
                this.model[key] = cb.instruction[key];
              }
            });
          }
          this.fields.forEach(field => {
            field.clear();
          });
          this.dirty = [];
          this.controller.validate();
        }
      });
      this.emit();
    }
    update({
      field,
      value
    }) {
      (0, _lodash.set)(this.model, field, value);
    }
    validate() {
      this.controller.validate();
      this.fields.forEach(field => {
        var _a;
        const errors = (_a = this.controller) === null || _a === void 0 ? void 0 : _a.errors.filter(error => {
          return error.propertyName === field.name && this.dirty.includes(field.name);
        }).map(error => {
          return error.message;
        });
        field.setErrors(errors);
      });
    }
    emit(valid = false) {
      var _a;
      (0, _lodash.set)(this.model, VALIDATION_PROPERTY, valid);
      (_a = this === null || this === void 0 ? void 0 : this.get) === null || _a === void 0 ? void 0 : _a.call(this, {
        controller: this.controller,
        valid
      });
    }
    detached() {
      this.observers.forEach(obs => {
        obs.dispose();
      });
      this.change = null;
      this.changeSubscription.unsubscribe();
      this.changeSubscription = null;
      this.controller = null;
      this.validateSubscription.dispose();
      this.validateSubscription = null;
    }
  };
  _exports.VMFormComponent = VMFormComponent;
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TWO_WAY), (0, _tslib.__metadata)("design:type", Object)], VMFormComponent.prototype, "model", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMFormComponent.prototype, "rules", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMFormComponent.prototype, "errorClass", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TO_VIEW), (0, _tslib.__metadata)("design:type", Function)], VMFormComponent.prototype, "get", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.children)('vm-form-field'), (0, _tslib.__metadata)("design:type", Object)], VMFormComponent.prototype, "fields", void 0);
  _exports.VMFormComponent = VMFormComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-form'), (0, _tslib.__param)(0, (0, _aureliaFramework.inject)(_aureliaFramework.BindingEngine)), (0, _tslib.__param)(1, (0, _aureliaFramework.inject)(_aureliaValidation.ValidationControllerFactory)), (0, _tslib.__metadata)("design:paramtypes", [_aureliaFramework.BindingEngine, _aureliaValidation.ValidationControllerFactory])], VMFormComponent);
});;
define('text!__dot_dot__/src/elements/vm-form/vm-form.component.html',[],function(){return "<template>\r\n    <form>\r\n        <slot></slot>\r\n    </form>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-header/vm-header.component',["exports", "tslib", "aurelia-framework", "../../constants/binding-modes"], function (_exports, _tslib, _aureliaFramework, _bindingModes) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMHeaderComponent = void 0;
  let VMHeaderComponent = class VMHeaderComponent {
    constructor() {
      this.faClass = '';
      this.showBorder = true;
      this.text = '';
      this.faClick = null;
    }
  };
  _exports.VMHeaderComponent = VMHeaderComponent;
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMHeaderComponent.prototype, "faClass", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMHeaderComponent.prototype, "showBorder", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMHeaderComponent.prototype, "text", void 0);
  (0, _tslib.__decorate)([_aureliaFramework.bindable, (0, _tslib.__metadata)("design:type", Function)], VMHeaderComponent.prototype, "faClick", void 0);
  _exports.VMHeaderComponent = VMHeaderComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-header'), (0, _tslib.__metadata)("design:paramtypes", [])], VMHeaderComponent);
});;
define('text!__dot_dot__/src/elements/vm-header/vm-header.component.css',[],function(){return "vm-header{align-items:center;border-bottom:1px solid #e7eaec;display:flex;justify-content:space-between;margin-bottom:20px;padding:10px 0}vm-header.vm-header__no-border{border-bottom:none;padding:10px 0 0}vm-header .vm-header--title{align-items:center;-moz-column-gap:5px;column-gap:5px;display:flex}vm-header .vm-header--title h1{font-size:26px;font-weight:700;margin:0}";});;
define('text!__dot_dot__/src/elements/vm-header/vm-header.component.html',[],function(){return "<template class=\"${!showBorder ? 'vm-header__no-border' : ''}\">\r\n    <require from=\"./vm-header.component.css\"></require>\r\n\r\n    <div class=\"vm-header--title\">\r\n        <h1>${text}</h1>\r\n        <vm-button if.bind=\"faClass\" icon click.call=\"faClick()\">\r\n            <i class=\"${faClass}\"></i>\r\n        </vm-button>\r\n    </div>\r\n    <div class=\"vm-header--content\">\r\n        <slot></slot>\r\n    </div>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-label/vm-label.component',["exports", "tslib", "aurelia-framework", "../../constants/binding-modes"], function (_exports, _tslib, _aureliaFramework, _bindingModes) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMLabelComponent = void 0;
  var LabelStateClasses;
  (function (LabelStateClasses) {
    LabelStateClasses["Selected"] = "__selected";
    LabelStateClasses["Disabled"] = "__disabled";
  })(LabelStateClasses || (LabelStateClasses = {}));
  let VMLabelComponent = class VMLabelComponent {
    constructor() {
      this.isDisabled = false;
      this.isSelected = false;
    }
    get stateClasses() {
      const classes = [];
      if (this.isSelected) {
        classes.push(LabelStateClasses.Selected);
      }
      if (this.isDisabled) {
        classes.push(LabelStateClasses.Disabled);
      }
      return classes.join(' ');
    }
  };
  _exports.VMLabelComponent = VMLabelComponent;
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TO_VIEW), (0, _tslib.__metadata)("design:type", Object)], VMLabelComponent.prototype, "isDisabled", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TO_VIEW), (0, _tslib.__metadata)("design:type", Object)], VMLabelComponent.prototype, "isSelected", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.computedFrom)('isSelected', 'isDisabled'), (0, _tslib.__metadata)("design:type", String), (0, _tslib.__metadata)("design:paramtypes", [])], VMLabelComponent.prototype, "stateClasses", null);
  _exports.VMLabelComponent = VMLabelComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-label')], VMLabelComponent);
});;
define('text!__dot_dot__/src/elements/vm-label/vm-label.component.css',[],function(){return "vm-label{background-color:#c1c7d0;border-radius:3px;color:#172b4a;display:inline-block;margin:0 10px 10px 0;padding:2px 8px}vm-label:last-child{margin-right:0}vm-label[pill]{margin:0;padding:0}vm-label[pill] vm-button{display:block;height:100%;width:100%}vm-label[pill] vm-button button{background-color:transparent;border:0;border-radius:3px;font-size:16px;height:100%;padding:4px 10px;width:100%}vm-label.vm-label--light,vm-label[light]{background-color:#eff2f7;color:#172b4a}vm-label[danger] vm-label.vm-label--light{background-color:#d61100;color:#fff}vm-label.vm-label--danger.vm-label--light,vm-label[danger][light]{background-color:#fde1e0;color:#721c24}vm-label.vm-label--danger-low,vm-label[danger-low]{background-color:#ed7d54;color:#fff}vm-label.vm-label--warning,vm-label[warning]{background-color:#feb836;color:#172b4a}vm-label.vm-label--warning.vm-label--light,vm-label[warning][light]{background-color:#fff3cd;color:#533f03}vm-label.vm-label--success,vm-label[success]{background-color:#4caf50;color:#fff}vm-label.vm-label--success.vm-label--light,vm-label[success][light]{background-color:#d4edda;color:#105242}vm-label.vm-label--success-low,vm-label[success-low]{background-color:#a6ce78;color:#fff}vm-label.vm-label--info,vm-label[info]{background-color:#25aae2;color:#fff}vm-label.vm-label--info.vm-label--light,vm-label[info][light]{background-color:#dfeffd;color:#25aae2}";});;
define('text!__dot_dot__/src/elements/vm-label/vm-label.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-label.component.css\"></require>\r\n    <slot></slot>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-pagination/vm-pagination.component',["exports", "tslib", "aurelia-framework", "../../constants/binding-modes", "../../services/vm-pagination.service"], function (_exports, _tslib, _aureliaFramework, _bindingModes, _vmPagination) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMPaginationComponent = void 0;
  let VMPaginationComponent = class VMPaginationComponent {
    constructor(paginationService) {
      this.paginationService = paginationService;
      this.pager = null;
      this.refreshPage = null;
    }
    attached() {
      if (this.pager) {
        this.setPager();
      }
    }
    setPage(page) {
      if (this.pager.currentPage !== page) {
        this.pager.currentPage = page;
        this.setPager();
        if (this.refreshPage) {
          this.refreshPage();
        }
      }
    }
    setPager() {
      this.pager = this.paginationService.getPagerData(this.pager.totalItems, this.pager.currentPage, this.pager.pageSize);
    }
  };
  _exports.VMPaginationComponent = VMPaginationComponent;
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TWO_WAY), (0, _tslib.__metadata)("design:type", Function)], VMPaginationComponent.prototype, "pager", void 0);
  (0, _tslib.__decorate)([_aureliaFramework.bindable, (0, _tslib.__metadata)("design:type", Function)], VMPaginationComponent.prototype, "refreshPage", void 0);
  _exports.VMPaginationComponent = VMPaginationComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-pagination'), (0, _tslib.__param)(0, (0, _aureliaFramework.inject)(_vmPagination.VMPaginationService)), (0, _tslib.__metadata)("design:paramtypes", [Object])], VMPaginationComponent);
});;
define('text!__dot_dot__/src/elements/vm-pagination/vm-pagination.component.css',[],function(){return "vm-pagination{display:flex;justify-content:flex-end;padding:20px 0;width:100%}vm-pagination .vm-pagination{align-items:center;background-color:#fff;display:grid;font-size:16px;grid-template-columns:40px 30px 80px 30px 40px;height:30px;line-height:24px}vm-pagination .vm-pagination .vm-pagination--btn{background-color:#fff;border:1px solid #c1c7d0;border-radius:0;height:100%;outline:none;width:100%}vm-pagination .vm-pagination .vm-pagination--btn:first-of-type{border-bottom-left-radius:4px;border-top-left-radius:4px}vm-pagination .vm-pagination .vm-pagination--btn:last-of-type{border-bottom-right-radius:4px;border-top-right-radius:4px}vm-pagination .vm-pagination .vm-pagination--btn:not(:last-of-type){border-right:none}vm-pagination .vm-pagination .vm-pagination--btn:focus,vm-pagination .vm-pagination .vm-pagination--btn:hover{background-color:#eff2f7;cursor:pointer}vm-pagination .vm-pagination .vm-pagination--btn:disabled{background-color:#fafbfc;color:rgba(115,127,146,.4);cursor:not-allowed}vm-pagination .vm-pagination .vm-pagination--info{align-items:center;border:1px solid #c1c7d0;border-right:none;display:flex;height:100%;justify-content:center}";});;
define('text!__dot_dot__/src/elements/vm-pagination/vm-pagination.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-pagination.component.css\"></require>\r\n\r\n    <div if.bind=\"pager && pager.totalItems\" class=\"vm-pagination\">\r\n        <button class=\"vm-pagination--btn\" disabled.bind=\"pager.currentPage === 1\" click.trigger=\"setPage(1)\">\r\n            <i class=\"fas fa-chevron-double-left\"></i>\r\n        </button>\r\n        <button class=\"vm-pagination--btn\" disabled.bind=\"pager.currentPage === 1\" click.trigger=\"setPage(pager.currentPage - 1)\">\r\n            <i class=\"fas fa-chevron-left\"></i>\r\n        </button>\r\n        <div class=\"vm-pagination--info\">${pager.currentPage} of ${pager.totalPages}</div>\r\n        <button\r\n            class=\"vm-pagination--btn\"\r\n            disabled.bind=\"pager.currentPage === pager.totalPages\"\r\n            click.trigger=\"setPage(pager.currentPage + 1)\"\r\n        >\r\n            <i class=\"fas fa-chevron-right\"></i>\r\n        </button>\r\n        <button class=\"vm-pagination--btn\" disabled.bind=\"pager.currentPage === pager.totalPages\" click.trigger=\"setPage(pager.totalPages)\">\r\n            <i class=\"fas fa-chevron-double-right\"></i>\r\n        </button>\r\n    </div>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-search/vm-search-menu/vm-search-menu.component',["exports", "rxjs", "rxjs/operators"], function (_exports, _rxjs, _operators) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMSearchMenuComponent = void 0;
  class VMSearchMenuComponent {
    constructor() {
      this.contextMenu = null;
      this.items = [];
      this.destroy = new _rxjs.Subject();
    }
    activate(contextMenu) {
      this.contextMenu = contextMenu;
    }
    attached() {
      this.contextMenu.render(this.contextMenu);
      this.width = `width: ${this.contextMenu.data.width}px`;
      this.contextMenu.data.items$.pipe((0, _operators.takeUntil)(this.destroy)).subscribe(items => {
        this.items = items;
      });
    }
    detached() {
      this.destroy.next();
      this.destroy.complete();
    }
  }
  _exports.VMSearchMenuComponent = VMSearchMenuComponent;
});;
define('text!__dot_dot__/src/elements/vm-search/vm-search-menu/vm-search-menu.component.css',[],function(){return ".vm-search-menu{display:flex;flex-direction:column;max-height:215px;overflow-y:auto}.vm-search-menu .vm-search-menu--item{background-color:#fff;border:none;border-radius:3px;cursor:pointer;font-size:16px;outline:none;padding:10px;text-align:left}.vm-search-menu .vm-search-menu--item:focus,.vm-search-menu .vm-search-menu--item:hover{background-color:#fafbfc}";});;
define('text!__dot_dot__/src/elements/vm-search/vm-search-menu/vm-search-menu.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-search-menu.component.css\"></require>\r\n\r\n    <div if.bind=\"items.length\" class=\"vm-search-menu actionable-item\" style.bind=\"width\">\r\n        <button class=\"vm-search-menu--item\" repeat.for=\"item of items\" type=\"button\" click.delegate=\"contextMenu.methods.click(item)\">\r\n            ${item}\r\n        </button>\r\n    </div>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-search/vm-search.component',["exports", "tslib", "aurelia-framework", "rxjs", "../../constants/binding-modes", "../../services/vm-context-menu.service"], function (_exports, _tslib, _aureliaFramework, _rxjs, _bindingModes, _vmContextMenu) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMSearchComponent = void 0;
  let VMSearchComponent = class VMSearchComponent {
    constructor(contextMenu) {
      this.contextMenu = contextMenu;
      this.autocompleteItems = [];
      this.isDisabled = false;
      this.placeholderText = 'Search';
      this.showIcon = true;
      this.value = '';
      this.search = null;
      this.clearOnEnter = false;
      this.searchOnKeypress = false;
      this.filteredItems = new _rxjs.BehaviorSubject([]);
      this.width = 0;
      this.x = 0;
      this.y = 0;
    }
    handleKeypress($event) {
      var _a;
      const isEnterPress = $event['key'] === 'Enter';
      if (this.searchOnKeypress && !isEnterPress) {
        this.search(this.value);
      } else if (isEnterPress) {
        this.search(this.value);
        this.contextMenu.close();
        if (this.clearOnEnter) {
          this.value = '';
        }
      }
      if (((_a = this.value) === null || _a === void 0 ? void 0 : _a.length) > 1 && this.autocompleteItems.length && !isEnterPress) {
        if (!this.y) {
          const target = $event['target'];
          this.width = target.parentElement.offsetWidth - 2;
          this.x = target.parentElement.offsetLeft;
          this.y = target.parentElement.offsetHeight + target.parentElement.offsetTop + 10;
        }
        this.filteredItems.next(this.autocompleteItems.filter(x => x.toLowerCase().includes(this.value.toLowerCase())));
        this.contextMenu.open({
          component: _aureliaFramework.PLATFORM.moduleName('../vm-search/vm-search-menu/vm-search-menu.component', 'vm-library'),
          x: this.x,
          y: this.y,
          data: {
            items$: this.filteredItems.asObservable(),
            width: this.width
          },
          methods: {
            click: item => {
              this.value = item;
              this.search(this.value);
              this.contextMenu.close();
            }
          }
        });
      } else {
        this.contextMenu.close();
      }
    }
  };
  _exports.VMSearchComponent = VMSearchComponent;
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TO_VIEW), (0, _tslib.__metadata)("design:type", Array)], VMSearchComponent.prototype, "autocompleteItems", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TO_VIEW), (0, _tslib.__metadata)("design:type", Object)], VMSearchComponent.prototype, "isDisabled", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMSearchComponent.prototype, "placeholderText", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMSearchComponent.prototype, "showIcon", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TWO_WAY), (0, _tslib.__metadata)("design:type", Object)], VMSearchComponent.prototype, "value", void 0);
  (0, _tslib.__decorate)([_aureliaFramework.bindable, (0, _tslib.__metadata)("design:type", Function)], VMSearchComponent.prototype, "search", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMSearchComponent.prototype, "clearOnEnter", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMSearchComponent.prototype, "searchOnKeypress", void 0);
  _exports.VMSearchComponent = VMSearchComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-search'), (0, _tslib.__param)(0, (0, _aureliaFramework.inject)(_vmContextMenu.VMContextMenuService)), (0, _tslib.__metadata)("design:paramtypes", [_vmContextMenu.VMContextMenuService])], VMSearchComponent);
});;
define('text!__dot_dot__/src/elements/vm-search/vm-search.component.css',[],function(){return "vm-search{align-items:center;background-color:#fff;border:1px solid #c1c7d0;border-radius:5px;-moz-column-gap:10px;column-gap:10px;display:flex;font-size:16px;height:40px;padding:0 10px;width:100%}vm-search:focus-within{border-color:#20a281}vm-search.vm-search__disabled,vm-search.vm-search__disabled .vm-search--input{background-color:#fafbfc;cursor:not-allowed}vm-search .vm-search--icon{position:relative;top:1px}vm-search .vm-search--input{border:none;height:100%;outline:none;padding:0;width:100%}vm-search .vm-search--input::-moz-placeholder{color:#a6b0bc}vm-search .vm-search--input::placeholder{color:#a6b0bc}";});;
define('text!__dot_dot__/src/elements/vm-search/vm-search.component.html',[],function(){return "<template class=\"${isDisabled ? 'vm-search__disabled' : ''}\">\r\n    <require from=\"./vm-search.component.css\"></require>\r\n\r\n    <i if.bind=\"showIcon\" class=\"fas fa-search vm-search--icon\"></i>\r\n    <input\r\n        class=\"vm-search--input\"\r\n        type=\"text\"\r\n        placeholder.bind=\"placeholderText\"\r\n        value.bind=\"value\"\r\n        keyup.delegate=\"handleKeypress($event) & debounce\"\r\n        disabled.bind=\"isDisabled\"\r\n    />\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-tabs/vm-tabs.component',["exports", "tslib", "aurelia-framework", "aurelia-router", "rxjs", "rxjs/operators"], function (_exports, _tslib, _aureliaFramework, _aureliaRouter, _rxjs, _operators) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMTabsComponent = void 0;
  let VMTabsComponent = class VMTabsComponent {
    constructor(router) {
      this.router = router;
      this.tabs = [];
      this.destroy$ = new _rxjs.Subject();
    }
    attached() {
      this.tabs = this.router.navigation;
      this.tabs.forEach(nav => {
        var _a, _b, _c, _d;
        if ((_a = nav.settings.badge) === null || _a === void 0 ? void 0 : _a.count$) {
          (_b = nav.settings.badge) === null || _b === void 0 ? void 0 : _b.count$.pipe((0, _operators.takeUntil)(this.destroy$)).subscribe(count => {
            nav.settings.badge.count = count;
          });
        }
        if ((_c = nav.settings.icon) === null || _c === void 0 ? void 0 : _c.show$) {
          (_d = nav.settings.icon) === null || _d === void 0 ? void 0 : _d.show$.pipe((0, _operators.takeUntil)(this.destroy$)).subscribe(value => {
            nav.settings.icon.show = value;
          });
        }
      });
    }
    detached() {
      this.destroy$.next();
      this.destroy$.complete();
    }
  };
  _exports.VMTabsComponent = VMTabsComponent;
  _exports.VMTabsComponent = VMTabsComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-tabs'), (0, _tslib.__param)(0, (0, _aureliaFramework.inject)(_aureliaRouter.Router)), (0, _tslib.__metadata)("design:paramtypes", [_aureliaRouter.Router])], VMTabsComponent);
});;
define('text!__dot_dot__/src/elements/vm-tabs/vm-tabs.component.css',[],function(){return "vm-tabs{display:flex;flex-wrap:wrap}vm-tabs .vm-tabs--item{align-items:center;-moz-column-gap:10px;column-gap:10px;display:flex;font-size:16px;height:39px;position:relative;text-align:center}vm-tabs .vm-tabs--item.vm-tabs--item__active{font-weight:700}vm-tabs .vm-tabs--item:focus,vm-tabs .vm-tabs--item:hover{color:#172b4a!important;outline:none;text-decoration:none}.vm-tabs__primary,vm-tabs[primary]{border-bottom:3px solid #ebecf0;-moz-column-gap:10px;column-gap:10px}.vm-tabs__primary .vm-tabs--item,vm-tabs[primary] .vm-tabs--item{color:#a6b0bc;padding:0 20px;top:3px}.vm-tabs__primary .vm-tabs--item.vm-tabs--item__active,vm-tabs[primary] .vm-tabs--item.vm-tabs--item__active{border-bottom:3px solid #20a281;color:#172b4a}.vm-tabs__secondary,vm-tabs[secondary]{border-bottom:1px solid #c1c7d0;-moz-column-gap:5px;column-gap:5px}.vm-tabs__secondary .vm-tabs--item,vm-tabs[secondary] .vm-tabs--item{border:1px solid #c1c7d0;border-top-left-radius:5px;border-top-right-radius:5px;padding:0 25px;top:1px}.vm-tabs__secondary .vm-tabs--item.vm-tabs--item__active,vm-tabs[secondary] .vm-tabs--item.vm-tabs--item__active{border-bottom-color:#fff;color:#172b4a}.vm-tabs__secondary .vm-tabs--item:not(.vm-tabs--item__active),vm-tabs[secondary] .vm-tabs--item:not(.vm-tabs--item__active){background-color:#eff2f7;color:#737f92}.vm-tabs__vertical,vm-tabs[vertical]{border-right:1px solid #c1c7d0;display:block;height:100%;width:270px}.vm-tabs__vertical .vm-tabs--item,vm-tabs[vertical] .vm-tabs--item{border:1px solid #c1c7d0;border-right:none;color:#172b4a;height:45px;padding:0 22px;width:100%}.vm-tabs__vertical .vm-tabs--item:focus,.vm-tabs__vertical .vm-tabs--item:hover,vm-tabs[vertical] .vm-tabs--item:focus,vm-tabs[vertical] .vm-tabs--item:hover{background-color:#eee}.vm-tabs__vertical .vm-tabs--item:not(:first-of-type),vm-tabs[vertical] .vm-tabs--item:not(:first-of-type){border-top:none}.vm-tabs__vertical .vm-tabs--item.vm-tabs--item__active,vm-tabs[vertical] .vm-tabs--item.vm-tabs--item__active{background-color:#ebf6f3;box-shadow:inset 5px 0 0 #20a281}";});;
define('text!__dot_dot__/src/elements/vm-tabs/vm-tabs.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-tabs.component.css\"></require>\r\n\r\n    <a repeat.for=\"tab of tabs\" class=\"vm-tabs--item ${tab.isActive ? 'vm-tabs--item__active' : ''}\" href.bind=\"tab.href\">\r\n        <span>${tab.title}</span>\r\n        <vm-badge\r\n            if.bind=\"tab.settings.badge && (tab.settings.badge.hideWhenZero ? tab.settings.badge.count !== 0 : true)\"\r\n            type.one-time=\"tab.settings.badge.type\"\r\n        >\r\n            ${tab.settings.badge.count}\r\n        </vm-badge>\r\n        <i if.bind=\"tab.settings.icon.show\" class.bind=\"tab.settings.icon.class\" title.bind=\"tab.settings.icon.title\"></i>\r\n    </a>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-toggle/vm-toggle.component',["exports", "tslib", "aurelia-framework", "../../constants/binding-modes"], function (_exports, _tslib, _aureliaFramework, _bindingModes) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMToggleComponent = void 0;
  var VMToggleClasses;
  (function (VMToggleClasses) {
    VMToggleClasses["Disabled"] = "vm-toggle__disabled";
    VMToggleClasses["Small"] = "vm-toggle__small";
    VMToggleClasses["Toggled"] = "vm-toggle__toggled";
  })(VMToggleClasses || (VMToggleClasses = {}));
  let VMToggleComponent = class VMToggleComponent {
    constructor() {
      this.isDisabled = false;
      this.isSmall = false;
      this.value = false;
      this.changed = null;
    }
    get vmToggleClasses() {
      const classes = [];
      if (this.isDisabled) {
        classes.push(VMToggleClasses.Disabled);
      }
      if (this.isSmall) {
        classes.push(VMToggleClasses.Small);
      }
      if (this.value) {
        classes.push(VMToggleClasses.Toggled);
      }
      return classes.join(' ');
    }
    onChanged($event) {
      var _a;
      (_a = this.changed) === null || _a === void 0 ? void 0 : _a.call(this, $event);
    }
  };
  _exports.VMToggleComponent = VMToggleComponent;
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TO_VIEW), (0, _tslib.__metadata)("design:type", Object)], VMToggleComponent.prototype, "isDisabled", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMToggleComponent.prototype, "isSmall", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TWO_WAY), (0, _tslib.__metadata)("design:type", Object)], VMToggleComponent.prototype, "value", void 0);
  (0, _tslib.__decorate)([_aureliaFramework.bindable, (0, _tslib.__metadata)("design:type", Function)], VMToggleComponent.prototype, "changed", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.computedFrom)('isDisabled', 'isSmall', 'value'), (0, _tslib.__metadata)("design:type", String), (0, _tslib.__metadata)("design:paramtypes", [])], VMToggleComponent.prototype, "vmToggleClasses", null);
  _exports.VMToggleComponent = VMToggleComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-toggle'), (0, _tslib.__metadata)("design:paramtypes", [])], VMToggleComponent);
});;
define('text!__dot_dot__/src/elements/vm-toggle/vm-toggle.component.css',[],function(){return ".vm-toggle{display:inline-block;height:24px;margin-bottom:0;position:relative;width:48px}.vm-toggle input{display:none;height:0;width:0}.vm-toggle input:checked+.vm-toggle--slider:before{transform:translateX(24px)}.vm-toggle .vm-toggle--slider{background-color:#c1c7d0;border-radius:50px;bottom:0;cursor:pointer;left:0;position:absolute;right:0;top:0;transition:.2s}.vm-toggle .vm-toggle--slider:before{background-color:#fff;border-radius:50%;bottom:3px;content:\"\";height:18px;left:3px;position:absolute;transition:.2s;width:18px}.vm-toggle.vm-toggle__disabled .vm-toggle--slider{cursor:not-allowed}.vm-toggle.vm-toggle__disabled:not(.vm-toggle__toggled) .vm-toggle--slider{background-color:#ebecf0}.vm-toggle.vm-toggle__disabled:not(.vm-toggle__toggled) .vm-toggle--slider:before{background-color:#c1c7d0}.vm-toggle.vm-toggle__small{height:16px;width:32px}.vm-toggle.vm-toggle__small input:checked+.vm-toggle--slider:before{transform:translateX(16px)}.vm-toggle.vm-toggle__small .vm-toggle--slider{border-radius:10px}.vm-toggle.vm-toggle__small .vm-toggle--slider:before{bottom:2px;height:12px;left:2px;width:12px}.vm-toggle.vm-toggle__toggled .vm-toggle--slider{background-color:#20a281}.vm-toggle.vm-toggle__toggled.vm-toggle__disabled .vm-toggle--slider{opacity:.65}";});;
define('text!__dot_dot__/src/elements/vm-toggle/vm-toggle.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-toggle.component.css\"></require>\r\n\r\n    <label class=\"vm-toggle ${vmToggleClasses}\">\r\n        <input type=\"checkbox\" checked.bind=\"value\" disabled.bind=\"isDisabled\" change.delegate=\"onChanged($event)\" />\r\n        <span class=\"vm-toggle--slider\"></span>\r\n    </label>\r\n</template>\r\n";});;
define('__dot_dot__/src/elements/vm-tooltip/vm-tooltip.component',["exports", "tslib", "aurelia-framework", "../../constants/binding-modes", "../../enums/vm-tooltip-pins.enum", "../../enums/vm-tooltip-positions.enum"], function (_exports, _tslib, _aureliaFramework, _bindingModes, _vmTooltipPins, _vmTooltipPositions) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMTooltipComponent = void 0;
  const VM_TOOLTIP_PIN_CLASSES = {
    [_vmTooltipPins.VMTooltipPins.Left]: 'tooltip__info--pin-left',
    [_vmTooltipPins.VMTooltipPins.Right]: 'tooltip__info--pin-right'
  };
  const VM_TOOLTIP_POSITION_CLASSES = {
    [_vmTooltipPositions.VMTooltipPositions.Bottom]: 'tooltip__info--bottom',
    [_vmTooltipPositions.VMTooltipPositions.Left]: 'tooltip__info--left',
    [_vmTooltipPositions.VMTooltipPositions.Right]: 'tooltip__info--right',
    [_vmTooltipPositions.VMTooltipPositions.Top]: 'tooltip__info--top'
  };
  let VMTooltipComponent = class VMTooltipComponent {
    constructor() {
      this.showTooltip = true;
      this.text = '';
      this.position = _vmTooltipPositions.VMTooltipPositions.Bottom;
      this.pin = _vmTooltipPins.VMTooltipPins.Left;
      this.textOptions = {};
      this.pinClass = '';
      this.positionClass = '';
    }
    get style() {
      return Object.keys(this.textOptions).map(key => `${key}: ${this.textOptions[key]}`).join('; ');
    }
    attached() {
      this.positionClass = VM_TOOLTIP_POSITION_CLASSES[this.position];
      this.pinClass = VM_TOOLTIP_PIN_CLASSES[this.pin];
    }
  };
  _exports.VMTooltipComponent = VMTooltipComponent;
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.TO_VIEW), (0, _tslib.__metadata)("design:type", Object)], VMTooltipComponent.prototype, "showTooltip", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMTooltipComponent.prototype, "text", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", String)], VMTooltipComponent.prototype, "position", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", String)], VMTooltipComponent.prototype, "pin", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.bindable)(_bindingModes.BINDING_MODES.ONE_TIME), (0, _tslib.__metadata)("design:type", Object)], VMTooltipComponent.prototype, "textOptions", void 0);
  (0, _tslib.__decorate)([(0, _aureliaFramework.computedFrom)('textOptions'), (0, _tslib.__metadata)("design:type", String), (0, _tslib.__metadata)("design:paramtypes", [])], VMTooltipComponent.prototype, "style", null);
  _exports.VMTooltipComponent = VMTooltipComponent = (0, _tslib.__decorate)([(0, _aureliaFramework.customElement)('vm-tooltip')], VMTooltipComponent);
});;
define('text!__dot_dot__/src/elements/vm-tooltip/vm-tooltip.component.css',[],function(){return "vm-tooltip{display:inline;position:relative}vm-tooltip .tooltip__info,vm-tooltip .tooltip__info:before{background-color:#fafbfc;border:1px solid #c1c7d0;position:absolute}vm-tooltip .tooltip__info{border-radius:3px;box-shadow:0 1px 4px rgba(22,45,80,.2);display:none;font-size:11px;font-weight:400;min-width:80px;padding:8px;white-space:nowrap;z-index:2}vm-tooltip .tooltip__info:before{border-bottom:none;border-right:none;content:\"\";height:8px;width:8px}vm-tooltip .tooltip__info.tooltip__info--bottom.tooltip__info--pin-left,vm-tooltip .tooltip__info.tooltip__info--top.tooltip__info--pin-left{left:calc(50% - 31px)}vm-tooltip .tooltip__info.tooltip__info--bottom.tooltip__info--pin-left:before,vm-tooltip .tooltip__info.tooltip__info--top.tooltip__info--pin-left:before{left:26px}vm-tooltip .tooltip__info.tooltip__info--bottom.tooltip__info--pin-right,vm-tooltip .tooltip__info.tooltip__info--top.tooltip__info--pin-right{right:calc(50% - 31px)}vm-tooltip .tooltip__info.tooltip__info--bottom.tooltip__info--pin-right:before,vm-tooltip .tooltip__info.tooltip__info--top.tooltip__info--pin-right:before{right:26px}vm-tooltip .tooltip__info.tooltip__info--bottom{top:calc(100% + 12px)}vm-tooltip .tooltip__info.tooltip__info--bottom:before{top:-5px;transform:rotate(45deg)}vm-tooltip .tooltip__info.tooltip__info--top{bottom:calc(100% + 12px)}vm-tooltip .tooltip__info.tooltip__info--top:before{bottom:-5px;transform:rotate(225deg)}vm-tooltip .tooltip__info.tooltip__info--left,vm-tooltip .tooltip__info.tooltip__info--right{top:calc(50% - 15px)}vm-tooltip .tooltip__info.tooltip__info--left:before,vm-tooltip .tooltip__info.tooltip__info--right:before{top:10px}vm-tooltip .tooltip__info.tooltip__info--left{right:calc(100% + 10px)}vm-tooltip .tooltip__info.tooltip__info--left:before{left:calc(100% - 3px);transform:rotate(135deg)}vm-tooltip .tooltip__info.tooltip__info--right{left:calc(100% + 10px)}vm-tooltip .tooltip__info.tooltip__info--right:before{right:calc(100% - 3px);transform:rotate(315deg)}vm-tooltip:focus-within .tooltip__info,vm-tooltip:hover .tooltip__info{display:block}";});;
define('text!__dot_dot__/src/elements/vm-tooltip/vm-tooltip.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-tooltip.component.css\"></require>\r\n\r\n    <slot></slot>\r\n    <div if.bind=\"showTooltip\" class=\"tooltip__info ${positionClass} ${pinClass}\" style.bind=\"style\">\r\n        <span class=\"info__title\" innerhtml.bind=\"text | sanitizeHTML\"></span>\r\n    </div>\r\n</template>\r\n";});;
define('__dot_dot__/src/enums/alert-icons.enum',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports.AlertIcons = void 0;
  var AlertIcons;
  _exports.AlertIcons = AlertIcons;
  (function (AlertIcons) {
    AlertIcons["Check"] = "fas fa-check-circle";
    AlertIcons["Exclamation"] = "fas fa-exclamation-circle";
    AlertIcons["Info"] = "fas fa-info-circle";
  })(AlertIcons || (_exports.AlertIcons = AlertIcons = {}));
});;
define('__dot_dot__/src/enums/alert-types.enum',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports.AlertTypes = void 0;
  var AlertTypes;
  _exports.AlertTypes = AlertTypes;
  (function (AlertTypes) {
    AlertTypes["Danger"] = "danger";
    AlertTypes["Info"] = "info";
    AlertTypes["Success"] = "success";
    AlertTypes["Warning"] = "warning";
  })(AlertTypes || (_exports.AlertTypes = AlertTypes = {}));
});;
define('__dot_dot__/src/enums/event-names.enum',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports.EventNames = void 0;
  var EventNames;
  _exports.EventNames = EventNames;
  (function (EventNames) {
    EventNames["VMDropdownClose"] = "VMDropdown:Close";
  })(EventNames || (_exports.EventNames = EventNames = {}));
});;
define('__dot_dot__/src/enums/index',["exports", "./alert-types.enum", "./alert-icons.enum", "./vm-badge-types.enum", "./vm-button-sizes.enum", "./vm-button-types.enum", "./vm-tooltip-pins.enum", "./vm-tooltip-positions.enum"], function (_exports, _alertTypes, _alertIcons, _vmBadgeTypes, _vmButtonSizes, _vmButtonTypes, _vmTooltipPins, _vmTooltipPositions) {
  "use strict";

  _exports.__esModule = true;
  Object.keys(_alertTypes).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _alertTypes[key]) return;
    _exports[key] = _alertTypes[key];
  });
  Object.keys(_alertIcons).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _alertIcons[key]) return;
    _exports[key] = _alertIcons[key];
  });
  Object.keys(_vmBadgeTypes).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _vmBadgeTypes[key]) return;
    _exports[key] = _vmBadgeTypes[key];
  });
  Object.keys(_vmButtonSizes).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _vmButtonSizes[key]) return;
    _exports[key] = _vmButtonSizes[key];
  });
  Object.keys(_vmButtonTypes).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _vmButtonTypes[key]) return;
    _exports[key] = _vmButtonTypes[key];
  });
  Object.keys(_vmTooltipPins).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _vmTooltipPins[key]) return;
    _exports[key] = _vmTooltipPins[key];
  });
  Object.keys(_vmTooltipPositions).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _vmTooltipPositions[key]) return;
    _exports[key] = _vmTooltipPositions[key];
  });
});;
define('__dot_dot__/src/enums/vm-badge-types.enum',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMBadgeTypes = void 0;
  var VMBadgeTypes;
  _exports.VMBadgeTypes = VMBadgeTypes;
  (function (VMBadgeTypes) {
    VMBadgeTypes["Danger"] = "vm-badge__danger";
    VMBadgeTypes["Primary"] = "vm-badge__primary";
    VMBadgeTypes["Secondary"] = "vm-badge__secondary";
  })(VMBadgeTypes || (_exports.VMBadgeTypes = VMBadgeTypes = {}));
});;
define('__dot_dot__/src/enums/vm-button-sizes.enum',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMButtonSizes = void 0;
  var VMButtonSizes;
  _exports.VMButtonSizes = VMButtonSizes;
  (function (VMButtonSizes) {
    VMButtonSizes["Small"] = "sm";
    VMButtonSizes["Medium"] = "md";
    VMButtonSizes["Large"] = "lg";
    VMButtonSizes["XXL"] = "xxl";
  })(VMButtonSizes || (_exports.VMButtonSizes = VMButtonSizes = {}));
});;
define('__dot_dot__/src/enums/vm-button-types.enum',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMButtonTypes = void 0;
  var VMButtonTypes;
  _exports.VMButtonTypes = VMButtonTypes;
  (function (VMButtonTypes) {
    VMButtonTypes["Approve"] = "approve";
    VMButtonTypes["Deny"] = "deny";
    VMButtonTypes["Icon"] = "icon";
    VMButtonTypes["Primary"] = "primary";
    VMButtonTypes["Secondary"] = "secondary";
    VMButtonTypes["Tertiary"] = "tertiary";
    VMButtonTypes["TertiaryNavy"] = "tertiary-navy";
  })(VMButtonTypes || (_exports.VMButtonTypes = VMButtonTypes = {}));
});;
define('__dot_dot__/src/enums/vm-tooltip-pins.enum',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMTooltipPins = void 0;
  var VMTooltipPins;
  _exports.VMTooltipPins = VMTooltipPins;
  (function (VMTooltipPins) {
    VMTooltipPins["Left"] = "left";
    VMTooltipPins["Right"] = "right";
  })(VMTooltipPins || (_exports.VMTooltipPins = VMTooltipPins = {}));
});;
define('__dot_dot__/src/enums/vm-tooltip-positions.enum',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMTooltipPositions = void 0;
  var VMTooltipPositions;
  _exports.VMTooltipPositions = VMTooltipPositions;
  (function (VMTooltipPositions) {
    VMTooltipPositions["Bottom"] = "bottom";
    VMTooltipPositions["Left"] = "left";
    VMTooltipPositions["Right"] = "right";
    VMTooltipPositions["Top"] = "top";
  })(VMTooltipPositions || (_exports.VMTooltipPositions = VMTooltipPositions = {}));
});;
define('__dot_dot__/src/index',["exports", "aurelia-framework", "./styles/main.css", "./classes/index", "./constants/index", "./elements/index", "./enums/index", "./interfaces/index", "./services/index", "./value-converters/index"], function (_exports, _aureliaFramework, _main, _index, _index2, _index3, _index4, _index5, _index6, _index7) {
  "use strict";

  _exports.__esModule = true;
  var _exportNames = {
    configure: true
  };
  _exports.configure = configure;
  Object.keys(_index).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
    if (key in _exports && _exports[key] === _index[key]) return;
    _exports[key] = _index[key];
  });
  Object.keys(_index2).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
    if (key in _exports && _exports[key] === _index2[key]) return;
    _exports[key] = _index2[key];
  });
  Object.keys(_index3).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
    if (key in _exports && _exports[key] === _index3[key]) return;
    _exports[key] = _index3[key];
  });
  Object.keys(_index4).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
    if (key in _exports && _exports[key] === _index4[key]) return;
    _exports[key] = _index4[key];
  });
  Object.keys(_index5).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
    if (key in _exports && _exports[key] === _index5[key]) return;
    _exports[key] = _index5[key];
  });
  Object.keys(_index6).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
    if (key in _exports && _exports[key] === _index6[key]) return;
    _exports[key] = _index6[key];
  });
  Object.keys(_index7).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
    if (key in _exports && _exports[key] === _index7[key]) return;
    _exports[key] = _index7[key];
  });
  function configure(config) {
    config.globalResources([_aureliaFramework.PLATFORM.moduleName('./elements/vm-alert/vm-alert.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-badge/vm-badge.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-breadcrumbs/vm-breadcrumbs.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-button/vm-button.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-checkbox/vm-checkbox.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-checkbox-picklist/vm-checkbox-picklist.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-context-menu/vm-context-menu.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-dialog/vm-dialog.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-dialog/vm-dialog-duotone/vm-dialog-duotone.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-dropdown/vm-dropdown.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-dropdown/vm-dropdown-item/vm-dropdown-item.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-form/vm-form.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-form/vm-form-field/vm-form-field.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-form/vm-form-wizard/vm-form-wizard.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-header/vm-header.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-label/vm-label.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-pagination/vm-pagination.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-search/vm-search.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-tabs/vm-tabs.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-toggle/vm-toggle.component'), _aureliaFramework.PLATFORM.moduleName('./elements/vm-tooltip/vm-tooltip.component')]);
  }
});
define('__dot_dot__/src/styles/main.css',['__inject_css__','text!__dot_dot__/src/styles/main.css'],function(i,c){i(c,'_au_css:__dot_dot__/src/styles/main.css');});
;
define('__dot_dot__/src/interfaces/index',["exports", "./vm-breadcrumb", "./vm-checkbox-picklist", "./vm-context-menu-service", "./vm-pagination-service", "./vm-tooltip-text-options", "./vm-wizard-step"], function (_exports, _vmBreadcrumb, _vmCheckboxPicklist, _vmContextMenuService, _vmPaginationService, _vmTooltipTextOptions, _vmWizardStep) {
  "use strict";

  _exports.__esModule = true;
  Object.keys(_vmBreadcrumb).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _vmBreadcrumb[key]) return;
    _exports[key] = _vmBreadcrumb[key];
  });
  Object.keys(_vmCheckboxPicklist).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _vmCheckboxPicklist[key]) return;
    _exports[key] = _vmCheckboxPicklist[key];
  });
  Object.keys(_vmContextMenuService).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _vmContextMenuService[key]) return;
    _exports[key] = _vmContextMenuService[key];
  });
  Object.keys(_vmPaginationService).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _vmPaginationService[key]) return;
    _exports[key] = _vmPaginationService[key];
  });
  Object.keys(_vmTooltipTextOptions).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _vmTooltipTextOptions[key]) return;
    _exports[key] = _vmTooltipTextOptions[key];
  });
  Object.keys(_vmWizardStep).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _vmWizardStep[key]) return;
    _exports[key] = _vmWizardStep[key];
  });
});;
define('__dot_dot__/src/interfaces/vm-breadcrumb',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
});;
define('__dot_dot__/src/interfaces/vm-checkbox-picklist',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
});;
define('__dot_dot__/src/interfaces/vm-context-menu-service',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
});;
define('__dot_dot__/src/interfaces/vm-pagination-service',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
});;
define('__dot_dot__/src/interfaces/vm-tooltip-text-options',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
});;
define('__dot_dot__/src/interfaces/vm-wizard-step',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
});;
define('__dot_dot__/src/resources/trap-keys-dialog',["exports", "tslib", "aurelia-framework"], function (_exports, _tslib, _aureliaFramework) {
  "use strict";

  _exports.__esModule = true;
  _exports.TrapKeysDialog = void 0;
  let TrapKeysDialog = class TrapKeysDialog {
    constructor(element) {
      this.element = element;
      this.tabNavigate = e => {
        const target = e.target;
        const templateName = target.getAttribute('data-id');
        const vmEle = document.querySelector(templateName);
        const eles = vmEle.querySelectorAll('a, input, textarea, [tabindex="0"], button:not([disabled]');
        const firstEle = eles[0];
        const lastEle = eles[eles.length - 1];
        if (e.type === 'keydown' && e.key.toLowerCase() === 'tab') {
          if (target.classList.contains('top')) {
            lastEle.focus();
          } else if (target.classList.contains('bottom')) {
            firstEle.focus();
          }
        }
      };
    }
    attached() {
      this.element.addEventListener('keydown', this.tabNavigate);
    }
    detached() {
      this.element.removeEventListener('keydown', this.tabNavigate);
    }
  };
  _exports.TrapKeysDialog = TrapKeysDialog;
  _exports.TrapKeysDialog = TrapKeysDialog = (0, _tslib.__decorate)([(0, _aureliaFramework.customAttribute)('tabnav'), (0, _tslib.__param)(0, (0, _aureliaFramework.inject)(Element)), (0, _tslib.__metadata)("design:paramtypes", [Object])], TrapKeysDialog);
});;
define('__dot_dot__/src/services/index',["exports", "./vm-context-menu.service", "./vm-pagination.service"], function (_exports, _vmContextMenu, _vmPagination) {
  "use strict";

  _exports.__esModule = true;
  Object.keys(_vmContextMenu).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _vmContextMenu[key]) return;
    _exports[key] = _vmContextMenu[key];
  });
  Object.keys(_vmPagination).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _vmPagination[key]) return;
    _exports[key] = _vmPagination[key];
  });
});;
define('__dot_dot__/src/services/vm-context-menu.service',["exports", "rxjs", "rxjs/operators", "../classes/vm-context-menu"], function (_exports, _rxjs, _operators, _vmContextMenu) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMContextMenuService = void 0;
  class VMContextMenuService {
    constructor() {
      this.contextMenu = new _rxjs.BehaviorSubject(new _vmContextMenu.VMContextMenu());
      this.isOpen = false;
      this.contextMenu.subscribe(contextMenu => this.isOpen = contextMenu.isOpen);
    }
    getContextMenuState() {
      return this.contextMenu;
    }
    open(contextMenu) {
      if (!this.isOpen) {
        const initialMenuState = new _vmContextMenu.VMContextMenu();
        this.contextMenu.next({
          ...initialMenuState,
          isOpen: true,
          ...contextMenu
        });
      }
      return this.contextMenu.pipe((0, _operators.pairwise)(), (0, _operators.first)(contextMenus => contextMenus[0].isOpen && !contextMenus[1].isOpen), (0, _operators.map)(contextMenus => contextMenus[0]));
    }
    close(contextMenu = new _vmContextMenu.VMContextMenu()) {
      this.contextMenu.next({
        ...contextMenu,
        isOpen: false
      });
    }
  }
  _exports.VMContextMenuService = VMContextMenuService;
});;
define('__dot_dot__/src/services/vm-pagination.service',["exports", "../classes/vm-pager"], function (_exports, _vmPager) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMPaginationService = void 0;
  class VMPaginationService {
    getPagerData(totalItems, currentPage, pageSize) {
      const startIndex = (currentPage - 1) * pageSize;
      return new _vmPager.VMPager({
        currentPage: currentPage,
        pageSize: pageSize,
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        startIndex: startIndex,
        endIndex: Math.min(startIndex + pageSize - 1, totalItems - 1)
      });
    }
  }
  _exports.VMPaginationService = VMPaginationService;
});;
define('text!__dot_dot__/src/styles/main.css',[],function(){return ".vm-dialog{background-color:#fff;border-radius:10px;box-shadow:0 0 15px rgba(0,0,0,.15);width:600px}.vm-dialog.vm-dialog__lg{width:900px}.vm-dialog .vm-dialog--body{padding:25px}.vm-dialog .vm-dialog--footer,.vm-dialog .vm-dialog--header{align-items:center;display:flex;padding:0 25px}.vm-dialog .vm-dialog--footer{border-top:1px solid #c1c7d0;-moz-column-gap:15px;column-gap:15px;height:75px;justify-content:flex-end}.vm-dialog .vm-dialog--header{border-bottom:1px solid #c1c7d0;height:70px;justify-content:space-between}.vm-dialog .vm-dialog--header .vm-dialog--title{font-size:18px;font-weight:700}input.vm-input{border:1px solid #c1c7d0;border-radius:3px;font-size:16px;height:40px;line-height:19px;outline:none;padding:10px 13px;width:100%}input.vm-input:disabled{background-color:#fafbfc;cursor:not-allowed}input.vm-input:focus{border-color:#20a281}input.vm-input::-moz-placeholder{color:#a6b0bc}input.vm-input::placeholder{color:#a6b0bc}textarea.vm-input{border:1px solid #c1c7d0;border-radius:4px;box-shadow:inset 0 2px 2px rgba(0,0,0,.08);font-size:14px;line-height:17px;max-width:100%;min-height:40px;min-width:100%;outline:none;padding:8px;width:100%}textarea.vm-input:disabled{background-color:#fafbfc;cursor:not-allowed}textarea.vm-input:focus{border-color:#20a281}textarea.vm-input::-moz-placeholder{color:#999}textarea.vm-input::placeholder{color:#999}textarea.vm-input.no-resize{resize:none}.vm-input--no-arrows::-webkit-inner-spin-button,.vm-input--no-arrows::-webkit-outer-spin-button{-webkit-appearance:none;appearance:none}.vm-input-group{display:flex}.vm-input-group .vm-input{border-radius:0 3px 3px 0}.vm-input-group .vm-input-group-addon{align-items:center;border:1px solid #c1c7d0;border-radius:3px 0 0 3px;border-right:none;display:flex;font-size:16px;padding:0 13px}.vm-input-group:focus-within .vm-input-group-addon{border-color:#20a281}.has-error>.vm-input,.has-error>.vm-input-group .vm-input,.has-error>.vm-input-group .vm-input-group-addon{border-color:#d61100}";});;
define('__dot_dot__/src/value-converters/dom-purify-sanitizer',["exports", "dompurify"], function (_exports, DOMPurify) {
  "use strict";

  _exports.__esModule = true;
  _exports.DOMPurifySanitizer = void 0;
  DOMPurify = _interopRequireWildcard(DOMPurify);
  function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
  function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
  class DOMPurifySanitizer {
    sanitize(input) {
      return DOMPurify.sanitize(input);
    }
  }
  _exports.DOMPurifySanitizer = DOMPurifySanitizer;
});;
define('__dot_dot__/src/value-converters/index',["exports", "./dom-purify-sanitizer"], function (_exports, _domPurifySanitizer) {
  "use strict";

  _exports.__esModule = true;
  Object.keys(_domPurifySanitizer).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    if (key in _exports && _exports[key] === _domPurifySanitizer[key]) return;
    _exports[key] = _domPurifySanitizer[key];
  });
});;
define('app',["exports", "tslib", "aurelia-event-aggregator", "aurelia-framework", "resources/styles/main.css"], function (_exports, _tslib, _aureliaEventAggregator, _aureliaFramework, _main) {
  "use strict";

  _exports.__esModule = true;
  _exports.App = void 0;
  var ComponentNames;
  (function (ComponentNames) {
    ComponentNames["VMAlert"] = "vm-alert";
    ComponentNames["VMBadge"] = "vm-badge";
    ComponentNames["VMButton"] = "vm-button";
    ComponentNames["VMCheckbox"] = "vm-checkbox";
    ComponentNames["VMContextMenu"] = "vm-context-menu";
    ComponentNames["VMDialog"] = "vm-dialog";
    ComponentNames["VMDropdown"] = "vm-dropdown";
    ComponentNames["VMForm"] = "vm-form";
    ComponentNames["VMInput"] = "vm-input";
    ComponentNames["VMPagination"] = "vm-pagination";
    ComponentNames["VMSearch"] = "vm-search";
    ComponentNames["VMTabs"] = "vm-tabs";
    ComponentNames["VMToggle"] = "vm-toggle";
    ComponentNames["VMTooltip"] = "vm-tooltip";
  })(ComponentNames || (ComponentNames = {}));
  let App = class App {
    constructor(ea) {
      this.ea = ea;
      this.activeNavTitle = '';
      this.navSub = null;
    }
    attached() {
      this.navSub = this.ea.subscribe("router:navigation:complete", event => {
        this.activeNavTitle = event.instruction.config.name + ' Demo';
      });
    }
    detached() {
      var _a;
      (_a = this.navSub) === null || _a === void 0 ? void 0 : _a.dispose();
      this.navSub = null;
    }
    configureRouter(config, router) {
      const homeBreadcrumb = {
        href: '/',
        title: 'Home'
      };
      config.title = 'vm-library';
      config.map(Object.values(ComponentNames).map(name => {
        const route = name === ComponentNames.VMAlert ? ['', name] : name;
        return {
          route: route,
          name: name,
          nav: true,
          title: name,
          moduleId: _aureliaFramework.PLATFORM.moduleName(`./${name}-demo/${name}-demo.component`, 'testbed'),
          breadcrumbs: [homeBreadcrumb, {
            name: name,
            title: name
          }]
        };
      }));
      this.router = router;
    }
  };
  _exports.App = App;
  _exports.App = App = (0, _tslib.__decorate)([(0, _tslib.__param)(0, (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator)), (0, _tslib.__metadata)("design:paramtypes", [_aureliaEventAggregator.EventAggregator])], App);
});
define('resources/styles/main.css',['__inject_css__','text!resources/styles/main.css'],function(i,c){i(c,'_au_css:resources/styles/main.css');});
;
define('text!app.css',[],function(){return "@import url(\"https://fonts.googleapis.com/css?family=Lato\");@import url(\"https://fonts.googleapis.com/css?family=Lato:400italic\");@import url(\"https://cdn.jsdelivr.net/npm/bootstrap-reboot@4.3.1/dist/reboot.css\");*{font-family:Lato,sans-serif}body{color:#172b4a;font-size:13px;margin:0}ux-dialog-container.active{background-color:rgba(60,60,60,.4)}.app{display:grid;grid-template-columns:220px 1fr;min-height:100vh}.app .app--content{display:flex;flex-direction:column;padding:20px}.app .app--nav{background-color:#172b4a}.app .app--nav .app--nav-item{align-items:center;color:#c1c7d0;display:flex;font-size:14px;height:60px;outline:none;padding:0 8px 0 15px;text-decoration:none}.app .app--nav .app--nav-item:focus,.app .app--nav .app--nav-item:hover{background-color:#2e405c;color:#fff}.app .app--nav .app--nav-item.app--nav-item__active{background-color:#45556e;color:#fff}.form-group{margin-bottom:15px}.form-group>label{font-weight:700;margin-bottom:5px}.m-b{margin-bottom:15px}.sr-only{height:1px;left:-10000px;overflow:hidden;position:absolute;top:auto;width:1px}";});;
define('text!app.html',[],function(){return "<template>\r\n    <require from=\"./app.css\"></require>\r\n\r\n    <div class=\"app\">\r\n        <nav class=\"app--nav\">\r\n            <a\r\n                class=\"app--nav-item ${nav.isActive ? 'app--nav-item__active' : ''}\"\r\n                repeat.for=\"nav of router.navigation\"\r\n                href.bind=\"nav.href\"\r\n            >\r\n                ${nav.title}\r\n            </a>\r\n        </nav>\r\n\r\n        <div class=\"app--content\">\r\n            <vm-breadcrumbs></vm-breadcrumbs>\r\n            <vm-header text.to-view=\"activeNavTitle\"></vm-header>\r\n            <router-view></router-view>\r\n        </div>\r\n    </div>\r\n\r\n    <vm-context-menu></vm-context-menu>\r\n</template>\r\n";});;
define('environment',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports.default = void 0;
  var _default = {
    debug: true,
    testing: true
  };
  _exports.default = _default;
});;
define('main',["exports", "aurelia-framework", "aurelia-templating-resources", "resources", "./environment"], function (_exports, _aureliaFramework, _aureliaTemplatingResources, _resources, _environment) {
  "use strict";

  _exports.__esModule = true;
  _exports.configure = configure;
  _environment = _interopRequireDefault(_environment);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  function configure(aurelia) {
    aurelia.use.standardConfiguration().feature('resources').plugin(_aureliaFramework.PLATFORM.moduleName('aurelia-validation', 'testbed')).plugin(_aureliaFramework.PLATFORM.moduleName('aurelia-dialog', 'testbed')).developmentLogging(_environment.default.debug ? 'debug' : 'warn').singleton(_aureliaTemplatingResources.HTMLSanitizer, _resources.DOMPurifySanitizer);
    if (_environment.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }
    aurelia.start().then(() => aurelia.setRoot());
  }
});;
define('vm-alert-demo/vm-alert-demo.component',["exports", "resources"], function (_exports, _resources) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMAlertDemoComponent = void 0;
  class VMAlertDemoComponent {
    constructor() {
      this.alertTypes = Object.values(_resources.AlertTypes);
      this.text = 'This is a sample alert';
    }
  }
  _exports.VMAlertDemoComponent = VMAlertDemoComponent;
});;
define('text!vm-alert-demo/vm-alert-demo.component.css',[],function(){return ".vm-alert-demo{-moz-column-gap:50px;column-gap:50px;display:grid;grid-template-columns:repeat(2,1fr);row-gap:30px}.vm-alert-demo .vm-alert-demo--item{display:flex;flex-direction:column;row-gap:15px}.vm-alert-demo .vm-alert-demo--item .vm-alert-demo--item-title{text-transform:capitalize}";});;
define('text!vm-alert-demo/vm-alert-demo.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-alert-demo.component.css\"></require>\r\n\r\n    <div class=\"vm-alert-demo\">\r\n        <div class=\"vm-alert-demo--item\" repeat.for=\"alertType of alertTypes\">\r\n            <h4 class=\"vm-alert-demo--item-title\">${alertType}</h4>\r\n            <vm-alert type.one-time=\"alertType\">${text}</vm-alert>\r\n            <vm-alert type.one-time=\"alertType\" show-dismiss.one-time=\"true\">${text}</vm-alert>\r\n            <vm-alert type.one-time=\"alertType\" show-icon.one-time=\"false\">${text}</vm-alert>\r\n            <vm-alert type.one-time=\"alertType\" show-dismiss.one-time=\"true\" show-icon.one-time=\"false\">${text}</vm-alert>\r\n            <vm-alert type.one-time=\"alertType\" is-large.one-time=\"true\" show-dismiss.one-time=\"true\">${text}</vm-alert>\r\n        </div>\r\n    </div>\r\n</template>\r\n";});;
define('vm-badge-demo/vm-badge-demo.component',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMBadgeDemoComponent = void 0;
  class VMBadgeDemoComponent {
    constructor() {
      this.testNumbers = [3, 33, 333];
    }
  }
  _exports.VMBadgeDemoComponent = VMBadgeDemoComponent;
});;
define('text!vm-badge-demo/vm-badge-demo.component.css',[],function(){return ".vm-badge-demo{-moz-column-gap:20px;column-gap:20px;display:flex}.vm-badge-demo label{font-weight:700}.vm-badge-demo .vm-badge-demo--column{align-items:center;display:flex;flex-direction:column;row-gap:10px}";});;
define('text!vm-badge-demo/vm-badge-demo.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-badge-demo.component.css\"></require>\r\n\r\n    <div class=\"vm-badge-demo\">\r\n        <div class=\"vm-badge-demo--column\">\r\n            <label>Danger</label>\r\n            <vm-badge danger repeat.for=\"num of testNumbers\">${num}</vm-badge>\r\n        </div>\r\n\r\n        <div class=\"vm-badge-demo--column\">\r\n            <label>Primary</label>\r\n            <vm-badge primary repeat.for=\"num of testNumbers\">${num}</vm-badge>\r\n        </div>\r\n\r\n        <div class=\"vm-badge-demo--column\">\r\n            <label>Secondary</label>\r\n            <vm-badge secondary repeat.for=\"num of testNumbers\">${num}</vm-badge>\r\n        </div>\r\n    </div>\r\n</template>\r\n";});;
define('vm-button-demo/vm-button-demo.component',["exports", "resources"], function (_exports, _resources) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMButtonDemoComponent = void 0;
  class VMButtonDemoComponent {
    constructor() {
      this.vmButtonSizes = _resources.VMButtonSizes;
      this.vmButtonTypes = _resources.VMButtonTypes;
      this.buttonTypes = ['primary', 'secondary', 'approve', 'deny'];
    }
    alert() {
      alert('button clicked!');
    }
  }
  _exports.VMButtonDemoComponent = VMButtonDemoComponent;
});;
define('text!vm-button-demo/vm-button-demo.component.css',[],function(){return ".vm-btns-demo{border:1px solid #c1c7d0}.vm-btns-demo td,.vm-btns-demo th{padding:8px;text-align:center}.vm-btns-demo th{background-color:#eff2f7;border-bottom:1px solid #c1c7d0;border-right:1px solid #c1c7d0}.vm-btns-demo tr:not(:last-of-type) td{border-bottom:1px solid #e7eaec}";});;
define('text!vm-button-demo/vm-button-demo.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-button-demo.component.css\"></require>\r\n\r\n    <table class=\"vm-btns-demo\">\r\n        <thead>\r\n            <th>Button Type</th>\r\n            <th>Normal</th>\r\n            <th>Icon</th>\r\n            <th>Disabled</th>\r\n            <th>Small</th>\r\n            <th>Large</th>\r\n            <th>XXL</th>\r\n        </thead>\r\n        <tbody>\r\n            <tr repeat.for=\"buttonType of buttonTypes\">\r\n                <th>${buttonType}</th>\r\n                <td>\r\n                    <!-- Normal Button -->\r\n                    <vm-button type.one-time=\"buttonType\" click.call=\"alert()\"> Settings </vm-button>\r\n                </td>\r\n                <td>\r\n                    <!-- Button w/ Icon -->\r\n                    <vm-button type.one-time=\"buttonType\" click.call=\"alert()\">\r\n                        <i class=\"fas fa-cog\"></i>\r\n                        <span>Settings</span>\r\n                    </vm-button>\r\n                </td>\r\n                <td>\r\n                    <!-- Disabled Button -->\r\n                    <vm-button type.one-time=\"buttonType\" is-disabled.to-view=\"true\" click.call=\"alert()\"> Settings </vm-button>\r\n                </td>\r\n                <td>\r\n                    <!-- Small Button -->\r\n                    <vm-button type.one-time=\"buttonType\" size.one-time=\"vmButtonSizes.Small\" click.call=\"alert()\"> Settings </vm-button>\r\n                </td>\r\n                <td>\r\n                    <!-- Large Button -->\r\n                    <vm-button type.one-time=\"buttonType\" size.one-time=\"vmButtonSizes.Large\" click.call=\"alert()\"> Settings </vm-button>\r\n                </td>\r\n                <td>\r\n                    <!-- XXL Button -->\r\n                    <vm-button type.one-time=\"buttonType\" size.one-time=\"vmButtonSizes.XXL\" click.call=\"alert()\"> Settings </vm-button>\r\n                </td>\r\n            </tr>\r\n            <tr>\r\n                <th>icon</th>\r\n                <td></td>\r\n                <td>\r\n                    <vm-button icon click.call=\"alert()\">\r\n                        <i class=\"fas fa-cog\"></i>\r\n                    </vm-button>\r\n                </td>\r\n                <td>\r\n                    <vm-button icon click.call=\"alert()\" is-disabled.one-time=\"true\">\r\n                        <i class=\"fas fa-cog\"></i>\r\n                    </vm-button>\r\n                </td>\r\n                <td>\r\n                    <vm-button icon small click.call=\"alert()\" is-disabled.one-time=\"true\">\r\n                        <i class=\"fas fa-cog\"></i>\r\n                    </vm-button>\r\n                </td>\r\n                <td></td>\r\n                <td></td>\r\n            </tr>\r\n            <tr>\r\n                <th>tertiary</th>\r\n                <td>\r\n                    <vm-button tertiary click.call=\"alert()\">\r\n                        <span>Some Link</span>\r\n                    </vm-button>\r\n                </td>\r\n                <td></td>\r\n                <td></td>\r\n                <td></td>\r\n                <td></td>\r\n                <td></td>\r\n            </tr>\r\n\r\n            <tr>\r\n                <th>tertiary navy</th>\r\n                <td>\r\n                    <vm-button tertiaryNavy click.call=\"alert()\">\r\n                        <span>Some Link</span>\r\n                    </vm-button>\r\n                </td>\r\n            </tr>\r\n        </tbody>\r\n    </table>\r\n</template>\r\n";});;
define('vm-checkbox-demo/vm-checkbox-demo.component',["exports", "resources"], function (_exports, _resources) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMCheckboxDemoComponent = void 0;
  class VMCheckboxDemoComponent {
    constructor() {
      this.isSelected = false;
      this.items = [];
      this.vmAlertTypes = _resources.AlertTypes;
    }
    attached() {
      for (let i = 0; i < 10; i++) {
        this.items.push({
          id: 'id-' + i,
          display: 'Item ' + i,
          isSelected: false
        });
      }
    }
    handleItemsChange(items) {
      console.log(items);
    }
  }
  _exports.VMCheckboxDemoComponent = VMCheckboxDemoComponent;
});;
define('text!vm-checkbox-demo/vm-checkbox-demo.component.html',[],function(){return "<template>\r\n    <vm-alert class=\"m-b\" type.one-time=\"vmAlertTypes.Info\">\r\n        NOTE: The checkbox icon will not render correctly in the testbed due to an unresolved Font Awesome 5 issue. However, it does work as\r\n        expected in the main repo.\r\n    </vm-alert>\r\n\r\n    <div class=\"form-group\">\r\n        <label>vm-checkbox</label>\r\n        <vm-checkbox name=\"exampleCheckbox\" checked.bind=\"isSelected\">vm-checkbox test</vm-checkbox>\r\n    </div>\r\n\r\n    <div class=\"form-group\">\r\n        <label>vm-checkbox-picklist</label>\r\n        <vm-checkbox-picklist model.two-way=\"items\" change.call=\"handleItemsChange($event)\"></vm-checkbox-picklist>\r\n    </div>\r\n</template>\r\n";});;
define('vm-context-menu-demo/vm-context-menu-demo-items.component',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMContextMenuDemoItemsComponent = void 0;
  class VMContextMenuDemoItemsComponent {
    constructor() {
      this.items = [];
    }
    activate(menu) {
      this.menu = menu;
    }
    attached() {
      this.menu.render(this.menu);
      this.items = this.menu.data.items;
    }
  }
  _exports.VMContextMenuDemoItemsComponent = VMContextMenuDemoItemsComponent;
});;
define('text!vm-context-menu-demo/vm-context-menu-demo-items.component.css',[],function(){return ".vm-context-menu-demo-items{padding:15px;width:200px}";});;
define('text!vm-context-menu-demo/vm-context-menu-demo-items.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-context-menu-demo-items.component.css\"></require>\r\n\r\n    <div class=\"vm-context-menu-demo-items\">\r\n        <div>Items List</div>\r\n        <div repeat.for=\"item of items\">${item}</div>\r\n    </div>\r\n</template>\r\n";});;
define('vm-context-menu-demo/vm-context-menu-demo.component',["exports", "tslib", "aurelia-framework", "resources"], function (_exports, _tslib, _aureliaFramework, _resources) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMContextMenuDemoComponent = void 0;
  let VMContextMenuDemoComponent = class VMContextMenuDemoComponent {
    constructor(contextMenuService) {
      this.contextMenuService = contextMenuService;
    }
    openContextMenu($event) {
      const items = [];
      let event = $event['target'];
      for (let i = 0; i < 10; i++) {
        items.push('Item ' + i);
      }
      while (event.localName !== 'vm-button') {
        event = event.parentElement;
      }
      this.contextMenuService.open({
        component: 'vm-context-menu-demo/vm-context-menu-demo-items.component',
        x: event.offsetLeft,
        y: event.offsetTop + event.offsetHeight + 15 - window.scrollY,
        data: {
          items: items
        }
      });
    }
  };
  _exports.VMContextMenuDemoComponent = VMContextMenuDemoComponent;
  _exports.VMContextMenuDemoComponent = VMContextMenuDemoComponent = (0, _tslib.__decorate)([(0, _tslib.__param)(0, (0, _aureliaFramework.inject)(_resources.VMContextMenuService)), (0, _tslib.__metadata)("design:paramtypes", [_resources.VMContextMenuService])], VMContextMenuDemoComponent);
});;
define('text!vm-context-menu-demo/vm-context-menu-demo.component.html',[],function(){return "<template>\r\n    <vm-button secondary click.call=\"openContextMenu($event)\">Open Context Menu</vm-button>\r\n</template>\r\n";});;
define('vm-dialog-demo/vm-dialog-demo.component',["exports", "tslib", "aurelia-dialog", "aurelia-framework"], function (_exports, _tslib, _aureliaDialog, _aureliaFramework) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMDialogDemoComponent = void 0;
  let VMDialogDemoComponent = class VMDialogDemoComponent {
    constructor(dialogService) {
      this.dialogService = dialogService;
    }
    openDialog(isLarge) {
      this.dialogService.open({
        viewModel: _aureliaFramework.PLATFORM.moduleName('vm-dialog-demo/vm-dialog-demo.dialog', 'testbed'),
        model: {
          isLarge
        }
      }).whenClosed(response => {
        if (!response.wasCancelled) {
          alert('ok button clicked');
        }
      });
    }
    openDuotone(type) {
      this.dialogService.open({
        viewModel: _aureliaFramework.PLATFORM.moduleName('vm-dialog-demo/vm-dialog-duotone-demo.dialog', 'testbed'),
        model: {
          type
        }
      });
    }
  };
  _exports.VMDialogDemoComponent = VMDialogDemoComponent;
  _exports.VMDialogDemoComponent = VMDialogDemoComponent = (0, _tslib.__decorate)([(0, _tslib.__param)(0, (0, _aureliaFramework.inject)(_aureliaDialog.DialogService)), (0, _tslib.__metadata)("design:paramtypes", [_aureliaDialog.DialogService])], VMDialogDemoComponent);
});;
define('text!vm-dialog-demo/vm-dialog-demo.component.html',[],function(){return "<template>\r\n    <vm-button secondary click.call=\"openDialog(false)\">\r\n        <span>Open Dialog</span>\r\n    </vm-button>\r\n\r\n    <vm-button secondary click.call=\"openDialog(true)\">\r\n        <span>Open Large Dialog</span>\r\n    </vm-button>\r\n\r\n    <vm-button secondary click.call=\"openDuotone('info')\">\r\n        <span>Open Info Duotone</span>\r\n    </vm-button>\r\n    <vm-button secondary click.call=\"openDuotone('danger')\">\r\n        <span>Open Danger Duotone</span>\r\n    </vm-button>\r\n    <vm-button secondary click.call=\"openDuotone('success')\">\r\n        <span>Open Success Duotone</span>\r\n    </vm-button>\r\n    <vm-button secondary click.call=\"openDuotone('warning')\">\r\n        <span>Open Warning Duotone</span>\r\n    </vm-button>\r\n</template>\r\n";});;
define('vm-dialog-demo/vm-dialog-demo.dialog',["exports", "tslib", "aurelia-dialog", "aurelia-framework"], function (_exports, _tslib, _aureliaDialog, _aureliaFramework) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMDialogDemo = void 0;
  let VMDialogDemo = class VMDialogDemo {
    constructor(dialog) {
      this.dialog = dialog;
      this.isLarge = false;
    }
    activate(data) {
      this.isLarge = data['isLarge'];
    }
    save() {
      this.dialog.ok();
    }
  };
  _exports.VMDialogDemo = VMDialogDemo;
  _exports.VMDialogDemo = VMDialogDemo = (0, _tslib.__decorate)([(0, _tslib.__param)(0, (0, _aureliaFramework.inject)(_aureliaDialog.DialogController)), (0, _tslib.__metadata)("design:paramtypes", [_aureliaDialog.DialogController])], VMDialogDemo);
});;
define('text!vm-dialog-demo/vm-dialog-demo.dialog.html',[],function(){return "<template>\r\n    <vm-dialog dialog-title=\"vm-dialog Demo\" is-large.to-view=\"isLarge\" ok-click.call=\"save()\">\r\n        <p>\r\n            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\r\n            Dignissim cras tincidunt lobortis feugiat vivamus at augue eget. Adipiscing commodo elit at imperdiet dui accumsan sit. Etiam\r\n            non quam lacus suspendisse faucibus interdum. Arcu non odio euismod lacinia at quis risus sed vulputate. Leo vel orci porta non\r\n            pulvinar neque laoreet suspendisse. Sit amet risus nullam eget felis. Faucibus nisl tincidunt eget nullam. Sit amet nulla\r\n            facilisi morbi tempus iaculis. Consectetur adipiscing elit duis tristique sollicitudin nibh sit.\r\n        </p>\r\n        <p>\r\n            Volutpat lacus laoreet non curabitur gravida arcu ac. Vehicula ipsum a arcu cursus vitae. Purus gravida quis blandit turpis.\r\n            Tempus egestas sed sed risus pretium quam vulputate. Vitae tempus quam pellentesque nec nam aliquam sem. Lectus nulla at\r\n            volutpat diam ut. Habitasse platea dictumst quisque sagittis purus sit amet. Eget nullam non nisi est sit amet. Scelerisque eu\r\n            ultrices vitae auctor eu augue ut. Vel pretium lectus quam id leo. Neque ornare aenean euismod elementum nisi. Ut pharetra sit\r\n            amet aliquam. At ultrices mi tempus imperdiet nulla malesuada pellentesque elit eget. Libero nunc consequat interdum varius sit\r\n            amet mattis vulputate enim. At ultrices mi tempus imperdiet nulla. At tempor commodo ullamcorper a lacus vestibulum sed.\r\n        </p>\r\n        <p>\r\n            Neque laoreet suspendisse interdum consectetur. Faucibus ornare suspendisse sed nisi lacus sed viverra. Venenatis a condimentum\r\n            vitae sapien pellentesque habitant morbi tristique. Viverra maecenas accumsan lacus vel facilisis volutpat est velit egestas.\r\n            Morbi blandit cursus risus at ultrices mi tempus imperdiet nulla. Tristique senectus et netus et malesuada. Magnis dis\r\n            parturient montes nascetur ridiculus mus mauris vitae ultricies. Pharetra diam sit amet nisl suscipit adipiscing bibendum est.\r\n            Proin fermentum leo vel orci porta non pulvinar neque laoreet. Vitae congue eu consequat ac. Pharetra sit amet aliquam id diam\r\n            maecenas ultricies. Purus viverra accumsan in nisl nisi scelerisque eu. Arcu cursus vitae congue mauris rhoncus aenean. Neque\r\n            volutpat ac tincidunt vitae semper quis lectus. Arcu bibendum at varius vel pharetra vel. Non diam phasellus vestibulum lorem\r\n            sed risus ultricies. Faucibus ornare suspendisse sed nisi lacus sed viverra. Neque vitae tempus quam pellentesque nec nam\r\n            aliquam sem et. Senectus et netus et malesuada fames. Dictum at tempor commodo ullamcorper a lacus vestibulum sed arcu.\r\n        </p>\r\n    </vm-dialog>\r\n</template>\r\n";});;
define('vm-dialog-demo/vm-dialog-duotone-demo.dialog',["exports", "tslib", "aurelia-dialog", "aurelia-framework"], function (_exports, _tslib, _aureliaDialog, _aureliaFramework) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMDialogDuotoneDemo = void 0;
  let VMDialogDuotoneDemo = class VMDialogDuotoneDemo {
    constructor(dialog) {
      this.dialog = dialog;
    }
    activate(data) {
      this.type = data === null || data === void 0 ? void 0 : data.type;
    }
    save() {
      this.dialog.ok();
    }
  };
  _exports.VMDialogDuotoneDemo = VMDialogDuotoneDemo;
  _exports.VMDialogDuotoneDemo = VMDialogDuotoneDemo = (0, _tslib.__decorate)([(0, _tslib.__param)(0, (0, _aureliaFramework.inject)(_aureliaDialog.DialogController)), (0, _tslib.__metadata)("design:paramtypes", [_aureliaDialog.DialogController])], VMDialogDuotoneDemo);
});;
define('text!vm-dialog-demo/vm-dialog-duotone-demo.dialog.html',[],function(){return "<template>\r\n    <vm-dialog-duotone type.bind=\"type\" ok-click.call=\"save()\">\r\n        <h2 slot=\"title\">1 Resolved</h2>\r\n        <p>\r\n            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\r\n            Dignissim cras tincidunt lobortis feugiat vivamus at augue eget. Adipiscing commodo elit at imperdiet dui accumsan sit. Etiam\r\n            non quam lacus suspendisse faucibus interdum. Arcu non odio euismod lacinia at quis risus sed vulputate. Leo vel orci porta non\r\n            pulvinar neque laoreet suspendisse. Sit amet risus nullam eget felis. Faucibus nisl tincidunt eget nullam. Sit amet nulla\r\n            facilisi morbi tempus iaculis. Consectetur adipiscing elit duis tristique sollicitudin nibh sit.\r\n        </p>\r\n    </vm-dialog-duotone>\r\n</template>\r\n";});;
define('vm-dropdown-demo/vm-dropdown-demo.component',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMDropdownDemoComponent = void 0;
  class VMDropdownDemoComponent {
    constructor() {
      this.dropdownItems = [];
      this.selectedDropdownItemName = '';
      this.filteredSearchItems = [];
      this.selectedSearchItemName = '';
      this.multiselectItems = [];
      this.selectedMultiselectItemsName = '';
      this.selectAllValue = false;
      this.searchItems = [];
    }
    attached() {
      this.dropdownItems = this.getTenItems();
      this.multiselectItems = this.getTenItems();
      this.searchItems = this.getTenItems();
      this.filteredSearchItems = this.searchItems;
    }
    dropdownItemSelected($event) {
      this.dropdownItems.forEach(item => {
        item.isSelected = item.id === $event;
        this.selectedDropdownItemName = item.isSelected ? item.name : this.selectedDropdownItemName;
      });
    }
    handleSearch($event) {
      if ($event) {
        this.filteredSearchItems = this.searchItems.filter(x => {
          return x.name.toLowerCase().includes($event.toLowerCase());
        });
      } else {
        this.filteredSearchItems = this.searchItems;
      }
    }
    multiselectItemSelected($event) {
      const item = this.multiselectItems.find(x => {
        return x.id === $event;
      });
      item.isSelected = !item.isSelected;
      this.selectAllValue = this.multiselectItems.every(x => {
        return x.isSelected;
      });
      this.setMultiselectString();
    }
    searchItemSelected($event) {
      this.filteredSearchItems.forEach(item => {
        item.isSelected = item.id === $event;
        this.selectedSearchItemName = item.isSelected ? item.name : this.selectedSearchItemName;
      });
    }
    toggleAll() {
      this.selectAllValue = !this.selectAllValue;
      this.multiselectItems.map(x => {
        return x.isSelected = this.selectAllValue;
      });
      this.setMultiselectString();
    }
    getTenItems() {
      const tenItems = [];
      for (let i = 1; i <= 10; i++) {
        tenItems.push({
          id: i.toString(),
          isSelected: false,
          name: 'Item ' + i
        });
      }
      return tenItems;
    }
    setMultiselectString() {
      const selectedItems = this.multiselectItems.filter(x => {
        return x.isSelected;
      });
      if (selectedItems.length > 1) {
        this.selectedMultiselectItemsName = selectedItems.length + ' items selected';
      } else if (selectedItems.length === 1) {
        this.selectedMultiselectItemsName = selectedItems[0].name;
      } else {
        this.selectedMultiselectItemsName = '';
      }
    }
  }
  _exports.VMDropdownDemoComponent = VMDropdownDemoComponent;
});;
define('text!vm-dropdown-demo/vm-dropdown-demo.component.html',[],function(){return "<template>\r\n    <div class=\"form-group\">\r\n        <label>Dropdown</label>\r\n        <vm-dropdown display-text.to-view=\"selectedDropdownItemName\">\r\n            <vm-dropdown-item\r\n                repeat.for=\"item of dropdownItems\"\r\n                is-selected.to-view=\"item.isSelected\"\r\n                value.to-view=\"item.id\"\r\n                on-selection.call=\"dropdownItemSelected($event)\"\r\n            >\r\n                ${item.name}\r\n            </vm-dropdown-item>\r\n        </vm-dropdown>\r\n    </div>\r\n\r\n    <div class=\"form-group\">\r\n        <label>Disabled Dropdown</label>\r\n        <vm-dropdown is-disabled.one-time=\"true\"> </vm-dropdown>\r\n    </div>\r\n\r\n    <div class=\"form-group\">\r\n        <label>Dropdown w/ Search</label>\r\n        <vm-dropdown allow-search.one-time=\"true\" display-text.to-view=\"selectedSearchItemName\" on-search.call=\"handleSearch($event)\">\r\n            <vm-dropdown-item\r\n                repeat.for=\"item of filteredSearchItems\"\r\n                is-selected.to-view=\"item.isSelected\"\r\n                value.to-view=\"item.id\"\r\n                on-selection.call=\"searchItemSelected($event)\"\r\n            >\r\n                ${item.name}\r\n            </vm-dropdown-item>\r\n        </vm-dropdown>\r\n    </div>\r\n\r\n    <div class=\"form-group\">\r\n        <label>Multiselect Dropdown</label>\r\n        <vm-dropdown display-text.to-view=\"selectedMultiselectItemsName\">\r\n            <vm-dropdown-item is-selected.to-view=\"selectAllValue\" multiselect.one-time=\"true\" on-selection.call=\"toggleAll()\">\r\n                Select All\r\n            </vm-dropdown-item>\r\n            <vm-dropdown-item\r\n                repeat.for=\"item of multiselectItems\"\r\n                is-selected.to-view=\"item.isSelected\"\r\n                multiselect.one-time=\"true\"\r\n                value.to-view=\"item.id\"\r\n                on-selection.call=\"multiselectItemSelected($event)\"\r\n            >\r\n                ${item.name}\r\n            </vm-dropdown-item>\r\n        </vm-dropdown>\r\n    </div>\r\n</template>\r\n";});;
define('vm-form-demo/form-wizard-example.dialog',["exports", "tslib", "aurelia-dialog", "aurelia-framework", "aurelia-validation"], function (_exports, _tslib, _aureliaDialog, _aureliaFramework, _aureliaValidation) {
  "use strict";

  _exports.__esModule = true;
  _exports.FormWizardExampleDialog = void 0;
  const formModel = {
    firstName: '',
    lastName: '',
    email: '',
    nickname: ''
  };
  const wizardStepInitial = {
    name: '',
    visible: false,
    valid: false,
    model: {},
    rules: []
  };
  let FormWizardExampleDialog = class FormWizardExampleDialog {
    constructor(dialog) {
      this.dialog = dialog;
      this.stepIndex = 0;
      this.steps = [];
      this.wizardValid = false;
      this.rules = _aureliaValidation.ValidationRules.ensure('firstName').required().ensure('lastName').required().ensure('email').email().required().rules;
      this.nextHandler = () => {
        const maxIndex = this.steps.length - 1;
        if (this.stepIndex >= maxIndex) {
          this.stepIndex = 0;
        } else {
          this.stepIndex += 1;
        }
      };
      this.prevHandler = () => {
        const minIndex = 0;
        if (this.stepIndex <= minIndex) {
          this.stepIndex = 0;
        } else {
          this.stepIndex -= 1;
        }
      };
      this.saveHandler = () => {
        this.dialog.ok({
          model: this.steps.map(step => step.model)
        });
      };
    }
    activate() {
      this.steps = new Array(3).fill(wizardStepInitial).map((step, index) => {
        return {
          name: 'Step ' + index,
          visible: index === 0,
          valid: false,
          model: {
            ...formModel
          },
          rules: {
            ...this.rules
          }
        };
      });
    }
    setValid(index) {
      return params => {
        this.steps[index].valid = params.valid;
        this.wizardValid = this.steps.every(step => step.valid);
      };
    }
    select(index) {
      this.stepIndex = index;
    }
  };
  _exports.FormWizardExampleDialog = FormWizardExampleDialog;
  _exports.FormWizardExampleDialog = FormWizardExampleDialog = (0, _tslib.__decorate)([(0, _tslib.__param)(0, (0, _aureliaFramework.inject)(_aureliaDialog.DialogController)), (0, _tslib.__metadata)("design:paramtypes", [_aureliaDialog.DialogController])], FormWizardExampleDialog);
});;
define('text!vm-form-demo/form-wizard-example.dialog.css',[],function(){return "";});;
define('text!vm-form-demo/form-wizard-example.dialog.html',[],function(){return "<template>\r\n    <vm-form-wizard class=\"save-file-wizard\">\r\n      <div slot=\"header\">\r\n        <h2>Example Dialog</h2>\r\n      </div>\r\n      <div slot=\"nav\">\r\n          <button repeat.for=\"step of steps\"\r\n            click.delegate=\"select($index)\"\r\n            class=\"${ $index === stepIndex ? '--current-step' : '' }\">\r\n            ${ step.name }\r\n          </button>\r\n      </div>\r\n      <div slot=\"body\">\r\n        <div repeat.for=\"step of steps\" show.bind=\"$index === stepIndex\">\r\n            <h4>Is this valid? ${ step.valid }</h4>\r\n            <vm-form model.bind=\"step.model\" rules.bind=\"step.rules\" get.to-view=\"setValid($index)\">\r\n                <vm-form-field name=\"firstName\">\r\n                    <label>First Name</label>\r\n                    <input class=\"vm-input\" value.bind=\"step.model.firstName\" />\r\n                </vm-form-field>\r\n                <vm-form-field name=\"lastName\">\r\n                    <label>Last Name</label>\r\n                    <input class=\"vm-input\" value.bind=\"step.model.lastName\" />\r\n                </vm-form-field>\r\n                <vm-form-field name=\"email\">\r\n                    <label>Email</label>\r\n                    <input class=\"vm-input\" value.bind=\"step.model.email\" />\r\n                </vm-form-field>\r\n                <vm-form-field name=\"nickname\">\r\n                    <label>Nickname</label>\r\n                    <input class=\"vm-input\" value.bind=\"step.model.nickname\" />\r\n                </vm-form-field>\r\n            </vm-form>\r\n        </div>\r\n      </div>\r\n      <div slot=\"footer\">\r\n        <div class=\"footer-navigation\">\r\n          <vm-button secondary click.bind=\"prevHandler\" is-disabled.to-view=\"stepIndex === 0\">\r\n            <i class=\"fa fa-chevron-left\"> </i>Back</i>\r\n          </vm-button>\r\n          <vm-button secondary click.bind=\"nextHandler\" is-disabled.to-view=\"stepIndex > steps.length - 1\">\r\n            Next <i class=\"fa fa-chevron-right\"></i>\r\n          </vm-button>\r\n        </div>\r\n        <vm-button primary click.bind=\"saveHandler\" is-disabled.to-view=\"!wizardValid\">\r\n            Save\r\n        </vm-button>\r\n      </div>\r\n    </vm-form-wizard>\r\n  </template>\r\n  ";});;
define('vm-form-demo/vm-form-demo.component',["exports", "tslib", "aurelia-dialog", "aurelia-framework", "aurelia-validation"], function (_exports, _tslib, _aureliaDialog, _aureliaFramework, _aureliaValidation) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMFormDemoComponent = void 0;
  let VMFormDemoComponent = class VMFormDemoComponent {
    constructor(dialogService) {
      this.dialogService = dialogService;
      this.callbackValid = false;
      this.example = {
        firstName: '',
        lastName: '',
        email: '',
        hasNickname: false,
        nickname: ''
      };
      this.rules = _aureliaValidation.ValidationRules.ensure('firstName').required().ensure('lastName').required().ensure('email').email().required().ensure('nickname').required().when(form => form['hasNickname'] === true).rules;
      this.nestedExample = {
        topLevelInput: '',
        firstNested: {
          ...this.example
        },
        secondNested: {
          ...this.example
        }
      };
      this.nestedRules = _aureliaValidation.ValidationRules.ensure('topLevelInput').required().satisfies((val, obj) => {
        const subFormsToValidate = ['firstNested', 'secondNested'];
        return subFormsToValidate.map(key => obj[key].$valid).every(isValid => isValid === true);
      }).withMessage('Subforms are not valid').rules;
      this.getRules = () => [...this.rules];
      this.getFormInfo = params => {
        this.callbackValid = params.valid;
      };
      this.nestedGet = () => {
        this.nestedFormRef.validate();
      };
    }
    openWizard() {
      this.dialogService.open({
        viewModel: _aureliaFramework.PLATFORM.moduleName('vm-form-demo/form-wizard-example.dialog', 'testbed'),
        model: {
          test: true
        }
      }).whenClosed(response => {
        if (!response.wasCancelled) {
          console.log('ok button clicked');
        }
      });
    }
  };
  _exports.VMFormDemoComponent = VMFormDemoComponent;
  _exports.VMFormDemoComponent = VMFormDemoComponent = (0, _tslib.__decorate)([(0, _tslib.__param)(0, (0, _aureliaFramework.inject)(_aureliaDialog.DialogService)), (0, _tslib.__metadata)("design:paramtypes", [_aureliaDialog.DialogService])], VMFormDemoComponent);
});;
define('text!vm-form-demo/vm-form-demo.component.html',[],function(){return "<template>\r\n    <h2>Basic</h2>\r\n    Valid: ${ example.$valid }\r\n    <vm-form\r\n        model.bind=\"example\"\r\n        rules.bind=\"rules\"\r\n        get.bind=\"getFormInfo\"\r\n        class=\"row\"\r\n        >\r\n        <vm-form-field name=\"firstName\" class=\"col-xs-6 col-md-3\">\r\n            <label>First Name</label>\r\n            <input type=\"text\" class=\"vm-input\" value.bind=\"example.firstName\" />\r\n        </vm-form-field>\r\n        <vm-form-field name=\"lastName\"class=\"col-xs-6 col-md-3\">\r\n            <label>Last Name</label>\r\n            <input type=\"text\" class=\"vm-input\" value.bind=\"example.lastName\" />\r\n        </vm-form-field>\r\n        <vm-form-field name=\"email\"class=\"col-xs-12 col-md-6\">\r\n            <label>Email</label>\r\n            <input type=\"text\" class=\"vm-input\" value.bind=\"example.email\" />\r\n        </vm-form-field>\r\n        <vm-form-field name=\"hasNickname\" class=\"col-xs-12 col-md-6\">\r\n            <vm-checkbox name=\"hasNickname\" checked.two-way=\"example.hasNickname\">Use Nickname</vm-checkbox>\r\n        </vm-form-field>\r\n        <vm-form-field\r\n            class=\"col-xs-12 col-md-6 col-md-offset-6\"\r\n            show.bind=\"!!example.hasNickname\"\r\n            name=\"nickname\"\r\n            >\r\n            <label>Nickname</label>\r\n            <input type=\"text\"\r\n                class=\"vm-input\"\r\n                value.bind=\"example.nickname\"\r\n            />\r\n        </vm-form-field>\r\n    </vm-form>\r\n    <vm-button is-disabled.bind=\"!example.$valid\" primary>Submit</vm-button>\r\n    <h2>Dialog Wizard</h2>\r\n    <vm-button click.call=\"openWizard()\" primary>Open Wizard</vm-button>\r\n    <h2>Nested Models</h2>\r\n    <vm-form\r\n        view-model.ref=\"nestedFormRef\"\r\n        model.bind=\"nestedExample\"\r\n        rules.bind=\"nestedRules\"\r\n        >\r\n        <vm-form-field name=\"topLevelInput\">\r\n            <label>Arbitrary Input</label>\r\n            <input type=\"test\" class=\"vm-input\" value.bind=\"nestedExample.topLevelInput\" />\r\n        </vm-form-field>\r\n    </vm-form>\r\n    <h3>Nested Form #1</h3>\r\n    Valid: ${ nestedExample.firstNested.$valid }\r\n    <vm-form\r\n        model.bind=\"nestedExample.firstNested\"\r\n        rules.bind=\"rules\"\r\n        get.bind=\"nestedGet\"\r\n        class=\"row\"\r\n        >\r\n        <vm-form-field name=\"firstName\" class=\"col-xs-6 col-md-3\">\r\n            <label>First Name</label>\r\n            <input type=\"text\" class=\"vm-input\" value.bind=\"nestedExample.firstNested.firstName\" />\r\n        </vm-form-field>\r\n        <vm-form-field name=\"lastName\"class=\"col-xs-6 col-md-3\">\r\n            <label>Last Name</label>\r\n            <input type=\"text\" class=\"vm-input\" value.bind=\"nestedExample.firstNested.lastName\" />\r\n        </vm-form-field>\r\n        <vm-form-field name=\"email\"class=\"col-xs-12 col-md-6\">\r\n            <label>Email</label>\r\n            <input type=\"text\" class=\"vm-input\" value.bind=\"nestedExample.firstNested.email\" />\r\n        </vm-form-field>\r\n        <vm-form-field name=\"hasNickname\" class=\"col-xs-12 col-md-6\">\r\n            <vm-checkbox name=\"firstNestedHasNickname\" checked.two-way=\"nestedExample.firstNested.hasNickname\">Use Nickname</vm-checkbox>\r\n        </vm-form-field>\r\n        <vm-form-field\r\n            class=\"col-xs-12 col-md-6 col-md-offset-6\"\r\n            show.bind=\"!!nestedExample.firstNested.hasNickname\r\n            \"\r\n            name=\"nickname\"\r\n            >\r\n            <label>Nickname</label>\r\n            <input type=\"text\"\r\n                class=\"vm-input\"\r\n                value.bind=\"nestedExample.firstNested.nickname\"\r\n            />\r\n        </vm-form-field>\r\n    </vm-form>\r\n    <h3>Nested Form #2</h3>\r\n    Valid: ${ nestedExample.secondNested.$valid }\r\n    <vm-form\r\n        model.bind=\"nestedExample.secondNested\"\r\n        rules.bind=\"rules\"\r\n        get.bind=\"nestedGet\"\r\n        class=\"row\"\r\n        >\r\n        <vm-form-field name=\"firstName\" class=\"col-xs-6 col-md-3\">\r\n            <label>First Name</label>\r\n            <input type=\"text\" class=\"vm-input\" value.bind=\"nestedExample.secondNested.firstName\" />\r\n        </vm-form-field>\r\n        <vm-form-field name=\"lastName\"class=\"col-xs-6 col-md-3\">\r\n            <label>Last Name</label>\r\n            <input type=\"text\" class=\"vm-input\" value.bind=\"nestedExample.secondNested.lastName\" />\r\n        </vm-form-field>\r\n        <vm-form-field name=\"email\"class=\"col-xs-12 col-md-6\">\r\n            <label>Email</label>\r\n            <input type=\"text\" class=\"vm-input\" value.bind=\"nestedExample.secondNested.email\" />\r\n        </vm-form-field>\r\n        <vm-form-field name=\"hasNickname\" class=\"col-xs-12 col-md-6\">\r\n            <vm-checkbox name=\"secondNestedHasNickname\" checked.two-way=\"nestedExample.secondNested.hasNickname\">Use Nickname</vm-checkbox>\r\n        </vm-form-field>\r\n        <vm-form-field\r\n            class=\"col-xs-12 col-md-6 col-md-offset-6\"\r\n            show.bind=\"!!nestedExample.secondNested.hasNickname\"\r\n            name=\"nickname\"\r\n            >\r\n            <label>Nickname</label>\r\n            <input type=\"text\"\r\n                class=\"vm-input\"\r\n                value.bind=\"nestedExample.secondNested.nickname\"\r\n            />\r\n        </vm-form-field>\r\n    </vm-form>\r\n\r\n</template>";});;
define('vm-input-demo/vm-input-demo.component',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMInputDemoComponent = void 0;
  class VMInputDemoComponent {
    constructor() {}
  }
  _exports.VMInputDemoComponent = VMInputDemoComponent;
});;
define('text!vm-input-demo/vm-input-demo.component.html',[],function(){return "<template>\r\n    <div class=\"vm-input-demo\">\r\n        <div class=\"form-group\">\r\n            <label for=\"regular\">Input</label>\r\n            <input id=\"regular\" class=\"vm-input\" type=\"text\" />\r\n        </div>\r\n\r\n        <div class=\"form-group\">\r\n            <label for=\"regular\">Input - Disabled</label>\r\n            <input id=\"regular\" class=\"vm-input\" type=\"text\" disabled />\r\n        </div>\r\n\r\n        <div class=\"form-group\">\r\n            <label for=\"textarea\">Textarea</label>\r\n            <textarea id=\"textarea\" class=\"vm-input\" rows=\"5\"></textarea>\r\n        </div>\r\n\r\n        <div class=\"form-group\">\r\n            <label for=\"textarea\">Textarea - Disabled</label>\r\n            <textarea id=\"textarea\" class=\"vm-input\" rows=\"5\" disabled></textarea>\r\n        </div>\r\n\r\n        <div class=\"form-group\">\r\n            <label for=\"textarea\">Textarea - No Resize</label>\r\n            <textarea id=\"textarea\" class=\"vm-input no-resize\" rows=\"5\"></textarea>\r\n        </div>\r\n    </div>\r\n</template>\r\n";});;
define('vm-pagination-demo/vm-pagination-demo.component',["exports", "tslib", "aurelia-framework", "resources"], function (_exports, _tslib, _aureliaFramework, _resources) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMPaginationDemoComponent = void 0;
  const DEMO_ITEMS = 100;
  let VMPaginationDemoComponent = class VMPaginationDemoComponent {
    constructor(pagerService) {
      this.pagerService = pagerService;
      this.alertTypes = _resources.AlertTypes;
      this.items = [];
      this.pager = new _resources.VMPager();
      this.pageSize = 10;
    }
    attached() {
      for (let i = 1; i <= DEMO_ITEMS; i++) {
        this.items.push(`Item ${i}`);
      }
      this.pager = this.pagerService.getPagerData(DEMO_ITEMS, 1, this.pageSize);
    }
  };
  _exports.VMPaginationDemoComponent = VMPaginationDemoComponent;
  _exports.VMPaginationDemoComponent = VMPaginationDemoComponent = (0, _tslib.__decorate)([(0, _tslib.__param)(0, (0, _aureliaFramework.inject)(_resources.VMPaginationService)), (0, _tslib.__metadata)("design:paramtypes", [Object])], VMPaginationDemoComponent);
});;
define('text!vm-pagination-demo/vm-pagination-demo.component.css',[],function(){return ".vm-pagination-demo{width:500px}";});;
define('text!vm-pagination-demo/vm-pagination-demo.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-pagination-demo.component.css\"></require>\r\n\r\n    <vm-alert class=\"m-b\" type.one-time=\"alertTypes.Info\">\r\n        NOTE: The double left and double right icons are missing within the testbed, which is why there are the flashing error icons in\r\n        their place. However, these icons work fine within the main repo.\r\n    </vm-alert>\r\n\r\n    <div class=\"vm-pagination-demo\">\r\n        <template repeat.for=\"item of items\">\r\n            <div if.bind=\"(($index + 1) > ((pager.currentPage - 1) * pageSize)) && (($index + 1) <= (pager.currentPage * pageSize))\">\r\n                ${item}\r\n            </div>\r\n        </template>\r\n        <vm-pagination pager.bind=\"pager\"></vm-pagination>\r\n    </div>\r\n</template>\r\n";});;
define('vm-search-demo/vm-search-demo.component',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMSearchDemoComponent = void 0;
  class VMSearchDemoComponent {
    constructor() {
      this.autocompleteItems = ['Ben', 'Hunter', 'David', 'Jasper', 'Jasmine', 'Dave', 'Benjamin'];
    }
    log($event) {
      window.alert('searched: ' + $event);
    }
  }
  _exports.VMSearchDemoComponent = VMSearchDemoComponent;
});;
define('text!vm-search-demo/vm-search-demo.component.html',[],function(){return "<template>\r\n    <div class=\"form-group\">\r\n        <label>Search</label>\r\n        <vm-search search.call=\"log($event)\"></vm-search>\r\n    </div>\r\n\r\n    <div class=\"form-group\">\r\n        <label>Search on Keypress</label>\r\n        <vm-search search-on-keypress.one-time=\"true\" search.call=\"log($event)\"></vm-search>\r\n    </div>\r\n\r\n    <div class=\"form-group\">\r\n        <label>Disabled Search</label>\r\n        <vm-search is-disabled.one-time=\"true\" search.call=\"log($event)\"></vm-search>\r\n    </div>\r\n\r\n    <div class=\"form-group\">\r\n        <label>Search w/ Autocomplete</label>\r\n        <vm-search autocomplete-items.to-view=\"autocompleteItems\" search.call=\"log($event)\"></vm-search>\r\n    </div>\r\n\r\n    <div class=\"form-group\">\r\n        <label>\"vm-autocomplete\"</label>\r\n        <vm-search\r\n            autocomplete-items.to-view=\"autocompleteItems\"\r\n            placeholder-text=\"\"\r\n            show-icon.one-time=\"false\"\r\n            search.call=\"log($event)\"\r\n        ></vm-search>\r\n    </div>\r\n</template>\r\n";});;
define('vm-tabs-demo/vm-tabs-demo-tab.component',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMTabsDemoTabComponent = void 0;
  class VMTabsDemoTabComponent {
    constructor() {}
  }
  _exports.VMTabsDemoTabComponent = VMTabsDemoTabComponent;
});;
define('text!vm-tabs-demo/vm-tabs-demo-tab.component.html',[],function(){return "<template></template>\r\n";});;
define('vm-tabs-demo/vm-tabs-demo.component',["exports", "resources"], function (_exports, _resources) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMTabsDemoComponent = void 0;
  class VMTabsDemoComponent {
    constructor() {
      this.vmAlertTypes = _resources.AlertTypes;
    }
    configureRouter(config, router) {
      config.map([{
        route: ['', 'tab-demo-1'],
        moduleId: 'vm-tabs-demo/vm-tabs-demo-tab.component',
        name: 'tab-demo-1',
        nav: true,
        title: 'Tab 1'
      }, {
        route: 'tab-demo-2',
        moduleId: 'vm-tabs-demo/vm-tabs-demo-tab.component',
        name: 'tab-demo-2',
        nav: true,
        title: 'Tab 2'
      }]);
      this.router = router;
    }
  }
  _exports.VMTabsDemoComponent = VMTabsDemoComponent;
});;
define('text!vm-tabs-demo/vm-tabs-demo.component.html',[],function(){return "<template>\r\n    <vm-alert class=\"m-b\" type.one-time=\"vmAlertTypes.Info\">\r\n        NOTE: This demo is for demonstration only, meaning tab functionality is limited here. Please just use this for testing appearance\r\n        and test functionality within the main repo instead.\r\n    </vm-alert>\r\n\r\n    <div class=\"form-group\">\r\n        <label>Primary Tabs</label>\r\n        <vm-tabs primary></vm-tabs>\r\n    </div>\r\n    <div class=\"form-group\">\r\n        <label>Secondary Tabs</label>\r\n        <vm-tabs secondary></vm-tabs>\r\n    </div>\r\n    <div class=\"form-group\">\r\n        <label>Vertical Tabs</label>\r\n        <vm-tabs vertical></vm-tabs>\r\n    </div>\r\n\r\n    <router-view></router-view>\r\n</template>\r\n";});;
define('vm-toggle-demo/vm-toggle-demo.component',["exports"], function (_exports) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMToggleDemoComponent = void 0;
  class VMToggleDemoComponent {
    constructor() {}
  }
  _exports.VMToggleDemoComponent = VMToggleDemoComponent;
});;
define('text!vm-toggle-demo/vm-toggle-demo.component.css',[],function(){return ".vm-toggle-demo{align-items:center;display:grid;gap:20px;grid-auto-flow:column;grid-template-columns:repeat(2,min-content);grid-template-rows:repeat(5,min-content)}.vm-toggle-demo .vm-toggle-demo--label{border-bottom:1px solid #ccc;font-size:14px;font-weight:700;padding-bottom:5px;text-align:center;width:80px}.vm-toggle-demo vm-toggle{justify-self:center}";});;
define('text!vm-toggle-demo/vm-toggle-demo.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-toggle-demo.component.css\"></require>\r\n\r\n    <div class=\"vm-toggle-demo\">\r\n        <label class=\"vm-toggle-demo--label\">Default</label>\r\n        <vm-toggle></vm-toggle>\r\n        <vm-toggle value.one-time=\"true\"></vm-toggle>\r\n        <vm-toggle is-disabled.one-time=\"true\"></vm-toggle>\r\n        <vm-toggle is-disabled.one-time=\"true\" value.one-time=\"true\"></vm-toggle>\r\n\r\n        <label class=\"vm-toggle-demo--label\">Small</label>\r\n        <vm-toggle is-small.one-time=\"true\"></vm-toggle>\r\n        <vm-toggle is-small.one-time=\"true\" value.one-time=\"true\"></vm-toggle>\r\n        <vm-toggle is-disabled.one-time=\"true\" is-small.one-time=\"true\"></vm-toggle>\r\n        <vm-toggle is-disabled.one-time=\"true\" is-small.one-time=\"true\" value.one-time=\"true\"></vm-toggle>\r\n    </div>\r\n</template>\r\n";});;
define('vm-tooltip-demo/vm-tooltip-demo.component',["exports", "resources"], function (_exports, _resources) {
  "use strict";

  _exports.__esModule = true;
  _exports.VMTooltipDemoComponent = void 0;
  class VMTooltipDemoComponent {
    constructor() {
      this.tooltipText = 'This is a demo tooltip.';
      this.vmTooltipPins = _resources.VMTooltipPins;
      this.vmTooltipPositions = _resources.VMTooltipPositions;
    }
  }
  _exports.VMTooltipDemoComponent = VMTooltipDemoComponent;
});;
define('text!vm-tooltip-demo/vm-tooltip-demo.component.css',[],function(){return ".vm-tooltip-demo{display:grid;gap:50px;grid-template-columns:repeat(2,min-content);white-space:nowrap}";});;
define('text!vm-tooltip-demo/vm-tooltip-demo.component.html',[],function(){return "<template>\r\n    <require from=\"./vm-tooltip-demo.component.css\"></require>\r\n\r\n    <div class=\"vm-tooltip-demo\">\r\n        <span>\r\n            <vm-tooltip text.one-time=\"tooltipText\">\r\n                <span>Pin Left/Position Bottom (Default)</span>\r\n            </vm-tooltip>\r\n        </span>\r\n\r\n        <span>\r\n            <vm-tooltip pin.one-time=\"vmTooltipPins.Right\" text.one-time=\"tooltipText\">\r\n                <span>Pin Right/Position Bottom</span>\r\n            </vm-tooltip>\r\n        </span>\r\n\r\n        <span>\r\n            <vm-tooltip position.one-time=\"vmTooltipPositions.Top\" text.one-time=\"tooltipText\">\r\n                <span>Pin Left/Position Top</span>\r\n            </vm-tooltip>\r\n        </span>\r\n\r\n        <span>\r\n            <vm-tooltip pin.one-time=\"vmTooltipPins.Right\" position.one-time=\"vmTooltipPositions.Top\" text.one-time=\"tooltipText\">\r\n                <span>Pin Right/Position Top</span>\r\n            </vm-tooltip>\r\n        </span>\r\n\r\n        <span>\r\n            <vm-tooltip position.one-time=\"vmTooltipPositions.Right\" text.one-time=\"tooltipText\">\r\n                <span>Position Right</span>\r\n            </vm-tooltip>\r\n        </span>\r\n\r\n        <span>\r\n            <vm-tooltip position.one-time=\"vmTooltipPositions.Left\" text.one-time=\"tooltipText\">\r\n                <span>Position Left</span>\r\n            </vm-tooltip>\r\n        </span>\r\n    </div>\r\n</template>\r\n";});
//# sourceMappingURL=app-bundle.js.map
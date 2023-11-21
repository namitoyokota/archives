/*
	Leaflet.contextmenu, a context menu for Leaflet.
	(c) 2015, Adam Ratcliffe, GeoSmart Maps Limited

	@preserve
*/

(function(factory) {
	// Packaging/modules magic dance
	var L;
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['leaflet'], factory);
	} else if (typeof module === 'object' && typeof module.exports === 'object') {
		// Node/CommonJS
		L = require('leaflet');
		module.exports = factory(L);
	} else {
		// Browser globals
		if (typeof window.L === 'undefined') {
			throw new Error('Leaflet must be loaded first');
		}
		factory(window.L);
	}
})(function(L) {
L.Map.mergeOptions({
    contextmenuItems: [],
    showCurrentLocation: true
});

L.Map.ContextMenu = L.Handler.extend({
    _touchstart: L.Browser.msPointer ? 'MSPointerDown' : L.Browser.pointer ? 'pointerdown' : 'touchstart',
    statics: {
        BASE_CLS: 'leaflet-contextmenu'
    },
    
    initialize: function (map) {
        L.Handler.prototype.initialize.call(this, map);
        
        this._items = [];
        this._visible = false;

        var container = this._container = L.DomUtil.create('div', L.Map.ContextMenu.BASE_CLS, map._container);
        container.style.zIndex = 10000;
        container.style.position = 'absolute';

        var subcontainer = this._subcontainer = L.DomUtil.create('div', L.Map.ContextMenu.BASE_CLS, map._container);
        subcontainer.style.zIndex = 10000;
        subcontainer.style.position = 'absolute';

        var copyMsgContainer = this._copyMsgContainer = L.DomUtil.create('div', 'leaflet-contextmenu-copy-msg closed', map._container);
        copyMsgContainer.style.zIndex = 10000;
        copyMsgContainer.style.position = 'absolute';
        copyMsgContainer.style.left = `${((this._map._container.clientWidth - copyMsgContainer.clientWidth)/2)}px`;
        var html = '<img class="leaflet-contextmenu-copy-msg-icon" src="assets/commonmap-core/images/layout/text-copied.svg" />'; 
        html += `<div class="leaflet-contextmenu-copy-msg-text">${this._map.options.copyCoordsMsg}</div>`;
        html +=  '<img class="leaflet-contextmenu-copy-msg-close-icon" src="assets/commonmap-core/images/layout/text-copied-close.png" />';

        copyMsgContainer.innerHTML = html;

        L.DomEvent
            .on(copyMsgContainer, 'mousedown', L.DomEvent.stopPropagation)
            .on(copyMsgContainer, 'click', this._closeCopyToClipboardMsg, this);


        if (map.options.contextmenuWidth) {
            container.style.width = map.options.contextmenuWidth + 'px';
            subcontainer.style.width = map.options.contextmenuWidth + 'px';
        }


        this._createItems(this._container, this._map.options.contextmenuItems, false);

        L.DomEvent
            .on(container, 'click', L.DomEvent.stop)
            .on(container, 'mousedown', L.DomEvent.stop)
            .on(container, 'dblclick', L.DomEvent.stop)
            .on(container, 'contextmenu', L.DomEvent.stop)

            .on(subcontainer, 'click', L.DomEvent.stop)
            .on(subcontainer, 'mousedown', L.DomEvent.stop)
            .on(subcontainer, 'dblclick', L.DomEvent.stop)
            .on(subcontainer, 'contextmenu', L.DomEvent.stop);
        },

    addHooks: function () {
        var container = this._map.getContainer();

        L.DomEvent
            // .on(container, 'mouseleave', this._hide, this)
            .on(document, 'keydown', this._onKeyDown, this);

        if (L.Browser.touch) {
            L.DomEvent.on(document, this._touchstart, this._hide, this);
        }

        this._map.on({
            contextmenu: this._show,
            mousedown: this._hide,
            movestart: this._hide,
            zoomstart: this._hide
        }, this);
    },

    removeHooks: function () {
        var container = this._map.getContainer();

        L.DomEvent
            .off(container, 'mouseleave', this._hide, this)
            .off(document, 'keydown', this._onKeyDown, this);

        if (L.Browser.touch) {
            L.DomEvent.off(document, this._touchstart, this._hide, this);
        }

        this._map.off({
            contextmenu: this._show,
            mousedown: this._hide,
            movestart: this._hide,
            zoomstart: this._hide
        }, this);
    },

    showAt: function (point, data) {
        if (point instanceof L.LatLng) {
            point = this._map.latLngToContainerPoint(point);
        }
        this._showAtPoint(point, data);
    },

    showSubmenu: function () {
        this._setSubmenuPosition();

        this._subcontainer.style.display = 'block';
    },

    hide: function () {
        this._hide();
    },

    addItem: function (options) {
        return this.insertItem(options);
    },

    insertItem: function (options, index) {
        index = index !== undefined ? index: this._items.length;

        var item = this._createItem(this._container, options, index);

        this._items.push(item);

        this._sizeChanged = true;

        this._map.fire('contextmenu.additem', {
            contextmenu: this,
            el: item.el,
            index: index
        });

        return item.el;
    },

    insertSubmenuItem: function (options, index) {
        index = index !== undefined ? index: this._items.length;

        var item = this._createItem(this._subcontainer, options, index);

        this._items.push(item);

        this._sizeChanged = true;

        this._map.fire('contextmenu.additem', {
            contextmenu: this,
            el: item.el,
            index: index
        });

        return item.el;
    },

    removeItem: function (item) {
        var container = this._container;
        if (!isNaN(item)) {
            item = container.children[item];
        }

        if (item) {
            this._removeItem(L.Util.stamp(item), this._container);

            this._sizeChanged = true;

            this._map.fire('contextmenu.removeitem', {
                contextmenu: this,
                el: item
            });

            return item;
        }

        return null;
    },

    removeSubmenuItem: function (subItem) {
        var subContainer = this._subcontainer;
        if (!isNaN(subItem)) {
            subItem = subContainer.children[item];
        }

        if (subItem) {
            this._removeItem(L.Util.stamp(subItem), this._subcontainer);

            this._sizeChanged = true;
            return subItem;
        }

        return null;
    },

    removeAllItems: function () {
        var items = this._container.children,
            item;

        while (items.length) {
            item = items[0];
            this._removeItem(L.Util.stamp(item), this._container);
        }

        var subItems = this._subcontainer.children;
        while (items.length) {
            item = subItems[0];
            this._removeItem(L.Util.stamp(subItems), this._subcontainer);
        }

        return items;
    },

    hideAllItems: function () {
        var item, i, l;

        for (i = 0, l = this._items.length; i < l; i++) {
            item = this._items[i];
            item.el.style.display = 'none';
        }
    },

    showAllItems: function () {
        var item, i, l;

        for (i = 0, l = this._items.length; i < l; i++) {
            item = this._items[i];
            item.el.style.display = '';
        }
    },

    setDisabled: function (item, disabled) {
        var container = this._container,
        itemCls = L.Map.ContextMenu.BASE_CLS + '-item';

        if (!isNaN(item)) {
            item = container.children[item];
        }

        if (item && L.DomUtil.hasClass(item, itemCls)) {
            if (disabled) {
                L.DomUtil.addClass(item, itemCls + '-disabled');
                this._map.fire('contextmenu.disableitem', {
                    contextmenu: this,
                    el: item
                });
            } else {
                L.DomUtil.removeClass(item, itemCls + '-disabled');
                this._map.fire('contextmenu.enableitem', {
                    contextmenu: this,
                    el: item
                });
            }
        }
    },

    isVisible: function () {
        return this._visible;
    },

    refresh() {
        if (this._visible) {
            this._hide();
        }

        this.removeAllItems();
        this._createItems(this._container, this._map.options.contextmenuItems, false);
    },

    _copyToClipboard: function() {
        var el = this._items[0].el;

        var text = el.children[0].innerHTML;
        navigator.clipboard.writeText(text);

        L.DomUtil.removeClass(this._copyMsgContainer, 'closed');
        this._copyMsgContainer.style.top = `${this._map._container.clientHeight - 40}px`;
        setTimeout(() => this._closeCopyToClipboardMsg(), 3000);
    },

    _closeCopyToClipboardMsg: function() {
        L.DomUtil.addClass(this._copyMsgContainer, 'closed');        
    },

    _createItems: function (container, itemOptions, submenu) {
        var item,
            i, l;

        if (this._map.options.showCurrentLocation && !submenu) {
            var item = {
                text: '',
                index: 0,
                callback: this._copyToClipboard,
                context: this                  
             }
             this._items.push(this._createItem(container,item));
        }
        for (i = 0, l = itemOptions.length; i < l; i++) {
            this._items.push(this._createItem(container, itemOptions[i]));
        }
    },

    _createItem: function (container, options, index) {
        if (options.separator || options === '-') {
            return this._createSeparator(container, index);
        }

        var itemCls = 'leaflet-contextmenu-item',
            cls = options.disabled ? (itemCls + ' ' + 'disabled') : itemCls,
            el = this._insertElementAt('div', cls, container, index),
            icon = this._getIcon(options),
            iconCls = this._getIconCls(options),
            html = '',
            callback,
            parent = options.submenuItems && options.submenuItems.length > 0;

        callback = this._createEventHandler(el, options.callback, options.context, options.hideOnSelect, options.disabled);

        if (icon) {
            html = '<img class="leaflet-contextmenu-item-icon" src="' + icon + '"/>';
        } else if (iconCls) {
            html = '<span class="leaflet-contextmenu-item-icon ' + iconCls + '"></span>';
        }
        let title;
        if (options.tooltip) {
            title=` title="${options.tooltip}"`;
        }

        if (html) {
            html += '<span class="leaflet-contextmenu-item-text"';
        } else {
            html += '<span class="leaflet-contextmenu-item-text no-icon"';
        }
        if (title) {
            html += title;
        }

        html += '>' + options.text + '</span>';

        if (parent) {
            html += '<img class="leaflet-contextmenu-submenu-icon" src="assets/commonmap-core/images/layout/submenu-carat-icon.svg" />';
        } else {
            html += '<span class="leaflet-contextmenu-submenu-icon"></span>';
        }

        el.innerHTML = html;

        // L.DomEvent
        //    .on(el, 'mouseover', this._onItemMouseOver, this)
        //    .on(el, 'mouseout', this._onItemMouseOut, this)
        //    .on(el, 'mousedown', L.DomEvent.stopPropagation)
        //    .on(el, 'click', callback);
        L.DomEvent
            .on(el, 'mousedown', L.DomEvent.stopPropagation)
            .on(el, 'click', callback);

        if (L.Browser.touch) {
            L.DomEvent.on(el, this._touchstart, L.DomEvent.stopPropagation);
        }

        // Devices without a mouse fire "mouseover" on tap, but never “mouseout"
        if (!L.Browser.pointer) {
            L.DomEvent.on(el, 'click', this._onItemMouseOut, this);
        }

        return {
            id: L.Util.stamp(el),
            el: el,
            container: container,
            callback: callback,
            index: index,
            alwaysLast: options.alwaysLast
        };
    },

    _removeItem: function (id, container) {
        var item,
            el,
            i, l, callback;

        for (i = 0, l = this._items.length; i < l; i++) {
            item = this._items[i];

            if (item.id === id) {
                el = item.el;
                callback = item.callback;

                if (callback) {
                    L.DomEvent
                        .off(el, 'mouseover', this._onItemMouseOver, this)
                        .off(el, 'mouseover', this._onItemMouseOut, this)
                        .off(el, 'mousedown', L.DomEvent.stopPropagation)
                        .off(el, 'click', callback);

                    if (L.Browser.touch) {
                        L.DomEvent.off(el, this._touchstart, L.DomEvent.stopPropagation);
                    }

                    if (!L.Browser.pointer) {
                        L.DomEvent.on(el, 'click', this._onItemMouseOut, this);
                    }
                }

                container.removeChild(el);
                this._items.splice(i, 1);

                return item;
            }
        }
        return null;
    },

    _createSeparator: function (container, index) {
        var el = this._insertElementAt('div', L.Map.ContextMenu.BASE_CLS + '-separator', container, index);

        return {
            id: L.Util.stamp(el),
            el: el
        };
    },

    _createCurLoc: function (container, options, index) {

        var itemCls = 'leaflet-contextmenu-item',
            cls = itemCls,
            el = this._insertElementAt('div', cls, container, index),
            // icon = this._getIcon(options),
            // iconCls = this._getIconCls(options),
            html = '';

        // if (icon) {
        //     html = '<img class="leaflet-contextmenu-item-icon" src="' + icon + '"/>';
        // } else if (iconCls) {
        //     html = '<span class="leaflet-contextmenu-item-icon" ' + iconCls + '"></span>';
        // }

        if (html) {
            el.innerHTML = html + '<span class="leaflet-contextmenu-item-text">' + options.text + '</span>';
        } else {
            el.innerHTML = html + '<span class="leaflet-contextmenu-item-text no-icon">' + options.text + '</span>';
        }

        // L.DomEvent
        //    .on(el, 'mouseover', this._onItemMouseOver, this)
        //    .on(el, 'mouseout', this._onItemMouseOut, this)
        //    .on(el, 'mousedown', L.DomEvent.stopPropagation)
        //    .on(el, 'click', callback);
        L.DomEvent
            .on(el, 'mousedown', L.DomEvent.stopPropagation);

        if (L.Browser.touch) {
            L.DomEvent.on(el, this._touchstart, L.DomEvent.stopPropagation);
        }


        return {
            id: L.Util.stamp(el),
            el: el
        };
    },

    _createEventHandler: function (el, func, context, hideOnSelect, disabled) {
        var me = this,
            map = this._map,
            disabledCls = L.Map.ContextMenu.BASE_CLS + '-item-disabled',
            hideOnSelect = (hideOnSelect !== undefined) ? hideOnSelect : true;

        return function (e) {
            if (L.DomUtil.hasClass(el, disabledCls) || disabled) {
                return;
            }

            if (hideOnSelect) {
                me._hide();
            }

            if (func) {
                func.call(context || map, me._showLocation);
            }

            me._map.fire('contextmenu.select', {
                contextmenu: me,
                el: el
            });
        };
    },

    _insertElementAt: function (tagName, className, container, index) {
        var refEl,
            el = document.createElement(tagName);

        el.className = className;
        var item;
        if (index !== undefined) {
            item = this._items.find((i) => i.index == index && i.container == container);
            if (item) {
                refEl = item.el;
            }
            // refEl = container.children[index];
        }

        if (refEl) {
            container.insertBefore(el, refEl);
        } else {
            item = this._items.find((i) => i.alwaysLast && i.container == container);
            if (item) {
                container.insertBefore(el, item.el);
            } else {
                container.appendChild(el);
            }
        }

        return el;
    },

    _show: function (e) {
        this._showAtPoint(e.containerPoint, e);
    },

    _showAtPoint: function (pt, data) {
        if (this._items.length) {
            var map = this._map,
            layerPoint = map.containerPointToLayerPoint(pt),
            latlng = map.layerPointToLatLng(layerPoint),
            event = L.extend(data || {}, {contextmenu: this});
            
            this._showLocation = {
                latlng: latlng,
                layerPoint: layerPoint,
                containerPoint: pt,
                event: data
            };

            if (this._map.options.showCurrentLocation) {
                var el = this._items[0].el;
                var latLngStr = `${this._roundNumber(latlng.lat, 6)}, ${this._roundNumber(latlng.lng, 6)}`;
                el.innerHTML = `<span class="leaflet-contextmenu-item-text no-icon" title="${this._map.options.copyCoordsTooltip}">${latLngStr}</span>`;

            }

            if (data && data.relatedTarget){
                this._showLocation.relatedTarget = data.relatedTarget;
            }

            this._setPosition(pt);

            if (!this._visible) {
                this._container.style.display = 'block';
                this._visible = true;
            }

            this._map.fire('contextmenu.show', event);
        }
    },

    _roundNumber: function(num, dec) {
        return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    },

    _hide: function () {
        if (this._visible) {
            this._visible = false;
            this._container.style.display = 'none';
            this._subcontainer.style.display = 'none';
            this._map.fire('contextmenu.hide', {contextmenu: this});
        }
    },

    _getIcon: function (options) {
        return L.Browser.retina && options.retinaIcon || options.icon;
    },

    _getIconCls: function (options) {
        return L.Browser.retina && options.retinaIconCls || options.iconCls;
    },

    _setPosition: function (pt) {
        var mapSize = this._map.getSize(),
            container = this._container,
            containerSize = this._getElementSize(container),
            anchor;

        container._size = containerSize;
        if (this._map.options.contextmenuAnchor) {
            anchor = L.point(this._map.options.contextmenuAnchor);
            pt = pt.add(anchor);
        }

        container._leaflet_pos = pt;

        if (pt.x + containerSize.x > mapSize.x) {
            container.style.left = 'auto';
            container.style.right = Math.min(15, mapSize.x - containerSize.x - 1) + 'px';
            // container.style.right = Math.min(Math.max(mapSize.x - pt.x, 0), mapSize.x - containerSize.x - 1) + 'px';
        } else {
            container.style.left = Math.max(pt.x, 0) + 'px';
            container.style.right = 'auto';
        }

        if (pt.y + containerSize.y > mapSize.y) {
            container.style.top = 'auto';
            container.style.bottom = Math.min(20, mapSize.y - containerSize.y - 1) + 'px';
            // container.style.bottom = Math.min(Math.max(mapSize.y - pt.y, 0), mapSize.y - containerSize.y - 1) + 'px';
        } else {
            container.style.top = Math.max(pt.y, 0) + 'px';
            container.style.bottom = 'auto';
        }
    },

    _setSubmenuPosition: function () {
        var mapSize = this._map.getSize(),
            container = this._container,
            subcontainer = this._subcontainer,
            subcontainerSize = this._getElementSize(subcontainer),
            containerSize = container._size;

        var pt;
        pt = L.point(container._leaflet_pos);
        pt.x += containerSize.x + 5;
        pt.y += 10;
        subcontainer._leaflet_pos = pt;

        if (pt.x + subcontainerSize.x > mapSize.x) {
            subcontainer.style.left = 'auto';
            subcontainer.style.right = Math.min(10, mapSize.x - containerSize.x - 1) + 'px';
            // subcontainer.style.right = Math.min(Math.max(mapSize.x - pt.x, 0), mapSize.x - containerSize.x - 1) + 'px';
        } else {
            subcontainer.style.left = Math.max(pt.x, 0) + 'px';
            subcontainer.style.right = 'auto';
        }

        if (pt.y + containerSize.y > mapSize.y) {
            subcontainer.style.top = 'auto';
            subcontainer.style.bottom = Math.min(15, mapSize.y - containerSize.y - 1) + 'px';
            // subcontainer.style.bottom = Math.min(Math.max(mapSize.y - pt.y, 0), mapSize.y - containerSize.y - 1) + 'px';
        } else {
            subcontainer.style.top = Math.max(pt.y, 0) + 'px';
            subcontainer.style.bottom = 'auto';
        }
    },

    _getElementSize: function (el) {
        var size = this._size,
            initialDisplay = el.style.display;

        if (!size || this._sizeChanged) {
            size = {};

            el.style.left = '-999999px';
            el.style.right = 'auto';
            el.style.display = 'block';

            size.x = el.offsetWidth;
            size.y = el.offsetHeight;

            el.style.left = 'auto';
            el.style.display = initialDisplay;

            this._sizeChanged = false;
        }

        return size;
    },

    _onKeyDown: function (e) {
        var key = e.keyCode;

        // If ESC pressed and context menu is visible hide it
        if (key === 27) {
            this._hide();
        }
    },

    _onItemMouseOver: function (e) {
        L.DomUtil.addClass(e.target || e.srcElement, 'over');
    },

    _onItemMouseOut: function (e) {
        L.DomUtil.removeClass(e.target || e.srcElement, 'over');
    }
});

L.Map.addInitHook('addHandler', 'contextmenu', L.Map.ContextMenu);
L.Mixin.ContextMenu = {
    bindContextMenu: function (options) {
        L.setOptions(this, options);
        this._initContextMenu();

        return this;
    },

    unbindContextMenu: function (){
        this.off('contextmenu', this._showContextMenu, this);

        return this;
    },

    addContextMenuItem: function (item) {
            this.options.contextmenuItems.push(item);
    },

    removeContextMenuItemWithIndex: function (index) {
        var items = [];
        for (var i = 0; i < this.options.contextmenuItems.length; i++) {
            if (this.options.contextmenuItems[i].index == index){
                items.push(i);
            }
        }
        var elem = items.pop();
        while (elem !== undefined) {
            this.options.contextmenuItems.splice(elem,1);
            elem = items.pop();
        }
    },

    replaceContextMenuItem: function (item) {
        this.removeContextMenuItemWithIndex(item.index);
        this.addContextMenuItem(item);
    },

    _initContextMenu: function () {
        this._items = [];
        this._submenuItems = [];
        this._submenuOpen = null;

        this.on('contextmenu', this._showContextMenu, this);
    },

    _showContextMenu: function (e) {
        var itemOptions,
            data, pt, i, l;

        if (this._map.contextmenu) {
            data = L.extend({relatedTarget: this}, e);

            pt = this._map.mouseEventToContainerPoint(e.originalEvent);

            if (!this.options.contextmenuInheritItems) {
                this._map.contextmenu.hideAllItems();
            }

            for (i = 0, l = this.options.contextmenuItems.length; i < l; i++) {
                itemOptions = this.options.contextmenuItems[i];
                if(itemOptions.submenuItems && itemOptions.submenuItems.length > 0) {
                    itemOptions.callback = () => { this._openSubmenu(itemOptions)};
                    itemOptions.context = this;
                    itemOptions.hideOnSelect = false;
                }
                this._items.push(this._map.contextmenu.insertItem(itemOptions, itemOptions.index));
            }

            const contextMenu = this._map.contextmenu;
            this._map.once('contextmenu.hide', () => { 
                this._hideContextMenu(contextMenu, this)
            }, this);
            L.DomEvent.stopPropagation(e);
            this._map.contextmenu.showAt(pt, data);
        }
    },

    _hideContextMenu: function (contextMenu) {
        var i, l;

        for (i = 0, l = this._items.length; i < l; i++) {
            contextMenu.removeItem(this._items[i]);
        }
        this._items.length = 0;

        if (!this.options.contextmenuInheritItems) {
            contextMenu.showAllItems();
        }

        this._hideSubmenu(contextMenu);
    },

    _hideSubmenu: function (contextMenu) {
        var i, l;

        for (i = 0, l = this._submenuItems.length; i < l; i++) {
            contextMenu.removeSubmenuItem(this._submenuItems[i]);
        }

        this._submenuItems.length = 0;

        this._submenuOpen = null;
    },

    _openSubmenu: function (parentItemOptions) {
        if (this._submenuOpen && this._submenuOpen !== parentItemOptions) {
            this._hideSubmenu(this._map.contextmenu);
        } 

        if (this._submenuItems.length == 0) {
            for (i = 0, l = parentItemOptions.submenuItems.length; i < l; i++) {
                var itemOptions = parentItemOptions.submenuItems[i];
                this._submenuItems.push(this._map.contextmenu.insertSubmenuItem(itemOptions, itemOptions.index));
            }
    
            this._map.contextmenu.showSubmenu();
            this._submenuOpen = parentItemOptions;
        }

    }, 


};

var classes = [L.Marker, L.Path],
    defaultOptions = {
        contextmenu: false,
        contextmenuItems: [],
        contextmenuInheritItems: true
    },
    cls, i, l;

for (i = 0, l = classes.length; i < l; i++) {
    cls = classes[i];

    // L.Class should probably provide an empty options hash, as it does not test
    // for it here and add if needed
    if (!cls.prototype.options) {
        cls.prototype.options = defaultOptions;
    } else {
        cls.mergeOptions(defaultOptions);
    }

    cls.addInitHook(function () {
        if (this.options.contextmenu) {
            this._initContextMenu();
        }
    });

    cls.include(L.Mixin.ContextMenu);
}
return L.Map.ContextMenu;
});

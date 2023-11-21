/*
    Extends Leaflet.draw 1.0.4, a plugin that adds drawing and editing tools to Leaflet powered maps.
    (c) 2012-2017, Jacob Toye, Jon West, Smartrak, Leaflet

    https://github.com/Leaflet/Leaflet.draw
    http://leafletjs.com
 */
(function (window, document, undefined) {
    L.drawVersion = "1.0.0";
    /**
     * @class L.Draw
     * @aka Draw
     *
     * To add the draw toolbar set the option drawControl: true in the map options.
     *
     * ### Adding the edit toolbar
     * To use the edit toolbar you must initialize the Leaflet.draw control and manually add it to the map.
     *
     * The key here is the featureGroup option. This tells the plugin which FeatureGroup contains the layers that
     * should be editable. The featureGroup can contain 0 or more features with geometry types Point, LineString, and Polygon.
     * Leaflet.draw does not work with multigeometry features such as MultiPoint, MultiLineString, MultiPolygon,
     * or GeometryCollection. If you need to add multigeometry features to the draw plugin, convert them to a
     * FeatureCollection of non-multigeometries (Points, LineStrings, or Polygons).
     */
    L.Draw = {};

    /**
     * @class L.drawLocal
     * @aka L.drawLocal
     *
     * The core toolbar class of the API — it is used to create the toolbar ui
     *
     * The default state for the control is the draw toolbar just below the zoom control.
     * This will allow map users to draw vectors and markers.
     * **Please note the edit toolbar is not enabled by default.**
     */
    L.drawLocal = {
        // format: {
        // 	numeric: {
        // 		delimiters: {
        // 			thousands: ',',
        // 			decimal: '.'
        // 		}
        // 	}
        // },
        draw: {
            toolbar: {
                actions: {
                    title: 'Cancel drawing',
                    text: 'Cancel'
                },
                finish: {
                    title: 'Finish drawing',
                    text: 'Finish'
                },
                undo: {
                    title: 'Delete last point drawn',
                    text: 'Delete last point'
                },
                buttons: {
                    polyline: 'Draw a polyline',
                    polygon: 'Draw a polygon',
                    rectangle: 'Draw a rectangle',
                    circle: 'Draw a circle',
                    marker: 'Draw a marker',
                    circlemarker: 'Draw a circlemarker'
                }
            },
            handlers: {
                circle: {
                    tooltip: {
                        start: 'Click and drag to draw circle.'
                    }
                },
                circlemarker: {
                    tooltip: {
                        start: 'Click map to place circle marker.'
                    }
                },
                marker: {
                    tooltip: {
                        start: 'Click map to place marker.'
                    }
                },
                polygon: {
                    tooltip: {
                        start: 'Click to start drawing shape.',
                        cont: 'Click to continue drawing shape.',
                        end: 'Click first point to close this shape.'
                    }
                },
                polyline: {
                    deleteError: '<strong>Error:</strong> Deleting marker will cause segments to cross.',
                    error: '<strong>Error:</strong> shape edges cannot cross!',
                    tooltip: {
                        start: 'Click to start drawing line.',
                        cont: 'Click to continue drawing line.',
                        end: 'Click last point to finish line.'
                    }
                },
                rectangle: {
                    tooltip: {
                        start: 'Click and drag to draw rectangle.'
                    }
                },
                simpleshape: {
                    tooltip: {
                        end: 'Release mouse to finish drawing.'
                    }
                }
            }
        },
        edit: {
            toolbar: {
                actions: {
                    save: {
                        title: 'Save changes',
                        text: 'Save'
                    },
                    cancel: {
                        title: 'Cancel editing, discards all changes',
                        text: 'Cancel'
                    },
                    clearAll: {
                        title: 'Clear all layers',
                        text: 'Clear All'
                    }
                },
                buttons: {
                    edit: 'Edit layers',
                    editDisabled: 'No layers to edit',
                    remove: 'Delete layers',
                    removeDisabled: 'No layers to delete'
                }
            },
            handlers: {
                remove: {
                    tooltip: {
                        text: 'Click on a feature to remove.'
                    }
                }
            }
        }
    };

    /**
     * ### Events
     * Once you have successfully added the Leaflet.draw plugin to your map you will want to respond to the different
     * actions users can initiate. The following events will be triggered on the map:
     *
     * @class L.Draw.Event
     * @aka Draw.Event
     *
     * Use `L.Draw.Event.EVENTNAME` constants to ensure events are correct.
     */
    L.Draw.Event = {};

    /**
     * @event draw:created: PolyLine; Polygon; Rectangle; Circle; Marker | String
     *
     * Layer that was just created.
     * The type of layer this is. One of: `polyline`; `polygon`; `rectangle`; `circle`; `marker`
     * Triggered when a new vector or marker has been created.
     *
     */
    L.Draw.Event.CREATED = 'draw:created';

    /**
     * @event draw:edited: LayerGroup
     *
     * List of all layers just edited on the map.
     * Triggered when layers in the FeatureGroup; initialized with the plugin; have been edited and saved.
     */
    L.Draw.Event.EDITED = 'draw:edited';

    /**
     * @event draw:deleted: LayerGroup
     *
     * List of all layers just removed from the map.
     * Triggered when layers have been removed (and saved) from the FeatureGroup.
     */
    L.Draw.Event.DELETED = 'draw:deleted';

    /**
     * @event draw:drawstart: String
     *
     * The type of layer this is. One of:`polyline`; `polygon`; `rectangle`; `circle`; `marker`
     * Triggered when the user has chosen to draw a particular vector or marker.
     */
    L.Draw.Event.DRAWSTART = 'draw:drawstart';

    /**
     * @event draw:drawstop: String
     *
     * The type of layer this is. One of: `polyline`; `polygon`; `rectangle`; `circle`; `marker`
     * Triggered when the user has finished a particular vector or marker.
     */
    L.Draw.Event.DRAWSTOP = 'draw:drawstop';

    /**
     * @event draw:drawvertex: LayerGroup
     *
     * List of all layers just being added from the map.
     * Triggered when a vertex is created on a polyline or polygon.
     */
    L.Draw.Event.DRAWVERTEX = 'draw:drawvertex';

    /**
     * @event draw:editstart: String
     *
     * The type of edit this is. One of: `edit`
     * Triggered when the user starts edit mode by clicking the edit tool button.
     */
    L.Draw.Event.EDITSTART = 'draw:editstart';

    /**
     * @event draw:editmove: ILayer
     *
     * Layer that was just moved.
     * Triggered as the user moves a rectangle; circle or marker.
     */
    L.Draw.Event.EDITMOVE = 'draw:editmove';

    /**
     * Event when an undoable event happens
     */
    L.Draw.Event.UNDOABLEEDIT = 'draw:undoableedit';

    /**
     * @event draw:editresize: ILayer
     *
     * Layer that was just moved.
     * Triggered as the user resizes a rectangle or circle.
     */
    L.Draw.Event.EDITRESIZE = 'draw:editresize';

    /**
     * @event draw:editvertex: LayerGroup
     *
     * List of all layers just being edited from the map.
     * Triggered when a vertex is edited on a polyline or polygon.
     */
    L.Draw.Event.EDITVERTEX = 'draw:editvertex';

    /**
     * @event draw:editstop: String
     *
     * The type of edit this is. One of: `edit`
     * Triggered when the user has finshed editing (edit mode) and saves edits.
     */
    L.Draw.Event.EDITSTOP = 'draw:editstop';

    /**
     * @event draw:deletestart: String
     *
     * The type of edit this is. One of: `remove`
     * Triggered when the user starts remove mode by clicking the remove tool button.
     */
    L.Draw.Event.DELETESTART = 'draw:deletestart';

    /**
     * @event draw:deletestop: String
     *
     * The type of edit this is. One of: `remove`
     * Triggered when the user has finished removing shapes (remove mode) and saves.
     */
    L.Draw.Event.DELETESTOP = 'draw:deletestop';

    /**
     * @event draw:toolbaropened: String
     *
     * Triggered when a toolbar is opened.
     */
    L.Draw.Event.TOOLBAROPENED = 'draw:toolbaropened';

    /**
     * @event draw:toolbarclosed: String
     *
     * Triggered when a toolbar is closed.
     */
    L.Draw.Event.TOOLBARCLOSED = 'draw:toolbarclosed';

    /**
     * @event draw:markercontext: String
     *
     * Triggered when a marker is right clicked.
     */
    L.Draw.Event.MARKERCONTEXT = 'draw:markercontext';

    /**
     * @event draw:radiuschange: String
     * Triggered when a circle's radius changes
     */
    L.Draw.Event.RADIUSCHANGE = 'draw:radiuschange';

    L.Draw = L.Draw || {};

    L.Mask = L.LayerGroup.extend({
        options: {
            color: "#62B4FF",
            weight: 1,
            fillColor: "#000000",
            fillOpacity: 0.35,
            interactive: true,
            pane: 'drawMask'
        },

        initialize: function (geojson, options) {
            L.Util.setOptions(this, options);

            this._layers = {};
            this._bounds = new L.LatLngBounds();
            this._maskPolygonCoords = [
                [
                    [-360, -90],
                    [-360, 90],
                    [360, 90],
                    [360, -90],
                ],
            ];

            if (geojson) {
                this.addData(geojson);
            }
        },

        addData: function (geojson) {
            this.addObject(geojson);
            this.addMaskLayer();
        },

        addObject: function (json) {
            var i, len;
            if (L.Util.isArray(json)) {
                for (i = 0, len = json.length; i < len; i++) {
                    this.addObject(json[i]);
                }
            } else {
                switch (json.type) {
                    case "FeatureCollection":
                        var features = json.features;
                        for (i = 0, len = features.length; i < len; i++) {
                            this.addObject(features[i]);
                        }
                        return;
                    case "Feature":
                        this.addObject(json.geometry);
                        return;
                    case "GeometryCollection":
                        var geometries = json.geometries;
                        for (i = 0, len = geometries.length; i < len; i++) {
                            this.addObject(geometries[i]);
                        }
                        return;
                    case "Polygon":
                        this.addRemovalPolygonCoordinates(json.coordinates);
                        return;
                    case "MultiPolygon":
                        this.addRemovalMultiPolygonCoordinates(json.coordinates);
                        return;
                    default:
                        return;
                }
            }
        },

        addRemovalPolygonCoordinates: function (coords) {
            for (var i = 0, len = coords.length; i < len; i++) {
                this._maskPolygonCoords.push(coords[i]);
                this.updateBounds(coords[i]);
            }
        },

        addRemovalMultiPolygonCoordinates: function (coords) {
            for (var i = 0, len = coords.length; i < len; i++) {
                this.addRemovalPolygonCoordinates(coords[i]);
            }
        },

        updateBounds: function (coords) {
            for (var i = 0, len = coords.length; i < len; i++) {
                var coords2 = coords[i];
                for (var j = 0, lenJ = coords2.length; j < lenJ; j++) {
                    this._bounds.extend(new L.latLng(coords2[1], coords2[0], coords2[2]));
                }
            }
        },

        addMaskLayer: function () {
            var latlngs = this.coordsToLatLngs(this._maskPolygonCoords);
            var layer = new L.Polygon(latlngs, this.options);
            this.addLayer(layer);
        },

        dimension: function (arr) {
            var j = 1;
            for (var i in arr) {
                if (arr[i] instanceof Array) {
                    if (1 + this.dimension(arr[i]) > j) {
                        j = j + this.dimension(arr[i]);
                    }
                }
            }
            return j;
        },

        coordsToLatLng: function (coords) {
            return new L.LatLng(coords[1], coords[0], coords[2]);
        },

        coordsToLatLngs: function (coords) {
            var latlngs = [];
            var dimensions = this.dimension(coords);
            for (var i = 0, len = coords.length, latlng; i < len; i++) {
                if (dimensions > 2) {
                    latlng = this.coordsToLatLngs(coords[i]);
                } else {
                    latlng = this.coordsToLatLng(coords[i]);
                }
                latlngs.push(latlng);
            }

            return latlngs;
        }
    });

    L.mask = function (geojson, options) {
        return new L.Mask(geojson, options);
    };

    L.BufferMask = L.Mask.extend({
        options: {
            pane: 'drawGeom'
        },

        _bufferLayer: null,

        addData: function (geojson) {
            this.addMaskLayer(geojson);
        },

        addMaskLayer: function (geojson) {
            var latlngs = this.coordsToLatLngs(geojson.geometry.coordinates);
            this._bufferLayer = new L.Polygon(latlngs, this.options);
            this.addLayer(this._bufferLayer);
        },

        setStyle: function (style) {
            if (this._bufferLayer) {
                this._bufferLayer.setStyle(style);
            }
        }, 
        setLatLngs: function (geoJSON) {
            if (this._bufferLayer) {
                var latLngs = this.coordsToLatLngs(geoJSON.coordinates);
                this._bufferLayer.setLatLngs(latLngs);
            }
        }
    });

    L.bufferMask = function (geojson, options) {
        return new L.BufferMask(geojson, options);
    }

    /**
     * @class L.Draw.Feature
     * @aka Draw.Feature
     */
    L.Draw.Feature = L.Handler.extend({

        // @method initialize(): void
        initialize: function (map, options) {
            this._map = map;
            this._container = map._container;
            this._dynamicPane = map._panes.drawGeom;
            this._popupPane = map._panes.drawPopup;

            // Merge default shapeOptions options with custom shapeOptions
            if (options && options.shapeOptions) {
                options.shapeOptions = L.Util.extend({}, this.options.shapeOptions, options.shapeOptions);
            }

            L.setOptions(this, options);

            var version = L.version.split('.');
            //If Version is >= 1.2.0
            if (parseInt(version[0], 10) === 1 && parseInt(version[1], 10) >= 2) {
                L.Draw.Feature.include(L.Evented.prototype);
            } else {
                L.Draw.Feature.include(L.Mixin.Events);
            }
        },

        // @method enable(): void
        // Enables this handler
        enable: function () {
            if (this._enabled) {
                return;
            }

            L.Handler.prototype.enable.call(this);
            this.fire('enabled', { handler: this.type });
            this._map.fire(L.Draw.Event.DRAWSTART, { layerType: this.type });
        },

        // @method disable(): void
        disable: function () {
            if (!this._enabled) {
                return;
            }

            L.Handler.prototype.disable.call(this);
            this._map.fire(L.Draw.Event.DRAWSTOP, { layerType: this.type });
            this.fire('disabled', { handler: this.type });
        },

        // @method addHooks(): void
        // Add's event listeners to this handler
        addHooks: function () {
            var map = this._map;

            if (map) {
                L.DomUtil.disableTextSelection();
                map.getContainer().focus();
                this._tooltip = new L.Draw.Tooltip(this._map);
            }
        },

        // @method removeHooks(): void
        // Removes event listeners from this handler
        removeHooks: function () {
            if (this._map) {
                L.DomUtil.enableTextSelection();
                this._tooltip.dispose();
                this._tooltip = null;
            }
        },

        // @method setOptions(object): void
        // Sets new options to this handler
        setOptions: function (options) {
            L.setOptions(this, options);
        },

        _fireCreatedEvent: function (layer) {
            this._map.fire(L.Draw.Event.CREATED, { layer: layer, layerType: this.type });
        },

        // Cancel drawing
        cancelDrawing: function (e) {
            this._map.fire('draw:canceled', { layerType: this.type });
            this.disable();
        }
    });

    /**
     * @class L.Draw.Polyline
     * @aka Draw.Polyline
     * @inherits L.Draw.Feature
     */
    L.Draw.Polyline = L.Draw.Feature.extend({
        statics: {
            TYPE: 'polyline'
        },
        Poly: L.Polyline,
        options: {
            repeatMode: false,
            drawError: {
                color: '#b00b00',
                timeout: 2500
            },
            icon: new L.DivIcon({
                iconSize: new L.Point(20, 20),
                className: 'main-marker'
            }),
            guidelineDistance: 20,
            maxGuideLineLength: 4000,
            shapeOptions: {
                allowIntersection: true,
                stroke: true,
                color: 'rgb(98, 180, 255)',
                weight: 4,
                opacity: 1,
                fill: false,
                clickable: true,
                pane: 'drawGeom'
            },
            zIndexOffset: 2000, // This should be > than the highest z-index any map layers
            factor: 1, // To change distance calculation
            maxPoints: 0, // Once this number of points are placed, finish shape
            type: 'polyline' // Used to distinguish between polyline and polygons;
        },

        // @method initialize(): void
        initialize: function (map, options) {
            if (!options) {
                options = {type: 'polyline'};
            }
            // Need to set this here to ensure the correct message is used.
            this.options.drawError.message = L.drawLocal.draw.handlers.polyline.error;
            this.options.drawError.deleteCoordError = L.drawLocal.draw.handlers.polyline.deleteCoordError;
            this.options.type = options.type;
            // Merge default drawError options with custom options
            if (options && options.drawError) {
                options.drawError = L.Util.extend({}, this.options.drawError, options.drawError);
            }

            // Save the type so super can fire, need to do this as cannot do this.TYPE :(
            this.type = L.Draw.Polyline.TYPE;

            L.Draw.Feature.prototype.initialize.call(this, map, options);
        },

        // @method addHooks(): void
        // Add listener hooks to this handler
        addHooks: function () {
            L.Draw.Feature.prototype.addHooks.call(this);
            if (this._map) {
                this._markers = [];
                this._markerGroup = new L.LayerGroup();
                this._map.addLayer(this._markerGroup);
                this._poly = new L.Polyline([], this.options.shapeOptions);
                this._poly._type = this.options.type;
                this._tooltip.updateContent(this._getTooltipText());

                // Make a transparent marker that will used to catch click events. These click
                // events will create the vertices. We need to do this so we can ensure that
                // we can create vertices over other map layers (markers, vector layers). We
                // also do not want to trigger any click handlers of objects we are clicking on
                // while drawing.
                if (!this._mouseMarker) {
                    this._mouseMarker = L.marker(this._map.getCenter(), {
                        icon: L.divIcon({
                            className: 'leaflet-mouse-marker',
                            iconAnchor: [20, 20],
                            iconSize: [40, 40],
                            pane: 'drawMarkers'
                        }),
                        opacity: 0,
                        zIndexOffset: this.options.zIndexOffset
                    });
                }

                this._mouseMarker
                    .on('mouseout', this._onMouseOut, this)
                    .on('mousemove', this._onMouseMove, this) // Necessary to prevent 0.8 stutter
                    .on('mousedown', this._onMouseDown, this)
                    .on('mouseup', this._onMouseUp, this) // Necessary for 0.8 compatibility
                    .addTo(this._map);

                this._map
                    .on('mouseup', this._onMouseUp, this) // Necessary for 0.7 compatibility
                    .on('mousemove', this._onMouseMove, this)
                    .on('zoomlevelschange', this._onZoomEnd, this)
                    .on('touchstart', this._onTouch, this)
                    .on('zoomend', this._onZoomEnd, this)
                    .on('click', this._onClick, this);
            }
        },

        // @method removeHooks(): void
        // Remove listener hooks from this handler.
        removeHooks: function () {
            L.Draw.Feature.prototype.removeHooks.call(this);
            this._clearHideErrorTimeout();
            this._cleanUpShape();

            // remove markers from map
            this._map.removeLayer(this._markerGroup);
            delete this._markerGroup;
            delete this._markers;

            this._map.removeLayer(this._poly);
            delete this._poly;

            this._mouseMarker
                .off('mouseout', this._onMouseOut, this)
                .off('mousemove', this._onMouseMove, this)
                .off('mousedown', this._onMouseDown, this)
                .off('mouseup', this._onMouseUp, this);
            this._map.removeLayer(this._mouseMarker);
            delete this._mouseMarker;

            // clean up DOM
            this._clearGuides();

            this._map
                .off('mouseup', this._onMouseUp, this)
                .off('mousemove', this._onMouseMove, this)
                .off('zoomlevelschange', this._onZoomEnd, this)
                .off('touchstart', this._onTouch, this)
                .off('zoomend', this._onZoomEnd, this)
                .off('click', this._onClick, this);
        },

        // @method deleteLastVertex(): void
        // Remove the last vertex from the polyline, removes polyline from map if only one point exists.
        deleteLastVertex: function () {
            var lastMarker = this._markers.pop(),
                poly = this._poly,
                // Replaces .spliceLatLngs()
                latlngs = poly.getLatLngs(),
                latlng = latlngs.splice(-1, 1)[0];
            this._poly.setLatLngs(latlngs);

            // if (this._markers.length <= 1) {
            //     return latlng;
            // }

            this._markerGroup.removeLayer(lastMarker);

            if (poly.getLatLngs().length < 2) {
                this._map.removeLayer(poly);
            }

            if (this._markers.length > 1) {
                this._vertexChanged(latlng, false);
            }

            return latlng;
        },

        // @method addVertex(): void
        // Add a vertex to the end of the polyline
        addVertex: function (latlng, shouldFire, intersectTest = true) {
            const shapeIsNotPolyline = this.type !== L.Draw.Polyline.TYPE;
            if (intersectTest && shapeIsNotPolyline) {
                var markersLength = this._markers.length;

                // markersLength must be greater than or equal to 2 before intersections can occur
                if (markersLength >= 2 && !this.options.allowIntersection && this._poly.newLatLngIntersects(latlng)) {
                    this._showErrorTooltip();
                    return;
                }
                else if (this._errorShown) {
                    this._hideErrorTooltip();
                }
            }

            this._markers.push(this._createMarker(latlng));
            this._poly.addLatLng(latlng);

            if (this._poly.getLatLngs().length === 2) {
                this._map.addLayer(this._poly);
            }

            this._vertexChanged(latlng, true);

            if (shouldFire) {
                this._map.fire(L.Draw.Event.DRAWVERTEX, { layers: this._markerGroup });
            }
        },

        // @method completeShape(): void
        // Closes the polyline between the first and last points
        completeShape: function () {
            if (this._markers.length <= 1 || !this._shapeIsValid()) {
                return;
            }

            this._fireCreatedEvent();
            this.disable();

            if (this.options.repeatMode) {
                this.enable();
            }
        },

        // Create a shape from lat lngs
        initShape: function (coords, mode = 'Draw') {
            this.enable();

            var poly;
            if (mode == 'Draw') {
                coords.forEach(c => {
                    const latlng = new L.LatLng(c[1], c[0]);
                    this.addVertex(latlng, false, false);
                });
                this._finishShape(null, false);
            } else {
                // addVertex
                coords.forEach(c => {
                    const latlng = new L.LatLng(c[1], c[0]);
                    this._poly.addLatLng(latlng);
                });

                var latlngs = this._poly._defaultShape ? this._poly._defaultShape() : this._poly.getLatLngs();
                this.disable();

                poly = new this.Poly(latlngs, this.options.shapeOptions);
            }

            return (poly);
        },

        _finishShape: function (latLng, intersectTest = true) {
            var latlngs = this._poly._defaultShape ? this._poly._defaultShape() : this._poly.getLatLngs();

            if (intersectTest) {
                var lastPt;
                if (latLng) {
                    lastPt = latLng;
                } else {
                    lastPt = latlngs[latlngs.length - 1];
                }
                var intersects = this._poly.newLatLngIntersects(lastPt, true);

                if ((!this.options.allowIntersection && intersects) || !this._shapeIsValid()) {
                    this._showErrorTooltip();
                    return;
                }
            }
            this._fireCreatedEvent();
            this.disable();
            if (this.options.repeatMode) {
                this.enable();
            }
        },

        _lastMarkerClicked(event) {
            var marker = event.target;
            var pt = marker.getLatLng();
            this._finishShape(pt);
        },

        // Called to verify the shape is valid when the user tries to finish it
        // Return false if the shape is not valid
        _shapeIsValid: function () {
            return true;
        },

        _onZoomEnd: function () {
            if (this._markers !== null) {
                this._updateGuide();
            }
        },

        _onMouseMove: function (e) {
            var newPos = this._map.mouseEventToLayerPoint(e.originalEvent);
            var latlng = this._map.layerPointToLatLng(newPos);

            // Save latlng
            this._currentLatLng = latlng;
            this._updateTooltip(latlng);

            // Update the guide line
            this._updateGuide(newPos);

            // Update the mouse marker position
            this._mouseMarker.setLatLng(latlng);

            L.DomEvent.preventDefault(e.originalEvent);
        },

        _vertexChanged: function (latlng, added) {
            this._updateFinishHandler();
            this._updateRunningMeasure(latlng, added);
            this._clearGuides();
            this._updateTooltip();
        },

        _onMouseDown: function (e) {
            var windowEvent = window.event;
            if (windowEvent.ctrlKey) {
                return;
            }

            if (!this._clickHandled && !this._touchHandled && !this._disableMarkers) {
                this._onMouseMove(e);
                this._clickHandled = true;
                this._disableNewMarkers();
                var originalEvent = e.originalEvent;
                var clientX = originalEvent.clientX;
                var clientY = originalEvent.clientY;
                this._startPoint.call(this, clientX, clientY);
            }
        },

        _startPoint: function (clientX, clientY) {
            this._mouseDownOrigin = L.point(clientX, clientY);
        },

        _onMouseUp: function (e) {
            var windowEvent = window.event;
            if (windowEvent.ctrlKey) {
                return;
            }

            var originalEvent = e.originalEvent;
            var clientX = originalEvent.clientX;
            var clientY = originalEvent.clientY;
            this._endPoint.call(this, clientX, clientY, e);
            this._clickHandled = null;
        },

        _endPoint: function (clientX, clientY, e) {
            if (this._mouseDownOrigin) {
                var dragCheckDistance = L.point(clientX, clientY).distanceTo(this._mouseDownOrigin);
                var lastPtDistance = this._calculateFinishDistance(e.latlng);
                if (this.options.maxPoints > 1 && this.options.maxPoints == this._markers.length + 1) {
                    this.addVertex(e.latlng, true);
                    this._finishShape();
                } else if (lastPtDistance < 10 && L.Browser.touch) {
                    var lastPt;
                    if (this.type === L.Draw.Polygon.TYPE) {
                        lastPt = this._markers[0].getLatLng();
                    } else {
                        lastPt = e.latlng;
                    }
                    this._finishShape(lastPt);
                } else if (Math.abs(dragCheckDistance) < 9 * (window.devicePixelRatio || 1)) {
                    this.addVertex(e.latlng, true);
                }
                this._enableNewMarkers(); // after a short pause, enable new markers
            }

            this._mouseDownOrigin = null;
        },

        // ontouch prevented by clickHandled flag because some browsers fire both click/touch events,
        // causing unwanted behavior
        _onTouch: function (e) {
            var windowEvent = window.event;
            if (windowEvent.ctrlKey) {
                return;
            }

            var originalEvent = e.originalEvent;
            var clientX;
            var clientY;

            if (originalEvent.touches && originalEvent.touches[0] && !this._clickHandled && !this._touchHandled && !this._disableMarkers) {
                clientX = originalEvent.touches[0].clientX;
                clientY = originalEvent.touches[0].clientY;
                this._disableNewMarkers();
                this._touchHandled = true;
                this._startPoint.call(this, clientX, clientY);
                this._endPoint.call(this, clientX, clientY, e);
                this._touchHandled = null;
            }

            this._clickHandled = null;
        },

        // handles map click ('touchstart' listener no longer listens to clicks with leaflet 1.8)
        _onClick: function (e) {
            var windowEvent = window.event;
            if (windowEvent.ctrlKey) {
                return;
            }

            var originalEvent = e.originalEvent;
            var clientX;
            var clientY;

            if (!this._clickHandled && !this._touchHandled && !this._disableMarkers) {
                clientX = originalEvent.clientX;
                clientY = originalEvent.clientY;
                this._disableNewMarkers();
                this._touchHandled = true;
                this._startPoint.call(this, clientX, clientY);
                this._endPoint.call(this, clientX, clientY, e);
                this._touchHandled = null;
            }

            this._clickHandled = null;
        },

        _onMouseOut: function () {
            if (this._tooltip) {
                this._tooltip._onMouseOut.call(this._tooltip);
            }
        },

        // calculate if we are currently within close enough distance
        // of the closing point (first point for shapes, last point for lines)
        // this is semi-ugly code but the only reliable way i found to get the job done
        // note: calculating point.distanceTo between mouseDownOrigin and last marker did NOT work
        _calculateFinishDistance: function (potentialLatLng) {
            var lastPtDistance;
            if (this._markers.length > 0) {
                var finishMarker;
                if (this.type === L.Draw.Polyline.TYPE) {
                    finishMarker = this._markers[this._markers.length - 1];
                } else if (this.type === L.Draw.Polygon.TYPE) {
                    finishMarker = this._markers[0];
                } else {
                    return Infinity;
                }

                var lastMarkerPoint = this._map.latLngToContainerPoint(finishMarker.getLatLng()),
                    potentialMarker = new L.Marker(potentialLatLng, {
                        icon: this.options.icon,
                        zIndexOffset: this.options.zIndexOffset * 2,
                        pane: 'drawMarkers'
                    });

                var potentialMarkerPint = this._map.latLngToContainerPoint(potentialMarker.getLatLng());
                lastPtDistance = lastMarkerPoint.distanceTo(potentialMarkerPint);
            } else {
                lastPtDistance = Infinity;
            }
            return lastPtDistance;
        },

        _updateFinishHandler: function () {
            var markerCount = this._markers.length;

            // The last marker should have a click handler to close the polyline
            if (markerCount > 1) {
                this._markers[markerCount - 1].on('click', this._lastMarkerClicked, this);
            }

            // Remove the old marker click handler (as only the last point should close the polyline)
            if (markerCount > 2) {
                this._markers[markerCount - 2].off('click', this._lastMarkerClicked, this);
            }
        },

        _createMarker: function (latlng) {
            var marker = new L.Marker(latlng, {
                icon: this.options.icon,
                zIndexOffset: this.options.zIndexOffset * 2,
                pane: 'drawMarkers'
            });

            this._markerGroup.addLayer(marker);
            return marker;
        },

        _updateGuide: function (newPos) {
            var markerCount = this._markers ? this._markers.length : 0;

            if (markerCount > 0) {
                newPos = newPos || this._map.latLngToLayerPoint(this._currentLatLng);

                this._drawGuide(
                    this._markers[markerCount - 1].getLatLng(),
                    this._map.layerPointToLatLng(newPos),
                    this._map
                );
            }
        },

        _updateTooltip: function (latLng) {
            var text = this._getTooltipText();

            if (latLng) {
                this._tooltip.updatePosition(latLng);
            }

            if (!this._errorShown) {
                this._tooltip.updateContent(text);
            }
        },

        _drawGuide: function (pointA, pointB, map) {

            this._clearGuides();

            var lines = [[pointA.lat, pointA.lng], [pointB.lat, pointB.lng]];

            this._guideLine = new L.Polyline(lines, {
                stroke: true,
                color: this.options.shapeOptions.color,
                weight: 4,
                opacity: 1,
                fill: false,
                clickable: false,
                pane: 'drawMarkers'
            });

            this._guideLine.addTo(this._map);

        },

        // Change the color of the guideline
        _updateGuideColor: function (color) {
            if (this._guideLine) {
                this._guideLine.setStyle({ color: color });
            }
        },

        // removes all child elements (guide dashes) from the guides container
        _clearGuides: function () {
            if (this._guideLine) {
                this._guideLine.remove(this._map);
            }
        },

        _getTooltipText: function () {
            var showLength = this.options.showLength,
                labelText, distanceStr;
            if (this._markers.length === 0) {
                labelText = {
                    text: L.drawLocal.draw.handlers.polyline.tooltip.start
                };
            } else {
                distanceStr = showLength ? this._getMeasurementString() : '';

                if (this._markers.length === 1) {
                    labelText = {
                        text: L.drawLocal.draw.handlers.polyline.tooltip.cont,
                        subtext: distanceStr
                    };
                } else {
                    labelText = {
                        text: L.drawLocal.draw.handlers.polyline.tooltip.end,
                        subtext: distanceStr
                    };
                }
            }
            return labelText;
        },

        _updateRunningMeasure: function (latlng, added) {
            var markersLength = this._markers.length,
                previousMarkerIndex, distance;

            if (this._markers.length === 1) {
                this._measurementRunningTotal = 0;
            } else {
                previousMarkerIndex = markersLength - (added ? 2 : 1);

                // Calculate the distance based on the version
                if (L.GeometryUtil.isVersion07x()) {
                    distance = latlng.distanceTo(this._markers[previousMarkerIndex].getLatLng()) * (this.options.factor || 1);
                } else {
                    distance = this._map.distance(latlng, this._markers[previousMarkerIndex].getLatLng()) * (this.options.factor || 1);
                }

                this._measurementRunningTotal += distance * (added ? 1 : -1);
            }
        },

        _getMeasurementString: function () {
            var currentLatLng = this._currentLatLng,
                previousLatLng = this._markers[this._markers.length - 1].getLatLng(),
                distance;

            // Calculate the distance from the last fixed point to the mouse position based on the version
            if (L.GeometryUtil.isVersion07x()) {
                distance = previousLatLng && currentLatLng && currentLatLng.distanceTo ? this._measurementRunningTotal + currentLatLng.distanceTo(previousLatLng) * (this.options.factor || 1) : this._measurementRunningTotal || 0;
            } else {
                distance = previousLatLng && currentLatLng ? this._measurementRunningTotal + this._map.distance(currentLatLng, previousLatLng) * (this.options.factor || 1) : this._measurementRunningTotal || 0;
            }

            return L.GeometryUtil.readableDistance(distance, this.options.metric, this.options.feet, this.options.nautic, this.options.precision);
        },

        _showErrorTooltip: function () {
            this._errorShown = true;

            // Update tooltip
            this._tooltip
                .showAsError()
                .updateContent({ text: this.options.drawError.message });

            // Update shape
            this._updateGuideColor(this.options.drawError.color);
            this._poly.setStyle({ color: this.options.drawError.color });

            // Hide the error after 2 seconds
            this._clearHideErrorTimeout();
            this._hideErrorTimeout = setTimeout(L.Util.bind(this._hideErrorTooltip, this), this.options.drawError.timeout);
        },

        _hideErrorTooltip: function () {
            this._errorShown = false;

            this._clearHideErrorTimeout();

            // Revert tooltip
            this._tooltip
                .removeError()
                .updateContent(this._getTooltipText());

            // Revert shape
            this._updateGuideColor(this.options.shapeOptions.color);
            this._poly.setStyle({ color: this.options.shapeOptions.color });
        },

        _clearHideErrorTimeout: function () {
            if (this._hideErrorTimeout) {
                clearTimeout(this._hideErrorTimeout);
                this._hideErrorTimeout = null;
            }
        },

        // disable new markers temporarily;
        // this is to prevent duplicated touch/click events in some browsers
        _disableNewMarkers: function () {
            this._disableMarkers = true;
        },

        // see _disableNewMarkers
        _enableNewMarkers: function () {
            setTimeout(function () {
                this._disableMarkers = false;
            }.bind(this), 50);
        },

        _cleanUpShape: function () {
            if (this._markers.length > 1) {
                this._markers[this._markers.length - 1].off('click', this._lastMarkerClicked, this);
            }
        },

        _fireCreatedEvent: function () {
            var poly = new this.Poly(this._poly.getLatLngs(), this.options.shapeOptions);
            poly._type = this._poly._type;
            L.Draw.Feature.prototype._fireCreatedEvent.call(this, poly);
        }
    });

    /**
     * @class L.Draw.Polygon
     * @aka Draw.Polygon
     * @inherits L.Draw.Polyline
     */
    L.Draw.Polygon = L.Draw.Polyline.extend({
        statics: {
            TYPE: 'polygon'
        },
        Poly: L.Polygon,
        options: {
            showArea: false,
            showLength: false,
            shapeOptions: {
                allowIntersection: false,
                stroke: true,
                color: 'rgb(98, 180, 255)',
                weight: 4,
                opacity: 1,
                fill: true,
                fillColor: null,
                fillOpacity: 0.15,
                clickable: true,
                pane: 'drawGeom'
            },
            // Whether to use the metric measurement system (truthy) or not (falsy).
            // Also defines the units to use for the metric system as an array of
            // strings (e.g. `['ha', 'm']`).
            metric: true,
            feet: true, // When not metric, to use feet instead of yards for display.
            nautic: false, // When not metric, not feet use nautic mile for display
            // Defines the precision for each type of unit (e.g. {km: 2, ft: 0}
            precision: {}
        },

        // @method initialize(): void
        initialize: function (map, options) {
            if (!options) {
                options = {};
            }
            options.type = 'polygon';
            L.Draw.Polyline.prototype.initialize.call(this, map, options);

            // Save the type so super can fire, need to do this as cannot do this.TYPE :(
            this.type = L.Draw.Polygon.TYPE;
        },

        _updateFinishHandler: function () {
            var markerCount = this._markers.length;

            // The first marker should have a click handler to close the polygon
            if (markerCount === 1) {
                this._markers[0].on('click', this._lastMarkerClicked, this);
            }

            // Add and update the double click handler
            if (markerCount > 2) {
                this._markers[markerCount - 1].on('dblclick', this._lastMarkerClicked, this);
                // Only need to remove handler if has been added before
                if (markerCount > 3) {
                    this._markers[markerCount - 2].off('dblclick', this._lastMarkerClicked, this);
                }
            }
        },

        _getTooltipText: function () {
            var text, subtext;

            if (this._markers.length === 0) {
                text = L.drawLocal.draw.handlers.polygon.tooltip.start;
            } else if (this._markers.length < 3) {
                text = L.drawLocal.draw.handlers.polygon.tooltip.cont;
                subtext = this._getMeasurementString();
            } else {
                text = L.drawLocal.draw.handlers.polygon.tooltip.end;
                subtext = this._getMeasurementString();
            }

            return {
                text: text,
                subtext: subtext
            };
        },

        _getMeasurementString: function () {
            var area = this._area,
                measurementString = '';

            if (!area && !this.options.showLength) {
                return null;
            }

            if (this.options.showLength) {
                measurementString = L.Draw.Polyline.prototype._getMeasurementString.call(this);
            }

            if (area) {
                measurementString += '<br>' + L.GeometryUtil.readableArea(area, this.options.metric, this.options.precision);
            }

            return measurementString;
        },

        _shapeIsValid: function () {
            return this._markers.length >= 3;
        },

        _cleanUpShape: function () {
            var markerCount = this._markers.length;

            if (markerCount > 0) {
                this._markers[0].off('click', this._lastMarkerClicked, this);

                if (markerCount > 2) {
                    this._markers[markerCount - 1].off('dblclick', this._lastMarkerClicked, this);
                }
            }
        }
    });

    L.SimpleShape = {};
    /**
     * @class L.Draw.SimpleShape
     * @aka Draw.SimpleShape
     * @inherits L.Draw.Feature
     */
    L.Draw.SimpleShape = L.Draw.Feature.extend({
        options: {
            repeatMode: false
        },

        // @method initialize(): void
        initialize: function (map, options) {
            this._endLabelText = L.drawLocal.draw.handlers.simpleshape.tooltip.end;
            L.Draw.Feature.prototype.initialize.call(this, map, options);
        },

        // @method addHooks(): void
        // Add listener hooks to this handler.
        addHooks: function () {
            L.Draw.Feature.prototype.addHooks.call(this);

            if (this._map) {
                this._mapDraggable = this._map.dragging.enabled();

                if (this._mapDraggable) {
                    this._map.dragging.disable();
                }

                this._container.style.cursor = 'crosshair';
                this._tooltip.updateContent({ text: this._initialLabelText });

                this._map
                    .on('mousedown', this._onMouseDown, this)
                    .on('mousemove', this._onMouseMove, this);
            }
        },

        // @method removeHooks(): void
        // Remove listener hooks from this handler.
        removeHooks: function () {
            L.Draw.Feature.prototype.removeHooks.call(this);

            if (this._map) {
                if (this._mapDraggable) {
                    this._map.dragging.enable();
                }

                this._container.style.cursor = '';

                this._map
                    .off('mousedown', this._onMouseDown, this)
                    .off('mousemove', this._onMouseMove, this);

                L.DomEvent
                    .off(document, 'mouseup', this._onMouseUp, this)
                    .off(document, 'touchend', this._onMouseUp, this);

                // If the box element doesn't exist they must not have moved the mouse, so don't need to destroy/return
                if (this._shape) {
                    this._map.removeLayer(this._shape);
                    delete this._shape;
                }
            }

            this._isDrawing = false;
        },

        _getTooltipText: function () {
            return {
                text: this._endLabelText
            };
        },

        _onMouseDown: function (e) {
            this._isDrawing = true;
            this._startLatLng = e.latlng;

            L.DomEvent
                .on(document, 'mouseup', this._onMouseUp, this)
                .on(document, 'touchend', this._onMouseUp, this)
                .preventDefault(e.originalEvent);
        },

        _onMouseMove: function (e) {
            var latlng = e.latlng;
            this._tooltip.updatePosition(latlng);

            if (this._isDrawing) {
                this._tooltip.updateContent(this._getTooltipText());
                this._drawShape(latlng);
            }
        },

        _onMouseUp: function () {
            if (this._shape) {
                this._fireCreatedEvent();
            }

            this.disable();

            if (this.options.repeatMode) {
                this.enable();
            }
        }
    });

    /**
     * @class L.Draw.Rectangle
     * @aka Draw.Rectangle
     * @inherits L.Draw.SimpleShape
     */
    L.Draw.Rectangle = L.Draw.SimpleShape.extend({
        statics: {
            TYPE: 'rectangle'
        },
        options: {
            shapeOptions: {
                stroke: true,
                color: 'rgb(98, 180, 255)',
                weight: 4,
                opacity: 1,
                fill: true,
                fillColor: null,
                fillOpacity: 0.15,
                clickable: true,
                pane: 'drawGeom'
            }
        },

        // @method initialize(): void
        initialize: function (map, options) {
            // Save the type so super can fire, need to do this as cannot do this.TYPE :(
            this.type = L.Draw.Rectangle.TYPE;
            this._initialLabelText = L.drawLocal.draw.handlers.rectangle.tooltip.start;
            L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
        },

        // @method disable(): void
        disable: function () {
            if (!this._enabled) {
                return;
            }

            this._isCurrentlyTwoClickDrawing = false;
            L.Draw.SimpleShape.prototype.disable.call(this);
        },

        _onMouseUp: function () {
            if (this._shape) {
                this._fireCreatedEvent();
                this.disable();
            } else {
                this.disable();
                this.enable();
            }

            if (this.options.repeatMode) {
                this.enable();
            }
        },

        // Create a shape from a list of coordinates
        initShape(coordinates, mode = 'Draw') {
            const bounds = L.latLngBounds(coordinates.map((c) => {
                return [c[1], c[0]];
            }));

            this._shape = new L.Rectangle(bounds, this.options.shapeOptions);
            if (mode == 'Draw') {
                this._fireCreatedEvent();
            } else {
                return (this._shape);
            }
        },

        _drawShape: function (latlng) {
            if (!this._shape) {
                this._shape = new L.Rectangle(new L.LatLngBounds(this._startLatLng, latlng), this.options.shapeOptions);
                this._map.addLayer(this._shape);
            } else {
                this._shape.setBounds(new L.LatLngBounds(this._startLatLng, latlng));
            }
        },

        _fireCreatedEvent: function () {
            var rectangle = new L.Rectangle(this._shape.getBounds(), this.options.shapeOptions);
            L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, rectangle);
        },

        _getTooltipText: function () {
            var tooltipText = L.Draw.SimpleShape.prototype._getTooltipText.call(this),
                shape = this._shape,
                showArea = this.options.showArea,
                latLngs, area, subtext;

            if (shape) {
                latLngs = this._shape._defaultShape ? this._shape._defaultShape() : this._shape.getLatLngs();
                area = L.GeometryUtil.geodesicArea(latLngs);
                subtext = showArea ? L.GeometryUtil.readableArea(area, this.options.metric) : '';
            }

            return {
                text: tooltipText.text,
                subtext: subtext
            };
        }
    });

    function _hasAncestor(el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls)) {
            ;
        }
        return el;
    }

    /**
     * @class L.Draw.Circle
     * @aka Draw.Circle
     * @inherits L.Draw.SimpleShape
     */
    L.Draw.Circle = L.Draw.SimpleShape.extend({
        statics: {
            TYPE: 'circle'
        },
        options: {
            shapeOptions: {
                stroke: true,
                color: 'rgba(98, 180, 255)',
                weight: 4,
                opacity: 1,
                fill: true,
                fillColor: null,
                fillOpacity: 0.15,
                clickable: true,
                pane: 'drawGeom'
            },
            showRadius: true,
            metric: true, // Whether to use the metric measurement system or imperial
            feet: true, // When not metric, use feet instead of yards for display
            nautic: false // When not metric, not feet use nautic mile for display
        },

        // @method initialize(): void
        initialize: function (map, options) {
            // Save the type so super can fire, need to do this as cannot do this.TYPE :(
            this.type = L.Draw.Circle.TYPE;

            this._initialLabelText = L.drawLocal.draw.handlers.circle.tooltip.start;
            L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
        },

        // Create a shape from a center point and a radius
        initShape(center, radius, mode = 'Draw') {
            const latLng = new L.LatLng(center[1], center[0], 0);
            this._shape = new L.Circle(latLng, radius, this.options.shapeOptions);
            this._startLatLng = latLng;
            if (mode == 'Draw') {
                this._fireCreatedEvent();
            } else {
                return (this._shape);
            }
        },

        _onMouseUp: function () {
            if (this._shape) {
                this._fireCreatedEvent();
                this.disable();
            } else {
                this.disable();
                this.enable();
            }

            if (this.options.repeatMode) {
                this.enable();
            }
        },

        _drawShape: function (latlng) {
            // Calculate the distance based on the version
            if (L.GeometryUtil.isVersion07x()) {
                var distance = this._startLatLng.distanceTo(latlng);
            } else {
                var distance = this._map.distance(this._startLatLng, latlng);
            }

            if (!this._shape) {
                this._shape = new L.Circle(this._startLatLng, distance, this.options.shapeOptions);
                this._map.addLayer(this._shape);
            } else {
                this._shape.setRadius(distance);
            }
        },

        _fireCreatedEvent: function () {
            var circle = new L.Circle(this._startLatLng, this._shape.getRadius(), this.options.shapeOptions);
            L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, circle);
        },

        _onMouseMove: function (e) {
            var latlng = e.latlng,
                showRadius = this.options.showRadius,
                useMetric = this.options.metric,
                radius;

            this._tooltip.updatePosition(latlng);

            if (this._isDrawing) {
                this._drawShape(latlng);

                // Get the new radius (rounded to 1 dp)
                radius = this._shape.getRadius().toFixed(1);
                this._map.fire(L.Draw.Event.RADIUSCHANGE, { radius: radius });

                if (showRadius) {
                    this._tooltip.updateContent({
                        text: L.GeometryUtil.readableDistance(radius, useMetric, false, false)
                    });
                } else {
                    this._tooltip.updateContent({
                        text: this._endLabelText
                    });
                }
            }
        }
    });

    L.Edit = L.Edit || {};

    /**
     * @class L.Edit.Tooltip
     * @aka Tooltip
     *
     * The tooltip class — it is used to display the tooltip while editing
     *
     */
    L.Edit.Tooltip = L.Class.extend({

        // @section Methods for modifying draw state

        // @method initialize(map): void
        // Tooltip constructor
        initialize: function (map) {
            this._map = map;
            this._popupPane = map._panes.drawPopup;
            this._visible = false;

            this._container = map.options.drawControlTooltips ?
                L.DomUtil.create('div', 'leaflet-draw-tooltip', this._popupPane) : null;
            this._singleLineLabel = false;

            this._map.on('mouseout', this._onMouseOut, this);
        },

        // @method dispose(): void
        // Remove Tooltip DOM and unbind events
        dispose: function () {
            this._map.off('mouseout', this._onMouseOut, this);

            if (this._container) {
                if (this._popupPane) {
                    this._popupPane.removeChild(this._container);
                }
                this._container = null;
            }
        },

        // @method updateContent(labelText): this
        // Changes the tooltip text to string in function call
        updateContent: function (labelText) {
            if (!this._container) {
                return this;
            }
            labelText.subtext = labelText.subtext || '';

            // update the vertical position (only if changed)
            if (labelText.subtext.length === 0 && !this._singleLineLabel) {
                L.DomUtil.addClass(this._container, 'leaflet-draw-tooltip-single');
                this._singleLineLabel = true;
            }
            else if (labelText.subtext.length > 0 && this._singleLineLabel) {
                L.DomUtil.removeClass(this._container, 'leaflet-draw-tooltip-single');
                this._singleLineLabel = false;
            }

            this._container.innerHTML =
                (labelText.subtext.length > 0 ?
                    '<span class="leaflet-draw-tooltip-subtext">' + labelText.subtext + '</span>' + '<br />' : '') +
                '<span>' + labelText.text + '</span>';

            if (!labelText.text && !labelText.subtext) {
                this._visible = false;
                this._container.style.visibility = 'hidden';
            } else {
                this._visible = true;
                this._container.style.visibility = 'inherit';
            }

            return this;
        },

        // @method updatePosition(latlng): this
        // Changes the location of the tooltip
        updatePosition: function (latlng) {
            var pos = this._map.latLngToLayerPoint(latlng),
                tooltipContainer = this._container;

            if (this._container) {
                if (this._visible) {
                    tooltipContainer.style.visibility = 'inherit';
                }
                L.DomUtil.setPosition(tooltipContainer, pos);
            }

            return this;
        },

        // @method showAsError(): this
        // Applies error class to tooltip
        showAsError: function () {
            if (this._container) {
                L.DomUtil.addClass(this._container, 'leaflet-error-draw-tooltip');
            }

            return this;
        },

        // @method removeError(): this
        // Removes the error class from the tooltip
        removeError: function () {
            if (this._container) {
                L.DomUtil.removeClass(this._container, 'leaflet-error-draw-tooltip');
            }

            return this;
        },

        _onMouseOut: function () {
            if (this._container) {
                this._container.style.visibility = 'hidden';
            }
        }
    });

    /**
     * @class L.Edit.Marker
     * @aka Edit.Marker
     */
    L.Edit.Marker = L.Handler.extend({
        // @method initialize(): void
        initialize: function (marker, options) {
            this._marker = marker;
            L.setOptions(this, options);
        },

        // @method addHooks(): void
        // Add listener hooks to this handler
        addHooks: function () {
            var marker = this._marker;
            marker.dragging.enable();
            marker.on('dragend', this._onDragEnd, marker);
        },

        // @method removeHooks(): void
        // Remove listener hooks from this handler
        removeHooks: function () {
            var marker = this._marker;
            marker.dragging.disable();
            marker.off('dragend', this._onDragEnd, marker);
        },

        _onDragEnd: function (e) {
            var layer = e.target;
            layer.edited = true;
            this._map.fire(L.Draw.Event.EDITMOVE, { layer: layer });

        }
    });

    L.Marker.addInitHook(function () {
        if (L.Edit.Marker) {
            this.editing = new L.Edit.Marker(this);

            if (this.options.editable) {
                this.editing.enable();
            }
        }
    });

    L.Edit = L.Edit || {};

    /**
     * @class L.Edit.Polyline
     * @aka L.Edit.Poly
     * @aka Edit.Poly
     */
    L.Edit.Poly = L.Handler.extend({
        // @method initialize(): void
        initialize: function (poly) {

            this.latlngs = [poly._latlngs];
            if (poly._holes) {
                this.latlngs = this.latlngs.concat(poly._holes);
            }

            this._poly = poly;

            this._poly.on('revert-edited', this._updateLatLngs, this);
        },

        // Compatibility method to normalize Poly* objects
        // between 0.7.x and 1.0+
        _defaultShape: function () {
            if (!L.LineUtil.isFlat) {
                return this._poly._latlngs;
            }
            return L.LineUtil.isFlat(this._poly._latlngs) ? this._poly._latlngs : this._poly._latlngs[0];
        },

        _eachVertexHandler: function (callback) {
            for (var i = 0; i < this._verticesHandlers.length; i++) {
                callback(this._verticesHandlers[i]);
            }
        },

        // @method addHooks(): void
        // Add listener hooks to this handler
        addHooks: function () {
            this._initHandlers();
            this._eachVertexHandler(function (handler) {
                handler.addHooks();
            });
        },

        // @method removeHooks(): void
        // Remove listener hooks from this handler
        removeHooks: function () {
            this._eachVertexHandler(function (handler) {
                handler.removeHooks();
            });
        },

        // @method updateMarkers(): void
        // Fire an update for each vertex handler
        updateMarkers: function () {
            this._eachVertexHandler(function (handler) {
                handler.updateMarkers();
            });
        },

        _initHandlers: function () {
            this._verticesHandlers = [];
            for (var i = 0; i < this.latlngs.length; i++) {
                this._verticesHandlers.push(new L.Edit.PolyVerticesEdit(this._poly, this.latlngs[i], this._poly.options));
            }
        },

        _updateLatLngs: function (e) {
            this.latlngs = [e.layer._latlngs];
            if (e.layer._holes) {
                this.latlngs = this.latlngs.concat(e.layer._holes);
            }
        }
    });

    /**
     * @class L.Edit.PolyVerticesEdit
     * @aka Edit.PolyVerticesEdit
     */
    L.Edit.PolyVerticesEdit = L.Handler.extend({
        options: {
            icon: new L.DivIcon({
                iconSize: new L.Point(20, 20),
                className: 'main-marker'
            }),
            middleIcon: new L.DivIcon({
                iconSize: new L.Point(20, 20),
                className: 'middle-marker'
            }),
            drawError: {
                color: '#b00b00',
                timeout: 1000
            }
        },

        // @method intialize(): void
        initialize: function (poly, latlngs, options) {
            this._poly = poly;

            this.options.drawError.message = L.drawLocal.draw.handlers.polyline.error;
            this.options.drawError.deleteCoordError = L.drawLocal.draw.handlers.polyline.deleteCoordError;
            if (options && options.drawError) {
                options.drawError = L.Util.extend({}, this.options.drawError, options.drawError);
            }

            this._latlngs = latlngs;

            L.setOptions(this, options);
        },

        // Compatibility method to normalize Poly* objects
        // between 0.7.x and 1.0+
        _defaultShape: function () {
            if (!L.LineUtil.isFlat) {
                return this._latlngs;
            }
            return L.LineUtil.isFlat(this._latlngs) ? this._latlngs : this._latlngs[0];
        },

        _getProjectedPoints: function (latlngs) {
            var points = [];

            for (var i = 0; i < latlngs.length; i++) {
                points.push(this._map.latLngToLayerPoint(latlngs[i]));
            }
            return points;
        },

        _intersects: function (latlngs) {
            var points = this._getProjectedPoints(latlngs),
                len = points ? points.length : 0,
                i, p, p1;

            if (this._tooFewPointsForIntersection(latlngs)) {
                return false;
            }

            for (i = len - 1; i >= 3; i--) {
                p = points[i - 1];
                p1 = points[i];


                if (this._lineSegmentsIntersectsRange(latlngs, p, p1, i - 2)) {
                    return true;
                }
            }

            // If its a polygon, need to check the segments between the first and last point.
            if (this._poly && this._poly._type === 'polygon') {
                p1 = points[0];
                p = points[len - 1];
   
                if (this._lineSegmentsIntersectsRange(latlngs, p, p1, len - 2, 1)) {
                    return true;
                }
            }


            return false;
        },

        // Polylines with 2 sides can only intersect in cases where points are collinear (we don't support detecting these).
        // Cannot have intersection when < 3 line segments (< 4 points)
        _tooFewPointsForIntersection: function (latlngs) {
            var points = this._getProjectedPoints(latlngs),
                len = points ? points.length : 0;

            return !points || len <= 3;
        },

        // Checks a line segment intersections with any line segments before its predecessor.
        // Don't need to check the predecessor as will never intersect.
        _lineSegmentsIntersectsRange: function (latlngs, p, p1, maxIndex, minIndex) {
            var points = this._getProjectedPoints(latlngs),
                p2, p3;

            minIndex = minIndex || 0;

            // Check all previous line segments (beside the immediately previous) for intersections
            for (var j = maxIndex; j > minIndex; j--) {
                p2 = points[j - 1];
                p3 = points[j];

                if (L.LineUtil.segmentsIntersect(p, p1, p2, p3)) {
                    return true;
                }
            }

            return false;
        },

        // @method addHooks(): void
        // Add listener hooks to this handler.
        addHooks: function () {
            var poly = this._poly;
            var path = poly._path;

            this._tooltip = new L.Edit.Tooltip(this._poly._map);

            if (!(poly instanceof L.Polygon)) {
                poly.options.fill = false;
                if (poly.options.editing) {
                    poly.options.editing.fill = false;
                }
            }

            if (path) {
                if (poly.options.editing && poly.options.editing.className) {
                    if (poly.options.original.className) {
                        poly.options.original.className.split(' ').forEach(function (className) {
                            L.DomUtil.removeClass(path, className);
                        });
                    }
                    poly.options.editing.className.split(' ').forEach(function (className) {
                        L.DomUtil.addClass(path, className);
                    });
                }
            }

            poly.setStyle(poly.options.editing);

            if (this._poly._map) {
                this._map = this._poly._map; // Set map

                if (!this._markerGroup) {
                    this._initMarkers();
                }

                this._poly._map.addLayer(this._markerGroup);
            }
        },

        // @method removeHooks(): void
        // Remove listener hooks from this handler.
        removeHooks: function () {
            var poly = this._poly;
            var path = poly._path;

            if (this._tooltip) {

                this._tooltip.dispose();
                this._tooltip = null;
            }

            if (path) {
                if (poly.options.editing && poly.options.editing.className) {
                    poly.options.editing.className.split(' ').forEach(function (className) {
                        L.DomUtil.removeClass(path, className);
                    });
                    if (poly.options.original.className) {
                        poly.options.original.className.split(' ').forEach(function (className) {
                            L.DomUtil.addClass(path, className);
                        });
                    }
                }
            }

            poly.setStyle(poly.options.original);

            if (poly._map) {
                poly._map.removeLayer(this._markerGroup);
                delete this._markerGroup;
                delete this._markers;
            }
        },

        // @method updateMarkers(): void
        // Clear markers and update their location
        updateMarkers: function () {
            this._markerGroup.clearLayers();
            this._initMarkers();
        },

        _initMarkers: function () {
            if (!this._markerGroup) {
                this._markerGroup = new L.LayerGroup();
            }

            this._markers = [];
            var latlngs = this._defaultShape(),
                i, j, len, marker;

            for (i = 0, len = latlngs.length; i < len; i++) {
                marker = this._createMarker(latlngs[i], i, false);
                marker.on('click', this._onMarkerClick, this);
                marker.on('contextmenu', this._onContextMenu, this);
                this._markers.push(marker);
            }

            var markerLeft, markerRight;

            for (i = 0, j = len - 1; i < len; j = i++) {
                if (i === 0 && !(L.Polygon && (this._poly instanceof L.Polygon))) {
                    continue;
                }

                markerLeft = this._markers[j];
                markerRight = this._markers[i];

                this._createMiddleMarker(markerLeft, markerRight);
                this._updatePrevNext(markerLeft, markerRight);
            }
        },

        _createMarker: function (latlng, index, middleMarker) {
            // Extending L.Marker in TouchEvents.js to include touch.
            if (middleMarker) {
                var marker = new L.Marker.Touch(latlng, {
                    draggable: true,
                    icon: this.options.middleIcon,
                    pane: 'drawMarkers'
                });
            } else {
                var marker = new L.Marker.Touch(latlng, {
                    draggable: true,
                    icon: this.options.icon,
                    pane: 'drawMarkers'
                });
            }

            marker._origLatLng = latlng;
            marker._index = index;

            marker
                .on('dragstart', this._onMarkerDragStart, this)
                .on('drag', this._onMarkerDrag, this)
                .on('dragend', this._onMarkerDragEnd, this)
                // .on('dragend', this._canUndo, this)
                .on('touchmove', this._onTouchMove, this)
                .on('touchend', this._onMarkerDragEnd, this)
                // .on('touchend', this._canUndo, this);

            this._markerGroup.addLayer(marker);
            return marker;
        },

        _canUndo: function () {
            this._poly._map.fire(L.Draw.Event.UNDOABLEEDIT, { layers: this._markerGroup });
        },

        _onMarkerDragStart: function (e) {
            var marker = e.target;
            marker._saveLatLng = L.LatLngUtil.cloneLatLng(marker._origLatLng);
            marker._originalColor = this._poly.options.color;
            this._intersectError = false;
            this._poly.fire('editstart');
        },

        _spliceLatLngs: function () {
            var latlngs = this._defaultShape();
            var removed = [].splice.apply(latlngs, arguments);
            this._poly._convertLatLngs(latlngs, true);
            this._poly.redraw();
            return removed;
        },

        _removeMarker: function (marker) {
            var i = marker._index;

            this._markerGroup.removeLayer(marker);
            this._markers.splice(i, 1);
            this._spliceLatLngs(i, 1);
            this._updateIndexes(i, -1);

            this._canUndo();

            marker
                .off('dragstart', this._onMarkerDragStart, this)
                .off('drag', this._onMarkerDrag, this)
                .off('dragend', this._onMarkerDragEnd, this)
                .off('touchmove', this._onMarkerDrag, this)
                .off('touchend', this._fireEdit, this)
                // .off('dragend', this._canUndo, this)
                .off('click', this._onMarkerClick, this)
                // .off('touchend', this._canUndo, this);
        },

        _fireEdit: function () {
            this._poly.edited = true;
            this._poly.fire('edit');
            this._poly._map.fire(L.Draw.Event.EDITVERTEX, { layers: this._markerGroup, poly: this._poly });
        },

        _onMarkerDrag: function (e) {

            var marker = e.target;
            var poly = this._poly;

            var oldOrigLatLng = L.LatLngUtil.cloneLatLng(marker._origLatLng);
            L.extend(marker._origLatLng, marker._latlng);
            if (poly.options) {
                var tooltip = this._tooltip; // Access the tooltip

                // If we don't allow intersections and the polygon intersects
                if (!poly.options.allowIntersection && poly.intersects()) {
                    L.extend(marker._origLatLng, oldOrigLatLng);
                    marker.setLatLng(oldOrigLatLng);
                    this._intersectError = true;
                    poly.setStyle({ color: this.options.drawError.color });
                    if (tooltip) {
                        tooltip
                            .updatePosition(oldOrigLatLng)
                            .showAsError()
                            .updateContent({ text: this.options.drawError.message });
                    }

                    // Reset everything back to normal after a second
                    // setTimeout(function () {
                    //     poly.setStyle({ color: marker._originalColor });
                    //     if (tooltip) {
                    //         tooltip.updateContent({
                    //             text: L.drawLocal.edit.handlers.edit.tooltip.text,
                    //             subtext: L.drawLocal.edit.handlers.edit.tooltip.subtext
                    //         });
                    //     }
                    // }, 1000);
                } else {
                    poly.setStyle({ color: marker._originalColor });
                    if (tooltip) {
                        tooltip
                            .removeError()
                            ._onMouseOut();

                    }
                    this._intersectError = false;
                }
            }

            if (marker._middleLeft) {
                marker._middleLeft.setLatLng(this._getMiddleLatLng(marker._prev, marker));
            }

            if (marker._middleRight) {
                marker._middleRight.setLatLng(this._getMiddleLatLng(marker, marker._next));
            }

            //refresh the bounds when draging
            this._poly._bounds._southWest = L.latLng(Infinity, Infinity);
            this._poly._bounds._northEast = L.latLng(-Infinity, -Infinity);
            var latlngs = this._poly.getLatLngs();
            this._poly._convertLatLngs(latlngs, true);
            this._poly.redraw();
            this._poly.fire('editdrag');
            this._fireEdit();
        },

        _onMarkerDragEnd: function (e) {
            var marker = e.target;
            if (this._intersectError) {
                var poly = this._poly;
                var tooltip = this._tooltip; // Access the tooltip
                var originalColor = marker._originalColor;

                poly.setStyle({ color: originalColor });
                if (tooltip) {
                    tooltip
                        .removeError()
                        ._onMouseOut();
                }

                this._intersectError = false;
                L.extend(marker._origLatLng, marker._saveLatLng);
                marker.setLatLng(marker._saveLatLng);
                if (marker._middleLeft) {
                    marker._middleLeft.setLatLng(this._getMiddleLatLng(marker._prev, marker));
                }

                if (marker._middleRight) {
                    marker._middleRight.setLatLng(this._getMiddleLatLng(marker, marker._next));
                }
                this._poly._bounds._southWest = L.latLng(Infinity, Infinity);
                this._poly._bounds._northEast = L.latLng(-Infinity, -Infinity);
                var latlngs = this._poly.getLatLngs();
                this._poly._convertLatLngs(latlngs, true);
                this._poly.redraw();
                this._poly.fire('editdrag');
                this._fireEdit();
            } else {
                this._fireEdit();
                this._canUndo();
            }
        },

        _onMarkerClick: function (e) {

            var minPoints = L.Polygon && (this._poly instanceof L.Polygon) ? 4 : 3,
                marker = e.target;

            // If removing this point would create an invalid polyline/polygon don't remove
            if (this._defaultShape().length < minPoints) {
                return;
            }

            var latLngs = this._defaultShape().slice();
            latLngs.splice(marker._index, 1);
            var poly = this._poly;
            if (!poly.options.allowIntersection && this._intersects(latLngs)) {
                var tooltip = this._tooltip; // Access the tooltip
                if (tooltip) {
                    tooltip
                        .updatePosition(marker.getLatLng())
                        .showAsError()
                        .updateContent({ text: this.options.drawError.deleteCoordError });
                }

                // Reset everything back to normal after a second
                setTimeout(function () {
                    if (tooltip) {
                        tooltip
                            .removeError()
                            ._onMouseOut();
                    }
                }, 2000);
                return;
            }

            // remove the marker
            this._removeMarker(marker);

            // update prev/next links of adjacent markers
            this._updatePrevNext(marker._prev, marker._next);

            // remove ghost markers near the removed marker
            if (marker._middleLeft) {
                this._markerGroup.removeLayer(marker._middleLeft);
            }

            if (marker._middleRight) {
                this._markerGroup.removeLayer(marker._middleRight);
            }

            // create a ghost marker in place of the removed one
            if (marker._prev && marker._next) {
                this._createMiddleMarker(marker._prev, marker._next);

            } else if (!marker._prev) {
                marker._next._middleLeft = null;

            } else if (!marker._next) {
                marker._prev._middleRight = null;
            }

            this._fireEdit();
        },

        _onContextMenu: function (e) {
            var marker = e.target;
            var poly = this._poly;
            this._poly._map.fire(L.Draw.Event.MARKERCONTEXT, { marker: marker, layers: this._markerGroup, poly: this._poly });
            L.DomEvent.stopPropagation;
        },

        _onTouchMove: function (e) {

            var layerPoint = this._map.mouseEventToLayerPoint(e.originalEvent.touches[0]),
                latlng = this._map.layerPointToLatLng(layerPoint),
                marker = e.target;

            L.extend(marker._origLatLng, latlng);

            if (marker._middleLeft) {
                marker._middleLeft.setLatLng(this._getMiddleLatLng(marker._prev, marker));
            }

            if (marker._middleRight) {
                marker._middleRight.setLatLng(this._getMiddleLatLng(marker, marker._next));
            }

            this._poly.redraw();
            this.updateMarkers();
        },

        _updateIndexes: function (index, delta) {
            this._markerGroup.eachLayer(function (marker) {
                if (marker._index > index) {
                    marker._index += delta;
                }
            });
        },

        _createMiddleMarker: function (marker1, marker2) {
            var latlng = this._getMiddleLatLng(marker1, marker2),
                marker = this._createMarker(latlng, null, true),
                onClick,
                onDragStart,
                onDragEnd;

            marker1._middleRight = marker2._middleLeft = marker;

            onDragStart = function () {
                marker.off('touchmove', onDragStart, this);
                var i = marker2._index;
                marker._index = i;

                marker
                    .off('click', onClick, this)
                    .on('click', this._onMarkerClick, this);

                marker._icon.classList.remove('middle-marker');
                marker._icon.classList.add('main-marker');

                latlng.lat = marker.getLatLng().lat;
                latlng.lng = marker.getLatLng().lng;
                this._spliceLatLngs(i, 0, latlng);
                this._markers.splice(i, 0, marker);
                this._updateIndexes(i, 1);
                marker2._index++;
                this._updatePrevNext(marker1, marker);
                this._updatePrevNext(marker, marker2);
                this._poly.fire('editstart');
            };

            onDragEnd = function () {
                marker.off('dragstart', onDragStart, this);
                marker.off('dragend', onDragEnd, this);
                this._createMiddleMarker(marker1, marker);
                this._createMiddleMarker(marker, marker2);
            };

            onClick = function () {
                onDragStart.call(this);
                onDragEnd.call(this);
                this._fireEdit();
            };

            marker
                .on('click', onClick, this)
                .on('dragstart', onDragStart, this)
                .on('dragend', onDragEnd, this)
                .on('touchmove', onDragStart, this);

            this._markerGroup.addLayer(marker);
        },

        _updatePrevNext: function (marker1, marker2) {
            if (marker1) {
                marker1._next = marker2;
            }
            if (marker2) {
                marker2._prev = marker1;
            }
        },

        _getMiddleLatLng: function (marker1, marker2) {
            var map = this._poly._map,
                p1 = map.project(marker1.getLatLng()),
                p2 = map.project(marker2.getLatLng());

            return map.unproject(p1._add(p2)._divideBy(2));
        }
    });

    L.Polyline.addInitHook(function () {

        // Check to see if handler has already been initialized. This is to support versions of Leaflet that still have L.Handler.PolyEdit
        if (this.editing) {
            return;
        }

        if (L.Edit.Poly) {
            this.editing = new L.Edit.Poly(this);

            if (this.options.editable) {
                this.editing.enable();
            }
        }

        this.on('add', function () {
            if (this.editing && this.editing.enabled()) {
                this.editing.addHooks();
            }
        });

        this.on('remove', function () {
            if (this.editing && this.editing.enabled()) {
                this.editing.removeHooks();
            }
        });
    });

    L.Edit = L.Edit || {};
    /**
     * @class L.Edit.SimpleShape
     * @aka Edit.SimpleShape
     */
    L.Edit.SimpleShape = L.Handler.extend({
        options: {
            moveIcon: new L.DivIcon({
                iconSize: new L.Point(20, 20),
                className: 'main-marker leaflet-edit-move'
            }),
            resizeIcon: new L.DivIcon({
                iconSize: new L.Point(20, 20),
                className: 'main-marker leaflet-edit-resize'
            }),
            touchMoveIcon: new L.DivIcon({
                iconSize: new L.Point(20, 20),
                className: 'main-marker leaflet-edit-move'
            }),
            touchResizeIcon: new L.DivIcon({
                iconSize: new L.Point(20, 20),
                className: 'main-marker leaflet-edit-resize'
            }),
        },

        // @method intialize(): void
        initialize: function (shape, options) {
            // if touch, switch to touch icon
            if (L.Browser.touch) {
                this.options.moveIcon = this.options.touchMoveIcon;
                this.options.resizeIcon = this.options.touchResizeIcon;
            }

            this._shape = shape;
            L.Util.setOptions(this, options);
        },

        // @method addHooks(): void
        // Add listener hooks to this handler
        addHooks: function () {
            var shape = this._shape;
            if (this._shape._map) {
                this._map = this._shape._map;
                shape.setStyle(shape.options.editing);

                if (shape._map) {
                    this._map = shape._map;
                    if (!this._markerGroup) {
                        this._initMarkers();
                    }
                    this._map.addLayer(this._markerGroup);
                }
            }
        },

        // @method removeHooks(): void
        // Remove listener hooks from this handler
        removeHooks: function () {
            var shape = this._shape;
            shape.setStyle(shape.options.original);

            if (shape._map) {
                this._unbindMarker(this._moveMarker);

                for (var i = 0, l = this._resizeMarkers.length; i < l; i++) {
                    this._unbindMarker(this._resizeMarkers[i]);
                }

                this._resizeMarkers = null;

                this._map.removeLayer(this._markerGroup);
                delete this._markerGroup;
            }

            this._map = null;
        },

        // @method updateMarkers(): void
        // Remove the edit markers from this layer
        updateMarkers: function () {
            this._markerGroup.clearLayers();
            this._initMarkers();
        },

        _initMarkers: function () {
            if (!this._markerGroup) {
                this._markerGroup = new L.LayerGroup();
            }

            // Create center marker
            this._createMoveMarker();

            // Create edge marker
            this._createResizeMarker();
        },

        _createMoveMarker: function () {
            // Children override
        },

        _createResizeMarker: function () {
            // Children override
        },

        _createMarker: function (latlng, icon) {
            // Extending L.Marker in TouchEvents.js to include touch.
            var marker = new L.Marker.Touch(latlng, {
                draggable: true,
                icon: icon,
                zIndexOffset: 10,
                pane: 'drawMarkers'
            });

            this._bindMarker(marker);
            this._markerGroup.addLayer(marker);
            return marker;
        },

        _bindMarker: function (marker) {
            marker
                .on('dragstart', this._onMarkerDragStart, this)
                .on('drag', this._onMarkerDrag, this)
                .on('dragend', this._onMarkerDragEnd, this)
                .on('touchstart', this._onTouchStart, this)
                .on('touchmove', this._onTouchMove, this)
                .on('touchend', this._onTouchEnd, this);
        },

        _unbindMarker: function (marker) {
            marker
                .off('dragstart', this._onMarkerDragStart, this)
                .off('drag', this._onMarkerDrag, this)
                .off('dragend', this._onMarkerDragEnd, this)
                .off('touchstart', this._onTouchStart, this)
                .off('touchmove', this._onTouchMove, this)
                .off('touchend', this._onTouchEnd, this);
        },

        _onMarkerDragStart: function (e) {
            var marker = e.target;
            marker.setOpacity(0);
            this._shape.fire('editstart');
        },

        _fireEdit: function () {
            this._shape.edited = true;
            this._shape.fire('edit');
        },

        _onMarkerDrag: function (e) {
            var marker = e.target,
                latlng = marker.getLatLng();

            if (marker === this._moveMarker) {
                this._move(latlng);
            } else {
                this._resize(latlng);
            }

            this._shape.redraw();
            this._shape.fire('editdrag');
        },

        _onMarkerDragEnd: function (e) {
            var marker = e.target;
            marker.setOpacity(1);

            this._fireEdit();

            // FIRE UNDO EVENT
            this._map.fire(L.Draw.Event.UNDOABLEEDIT, { layers: this._markerGroup });
        },

        _onTouchStart: function (e) {
            L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this, e);

            if (typeof (this._getCorners) === 'function') {
                // Save a reference to the opposite point
                var corners = this._getCorners(),
                    marker = e.target,
                    currentCornerIndex = marker._cornerIndex;

                marker.setOpacity(0);

                // Copied from Edit.Rectangle.js line 23 _onMarkerDragStart()
                // Latlng is null otherwise.
                this._oppositeCorner = corners[(currentCornerIndex + 2) % 4];
                this._toggleCornerMarkers(0, currentCornerIndex);
            }

            this._shape.fire('editstart');
        },

        _onTouchMove: function (e) {
            var layerPoint = this._map.mouseEventToLayerPoint(e.originalEvent.touches[0]),
                latlng = this._map.layerPointToLatLng(layerPoint),
                marker = e.target;

            if (marker === this._moveMarker) {
                this._move(latlng);
            } else {
                this._resize(latlng);
            }

            this._shape.redraw();
            return false;
        },

        _onTouchEnd: function (e) {
            var marker = e.target;
            marker.setOpacity(1);
            this.updateMarkers();
            this._fireEdit();
        },

        _move: function () {
            // Children override
        },

        _resize: function () {
            // Children override
        }
    });

    L.Edit = L.Edit || {};
    /**
     * @class L.Edit.Rectangle
     * @aka Edit.Rectangle
     * @inherits L.Edit.SimpleShape
     */
    L.Edit.Rectangle = L.Handler.extend({
        // @method initialize(): void
        initialize: function (poly) {

            this.latlngs = [poly._latlngs];
            if (poly._holes) {
                this.latlngs = this.latlngs.concat(poly._holes);
            }

            this._poly = poly;

            this._poly.on('revert-edited', this._updateLatLngs, this);
        },

        // Compatibility method to normalize Poly* objects
        // between 0.7.x and 1.0+
        _defaultShape: function () {
            if (!L.LineUtil.isFlat) {
                return this._poly._latlngs;
            }
            return L.LineUtil.isFlat(this._poly._latlngs) ? this._poly._latlngs : this._poly._latlngs[0];
        },

        _eachVertexHandler: function (callback) {
            for (var i = 0; i < this._verticesHandlers.length; i++) {
                callback(this._verticesHandlers[i]);
            }
        },

        // @method addHooks(): void
        // Add listener hooks to this handler
        addHooks: function () {
            this._initHandlers();
            this._eachVertexHandler(function (handler) {
                handler.addHooks();
            });
        },

        // @method removeHooks(): void
        // Remove listener hooks from this handler
        removeHooks: function () {
            this._eachVertexHandler(function (handler) {
                handler.removeHooks();
            });
        },

        // @method updateMarkers(): void
        // Fire an update for each vertex handler
        updateMarkers: function () {
            this._eachVertexHandler(function (handler) {
                handler.updateMarkers();
            });
        },

        _initHandlers: function () {
            this._verticesHandlers = [];
            for (var i = 0; i < this.latlngs.length; i++) {
                this._verticesHandlers.push(new L.Edit.PolyVerticesEdit(this._poly, this.latlngs[i], this._poly.options.poly));
            }
        },

        _updateLatLngs: function (e) {
            this.latlngs = [e.layer._latlngs];
            if (e.layer._holes) {
                this.latlngs = this.latlngs.concat(e.layer._holes);
            }
        }
    });
    // L.Edit.Rectangle = L.Edit.SimpleShape.extend({
    //     _createMoveMarker: function () {
    //         var bounds = this._shape.getBounds(),
    //             center = bounds.getCenter();

    //         this._moveMarker = this._createMarker(center, this.options.moveIcon);
    //     },

    //     _createResizeMarker: function () {
    //         var corners = this._getCorners();
    //         this._resizeMarkers = [];

    //         for (var i = 0, l = corners.length; i < l; i++) {
    //             this._resizeMarkers.push(this._createMarker(corners[i], this.options.resizeIcon));
    //             // Monkey in the corner index as we will need to know this for dragging
    //             this._resizeMarkers[i]._cornerIndex = i;
    //         }
    //     },

    //     _onMarkerDragStart: function (e) {
    //         L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this, e);

    //         // Save a reference to the opposite point
    //         var corners = this._getCorners(),
    //             marker = e.target,
    //             currentCornerIndex = marker._cornerIndex;

    //         this._oppositeCorner = corners[(currentCornerIndex + 2) % 4];
    //         this._toggleCornerMarkers(0, currentCornerIndex);
    //     },

    //     _onMarkerDragEnd: function (e) {
    //         var marker = e.target,
    //             bounds, center;

    //         // Reset move marker position to the center
    //         if (marker === this._moveMarker) {
    //             bounds = this._shape.getBounds();
    //             center = bounds.getCenter();
    //             marker.setLatLng(center);
    //         }

    //         this._toggleCornerMarkers(1);
    //         this._repositionCornerMarkers();
    //         L.Edit.SimpleShape.prototype._onMarkerDragEnd.call(this, e);
    //     },

    //     _move: function (newCenter) {
    //         var latlngs = this._shape._defaultShape ? this._shape._defaultShape() : this._shape.getLatLngs(),
    //             bounds = this._shape.getBounds(),
    //             center = bounds.getCenter(),
    //             offset, newLatLngs = [];

    //         // Offset the latlngs to the new center
    //         for (var i = 0, l = latlngs.length; i < l; i++) {
    //             offset = [latlngs[i].lat - center.lat, latlngs[i].lng - center.lng];
    //             newLatLngs.push([newCenter.lat + offset[0], newCenter.lng + offset[1]]);
    //         }

    //         this._shape.setLatLngs(newLatLngs);

    //         // Reposition the resize markers
    //         this._repositionCornerMarkers();

    //         this._map.fire(L.Draw.Event.EDITMOVE, { layer: this._shape });
    //     },

    //     _resize: function (latlng) {
    //         var bounds;

    //         // Update the shape based on the current position of this corner and the opposite point
    //         this._shape.setBounds(L.latLngBounds(latlng, this._oppositeCorner));

    //         // Reposition the move marker
    //         bounds = this._shape.getBounds();
    //         this._moveMarker.setLatLng(bounds.getCenter());

    //         this._map.fire(L.Draw.Event.EDITRESIZE, { layer: this._shape });
    //     },

    //     _getCorners: function () {
    //         var bounds = this._shape.getBounds(),
    //             nw = bounds.getNorthWest(),
    //             ne = bounds.getNorthEast(),
    //             se = bounds.getSouthEast(),
    //             sw = bounds.getSouthWest();

    //         return [nw, ne, se, sw];
    //     },

    //     _toggleCornerMarkers: function (opacity) {
    //         for (var i = 0, l = this._resizeMarkers.length; i < l; i++) {
    //             this._resizeMarkers[i].setOpacity(opacity);
    //         }
    //     },

    //     _repositionCornerMarkers: function () {
    //         var corners = this._getCorners();

    //         for (var i = 0, l = this._resizeMarkers.length; i < l; i++) {
    //             this._resizeMarkers[i].setLatLng(corners[i]);
    //         }
    //     }
    // });

    L.Rectangle.addInitHook(function () {
        if (L.Edit.Rectangle) {
            this.editing = new L.Edit.Rectangle(this);

            if (this.options.editable) {
                this.editing.enable();
            }
        }
    });

    L.Edit = L.Edit || {};
    /**
     * @class L.Edit.CircleMarker
     * @aka Edit.Circle
     * @inherits L.Edit.SimpleShape
     */
    L.Edit.CircleMarker = L.Edit.SimpleShape.extend({
        _createMoveMarker: function () {
            var center = this._shape.getLatLng();
            this._moveMarker = this._createMarker(center, this.options.moveIcon);
        },

        _createResizeMarker: function () {
            // To avoid an undefined check in L.Edit.SimpleShape.removeHooks
            this._resizeMarkers = [];
        },

        _move: function (latlng) {
            if (this._resizeMarkers.length) {
                var resizemarkerPoint = this._getResizeMarkerPoint(latlng);

                // Move the resize marker
                this._resizeMarkers[0].setLatLng(resizemarkerPoint);

            }

            // Move the circle
            this._shape.setLatLng(latlng);

            this._map.fire(L.Draw.Event.EDITMOVE, { layer: this._shape });
        },
    });

    L.CircleMarker.addInitHook(function () {
        if (L.Edit.CircleMarker) {
            this.editing = new L.Edit.CircleMarker(this);

            if (this.options.editable) {
                this.editing.enable();
            }
        }

        this.on('add', function () {
            if (this.editing && this.editing.enabled()) {
                this.editing.addHooks();
            }
        });

        this.on('remove', function () {
            if (this.editing && this.editing.enabled()) {
                this.editing.removeHooks();
            }
        });
    });

    L.Edit = L.Edit || {};
    /**
     * @class L.Edit.Circle
     * @aka Edit.Circle
     * @inherits L.Edit.CircleMarker
     */
    L.Edit.Circle = L.Edit.CircleMarker.extend({
        initialize: function (map, options) {
            this._map = map;
            // TODO - Add tool tips to edit
            // this._popupPane = this._map._panes.popupPane;
            // this._tooltip = new L.Draw.Tooltip(this._map);

            L.Edit.CircleMarker.prototype.initialize.call(this, map, options);
        },

        _createResizeMarker: function () {
            var center = this._shape.getLatLng(),
                resizemarkerPoint = this._getResizeMarkerPoint(center);

            this._resizeMarkers = [];
            this._resizeMarkers.push(this._createMarker(resizemarkerPoint, this.options.resizeIcon));
        },

        _getResizeMarkerPoint: function (latlng) {
            // From L.shape.getBounds()
            var delta = this._shape._radius * Math.cos(Math.PI / 4),
                point = this._map.project(latlng);
            return this._map.unproject([point.x + delta, point.y - delta]);
        },

        _resize: function (latlng) {
            var moveLatLng = this._moveMarker.getLatLng();
            var radius;
            // Calculate the radius based on the version
            if (L.GeometryUtil.isVersion07x()) {
                radius = moveLatLng.distanceTo(latlng);
            } else {
                radius = this._map.distance(moveLatLng, latlng);
            }

            this._map.fire(L.Draw.Event.RADIUSCHANGE, { radius: radius.toFixed(1) });

            this._shape.setRadius(radius);
            this._map.fire(L.Draw.Event.EDITRESIZE, { layer: this._shape });
        },

    });

    L.Circle.addInitHook(function () {
        if (L.Edit.Circle) {
            this.editing = new L.Edit.Circle(this);

            if (this.options.editable) {
                this.editing.enable();
            }
        }
    });

    L.Map.mergeOptions({
        touchExtend: true
    });

    /**
     * @class L.Map.TouchExtend
     * @aka TouchExtend
     */
    L.Map.TouchExtend = L.Handler.extend({

        // @method initialize(): void
        // Sets TouchExtend private accessor variables
        initialize: function (map) {
            this._map = map;
            this._container = map._container;
            this._pane = map._panes.drawGeom;
        },

        // @method addHooks(): void
        // Adds dom listener events to the map container
        addHooks: function () {
            L.DomEvent.on(this._container, 'touchstart', this._onTouchStart, this);
            L.DomEvent.on(this._container, 'touchend', this._onTouchEnd, this);
            L.DomEvent.on(this._container, 'touchmove', this._onTouchMove, this);
            L.DomEvent.on(this._container, 'touchcancel', this._onTouchCancel, this);
            L.DomEvent.on(this._container, 'touchleave', this._onTouchLeave, this);
        },

        // @method removeHooks(): void
        // Removes dom listener events from the map container
        removeHooks: function () {
            L.DomEvent.off(this._container, 'touchstart', this._onTouchStart, this);
            L.DomEvent.off(this._container, 'touchend', this._onTouchEnd, this);
            L.DomEvent.off(this._container, 'touchmove', this._onTouchMove, this);
            L.DomEvent.off(this._container, 'touchcancel', this._onTouchCancel, this);
            L.DomEvent.off(this._container, 'touchleave', this._onTouchLeave, this);
        },

        _touchEvent: function (e, type) {
            var touchEvent = {};
            if (typeof e.touches !== 'undefined') {
                if (!e.touches.length) {
                    return;
                }
                touchEvent = e.touches[0];
            } else if (e.pointerType === 'touch') {
                touchEvent = e;
                if (!this._filterClick(e)) {
                    return;
                }
            } else {
                return;
            }

            var containerPoint = this._map.mouseEventToContainerPoint(touchEvent),
                layerPoint = this._map.mouseEventToLayerPoint(touchEvent),
                latlng = this._map.layerPointToLatLng(layerPoint);

            this._map.fire(type, {
                latlng: latlng,
                layerPoint: layerPoint,
                containerPoint: containerPoint,
                pageX: touchEvent.pageX,
                pageY: touchEvent.pageY,
                originalEvent: e
            });
        },

        /** Borrowed from Leaflet and modified for bool ops **/
        _filterClick: function (e) {
            var timeStamp = (e.timeStamp || e.originalEvent.timeStamp),
                elapsed = L.DomEvent._lastClick && (timeStamp - L.DomEvent._lastClick);

            // are they closer together than 500ms yet more than 100ms?
            // Android typically triggers them ~300ms apart while multiple listeners
            // on the same event should be triggered far faster;
            // or check if click is simulated on the element, and if it is, reject any non-simulated events
            if ((elapsed && elapsed > 100 && elapsed < 500) || (e.target._simulatedClick && !e._simulated)) {
                L.DomEvent.stop(e);
                return false;
            }

            L.DomEvent._lastClick = timeStamp;
            return true;
        },

        _onTouchStart: function (e) {
            if (!this._map._loaded) {
                return;
            }

            var type = 'touchstart';
            this._touchEvent(e, type);

        },

        _onTouchEnd: function (e) {
            if (!this._map._loaded) {
                return;
            }

            var type = 'touchend';
            this._touchEvent(e, type);
        },

        _onTouchCancel: function (e) {
            if (!this._map._loaded) {
                return;
            }

            var type = 'touchcancel';
            this._touchEvent(e, type);
        },

        _onTouchLeave: function (e) {
            if (!this._map._loaded) {
                return;
            }

            var type = 'touchleave';
            this._touchEvent(e, type);
        },

        _onTouchMove: function (e) {
            if (!this._map._loaded) {
                return;
            }

            var type = 'touchmove';
            this._touchEvent(e, type);
        }
    });

    L.Map.addInitHook('addHandler', 'touchExtend', L.Map.TouchExtend);

    /**
     * @class L.Marker.Touch
     * @aka Marker.Touch
     *
     * This isn't full Touch support. This is just to get markers to also support dom touch events after creation
     */
    L.Marker.Touch = L.Marker.extend({

        _initInteraction: function () {
            if (!this.addInteractiveTarget) {
                // 0.7.x support
                return this._initInteractionLegacy();
            }

            return L.Marker.prototype._initInteraction.apply(this);
        },

        // This is an exact copy of https://github.com/Leaflet/Leaflet/blob/v0.7/src/layer/marker/Marker.js
        // with the addition of the touch events
        _initInteractionLegacy: function () {

            if (!this.options.clickable) {
                return;
            }

            var icon = this._icon,
                events = [
                    'dblclick',
                    'mousedown',
                    'mouseover',
                    'mouseout',
                    'contextmenu',
                    'touchstart',
                    'touchend',
                    'touchmove'
                ];

            events.concat(['touchcancel']);

            // Updated class name with Leaflet 1.8 update: https://github.com/Leaflet/Leaflet/pull/7719/files
            L.DomUtil.addClass(icon, 'leaflet-interactive');
            L.DomEvent.on(icon, 'click', this._onMouseClick, this);
            L.DomEvent.on(icon, 'keypress', this._onKeyPress, this);

            for (var i = 0; i < events.length; i++) {
                L.DomEvent.on(icon, events[i], this._fireMouseEvent, this);
            }

            if (L.Handler.MarkerDrag) {
                this.dragging = new L.Handler.MarkerDrag(this);

                if (this.options.draggable) {
                    this.dragging.enable();
                }
            }
        }
    });

    /**
     * @class L.LatLngUtil
     * @aka LatLngUtil
     */
    L.LatLngUtil = {
        // Clones a LatLngs[], returns [][]

        // @method cloneLatLngs(LatLngs[]): L.LatLngs[]
        // Clone the latLng point or points or nested points and return an array with those points
        cloneLatLngs: function (latlngs) {
            var clone = [];
            for (var i = 0, l = latlngs.length; i < l; i++) {
                // Check for nested array (Polyline/Polygon)
                if (Array.isArray(latlngs[i])) {
                    clone.push(L.LatLngUtil.cloneLatLngs(latlngs[i]));
                } else {
                    clone.push(this.cloneLatLng(latlngs[i]));
                }
            }

            return clone;
        },

        // @method cloneLatLng(LatLng): L.LatLng
        // Clone the latLng and return a new LatLng object.
        cloneLatLng: function (latlng) {
            return L.latLng(latlng.lat, latlng.lng);
        }
    };

    (function () {
        var defaultPrecision = {
            km: 2,
            ha: 2,
            m: 0,
            mi: 2,
            ac: 2,
            yd: 0,
            ft: 0,
            nm: 2
        };

        /**
         * @class L.GeometryUtil
         * @aka GeometryUtil
         */
        L.GeometryUtil = L.extend(L.GeometryUtil || {}, {
            // Ported from the OpenLayers implementation.
            // See https://github.com/openlayers/openlayers/blob/master/lib/OpenLayers/Geometry/LinearRing.js#L270

            // @method geodesicArea(): number
            geodesicArea: function (latLngs) {
                var pointsCount = latLngs.length,
                    area = 0.0,
                    d2r = Math.PI / 180,
                    p1, p2;

                if (pointsCount > 2) {
                    for (var i = 0; i < pointsCount; i++) {
                        p1 = latLngs[i];
                        p2 = latLngs[(i + 1) % pointsCount];
                        area += ((p2.lng - p1.lng) * d2r) *
                            (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
                    }
                    area = area * 6378137.0 * 6378137.0 / 2.0;
                }

                return Math.abs(area);
            },

            // @method formattedNumber(n, precision): string
            // Returns n in specified number format (if defined) and precision
            formattedNumber: function (n, precision) {
                var formatted = parseFloat(n).toFixed(precision),
                    format = L.drawLocal.format && L.drawLocal.format.numeric,
                    delimiters = format && format.delimiters,
                    thousands = delimiters && delimiters.thousands,
                    decimal = delimiters && delimiters.decimal;

                if (thousands || decimal) {
                    var splitValue = formatted.split('.');
                    formatted = thousands ? splitValue[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + thousands) : splitValue[0];
                    decimal = decimal || '.';
                    if (splitValue.length > 1) {
                        formatted = formatted + decimal + splitValue[1];
                    }
                }

                return formatted;
            },

            // @method readableArea(area, isMetric, precision): string
            // Returns a readable area string in yards or metric.
            // The value will be rounded as defined by the precision option object.
            readableArea: function (area, isMetric, precision) {
                var areaStr,
                    units,
                    precision = L.Util.extend({}, defaultPrecision, precision);

                if (isMetric) {
                    units = ['ha', 'm'];
                    type = typeof isMetric;
                    if (type === 'string') {
                        units = [isMetric];
                    } else if (type !== 'boolean') {
                        units = isMetric;
                    }

                    if (area >= 1000000 && units.indexOf('km') !== -1) {
                        areaStr = L.GeometryUtil.formattedNumber(area * 0.000001, precision['km']) + ' km²';
                    } else if (area >= 10000 && units.indexOf('ha') !== -1) {
                        areaStr = L.GeometryUtil.formattedNumber(area * 0.0001, precision['ha']) + ' ha';
                    } else {
                        areaStr = L.GeometryUtil.formattedNumber(area, precision['m']) + ' m²';
                    }
                } else {
                    area /= 0.836127; // Square yards in 1 meter

                    if (area >= 3097600) { //3097600 square yards in 1 square mile
                        areaStr = L.GeometryUtil.formattedNumber(area / 3097600, precision['mi']) + ' mi²';
                    } else if (area >= 4840) { //4840 square yards in 1 acre
                        areaStr = L.GeometryUtil.formattedNumber(area / 4840, precision['ac']) + ' acres';
                    } else {
                        areaStr = L.GeometryUtil.formattedNumber(area, precision['yd']) + ' yd²';
                    }
                }

                return areaStr;
            },

            // @method readableDistance(distance, units): string
            // Converts a metric distance to one of [ feet, nauticalMile, metric or yards ] string
            //
            // @alternative
            // @method readableDistance(distance, isMetric, useFeet, isNauticalMile, precision): string
            // Converts metric distance to distance string.
            // The value will be rounded as defined by the precision option object.
            readableDistance: function (distance, isMetric, isFeet, isNauticalMile, precision) {
                var distanceStr,
                    units,
                    precision = L.Util.extend({}, defaultPrecision, precision);

                if (isMetric) {
                    units = typeof isMetric == 'string' ? isMetric : 'metric';
                } else if (isFeet) {
                    units = 'feet';
                } else if (isNauticalMile) {
                    units = 'nauticalMile';
                } else {
                    units = 'yards';
                }

                switch (units) {
                    case 'metric':
                        // show metres when distance is < 1km, then show km
                        distanceStr = L.GeometryUtil.formattedNumber(distance / 1000, precision['km']) + ' km';
                        break;
                    case 'feet':
                        distance *= 1.09361 * 3;
                        distanceStr = L.GeometryUtil.formattedNumber(distance, precision['ft']) + ' ft';
                        break;
                    case 'nauticalMile':
                        distance *= 0.53996;
                        distanceStr = L.GeometryUtil.formattedNumber(distance / 1000, precision['nm']) + ' nm';
                        break;
                    case 'yards':
                    default:
                        distance *= 1.09361;
                        if (distance > 1760) {
                            distanceStr = L.GeometryUtil.formattedNumber(distance / 1760, precision['mi']) + ' miles';
                        } else {
                            distanceStr = L.GeometryUtil.formattedNumber(distance, precision['yd']) + ' yd';
                        }
                        break;
                }
                return distanceStr;
            },

            // @method isVersion07x(): boolean
            // Returns true if the Leaflet version is 0.7.x, false otherwise.
            isVersion07x: function () {
                var version = L.version.split('.');
                //If Version is == 0.7.*
                return parseInt(version[0], 10) === 0 && parseInt(version[1], 10) === 7;
            },
        });
    })();

    /**
     * @class L.LineUtil
     * @aka Util
     * @aka L.Utils
     */
    L.Util.extend(L.LineUtil, {

        // @method segmentsIntersect(): boolean
        // Checks to see if two line segments intersect. Does not handle degenerate cases.
        // http://compgeom.cs.uiuc.edu/~jeffe/teaching/373/notes/x06-sweepline.pdf
        segmentsIntersect: function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2, /*Point*/ p3) {
            return this._checkCounterclockwise(p, p2, p3) !==
                this._checkCounterclockwise(p1, p2, p3) &&
                this._checkCounterclockwise(p, p1, p2) !==
                this._checkCounterclockwise(p, p1, p3);
        },

        // check to see if points are in counterclockwise order
        _checkCounterclockwise: function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2) {
            return (p2.y - p.y) * (p1.x - p.x) > (p1.y - p.y) * (p2.x - p.x);
        }
    });

    /**
     * @class L.Polyline
     * @aka Polyline
     */
    L.Polyline.include({

        // @method intersects(): boolean
        // Check to see if this polyline has any linesegments that intersect.
        // NOTE: does not support detecting intersection for degenerate cases.
        intersects: function () {
            var points = this._getProjectedPoints(),
                len = points ? points.length : 0,
                i, p, p1;

            if (this._tooFewPointsForIntersection()) {
                return false;
            }

            for (i = len - 1; i >= 3; i--) {
                p = points[i - 1];
                p1 = points[i];


                if (this._lineSegmentsIntersectsRange(p, p1, i - 2)) {
                    return true;
                }
            }

            return false;
        },

        // @method newLatLngIntersects(): boolean
        // Check for intersection if new latlng was added to this polyline.
        // NOTE: does not support detecting intersection for degenerate cases.
        newLatLngIntersects: function (latlng, skipFirst) {
            // Cannot check a polyline for intersecting lats/lngs when not added to the map
            if (!this._map) {
                return false;
            }

            return this.newPointIntersects(this._map.latLngToLayerPoint(latlng), skipFirst);
        },

        // @method newPointIntersects(): boolean
        // Check for intersection if new point was added to this polyline.
        // newPoint must be a layer point.
        // NOTE: does not support detecting intersection for degenerate cases.
        newPointIntersects: function (newPoint, skipFirst) {
            var points = this._getProjectedPoints(),
                len = points ? points.length : 0,
                lastPoint = points ? points[len - 1] : null,
                // The previous previous line segment. Previous line segment doesn't need testing.
                maxIndex = len - 2;

            if (this._tooFewPointsForIntersection(1)) {
                return false;
            }

            return this._lineSegmentsIntersectsRange(lastPoint, newPoint, maxIndex, skipFirst ? 1 : 0);
        },

        // Polylines with 2 sides can only intersect in cases where points are collinear (we don't support detecting these).
        // Cannot have intersection when < 3 line segments (< 4 points)
        _tooFewPointsForIntersection: function (extraPoints) {
            var points = this._getProjectedPoints(),
                len = points ? points.length : 0;
            // Increment length by extraPoints if present
            len += extraPoints || 0;

            return !points || len <= 3;
        },

        // Checks a line segment intersections with any line segments before its predecessor.
        // Don't need to check the predecessor as will never intersect.
        _lineSegmentsIntersectsRange: function (p, p1, maxIndex, minIndex) {
            var points = this._getProjectedPoints(),
                p2, p3;

            minIndex = minIndex || 0;

            // Check all previous line segments (beside the immediately previous) for intersections
            for (var j = maxIndex; j > minIndex; j--) {
                p2 = points[j - 1];
                p3 = points[j];

                if (L.LineUtil.segmentsIntersect(p, p1, p2, p3)) {
                    return true;
                }
            }

            return false;
        },

        _getProjectedPoints: function () {
            if (!this._defaultShape) {
                return this._originalPoints;
            }
            var points = [],
                _shape = this._defaultShape();

            for (var i = 0; i < _shape.length; i++) {
                points.push(this._map.latLngToLayerPoint(_shape[i]));
            }
            return points;
        }
    });

    /**
     * @class L.Polygon
     * @aka Polygon
     */
    L.Polygon.include({

        // @method intersects(): boolean
        // Checks a polygon for any intersecting line segments. Ignores holes.
        intersects: function () {
            var polylineIntersects,
                points = this._getProjectedPoints(),
                len, firstPoint, lastPoint, maxIndex;

            if (this._tooFewPointsForIntersection()) {
                return false;
            }

            polylineIntersects = L.Polyline.prototype.intersects.call(this);

            // If already found an intersection don't need to check for any more.
            if (polylineIntersects) {
                return true;
            }

            len = points.length;
            firstPoint = points[0];
            lastPoint = points[len - 1];
            maxIndex = len - 2;

            // Check the line segment between last and first point. Don't need to check the first line segment (minIndex = 1)
            return this._lineSegmentsIntersectsRange(lastPoint, firstPoint, maxIndex, 1);
        }
    });

    L.Map.mergeOptions({
        drawControlTooltips: true,
        drawControl: false
    });

    L.Draw = L.Draw || {};
    /**
     * @class L.Draw.Tooltip
     * @aka Tooltip
     *
     * The tooltip class — it is used to display the tooltip while drawing
     *
     */
    L.Draw.Tooltip = L.Class.extend({

        // @section Methods for modifying draw state

        // @method initialize(map): void
        // Tooltip constructor
        initialize: function (map) {
            this._map = map;
            this._popupPane = map._panes.drawPopup;
            this._visible = false;

            this._container = map.options.drawControlTooltips ?
                L.DomUtil.create('div', 'leaflet-draw-tooltip', this._popupPane) : null;
            this._singleLineLabel = false;

            this._map.on('mouseout', this._onMouseOut, this);
        },

        // @method dispose(): void
        // Remove Tooltip DOM and unbind events
        dispose: function () {
            this._map.off('mouseout', this._onMouseOut, this);

            if (this._container) {
                if (this._popupPane) {
                    this._popupPane.removeChild(this._container);
                }
                this._container = null;
            }
        },

        // @method updateContent(labelText): this
        // Changes the tooltip text to string in function call
        updateContent: function (labelText) {
            if (!this._container) {
                return this;
            }
            labelText.subtext = labelText.subtext || '';

            // update the vertical position (only if changed)
            if (labelText.subtext.length === 0 && !this._singleLineLabel) {
                L.DomUtil.addClass(this._container, 'leaflet-draw-tooltip-single');
                this._singleLineLabel = true;
            }
            else if (labelText.subtext.length > 0 && this._singleLineLabel) {
                L.DomUtil.removeClass(this._container, 'leaflet-draw-tooltip-single');
                this._singleLineLabel = false;
            }

            this._container.innerHTML =
                (labelText.subtext.length > 0 ?
                    '<span class="leaflet-draw-tooltip-subtext">' + labelText.subtext + '</span>' + '<br />' : '') +
                '<span>' + labelText.text + '</span>';

            if (!labelText.text && !labelText.subtext) {
                this._visible = false;
                this._container.style.visibility = 'hidden';
            } else {
                this._visible = true;
                this._container.style.visibility = 'inherit';
            }

            return this;
        },

        // @method updatePosition(latlng): this
        // Changes the location of the tooltip
        updatePosition: function (latlng) {
            var pos = this._map.latLngToLayerPoint(latlng),
                tooltipContainer = this._container;

            if (this._container) {
                if (this._visible) {
                    tooltipContainer.style.visibility = 'inherit';
                }
                L.DomUtil.setPosition(tooltipContainer, pos);
            }

            return this;
        },

        // @method showAsError(): this
        // Applies error class to tooltip
        showAsError: function () {
            if (this._container) {
                L.DomUtil.addClass(this._container, 'leaflet-error-draw-tooltip');
            }

            return this;
        },

        // @method removeError(): this
        // Removes the error class from the tooltip
        removeError: function () {
            if (this._container) {
                L.DomUtil.removeClass(this._container, 'leaflet-error-draw-tooltip');
            }

            return this;
        },

        _onMouseOut: function () {
            if (this._container) {
                this._container.style.visibility = 'hidden';
            }
        }
    });

    /**
     * @class L.EditToolbar.Edit
     * @aka EditToolbar.Edit
     */
    L.Draw.EditDraw = L.Handler.extend({
        statics: {
            TYPE: 'edit'
        },

        // @method intialize(): void
        initialize: function (map, options) {

            L.Handler.prototype.initialize.call(this, map);
            L.setOptions(this, options);

            // Store the selectable layer group for ease of access
            this._featureGroup = options.featureGroup;

            if (!(this._featureGroup instanceof L.FeatureGroup)) {
                throw new Error('options.featureGroup must be a L.FeatureGroup');
            }

            this._uneditedLayerProps = {};

            // Save the type so super can fire, need to do this as cannot do this.TYPE :(
            this.type = L.Draw.EditDraw.TYPE;

            L.Draw.EditDraw.include(L.Evented.prototype);
        },

        // @method enable(): void
        // Enable the edit toolbar
        enable: function () {
            if (this._enabled || !this._hasAvailableLayers()) {
                return;
            }
            this.fire('enabled', { handler: this.type });
            //this disable other handlers

            this._map.fire(L.Draw.Event.EDITSTART, { handler: this.type });
            //allow drawLayer to be updated before beginning edition.

            L.Handler.prototype.enable.call(this);
            this._featureGroup
                .on('layeradd', this._enableLayerEdit, this)
                .on('layerremove', this._disableLayerEdit, this);
        },

        // @method disable(): void
        // Disable the edit toolbar
        disable: function () {
            this._save();
            if (!this._enabled) {
                return;
            }
            this._featureGroup
                .off('layeradd', this._enableLayerEdit, this)
                .off('layerremove', this._disableLayerEdit, this);

            L.Handler.prototype.disable.call(this);
            this._map.fire(L.Draw.Event.EDITSTOP, { handler: this.type });
            this.fire('disabled', { handler: this.type });
        },

        // @method addHooks(): void
        // Add listener hooks for this handler
        addHooks: function () {
            var map = this._map;

            if (map) {
                map.getContainer().focus();
                this._featureGroup.eachLayer(this._enableLayerEdit, this);
            }
        },

        // @method save(): void
        // Save the layer geometries
        _save: function () {
            var editedLayers = new L.LayerGroup();
            this._featureGroup.eachLayer(function (layer) {
                if (layer.edited) {
                    editedLayers.addLayer(layer);
                    layer.edited = false;
                }
            });

            this._map.fire(L.Draw.Event.EDITED, { layers: editedLayers });
        },

        // @method removeHooks(): void
        // Remove listener hooks for this handler
        removeHooks: function () {
            if (this._map) {
                // Clean up selected layers.
                this._featureGroup.eachLayer(this._disableLayerEdit, this);

                // Clear the backups of the original layers
                this._uneditedLayerProps = {};
            }
        },

        // @method revertLayers(): void
        // Revert each layer's geometry changes
        revertLayers: function () {
            this._featureGroup.eachLayer(function (layer) {
                this._revertLayer(layer);
            }, this);
        },

        _backupLayer: function (layer) {
            var id = L.Util.stamp(layer);

            if (!this._uneditedLayerProps[id]) {
                // Polyline, Polygon or Rectangle
                if (layer instanceof L.Polyline || layer instanceof L.Polygon || layer instanceof L.Rectangle) {
                    this._uneditedLayerProps[id] = {
                        latlngs: L.LatLngUtil.cloneLatLngs(layer.getLatLngs())
                    };
                } else if (layer instanceof L.Circle) {
                    this._uneditedLayerProps[id] = {
                        latlng: L.LatLngUtil.cloneLatLng(layer.getLatLng()),
                        radius: layer.getRadius()
                    };
                } else if (layer instanceof L.Marker || layer instanceof L.CircleMarker) { // Marker
                    this._uneditedLayerProps[id] = {
                        latlng: L.LatLngUtil.cloneLatLng(layer.getLatLng())
                    };
                }
            }
        },

        _revertLayer: function (layer) {
            var id = L.Util.stamp(layer);
            layer.edited = false;
            if (this._uneditedLayerProps.hasOwnProperty(id)) {
                // Polyline, Polygon or Rectangle
                if (layer instanceof L.Polyline || layer instanceof L.Polygon || layer instanceof L.Rectangle) {
                    layer.setLatLngs(this._uneditedLayerProps[id].latlngs);
                } else if (layer instanceof L.Circle) {
                    layer.setLatLng(this._uneditedLayerProps[id].latlng);
                    layer.setRadius(this._uneditedLayerProps[id].radius);
                } else if (layer instanceof L.Marker || layer instanceof L.CircleMarker) { // Marker or CircleMarker
                    layer.setLatLng(this._uneditedLayerProps[id].latlng);
                }

                layer.fire('revert-edited', { layer: layer });
            }
        },

        _enableLayerEdit: function (e) {
            var layer = e.layer || e.target || e,
                pathOptions, poly;

            // Back up this layer (if haven't before)
            this._backupLayer(layer);

            if (this.options.poly) {
                poly = L.Util.extend({}, this.options.poly);
                layer.options.poly = poly;
            }

            // Set different style for editing mode
            if (this.options.selectedPathOptions) {
                pathOptions = L.Util.extend({}, this.options.selectedPathOptions);

                // Use the existing color of the layer
                if (pathOptions.maintainColor) {
                    pathOptions.color = layer.options.color;
                    pathOptions.fillColor = layer.options.fillColor;
                }

                layer.options.original = L.extend({}, layer.options);
                layer.options.editing = pathOptions;

            }

            if (layer instanceof L.Marker) {
                if (layer.editing) {
                    layer.editing.enable();
                }
                layer.dragging.enable();
                layer
                    .on('dragend', this._onMarkerDragEnd)
                    .on('touchmove', this._onTouchMove, this)
                    .on('touchend', this._onMarkerDragEnd, this);
            } else {
                if (layer.editing) {
                    layer.editing.enable();
                }
            }
        },

        _disableLayerEdit: function (e) {
            var layer = e.layer || e.target || e;

            layer.edited = false;
            if (layer.editing) {
                layer.editing.disable();
            }

            delete layer.options.editing;
            delete layer.options.original;

            // Reset layer styles to that of before select
            if (this._selectedPathOptions) {
                if (!(layer instanceof L.Marker)) {
                    // reset the layer style to what is was before being selected
                    layer.setStyle(layer.options.previousOptions);
                    // remove the cached options for the layer object
                    delete layer.options.previousOptions;
                }
            }

            if (layer instanceof L.Marker) {
                layer.dragging.disable();
                layer
                    .off('dragend', this._onMarkerDragEnd, this)
                    .off('touchmove', this._onTouchMove, this)
                    .off('touchend', this._onMarkerDragEnd, this);
            } else {
                if (layer.editing) {
                    layer.editing.disable();
                }
            }
        },

        _onMarkerDragEnd: function (e) {
            var layer = e.target;
            layer.edited = true;
            this._map.fire(L.Draw.Event.EDITMOVE, { layer: layer });
        },

        _onTouchMove: function (e) {
            var touchEvent = e.originalEvent.changedTouches[0],
                layerPoint = this._map.mouseEventToLayerPoint(touchEvent),
                latlng = this._map.layerPointToLatLng(layerPoint);
            e.target.setLatLng(latlng);
        },

        _hasAvailableLayers: function () {
            return this._featureGroup.getLayers().length !== 0;
        }
    });

    /**
     * @class L.EditToolbar.Delete
     * @aka EditToolbar.Delete
     */
    L.Draw.DeleteDraw = L.Handler.extend({
        statics: {
            TYPE: 'remove' // not delete as delete is reserved in js
        },

        // @method intialize(): void
        initialize: function (map, options) {
            L.Handler.prototype.initialize.call(this, map);
            L.Util.setOptions(this, options);

            // Store the selectable layer group for ease of access
            this._deletableLayers = this.options.featureGroup;

            if (!(this._deletableLayers instanceof L.FeatureGroup)) {
                throw new Error('options.featureGroup must be a L.FeatureGroup');
            }

            // Save the type so super can fire, need to do this as cannot do this.TYPE :(
            this.type = L.Draw.DeleteDraw.TYPE;

            var version = L.version.split('.');
            //If Version is >= 1.2.0
            if (parseInt(version[0], 10) === 1 && parseInt(version[1], 10) >= 2) {
                L.Draw.DeleteDraw.include(L.Evented.prototype);
            } else {
                L.Draw.DeleteDraw.include(L.Mixin.Events);
            }

        },

        // @method addHooks(): void
        // Add listener hooks to this handler
        addHooks: function () {
            var map = this._map;

            if (map) {
                map.getContainer().focus();
                this._deletableLayers.eachLayer(this._enableLayerDelete, this);
                this._deletedLayers = new L.LayerGroup();
                this._tooltip = new L.Draw.Tooltip(this._map);
                this._tooltip.updateContent({ text: L.drawLocal.edit.handlers.remove.tooltip.text });
                this._map.on('mousemove', this._onMouseMove, this);
            }
        },

        // @method removeHooks(): void
        // Remove listener hooks from this handler
        removeHooks: function () {
            if (this._map) {
                this._deletableLayers.eachLayer(this._disableLayerDelete, this);
                this._deletedLayers = null;
                this._tooltip.dispose();
                this._tooltip = null;
                this._map.off('mousemove', this._onMouseMove, this);
            }
        },

        // @method revertLayers(): void
        // Revert the deleted layers back to their prior state.
        revertLayers: function () {
            this._enable();
            // Iterate of the deleted layers and add them back into the featureGroup
            this._deletedLayers.eachLayer(function (layer) {
                this._deletableLayers.addLayer(layer);
                layer.fire('revert-deleted', { layer: layer });
            }, this);
            this._save();
            this._disable();
        },

        // @method removeAllLayers(): void
        // Remove all delateable layers
        removeAllLayers: function () {
            this._enable();

            // Iterate of the delateable layers and add remove them
            this._deletableLayers.eachLayer(function (layer) {
                this._removeLayer({ layer: layer });
            }, this);

            this._save();

            this._disable();
        },

        // // @method enable(): void
        // // Enable the delete toolbar
        _enable: function () {
            if (this._enabled || !this._hasAvailableLayers()) {
                return;
            }

            this.fire('enabled', { handler: this.type });
            this._map.fire(L.Draw.Event.DELETESTART, { handler: this.type });
            L.Handler.prototype.enable.call(this);

            this._deletableLayers
                .on('layeradd', this._enableLayerDelete, this)
                .on('layerremove', this._disableLayerDelete, this);
        },

        // @method disable(): void
        // Disable the delete toolbar
        _disable: function () {

            if (!this._enabled) {
                return;
            }

            this._deletableLayers
                .off('layeradd', this._enableLayerDelete, this)
                .off('layerremove', this._disableLayerDelete, this);

            L.Handler.prototype.disable.call(this);
            this._map.fire(L.Draw.Event.DELETESTOP, { handler: this.type });
            this.fire('disabled', { handler: this.type });
        },

        // @method save(): void
        // Save deleted layers
        _save: function () {
            this._map.fire(L.Draw.Event.DELETED, { layers: this._deletedLayers });
        },

        _enableLayerDelete: function (e) {
            var layer = e.layer || e.target || e;
            layer.on('click', this._removeLayer, this);
        },

        _disableLayerDelete: function (e) {
            var layer = e.layer || e.target || e;
            layer.off('click', this._removeLayer, this);

            // Remove from the deleted layers so we can't accidentally revert if the user presses cancel
            this._deletedLayers.removeLayer(layer);
        },

        _removeLayer: function (e) {
            var layer = e.layer || e.target || e;
            this._deletableLayers.removeLayer(layer);
            this._deletedLayers.addLayer(layer);

            layer.fire('deleted');
        },

        _onMouseMove: function (e) {
            this._tooltip.updatePosition(e.latlng);
        },

        _hasAvailableLayers: function () {
            return this._deletableLayers.getLayers().length !== 0;
        }
    });

}(window, document));
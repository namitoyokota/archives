/*! leaflet-wfst 1.2.0-alpha04 2017-08-04 */

const { ɵɵqueryRefresh } = require("@angular/core");

(function (window, document, undefined) {

    "use strict";

    L.XmlUtil = {
        namespaces: {
            xlink: 'http://www.w3.org/1999/xlink',
            xmlns: 'http://www.w3.org/2000/xmlns/',
            xsd: 'http://www.w3.org/2001/XMLSchema',
            xsi: 'http://www.w3.org/2001/XMLSchema-instance',
            wfs: 'http://www.opengis.net/wfs/2.0',
            ows: 'http://www.opengis.net/ows/1.1',
            gml: 'http://www.opengis.net/gml/3.2',
            ogc: 'http://www.opengis.net/ogc',
            ows: 'http://www.opengis.net/ows',
            fes: 'http://www.opengis.net/fes/2.0'
        },

        // TODO: find another way to create a new document with doctype text/xml?
        xmldoc: (new DOMParser()).parseFromString('<root />', 'text/xml'),

        setAttributes: function (node, attributes) {
            for (var name in attributes) {
                if (attributes[name] != null && attributes[name].toString) {
                    var value = attributes[name].toString();
                    var uri = this.namespaces[name.substring(0, name.indexOf(':'))] || null;
                    node.setAttributeNS(uri, name, value);
                }
            }
        },

        evaluate: function (xpath, rawxml) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(rawxml, 'text/xml');
            var xpe = new XPathEvaluator();
            var nsResolver = xpe.createNSResolver(xmlDoc.documentElement);

            return xpe.evaluate(xpath, xmlDoc, nsResolver, XPathResult.ANY_TYPE, null);
        },

        createElementNS: function (name, attributes, options) {
            options = options || {};

            var uri = options.uri;

            if (!uri) {
                uri = this.namespaces[name.substring(0, name.indexOf(':'))];
            }

            if (!uri) {
                uri = this.namespaces[options.prefix];
            }

            var node = uri ? this.xmldoc.createElementNS(uri, name) : this.xmldoc.createElement(name);

            if (attributes) {
                this.setAttributes(node, attributes);
            }

            if (options.value != null) {
                node.appendChild(this.xmldoc.createTextNode(options.value));
            }

            return node;
        },

        createTextNode: function (value) {
            if (value ||
                value === 0) {

                return this.xmldoc.createTextNode(value);
            }

            return this.xmldoc.createTextNode('');
        },

        getNodeText: function (node) {
            if (!node) {
                return '';
            }

            return node.innerText || node.textContent || node.text;
        },

        serializeXmlDocumentString: function (node) {
            var doc = document.implementation.createDocument('', '', null);
            doc.appendChild(node);
            var serializer = new XMLSerializer();
            return serializer.serializeToString(doc);
        },

        serializeXmlToString: function (node) {
            var serializer = new XMLSerializer();
            return serializer.serializeToString(node);
        },

        parseXml: function (rawXml) {
            if (typeof window.DOMParser !== 'undefined') {
                return (new window.DOMParser()).parseFromString(rawXml, 'text/xml');
            } else if (typeof window.ActiveXObject !== 'undefined' && new window.ActiveXObject('Microsoft.XMLDOM')) {
                var xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM');
                xmlDoc.async = 'false';
                xmlDoc.loadXML(rawXml);
                return xmlDoc;
            } else {
                throw new Error('No XML parser found');
            }
        },

        parseOwsExceptionReport: function (rawXml) {
            var exceptionReportElement = L.XmlUtil.parseXml(rawXml).documentElement;
            if (!exceptionReportElement || exceptionReportElement.tagName !== 'ows:ExceptionReport') {
                return null;
            }

            var exceptionReport = {
                exceptions: [],
                message: ''
            };

            var exceptionsNodes = exceptionReportElement.getElementsByTagNameNS(L.XmlUtil.namespaces.ows, 'Exception');
            for (var i = 0, exceptionsNodesCount = exceptionsNodes.length; i < exceptionsNodesCount; i++) {
                var exceptionNode = exceptionsNodes[i];
                var exceptionCode = exceptionNode.getAttribute('exceptionCode');
                var exceptionsTextNodes = exceptionNode.getElementsByTagNameNS(L.XmlUtil.namespaces.ows, 'ExceptionText');
                var exception = {
                    code: exceptionCode,
                    text: ''
                };

                for (var j = 0, textNodesCount = exceptionsTextNodes.length; j < textNodesCount; j++) {
                    var exceptionTextNode = exceptionsTextNodes[j];
                    var exceptionText = exceptionTextNode.innerText || exceptionTextNode.textContent || exceptionTextNode.text;

                    exception.text += exceptionText;
                    if (j < textNodesCount - 1) {
                        exception.text += '. ';
                    }
                }

                exceptionReport.message += exception.code + ' - ' + exception.text;
                if (i < exceptionsNodesCount - 1) {
                    exceptionReport.message += ' ';
                }

                exceptionReport.exceptions.push(exception);
            }

            return exceptionReport;
        }
    };

    L.Util.request = function (options) {
        options = L.extend({
            async: true,
            method: 'POST',
            data: '',
            params: {},
            headers: {},
            url: window.location.href,
            success: function (data) {
                console.log(data);
            },
            error: function (data) {
                console.log('Ajax request fail');
                console.log(data);
            },
            complete: function () {
            }
        }, options);

        // good bye IE 6,7
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    options.success(xhr.responseText);
                } else {
                    options.error(xhr.responseText);
                }
                options.complete();
            }
        };

        var url = options.url + L.Util.getParamString(options.params, options.url);

        xhr.open(options.method, url, options.async);
        for (var header in options.headers) {
            xhr.setRequestHeader(header, options.headers[header]);
        }

        xhr.send(options.data);
    };

    L.Filter = {};

    L.filter = function (filters) {
        var result = L.XmlUtil.createElementNS('ogc:Filter');

        if (Array.isArray(filters)) {
            filters.forEach(function (element) {
                result.appendChild(element.toGml());
            });
        } else if (filters) {
            result.appendChild(filters.toGml());
        }

        return result;
    };

    L.Filter.propertyName = function (value) {
        return L.XmlUtil.createElementNS('ogc:PropertyName', {}, { value: value });
    };

    L.Filter.literal = function (value) {
        return L.XmlUtil.createElementNS('ogc:Literal', {}, { value: value });
    };

    L.Filter.element = function (value) {
        if (value instanceof Element) {
            return value;
        }

        return value.toGml();
    };

    L.Filter.propertyElement = function (value) {
        if (value instanceof Element) {
            return value;
        }

        if (value && typeof (value.toGml) === "function") {
            return value.toGml();
        }

        return L.Filter.propertyName(value);
    };

    L.Filter.literalElement = function (value) {
        if (value instanceof Element) {
            return value;
        }

        if (value && typeof (value.toGml) === "function") {
            return value.toGml();
        }

        return L.Filter.literal(value);
    };

    L.Filter.Abstract = L.Class.extend({
        attributes: {},

        options: {},

        tagName: null,

        buildFilterContent: function () {
            throw "Build filter content is abstract and should be implemented";
        },

        toGml: function () {
            var filterElement = L.XmlUtil.createElementNS(this.tagName, this.attributes, this.options);
            this.buildFilterContent(filterElement);
            return filterElement;
        }
    });

    L.Filter.BinarySpatial = L.Filter.Abstract.extend({
        initialize: function (propertyName, value, crs) {
            this.propertyName = propertyName;
            this.value = value;
            this.crs = crs;
        },

        buildFilterContent: function (filterElement) {
            filterElement.appendChild(L.Filter.propertyName(this.propertyName));
            if (typeof (this.value) === "string") {
                filterElement.appendChild(L.Filter.propertyName(this.value));
            } else {
                filterElement.appendChild(this.value.toGml(this.crs));
            }
            return filterElement;
        }
    });

    L.Filter.Equals = L.Filter.BinarySpatial.extend({
        tagName: 'ogc:Equals'
    });

    L.Filter.equals = function (options) {
        return new L.Filter.Equals(options);
    };

    L.Filter.Disjoint = L.Filter.BinarySpatial.extend({
        tagName: 'ogc:Disjoint'
    });

    L.Filter.disjoint = function (options) {
        return new L.Filter.Disjoint(options);
    };

    L.Filter.Touches = L.Filter.BinarySpatial.extend({
        tagName: 'ogc:Touches'
    });

    L.Filter.touches = function (options) {
        return new L.Filter.Touches(options);
    };

    L.Filter.Within = L.Filter.BinarySpatial.extend({
        tagName: 'ogc:Within'
    });

    L.Filter.within = function (options) {
        return new L.Filter.Within(options);
    };

    L.Filter.Overlaps = L.Filter.BinarySpatial.extend({
        tagName: 'ogc:Overlaps'
    });

    L.Filter.overlaps = function (options) {
        return new L.Filter.Overlaps(options);
    };

    L.Filter.Crosses = L.Filter.BinarySpatial.extend({
        tagName: 'ogc:Crosses'
    });

    L.Filter.crosses = function (options) {
        return new L.Filter.Crosses(options);
    };

    L.Filter.Intersects = L.Filter.BinarySpatial.extend({
        tagName: 'ogc:Intersects'
    });

    L.Filter.intersects = function (options) {
        return new L.Filter.Intersects(options);
    };

    L.Filter.Contains = L.Filter.BinarySpatial.extend({
        tagName: 'ogc:Contains'
    });

    L.Filter.contains = function (options) {
        return new L.Filter.Contains(options);
    };

    L.Filter.DistanceBuffer = L.Filter.Abstract.extend({
        initialize: function (propertyName, geometry, crs, distance, units) {
            this.propertyName = propertyName;
            this.geomerty = geometry;
            this.crs = crs;
            this.distance = distance;
            this.units = units;
        },

        buildFilterContent: function (filterElement) {
            filterElement.appendChild(L.Filter.propertyName(this.propertyName));
            filterElement.appendChild(this.geomerty.toGml(this.crs));
            filterElement.appendChild(L.XmlUtil.createElementNS('ogc:Distance', { 'units': this.units }, { value: this.distance }));
        }
    });

    L.Filter.DWithin = L.Filter.DistanceBuffer.extend({
        tagName: 'ogc:DWithin'
    });

    L.Filter.dwithin = function (propertyName, geometry, crs, distance, units) {
        return new L.Filter.DWithin(propertyName, geometry, crs, distance, units);
    };

    L.Filter.Beyond = L.Filter.DistanceBuffer.extend({
        tagName: 'ogc:Beyond'
    });

    L.Filter.beyond = function (propertyName, geometry, crs, distance, units) {
        return new L.Filter.Beyond(propertyName, geometry, crs, distance, units);
    };

    L.Filter.BBox = L.Filter.Abstract.extend({
        tagName: 'ogc:BBOX',

        geometryField: null,

        bbox: null,

        crs: null,

        initialize: function (geometryField, bbox, crs) {
            this.bbox = bbox;
            this.geometryField = geometryField;
            this.crs = crs;
        },

        buildFilterContent: function (filterElement) {
            if (this.geometryField) {
                filterElement.appendChild(L.Filter.propertyName(this.geometryField));
            }

            filterElement.appendChild(this.bbox.toGml(this.crs));
        }
    });

    L.Filter.bbox = function (geometryField, bbox, crs) {
        return new L.Filter.BBox(geometryField, bbox, crs);
    };

    L.Filter.GmlObjectID = L.Filter.Abstract.extend({
        tagName: 'ogc:GmlObjectId',

        initialize: function (id) {
            this.attributes = { 'gml:id': id };
        },

        buildFilterContent: function () {
        }
    });

    L.Filter.gmlobjectid = function (id) {
        return new L.Filter.GmlObjectID(id);
    };

    L.Filter.BinaryOperator = L.Filter.Abstract.extend({
        initialize: function (firstValue, secondValue) {
            this.firstValue = firstValue;
            this.secondValue = secondValue;
        },

        buildFilterContent: function (filterElement) {
            filterElement.appendChild(L.Filter.propertyElement(this.firstValue));
            filterElement.appendChild(L.Filter.literalElement(this.secondValue));
        }
    });

    L.Filter.Add = L.Filter.BinaryOperator.extend({
        tagName: 'Add'
    });

    L.Filter.add = function (a, b) {
        return new L.Filter.Add(a, b);
    };

    L.Filter.Sub = L.Filter.BinaryOperator.extend({
        tagName: 'Sub'
    });

    L.Filter.sub = function (a, b) {
        return new L.Filter.Sub(a, b);
    };

    L.Filter.Mul = L.Filter.BinaryOperator.extend({
        tagName: 'Mul'
    });

    L.Filter.mul = function (a, b) {
        return new L.Filter.Mul(a, b);
    };

    L.Filter.Div = L.Filter.BinaryOperator.extend({
        tagName: 'Div'
    });

    L.Filter.div = function (a, b) {
        return new L.Filter.Div(a, b);
    };

    L.Filter.BinaryComparison = L.Filter.BinaryOperator.extend({
        attributes: {
            matchCase: false
        },

        initialize: function (firstValue, secondValue, matchCase) {
            L.Filter.BinaryOperator.prototype.initialize.call(this, firstValue, secondValue);
            this.attributes.matchCase = !!matchCase;
        }
    });

    L.Filter.EQ = L.Filter.BinaryComparison.extend({
        tagName: 'ogc:PropertyIsEqualTo'
    });

    L.Filter.eq = function (firstValue, secondValue) {
        return new L.Filter.EQ(firstValue, secondValue);
    };

    L.Filter.NotEQ = L.Filter.BinaryComparison.extend({
        tagName: 'ogc:PropertyIsNotEqualTo'
    });

    L.Filter.neq = function (firstValue, secondValue) {
        return new L.Filter.NotEQ(firstValue, secondValue);
    };

    L.Filter.LT = L.Filter.BinaryComparison.extend({
        tagName: 'ogc:PropertyIsLessThan'
    });

    L.Filter.lt = function (firstValue, secondValue) {
        return new L.Filter.LT(firstValue, secondValue);
    };

    L.Filter.GT = L.Filter.BinaryComparison.extend({
        tagName: 'ogc:PropertyIsGreaterThan'
    });

    L.Filter.gt = function (firstValue, secondValue) {
        return new L.Filter.GT(firstValue, secondValue);
    };

    L.Filter.LEQ = L.Filter.BinaryComparison.extend({
        tagName: 'ogc:PropertyIsLessThanOrEqualTo'
    });

    L.Filter.leq = function (firstValue, secondValue) {
        return new L.Filter.LEQ(firstValue, secondValue);
    };

    L.Filter.GEQ = L.Filter.BinaryComparison.extend({
        tagName: 'ogc:PropertyIsGreaterThanOrEqualTo'
    });

    L.Filter.geq = function (firstValue, secondValue) {
        return new L.Filter.GEQ(firstValue, secondValue);
    };

    L.Filter.Like = L.Filter.Abstract.extend({
        tagName: 'ogc:PropertyIsLike',

        attributes: {
            wildCard: '*',
            singleChar: '#',
            escapeChar: '!',
            matchCase: true
        },

        initialize: function (name, val, attributes) {
            this.name = name;
            this.val = val;
            this.attributes = L.extend(this.attributes, attributes || {});
        },

        buildFilterContent: function (filterElement) {
            var nameElement = L.Filter.propertyName(this.name);
            var valueElement = L.Filter.literal(this.val);
            filterElement.appendChild(nameElement);
            filterElement.appendChild(valueElement);
            return filterElement;
        }
    });

    L.Filter.like = function (name, val, attributes) {
        return new L.Filter.Like(name, val, attributes);
    };

    L.Filter.IsNull = L.Filter.Abstract.extend({
        tagName: 'ogc:PropertyIsNull',

        initialize: function (propertyName) {
            this.propertyName = propertyName;
        },

        buildFilterContent: function (filterElement) {
            filterElement.appendChild(L.Filter.propertyName(this.propertyName));
        }
    });

    L.Filter.isnull = function (propertyName) {
        return new L.Filter.IsNull(propertyName);
    };

    L.Filter.IsBetween = L.Filter.Abstract.extend({
        tagName: 'ogc:PropertyIsBetween',

        initialize: function (property, lowerBoundary, upperBoundary) {
            this.property = property;
            this.lowerBoundary = lowerBoundary;
            this.upperBoundary = upperBoundary;
        },

        buildFilterContent: function (filterElement) {
            filterElement.appendChild(L.Filter.propertyElement(this.property));

            var lowerBoundaryElement = L.XmlUtil.createElementNS('ogc:LowerBoundary');
            lowerBoundaryElement.appendChild(L.Filter.literalElement(this.lowerBoundary));

            filterElement.appendChild(lowerBoundaryElement);

            var upperBoundaryElement = L.XmlUtil.createElementNS('ogc:UpperBoundary');
            upperBoundaryElement.appendChild(L.Filter.literalElement(this.upperBoundary));

            filterElement.appendChild(upperBoundaryElement);
        }
    });

    L.Filter.isbetween = function (property, lowerBoundary, upperBoundary) {
        return new L.Filter.IsBetween(property, lowerBoundary, upperBoundary);
    };

    L.Filter.BinaryLogic = L.Filter.Abstract.extend({
        filters: null,

        initialize: function () {
            var filters = [];
            for (var i = 0; i < arguments.length; i++) {
                filters.push(arguments[i]);
            }

            this.filters = filters;
        },

        buildFilterContent: function (filterElement) {
            this.filters.forEach(function (filter) {
                filterElement.appendChild(L.Filter.element(filter));
            });
        }
    });

    L.Filter.And = L.Filter.BinaryLogic.extend({
        tagName: 'And'
    });

    L.Filter.and = function () {
        return new (Function.prototype.bind.apply(L.Filter.And, arguments))();
    };

    L.Filter.Or = L.Filter.BinaryLogic.extend({
        tagName: 'Or'
    });

    L.Filter.or = function () {
        return new (Function.prototype.bind.apply(L.Filter.Or, arguments))();
    };

    L.Filter.Not = L.Filter.Abstract.extend({
        tagName: 'Not',

        initialize: function (filter) {
            this.filter = filter;
        },

        buildFilterContent: function (filterElement) {
            filterElement.appendChild(L.Filter.element(this.filter));
        }
    });

    L.Filter.not = function (filter) {
        return new L.Filter.Not(filter);
    };

    L.Filter.Function = L.Filter.Abstract.extend({
        tagName: 'Function',

        initialize: function () {
            var functionName = arguments[0];
            this.attributes = { name: functionName };
            var expressions = [];
            for (var i = 1; i < arguments.length; i++) {
                expressions.push(arguments[i]);
            }

            this.expressions = expressions;
        },

        buildFilterContent: function (filterElement) {
            var firstArgument = this.expressions[0];
            filterElement.appendChild(L.Filter.propertyElement(firstArgument));

            for (var i = 1; i < this.expressions.length; i++) {
                var functionArgument = this.expressions[i];
                filterElement.appendChild(L.Filter.literalElement(functionArgument));
            }
        }
    });

    L.Filter.function = function () {
        return new (Function.prototype.bind.apply(L.Filter.Function, arguments))();
    };

    L.Format = {};

    L.Format.Scheme = L.Class.extend({
        options: {
            geometryField: 'Shape',
        },

        initialize: function (options) {
            L.setOptions(this, options);
        },

        parse: function (element) {
            var featureType = new L.GML.FeatureType({
                geometryField: this.options.geometryField
            });
            var complexTypeDefinition = element.getElementsByTagNameNS(L.XmlUtil.namespaces.xsd, 'complexType')[0];
            var properties = complexTypeDefinition.getElementsByTagNameNS(L.XmlUtil.namespaces.xsd, 'sequence')[0];
            for (var i = 0; i < properties.childNodes.length; i++) {
                var node = properties.childNodes[i];
                if (node.nodeType !== document.ELEMENT_NODE) {
                    continue;
                }

                var propertyAttr = node.attributes.name;
                if (!propertyAttr) {
                    continue;
                }

                var propertyName = node.attributes.name.value;
                if (propertyName === this.options.geometryField) {
                    continue;
                }

                var typeAttr = node.attributes.type;
                if (!typeAttr) {
                    var restriction = node.getElementsByTagNameNS(L.XmlUtil.namespaces.xsd, 'restriction');
                    typeAttr = restriction.attributes.base;
                }

                if (!typeAttr) {
                    continue;
                }

                var typeName = typeAttr.value.split(':').pop();

                featureType.appendField(propertyName, typeName);
            }

            return featureType;
        }
    });

    L.Format.Base = L.Class.extend({
        defaultOptions: {
            crs: L.CRS.EPSG3857,
            coordsToLatLng: function (coords) {
                return new L.LatLng(coords[1], coords[0], coords[2]);
            },
            latLngToCoords: function (latlng) {
                var coords = [latlng.lng, latlng.lat];
                if (latlng.alt !== undefined) {
                    coords.push(latlng.alt);
                }
                return coords;
            },
            geometryField: 'geometry',
            contextmenu: false,
            contextMenuItems: []
        },

        initialize: function (options) {
            L.setOptions(this, L.extend({}, this.defaultOptions, options));
            if (options.crs) {
                var crs = options.crs;
                this.options.coordsToLatLng = function (coords) {
                    var point = L.point(coords[0], coords[1]);
                    var ll = crs.projection.unproject(point);
                    if (coords[2]) {
                        ll.alt = coords[2];
                    }
                    return ll;
                };
                this.options.latLngToCoords = function (ll) {
                    var latLng = L.latLng(ll);
                    return crs.projection.project(latLng);
                };
            }
        },

        setFeatureDescription: function (featureInfo) {
            this.namespaceUri = featureInfo.attributes.targetNamespace.value;
            var schemeParser = new L.Format.Scheme({
                geometryField: this.options.geometryField
            });
            this.featureType = schemeParser.parse(featureInfo);
        }
    });

    L.Format.GeoJSON = L.Format.Base.extend({

        initialize: function (options) {
            L.Format.Base.prototype.initialize.call(this, options);
            this.outputFormat = 'application/json';
        },

        responseToLayers: function (rawData) {
            var layers = [];
            var geoJson = JSON.parse(rawData);

            for (var i = 0; i < geoJson.features.length; i++) {
                layers.push(this.processFeature(geoJson.features[i]));
            }

            return layers;
        },

        processFeature: function (feature) {
            var layer = this.generateLayer(feature);
            layer.feature = feature;
            return layer;
        },

        generateLayer: function (feature) {
            return L.GeoJSON.geometryToLayer(feature, this.options || null);
        }

    });

    L.GML = L.GML || {};

    L.GML.ParserContainerMixin = {

        parsers: {},

        initializeParserContainer: function () {
            this.parsers = {};
        },

        appendParser: function (parser) {
            this.parsers[parser.elementTag] = parser;
        },

        parseElement: function (element, options) {
            var parser = this.parsers[element.tagName];
            if (!parser) throw ('unknown child element ' + element.tagName);

            return parser.parse(element, options);
        }
    };

    L.GML.Element = L.Class.extend({
        elementTag: '',
        parse: function () {
            throw ('not implemented parse function in parser for ' + this.elementTag);
        }
    });

    L.GML.Geometry = L.GML.Element.extend({
        statics: {
            DIM: 2
        },

        dimensions: function (element) {
            if (element.attributes.srsDimension) {
                return parseInt(element.attributes.srsDimension.value);
            }

            return L.GML.Geometry.DIM;
        }
    });

    L.GML.Coordinates = L.GML.Element.extend({

        defaultSeparator: {
            ds: '.', //decimal separator
            cs: ',', // component separator
            ts: ' ' // tuple separator
        },

        initialize: function () {
            this.elementTag = 'gml:coordinates';
        },

        parse: function (element) {

            var ds = this.defaultSeparator.ds;
            if (element.attributes.decimal) {
                ds = element.attributes.decimal.value;
            }

            var cs = this.defaultSeparator.cs;
            if (element.attributes.cs) {
                cs = element.attributes.cs.value;
            }

            var ts = this.defaultSeparator.ts;
            if (element.attributes.ts) {
                ts = element.attributes.ts.value;
            }

            var result = [];
            var coords = element.textContent.split(ts);

            var mapFunction = function (coord) {
                if (ds !== '.') {
                    coord = coord.replace(ds, '.');
                }

                return parseFloat(coord);
            };

            for (var i = 0; i < coords.length; i++) {
                result.push(coords[i].split(cs).map(mapFunction));
            }

            if (result.length === 1) {
                return result[0];
            }

            return result;
        }
    });

    L.GML.Pos = L.GML.Element.extend({
        initialize: function () {
            this.elementTag = 'gml:pos';
        },

        parse: function (element) {
            return element.textContent.split(' ').map(function (coord) {
                return parseFloat(coord);
            });
        }
    });

    L.GML.PosList = L.GML.Element.extend({
        initialize: function () {
            this.elementTag = 'gml:posList';
        },

        parse: function (element, options) {
            var result = [];
            var dim = options.dimensions;
            var coords = element.textContent.split(' ');
            for (var i = 0; i < coords.length; i += dim) {
                var coord = [];
                for (var j = i; j < i + dim; j++) {
                    coord.push(parseFloat(coords[j]));
                }
                result.push(coord);
            }

            return result;
        }
    });

    L.GML.PointNode = L.GML.Geometry.extend({
        includes: L.GML.ParserContainerMixin,

        initialize: function () {
            this.elementTag = 'gml:Point';
            this.initializeParserContainer();
            this.appendParser(new L.GML.Pos());
            this.appendParser(new L.GML.Coordinates());
        },

        parse: function (element) {
            return this.parseElement(element.firstChild, { dimensions: this.dimensions(element) });
        }
    });

    L.GML.PointSequence = L.GML.Geometry.extend({
        includes: L.GML.ParserContainerMixin,

        initialize: function () {
            this.initializeParserContainer();
            this.appendParser(new L.GML.Pos());
            this.appendParser(new L.GML.PosList());
            this.appendParser(new L.GML.Coordinates());
            this.appendParser(new L.GML.PointNode());
        },

        parse: function (element) {
            var firstChild = element.firstChild;
            var coords = [];
            var tagName = firstChild.tagName;
            if (tagName === 'gml:pos' || tagName === 'gml:Point') {
                var childParser = this.parsers[tagName];
                var elements = element.getElementsByTagNameNS(L.XmlUtil.namespaces.gml, tagName.split(':').pop());
                for (var i = 0; i < elements.length; i++) {
                    coords.push(childParser.parse(elements[i]));
                }
            }
            else {
                coords = this.parseElement(firstChild, { dimensions: this.dimensions(element) });
            }

            return coords;
        }
    });

    L.GML.LinearRing = L.GML.PointSequence.extend({
        initialize: function () {
            L.GML.PointSequence.prototype.initialize.call(this);
            this.elementTag = 'gml:LinearRing';
        },

        parse: function (element) {
            var coords = L.GML.PointSequence.prototype.parse.call(this, element);
            //for leaflet polygons its not recommended insert additional last point equal to the first one
            coords.pop();
            return coords;
        }
    });

    L.GML.LineStringNode = L.GML.PointSequence.extend({
        initialize: function () {
            this.elementTag = 'gml:LineString';
            L.GML.PointSequence.prototype.initialize.call(this);
        },

        parse: function (element) {
            return L.GML.PointSequence.prototype.parse.call(this, element);
        }
    });

    L.GML.PolygonNode = L.GML.Geometry.extend({

        initialize: function () {
            this.elementTag = 'gml:Polygon';
            this.linearRingParser = new L.GML.LinearRing();
        },

        parse: function (element) {
            var coords = [];
            for (var i = 0; i < element.childNodes.length; i++) {
                //there can be exterior and interior, by GML standard and for leaflet its not significant
                var child = element.childNodes[i];
                if (child.nodeType === document.ELEMENT_NODE) {
                    coords.push(this.linearRingParser.parse(child.firstChild));
                }
            }

            return coords;
        }
    });

    L.GML.CoordsToLatLngMixin = {
        transform: function (coordinates, options) {
            if (Array.isArray(coordinates[0])) {
                var latLngs = [];
                for (var i = 0; i < coordinates.length; i++) {
                    latLngs.push(this.transform(coordinates[i], options));
                }

                return latLngs;
            }

            return options.coordsToLatLng(coordinates);
        }
    };

    L.GML.Point = L.GML.PointNode.extend({
        includes: L.GML.CoordsToLatLngMixin,

        parse: function (element, options) {
            var coords = L.GML.PointNode.prototype.parse.call(this, element);
            var layer = new L.Marker();
            layer.setLatLng(this.transform(coords, options));
            return layer;
        }
    });

    L.GML.LineString = L.GML.LineStringNode.extend({

        includes: L.GML.CoordsToLatLngMixin,

        parse: function (element, options) {
            var layer = new L.Polyline([]);
            var coordinates = L.GML.LineStringNode.prototype.parse.call(this, element);
            layer.setLatLngs(this.transform(coordinates, options));
            return layer;
        }
    });

    L.GML.Polygon = L.GML.PolygonNode.extend({

        includes: L.GML.CoordsToLatLngMixin,

        parse: function (element, options) {
            var layer = new L.Polygon([]);
            var coordinates = L.GML.PolygonNode.prototype.parse.call(this, element);
            layer.setLatLngs(this.transform(coordinates, options));
            return layer;
        }
    });

    L.GML.MultiGeometry = L.GML.Geometry.extend({
        includes: [L.GML.ParserContainerMixin, L.GML.CoordsToLatLngMixin],

        initialize: function () {
            this.initializeParserContainer();
        },

        parse: function (element, options) {
            var childObjects = [];
            for (var i = 0; i < element.childNodes.length; i++) {
                var geometryMember = element.childNodes[i];
                if (geometryMember.nodeType !== document.ELEMENT_NODE) continue;

                for (var j = 0; j < geometryMember.childNodes.length; j++) {
                    var singleGeometry = geometryMember.childNodes[j];
                    if (singleGeometry.nodeType !== document.ELEMENT_NODE) continue;

                    childObjects.push(this.parseElement(singleGeometry, options));
                }
            }

            return this.transform(childObjects, options);
        }
    });

    L.GML.AbstractMultiPolyline = L.GML.MultiGeometry.extend({

        initialize: function () {
            L.GML.MultiGeometry.prototype.initialize.call(this);
            this.appendParser(new L.GML.LineStringNode());
        },

        parse: function (element, options) {
            var latLngs = L.GML.MultiGeometry.prototype.parse.call(this, element, options);
            var layer = new L.Polyline([]);
            layer.setLatLngs(latLngs);
            return layer;
        }
    });

    L.GML.AbstractMultiPolygon = L.GML.MultiGeometry.extend({

        initialize: function () {
            L.GML.MultiGeometry.prototype.initialize.call(this);
            this.appendParser(new L.GML.PolygonNode());
        },

        parse: function (element, options) {
            var latLngs = L.GML.MultiGeometry.prototype.parse.call(this, element, options);
            var layer = new L.Polygon([]);
            layer.setLatLngs(latLngs);
            return layer;
        }
    });

    L.GML.MultiLineString = L.GML.AbstractMultiPolyline.extend({
        initialize: function () {
            L.GML.AbstractMultiPolyline.prototype.initialize.call(this);
            this.elementTag = 'gml:MultiLineString';
        }
    });

    L.GML.MultiCurve = L.GML.AbstractMultiPolyline.extend({
        initialize: function () {
            L.GML.AbstractMultiPolyline.prototype.initialize.call(this);
            this.elementTag = 'gml:MultiCurve';
        }
    });

    L.GML.MultiPolygon = L.GML.AbstractMultiPolygon.extend({
        initialize: function () {
            L.GML.AbstractMultiPolygon.prototype.initialize.call(this);
            this.elementTag = 'gml:MultiPolygon';
        }
    });

    L.GML.MultiSurface = L.GML.AbstractMultiPolygon.extend({
        initialize: function () {
            L.GML.AbstractMultiPolygon.prototype.initialize.call(this);
            this.elementTag = 'gml:MultiSurface';
        }
    });

    L.GML.MultiPoint = L.GML.MultiGeometry.extend({
        initialize: function () {
            L.GML.MultiGeometry.prototype.initialize.call(this);
            this.elementTag = 'gml:MultiPoint';
            this.appendParser(new L.GML.PointNode());
        },

        parse: function (element, options) {
            var coordinates = L.GML.MultiGeometry.prototype.parse.call(this, element, options);
            var multiPoint = new L.FeatureGroup();
            for (var i = 0; i < coordinates.length; i++) {
                var point = new L.Marker();
                point.setLatLng(coordinates[i]);
                multiPoint.addLayer(point);
            }

            return multiPoint;
        }
    });

    L.GML.FeatureType = L.Class.extend({
        options: {
            geometryField: 'Shape',
        },

        primitives: [
            {
                types: ['byte', 'decimal', 'int', 'integer', 'long', 'short'],
                parse: function (input) {
                    return Number(input);
                }
            },
            {
                types: ['string'],
                parse: function (input) {
                    return input;
                }
            },
            {
                types: ['boolean'],
                parse: function (input) {
                    return input !== 'false';
                }
            },
            {
                types: ['date', 'time', 'datetime'],
                parse: function (input) {
                    return new Date(input);
                }
            }
        ],

        initialize: function (options) {
            L.setOptions(this, options);

            this.fields = {};
        },

        appendField: function (name, type) {
            var that = this;
            this.primitives.forEach(function (primitive) {
                if (primitive.types.indexOf(type) !== -1) {
                    that.fields[name] = primitive.parse;
                }
            });
        },

        parse: function (feature) {
            var properties = {};
            for (var i = 0; i < feature.childNodes.length; i++) {
                var node = feature.childNodes[i];
                if (node.nodeType !== document.ELEMENT_NODE) {
                    continue;
                }

                var propertyName = node.tagName.split(':').pop();
                if (propertyName === this.options.geometryField) {
                    continue;
                }

                var parseField = this.fields[propertyName];
                if (!parseField) {
                    this.appendField(propertyName, "string");
                    parseField = this.fields[propertyName];
                }

                properties[propertyName] = parseField(node.textContent);
            }

            return {
                type: 'Feature',
                properties: properties,
                id: feature.attributes['gml:id'].value
            };
        }
    });

    L.Format.GML = L.Format.Base.extend({

        includes: L.GML.ParserContainerMixin,

        initialize: function (options) {
            L.Format.Base.prototype.initialize.call(this, options);
            this.outputFormat = 'text/xml; subtype=gml/3.1.1';
            this.initializeParserContainer();
            this.appendParser(new L.GML.Point());
            this.appendParser(new L.GML.LineString());
            this.appendParser(new L.GML.Polygon());
            this.appendParser(new L.GML.MultiLineString());
            this.appendParser(new L.GML.MultiPolygon());
            this.appendParser(new L.GML.MultiCurve());
            this.appendParser(new L.GML.MultiSurface());
            this.appendParser(new L.GML.MultiPoint());
        },

        responseToLayers: function (rawData) {
            var layers = [];
            var xmlDoc = L.XmlUtil.parseXml(rawData);
            var featureCollection = xmlDoc.documentElement;
            var featureMemberNodes = featureCollection.getElementsByTagNameNS(L.XmlUtil.namespaces.gml, 'featureMember');
            for (var i = 0; i < featureMemberNodes.length; i++) {
                var feature = featureMemberNodes[i].firstChild;
                layers.push(this.processFeature(feature));
            }

            var featureMembersNode = featureCollection.getElementsByTagNameNS(L.XmlUtil.namespaces.gml, 'featureMembers');
            if (featureMembersNode.length > 0) {
                var features = featureMembersNode[0].childNodes;
                for (var j = 0; j < features.length; j++) {
                    var node = features[j];
                    if (node.nodeType === document.ELEMENT_NODE) {
                        layers.push(this.processFeature(node));
                    }
                }
            }

            return layers;
        },

        processFeature: function (feature) {
            var layer = this.generateLayer(feature);
            layer.feature = this.featureType.parse(feature);
            return layer;
        },

        generateLayer: function (feature) {
            var geometryField = feature.getElementsByTagNameNS(this.namespaceUri, this.options.geometryField)[0];
            if (!geometryField) {
                throw new Error(
                    'Geometry field \'' +
                    this.options.geometryField +
                    '\' doesn\' exist inside received feature: \'' +
                    feature.innerHTML +
                    '\'');
            }

            return this.parseElement(geometryField.firstChild, this.options);
        }
    });

    L.Util.project = function (crs, latlngs) {
        if (L.Util.isArray(latlngs)) {
            var result = [];
            latlngs.forEach(function (latlng) {
                result.push(L.Util.project(crs, latlng));
            });

            return result;
        }
        else {
            return crs.projection.project(latlngs);
        }
    };

    L.GmlUtil = {
        posNode: function (coord) {
            return L.XmlUtil.createElementNS('gml:pos', { srsDimension: 2 }, { value: coord.x + ' ' + coord.y });
        },

        posListNode: function (coords, close) {
            var localcoords = [];
            coords.forEach(function (coord) {
                localcoords.push(coord.x + ' ' + coord.y);
            });
            if (close && coords.length > 0) {
                var coord = coords[0];
                localcoords.push(coord.x + ' ' + coord.y);
            }

            var posList = localcoords.join(' ');
            return L.XmlUtil.createElementNS('gml:posList', {}, { value: posList });
        }
    };

    L.CircleMarker.include({
        toGml: function (crs) {
            var node = L.XmlUtil.createElementNS('gml:Point', { srsName: crs.code });
            node.appendChild(L.GmlUtil.posNode(L.Util.project(crs, this.getLatLng())));
            return node;
        }
    });

    L.LatLngBounds.prototype.toGml = function (crs) {
        var projectedSW = crs.project(this.getSouthWest());
        var projectedNE = crs.project(this.getNorthEast());

        var envelopeElement = L.XmlUtil.createElementNS('gml:Envelope', { srsName: crs.code });
        envelopeElement.appendChild(L.XmlUtil.createElementNS('gml:lowerCorner', {}, { value: projectedSW.x + ' ' + projectedSW.y }));
        envelopeElement.appendChild(L.XmlUtil.createElementNS('gml:upperCorner', {}, { value: projectedNE.x + ' ' + projectedNE.y }));

        return envelopeElement;
    };

    L.Marker.include({
        toGml: function (crs) {
            var node = L.XmlUtil.createElementNS('gml:Point', { srsName: crs.code });
            node.appendChild(L.GmlUtil.posNode(L.Util.project(crs, this.getLatLng())));
            return node;
        }
    });

    L.Polygon.include({
        toGml: function (crs) {
            var polygons = this.getLatLngs();
            var gmlPolygons = [];

            for (var i = 0; i < polygons.length; i++) {
                var polygonCoordinates = polygons[i];
                var flat = L.Polyline._flat(polygonCoordinates);
                var node = L.XmlUtil.createElementNS('gml:Polygon', { srsName: crs.code, srsDimension: 2 });
                node.appendChild(L.XmlUtil.createElementNS('gml:exterior'))
                    .appendChild(L.XmlUtil.createElementNS('gml:LinearRing', { srsDimension: 2 }))
                    .appendChild(L.GmlUtil.posListNode(L.Util.project(crs, flat ? polygonCoordinates : polygonCoordinates[0]), true));

                if (!flat) {
                    for (var hole = 1; hole < polygonCoordinates.length; hole++) {
                        node.appendChild(L.XmlUtil.createElementNS('gml:interior'))
                            .appendChild(L.XmlUtil.createElementNS('gml:LinearRing', { srsDimension: 2 }))
                            .appendChild(L.GmlUtil.posListNode(L.Util.project(crs, polygonCoordinates[hole]), true));
                    }
                }

                gmlPolygons.push(node);
            }

            if (gmlPolygons.length === 1) return gmlPolygons[0];

            // else make multipolygon
            var multi = L.XmlUtil.createElementNS('gml:MultiPolygon', { srsName: crs.code, srsDimension: 2 });
            var collection = multi.appendChild(L.XmlUtil.createElementNS('gml:polygonMembers'));
            for (var p = 0; p < gmlPolygons.length; p++) {
                collection.appendChild(gmlPolygons[p]);
            }

            return multi;
        }
    });

    L.Polyline.include({
        _lineStringNode: function (crs, latlngs) {
            var node = L.XmlUtil.createElementNS('gml:LineString', { srsName: crs.code, srsDimension: 2 });
            node.appendChild(L.GmlUtil.posListNode(L.Util.project(crs, latlngs), false));
            return node;
        },

        toGml: function (crs) {
            var latLngs = this.getLatLngs();
            if (L.Polyline._flat(latLngs)) return this._lineStringNode(crs, latLngs);

            //we have multiline
            var multi = L.XmlUtil.createElementNS('gml:MultiLineString', { srsName: crs.code, srsDimension: 2 });
            var collection = multi.appendChild(L.XmlUtil.createElementNS('gml:lineStringMembers'));
            for (var i = 0; i < latLngs.length; i++) {
                collection.appendChild(this._lineStringNode(crs, latLngs[i]));
            }

            return multi;
        }
    });

    var PropertiesMixin = {
        setProperties: function (obj) {
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    this.feature.properties[i] = obj[i];
                }
            }
        },
        getProperty: function (field) {
            return this.feature.properties[field];
        },
        deleteProperties: function (arr) {
            for (var i = 0; i < arr.length; i++) {
                if (this.feature.properties.hasOwnProperty(arr[i])) {
                    delete this.feature.properties[arr[i]];
                }
            }
        }
    };
    L.Marker.include(PropertiesMixin);
    L.Path.include(PropertiesMixin);

    L.WFS = L.FeatureGroup.extend({

        _capabilities: null,

        _boundingBox: null,

        _bboxFilter: null,

        _bboxBnds: null,

        _onMoveEnd: null,

        options: {
            crs: L.CRS.EPSG3857,
            showExisting: true,
            geometryField: 'Shape',
            url: '',
            version: '2.0.0',
            typeNS: '',
            typeName: '',
            typeNSName: '',
            maxFeatures: null,
            filter: null,
            opacity: 1,
            style: {
                color: 'black',
                weight: 1,
                opacity: 1,
                fillOpacity: 1
            },
            namespaceUri: '',
            outputFormat: 'json'
        },

        state: {},

        initialize: function (options) {
            L.setOptions(this, options);

            this.state = {
                exist: 'exist'
            };

            this._layers = {};

            if (this.options.outputFormat) {
                switch (this.options.outputFormat) {
                    case 'application/json':
                    case 'json': {
                        this.readFormat = new L.Format.GeoJSON(this.options);
                        break;
                    }
                    case 'application/gml+xml; version=3.2': {
                        this.readFormat = readFormat || new L.Format.GML(this.options);
                        break;
                    }
                }
            }

            this.options.typeNSName = this.namespaceName(this.options.typeName);
            this.options.srsName = this.options.crs.code;

            this._updateOpacity();

            var that = this;
            that.on('add', function(event) {
                
                this.describeFeatureType(function () {
                    that._createBBoxFilter();
                    if (that.options.showExisting) {
                        that.loadFeatures(that.options.filter);
                    }
                    that._setEvents();
                }, function (errorMessage) {
                    that.fire('error', {
                        error: new Error(errorMessage)
                    });
                });
            });
            that.on('remove', function(even) {
                that._removeEvents();
            });
        //     this.describeFeatureType(function () {
        //         if (that.options.showExisting) {
        //             that.loadFeatures(that.options.filter);
        //         }
        //     }, function (errorMessage) {
        //         that.fire('error', {
        //             error: new Error(errorMessage)
        //         });
        //     });
         },

        _createBBoxFilter: function() {
            this._bboxFilter = null;
            if (this._map) {
                var bounds = this._map.getBounds();
                if (bounds) {
                    var sw = bounds.getSouthWest();
                    sw = this.options.crs.projection.project(sw);
                    var swStr = typeof sw.lat !== 'undefined' ? `${sw.lng} ${sw.lat}` : `${sw.x} ${sw.y}`;
                    var ne = bounds.getNorthEast();
                    ne = this.options.crs.projection.project(ne);
                    var neStr = typeof ne.lat !== 'undefined'? `${ne.lng} ${ne.lat}` : `${ne.x} ${ne.y}`;
                    this._bboxBnds = {sw: sw, ne: ne};
                    var bbox = L.XmlUtil.createElementNS('fes:BBOX');
                    var gmlEnv = L.XmlUtil.createElementNS('gml:Envelope', {
                        srsName: this.options.crs.code
                    });
                    gmlEnv.appendChild(L.XmlUtil.createElementNS('gml:lowerCorner', {}, {
                        value: swStr
                    }));
                    gmlEnv.appendChild(L.XmlUtil.createElementNS('gml:upperCorner', {}, {
                        value: neStr
                    }));

                    bbox.appendChild(gmlEnv);
                    this._bboxFilter = L.XmlUtil.createElementNS('fes:Filter');
                    this._bboxFilter.appendChild(bbox); 
        
                }
            }
        },

        _setEvents() {
            if (this._map) {
                if (!this._map.options.updateWhenIdle) {
                    // update tiles on move, but not more often than once per given interval
                    this._onMove = L.Util.throttle(this._onMoveEnd, this._map.options.updateInterval, this);
                } else {
                    this._onMove = this._onMoveEnd;
                }

                this._onRefresh = L.Util.throttle(this.refresh, 100, this);
      
                // this._map.on('zoomend', this._onZoomEnd, this);
                // // this._map.on('move', this._onMove, this);
                // this._map.on('moveend', this._onMove, this);
                this._map.on('zoomend', this._onZoomEnd, this);
                // this._map.on('move', this._onMove, this);
                this._map.on('moveend', this._onMoveEnd, this);
            }  
        },

        _removeEvents() {
            if (this._map) {
                this._map.off('zoomend', this._onZoomEnd);
                // this._map.off('move', this._onMove);
                this._map.off('moveend', this._onMove);
            }  
        },

        _onZoomStart(event) {
            this.clearLayers();
        },

        _onZoomEnd(event) {
            this.refresh();
        },

        _onMoveEnd(event) {
            this.refresh();
        },

        refresh() {
            const oldBBoxBnds = {...this._bboxBnds};
            this._createBBoxFilter();
            if (!this.areBndsEq(this._bboxBnds, oldBBoxBnds)) {
                this.loadFeatures();
            }
        },

        areBndsEq(bnds1, bnds2) {
            const props1 = Object.keys(bnds1.sw);
            const props2 = Object.keys(bnds2.sw);
            let bndsEq = true;
            if (bnds1.sw[props1[0]] !== bnds2.sw[props2[0]] &&
                bnds1.sw[props1[1]] !== bnds2.sw[props2[1]] &&
                bnds1.ne[props1[0]] !== bnds2.ne[props2[0]] &&
                bnds1.ne[props1[1]] !== bnds2.ne[props2[1]]) {
                bndsEq = false;
            }
            return(bndsEq);
        },

        namespaceName: function (name) {
            if (this.options.typeNS) {
                return this.options.typeNS + ':' + name;
            } else {
                return name;
            }
        },

        describeFeatureType: function (successCallback, errorCallback) {
            var requestData = L.XmlUtil.createElementNS('wfs:DescribeFeatureType', {
                service: 'WFS',
                version: this.options.version
            });
            requestData.appendChild(L.XmlUtil.createElementNS('TypeName', {}, {
                value: this.options.typeNSName
            }));

            var that = this;
            var headers = this.options.headers || {};
            headers['content-type'] = 'application/xml';
            L.Util.request({
                url: this.options.url,
                data: L.XmlUtil.serializeXmlDocumentString(requestData),
                headers: this.options.headers || {},
                success: function (data) {
                    // If some exception occur, WFS-service can response successfully, but with ExceptionReport,
                    // and such situation must be handled.
                    var exceptionReport = L.XmlUtil.parseOwsExceptionReport(data);
                    if (exceptionReport) {
                        if (typeof (errorCallback) === 'function') {
                            errorCallback(exceptionReport.message);
                        }

                        return;
                    }

                    var xmldoc = L.XmlUtil.parseXml(data);
                    var featureInfo = xmldoc.documentElement;
                    // that.readFormat.setFeatureDescription(featureInfo);
                    that.options.namespaceUri = featureInfo.attributes.targetNamespace.value;
                    if (typeof (successCallback) === 'function') {
                        successCallback();
                    }
                },
                error: function (errorMessage) {
                    if (typeof (errorCallback) === 'function') {
                        errorCallback(errorMessage);
                    }
                }
            });
        },

        getFeature: function (filter) {
            var reqOptions = {
                service: 'WFS',
                version: this.options.version,
                outputFormat: this.readFormat.outputFormat
            }
            if (typeof this.options.maxFeatures !== 'undefined') {
                if (this.options.version === '2.0.0') {
                    reqOptions.count = this.options.maxFeatures;
                } else {
                    reqOptions.maxFeatures = this.options.maxFeatures;
                }
            }

            var request = L.XmlUtil.createElementNS('wfs:GetFeature', reqOptions);


            var queryOpts;
            if (this.options.version === '2.0.0') {
                queryOpts = {
                    typeNames: this.options.typeNSName
                }
            } else {
                queryOpts = {
                    typeName: this.options.typeNSName
                }
            }

            var query = request.appendChild(L.XmlUtil.createElementNS('wfs:Query', queryOpts));

            if (this._bboxFilter) {
                query.appendChild(this._bboxFilter);
            }
            if (filter) {
                query.appendChild(L.filter(filter));
            }

            return request;
        },

        loadFeatures: function (filter) {
            var that = this;
            var headers = this.options.headers || {};
            headers['content-type'] = 'application/xml';
            
            L.Util.request({
                url: this.options.url,
                data: L.XmlUtil.serializeXmlDocumentString(that.getFeature(filter)),
                headers: headers,
                success: function (responseText) {
                    // If some exception occur, WFS-service can response successfully, but with ExceptionReport,
                    // and such situation must be handled.
                    var exceptionReport = L.XmlUtil.parseOwsExceptionReport(responseText);
                    if (exceptionReport) {
                        that.fire('error', {
                            error: new Error(exceptionReport.message)
                        });

                        return that;
                    }

                    // Request was truly successful (without exception report),
                    // so convert response to layers.
                    var layers = that.readFormat.responseToLayers(responseText, {
                        coordsToLatLng: that.options.coordsToLatLng,
                        pointToLayer: that.options.pointToLayer
                    });

                    that.clearLayers();
                    if (typeof that.options.style === "function") {
                        layers.forEach(function (element) {
                            element.state = that.state.exist;
                            if (element.setStyle) {
                                if (element.feature) {
                                    element.setStyle(that.options.style(element.feature));
                                }
                            }
                            that.addLayer(element);
                        });
                    } else {
                        layers.forEach(function (element) {
                            element.state = that.state.exist;
                            that.addLayer(element);
                        });
                        that.setStyle(that.options.style);
                    }

                    if (typeof that.options.onEachFeature === "function") {
                        layers.forEach(function (element) {
                            if (element.feature) {
                                that.options.onEachFeature(element.feature, element);
                            }
                        });
                    }

                    that.fire('load', {
                        responseText: responseText
                    });

                    return that;
                },
                error: function (errorMessage) {
                    that.fire('error', {
                        error: new Error(errorMessage)
                    });

                    return that;
                }
            });
        },

        getCapabilities: function (successCallback, errorCallback) {
            var capabilities = this._capabilities;

            // Check if capabilities were already received & cached.
            if (capabilities) {
                if (typeof (successCallback) === 'function') {
                    successCallback(capabilities);

                    return;
                }
            }

            var requestData = L.XmlUtil.createElementNS('wfs:GetCapabilities', {
                service: 'WFS',
                version: this.options.version
            });

            var that = this;
            L.Util.request({
                url: this.options.url,
                data: L.XmlUtil.serializeXmlDocumentString(requestData),
                headers: this.options.headers || {},
                success: function (data) {
                    // If some exception occur, WFS-service can response successfully, but with ExceptionReport,
                    // and such situation must be handled.
                    var exceptionReport = L.XmlUtil.parseOwsExceptionReport(data);
                    if (exceptionReport) {
                        if (typeof (errorCallback) === 'function') {
                            errorCallback(new Error(exceptionReport.message));
                        }

                        return;
                    }

                    try {
                        // Request was truly successful (without exception report), parse WFS_Capabilities.
                        capabilities = L.XmlUtil.parseXml(data).documentElement;
                    } catch (error) {
                        // If parsing failed.
                        if (typeof (errorCallback) === 'function') {
                            errorCallback(error);
                        }

                        return;
                    }

                    // Cache received capabilities.
                    that._capabilities = capabilities;

                    if (typeof (successCallback) === 'function') {
                        successCallback(capabilities);
                    }
                },
                error: function (errorMessage) {
                    if (typeof (errorCallback) === 'function') {
                        errorCallback(new Error(errorMessage));
                    }
                }
            });
        },

        getBoundingBox: function (successCallback, errorCallback) {
            var boundingBox = this._boundingBox;

            // Check if bounding box was already received & cached.
            if (boundingBox) {
                if (typeof (successCallback) === 'function') {
                    successCallback(boundingBox);

                    return;
                }
            }

            var that = this;
            this.getCapabilities(function (capabilities) {
                var featureTypeListElement = capabilities.getElementsByTagName('FeatureTypeList')[0];

                // Extract all 'FeatureType' nodes to list.
                var featureTypeList = featureTypeListElement.getElementsByTagName('FeatureType');

                for (var i = 0, len = featureTypeList.length; i < len; i++) {
                    var featureType = featureTypeList[i];

                    // Extract current FeatureType's name.
                    var featureTypeNSName = L.XmlUtil.getNodeText(featureType.getElementsByTagName('Name')[0]);

                    // Find node with current layer instance's name and namespace.
                    if (featureTypeNSName === that.options.typeNSName) {
                        // The <WGS84BoundingBox> element is used to indicate the edges of an
                        // enclosing rectangle in decimal degrees of latitude and longitude in WGS84.
                        var wgs84BoundingBox = featureType.getElementsByTagName('WGS84BoundingBox')[0];
                        var lowerCornerElement = wgs84BoundingBox.getElementsByTagName('LowerCorner')[0];
                        var upperCornerElement = wgs84BoundingBox.getElementsByTagName('UpperCorner')[0];

                        // Corner node's inner text format is like '-74.047185 40.679648', Lng and Lat with a space between.
                        var lowerCorner = L.XmlUtil.getNodeText(lowerCornerElement);
                        var upperCorner = L.XmlUtil.getNodeText(upperCornerElement);

                        // Extract LngLats and reverse it to LatLngs.
                        var sw = lowerCorner.split(' ').reverse();
                        var ne = upperCorner.split(' ').reverse();

                        // Wrap it into LatLngBounds.
                        boundingBox = L.latLngBounds([sw, ne]);

                        break;
                    }
                }

                // Cache received and calculated bounding box.
                that._boundingBox = boundingBox;

                if (typeof (successCallback) === 'function') {
                    successCallback(boundingBox);
                }
            }, function (errorMessage) {
                if (typeof (errorCallback) === 'function') {
                    errorCallback(new Error(errorMessage));
                }
            });
        },

        setOpacity: function (opacity) {
            this.options.opacity = opacity;

            this._updateOpacity();

            return this;
        },

        _updateOpacity: function () {
            var style = L.extend(this.options.style || {}, {
                opacity: this.options.opacity,
                fillOpacity: this.options.opacity
            });

            this.setStyle(style);
        },

        _onMove: function() {

        }

        
    });

    L.wfs = function (options, readFormat) {
        return new L.WFS(options, readFormat);
    };

    L.WFST = L.WFS.extend({
        initialize: function (options) {
            L.WFS.prototype.initialize.call(this, options);
            this.state = L.extend(this.state, {
                insert: 'insert',
                update: 'update',
                remove: 'remove'
            });

            this.changes = {};
        },

        addLayer: function (layer) {
            L.FeatureGroup.prototype.addLayer.call(this, layer);
            if (!layer.feature) {
                layer.feature = { properties: {} };
            }

            if (!layer.state) {
                layer.state = this.state.insert;
                var id = this.getLayerId(layer);
                this.changes[id] = layer;
            }
            return this;
        },

        removeLayer: function (layer) {
            L.FeatureGroup.prototype.removeLayer.call(this, layer);

            var id = this.getLayerId(layer);

            if (id in this.changes) {
                var change = this.changes[id];
                if (change.state === this.state.insert) {
                    delete this.changes[id];
                }
                else {
                    change.state = this.state.remove;
                }
            }
            else {
                layer.state = this.state.remove;
                this.changes[id] = layer;
            }
        },

        editLayer: function (layer) {
            if (layer.state !== this.state.insert) {
                layer.state = this.state.update;
            }

            var id = this.getLayerId(layer);
            this.changes[id] = layer;
            return this;
        },

        save: function () {
            var transaction = L.XmlUtil.createElementNS('wfs:Transaction', { service: 'WFS', version: this.options.version });

            var inserted = [];

            for (var id in this.changes) {
                var layer = this.changes[id];
                var action = this[layer.state](layer);
                transaction.appendChild(action);

                if (layer.state === this.state.insert) {
                    inserted.push(layer);
                }
            }

            var that = this;

            L.Util.request({
                url: this.options.url,
                data: L.XmlUtil.serializeXmlDocumentString(transaction),
                headers: this.options.headers || {},
                success: function (data) {
                    var insertResult = L.XmlUtil.evaluate('//wfs:InsertResults/wfs:Feature/ogc:FeatureId/@fid', data);
                    var insertedIds = [];
                    var id = insertResult.iterateNext();
                    while (id) {
                        insertedIds.push(new L.Filter.GmlObjectId(id));
                        id = insertResult.iterateNext();
                    }

                    inserted.forEach(function (layer) {
                        L.FeatureGroup.prototype.removeLayer.call(that, layer);
                    });

                    that.once('load', function () {
                        that.fire('save:success');
                        that.changes = {};
                    });

                    that.loadFeatures(insertedIds);
                },
                error: function (data) {
                    that.fire('save:failed', data);
                }
            });

            return this;
        }
    });

    L.wfst = function (options, readFormat) {
        return new L.WFST(options, readFormat);
    };

    L.WFST.include({
        gmlFeature: function (layer) {
            var featureNode = L.XmlUtil.createElementNS(this.options.typeNSName, {}, { uri: this.options.namespaceUri });
            var feature = layer.feature;
            for (var propertyName in feature.properties) {
                featureNode.appendChild(this.gmlProperty(propertyName,
                    feature.properties[propertyName]));
            }

            featureNode.appendChild(this.gmlProperty(this.options.geometryField,
                layer.toGml(this.options.crs)));
            return featureNode;
        },

        gmlProperty: function (name, value) {
            var propertyNode = L.XmlUtil.createElementNS(this.namespaceName(name));
            if (value instanceof Element) {
                propertyNode.appendChild(value);
            }
            else {
                propertyNode.appendChild(L.XmlUtil.createTextNode(value));
            }

            return propertyNode;
        },

        wfsProperty: function (name, value) {
            var propertyNode = L.XmlUtil.createElementNS('wfs:Property');
            propertyNode.appendChild(L.XmlUtil.createElementNS('wfs:Name', {}, { value: name }));
            var valueNode = L.XmlUtil.createElementNS('wfs:Value');
            if (value instanceof Element) {
                valueNode.appendChild(value);
            }
            else {
                valueNode.appendChild(L.XmlUtil.createTextNode(value));
            }

            propertyNode.appendChild(valueNode);

            return propertyNode;
        }
    });

    L.WFST.include({

        insert: function (layer) {
            var node = L.XmlUtil.createElementNS('wfs:Insert');
            node.appendChild(this.gmlFeature(layer));
            return node;
        },

        update: function (layer) {
            var node = L.XmlUtil.createElementNS('wfs:Update', { typeName: this.options.typeNSName });
            var feature = layer.feature;
            for (var propertyName in feature.properties) {
                node.appendChild(this.wfsProperty(propertyName, feature.properties[propertyName]));
            }

            node.appendChild(this.wfsProperty(this.namespaceName(this.options.geometryField),
                layer.toGml(this.options.crs)));

            var idFilter = new L.Filter.GmlObjectID(layer.feature.id);
            node.appendChild(L.filter(idFilter));
            return node;
        },

        remove: function (layer) {
            var node = L.XmlUtil.createElementNS('wfs:Delete', { typeName: this.options.typeNSName });
            var idFilter = new L.Filter.GmlObjectID(layer.feature.id);
            node.appendChild(L.filter(idFilter));
            return node;
        }
    });


})(window, document);
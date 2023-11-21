'use strict';

async function fetchImage(url, callback, headers, abort) {
  let _headers = {};
  if (headers) {
    headers.forEach(h => {
      _headers[h.header] = h.value;
    });
  }
  const controller = new AbortController();
  const signal = controller.signal;
  if (abort) {
    abort.subscribe(() => {
      controller.abort();
    });
  }
  const f = await fetch(url, {
    method: "GET",
    headers: _headers,
    mode: "cors",
    signal: signal
  });
  const blob = await f.blob();
  callback(blob);
}

L.TileLayer.WMSHeader = L.TileLayer.WMS.extend({
  initialize: function (url, options, headers, abort) {
    L.TileLayer.WMS.prototype.initialize.call(this, url, options);
    this.headers = headers;
    this.abort = abort;
  },
  createTile(coords, done) {
    const url = this.getTileUrl(coords);
    const img = document.createElement("img");
    img.setAttribute("role", "presentation");

    fetchImage(
      url,
      resp => {
        const reader = new FileReader();
        reader.onload = () => {
          img.src = reader.result;
        };
        reader.readAsDataURL(resp);
        done(null, img);
      },
      this.headers,
      this.abort
    );
    return img;
  }
});

L.TileLayer.TileLayerWithHeaders = L.TileLayer.extend({
  initialize: function (url, options, headers, abort) {
    L.TileLayer.prototype.initialize.call(this, url, options);
    this.headers = headers;
    this.abort = abort;
  },
  createTile(coords, done) {
    const url = this.getTileUrl(coords);
    const img = document.createElement("img");
    img.setAttribute("role", "presentation");

    fetchImage(
      url,
      resp => {
        const reader = new FileReader();
        reader.onload = () => {
          img.src = reader.result;
        };
        reader.readAsDataURL(resp);
        done(null, img);
      },
      this.headers,
      this.abort
    );
    return img;
  }
});

L.TileLayer.WMTSWithHeaders = L.TileLayer.extend({

    wmtsOptions: {
        layer: '',
        tileMatrixSetId: '',
        tileMatrices: null,
        format: 'image/jpeg',
        service: 'WMTS',
        request: 'GetTile',
        version: '1.0.0',
        style: '',
        requestParams: {}
    },

    initialize: function (url, options, headers) { // (String, Object)

        L.TileLayer.prototype.initialize.call(this, url, options);

        if (headers) {
            this.headers = headers;
        }

        var wmtsParams = L.extend({}, this.wmtsOptions);
        var tileSize = options.tileSize || this.options.tileSize;
        if (options.detectRetina && L.Browser.retina) {
            wmtsParams.width = wmtsParams.height = tileSize * 2;
        } else {
            wmtsParams.width = wmtsParams.height = tileSize;
        }

        if (options.requestParams) {
            wmtsParams = L.extend(wmtsParams, options.requestParams);
        }
        for (var i in options) {
            // all keys that are not TileLayer options go to WMTS params
            if (this.wmtsOptions.hasOwnProperty(i)) {
                wmtsParams[i] = options[i];
            }
        }
        this.wmtsParams = wmtsParams;
        this.tileMatrices= options.tileMatrices || this.getDefaultMatrix();
        L.setOptions(this, options);
    },

    onAdd: function (map) {
        L.TileLayer.prototype.onAdd.call(this, map);
    },

    // Override the getTileUrl method to produce the correct fetch url for each tile
    getTileUrl: function (tilePoint) {

        var map = this._map;
        var crs;
        var zoom = tilePoint.z;
        if (typeof map.options.crs !== 'undefined') {
            crs = map.options.crs;
        } else {
            crs = L.CRS.EPSG3857;
        }

        const tileSize = this.options.tileSize;
        
        var nwPoint = tilePoint.multiplyBy(tileSize);
        //+/-1 in order to be on the tile
        nwPoint.x+=1;
        nwPoint.y-=1;
        
        const sePoint = nwPoint.add(new L.Point(tileSize, tileSize));
        const nw = crs.project(map.unproject(nwPoint, zoom));
        const se = crs.project(map.unproject(sePoint, zoom));
    
        const tilewidth = se.x-nw.x;

        const ident = this.tileMatrices[zoom].identifier;
        let X0, Y0;
        let tileCol, tileRow;
        if (this.options.tms) {
            X0 = this.tileMatrices[zoom].topLeftCorner[1];
            Y0 = this.tileMatrices[zoom].topLeftCorner[0];
        } else {
            X0 = this.tileMatrices[zoom].topLeftCorner[0];
            Y0 = this.tileMatrices[zoom].topLeftCorner[1];
        }
        tileCol=Math.floor((nw.x-X0)/tilewidth);
        tileRow=-Math.floor((nw.y-Y0)/tilewidth);
    
        const url = L.Util.template(this._url, {s: this._getSubdomain(tilePoint)});
    
        let returnURL = `${url}?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=${this.wmtsParams.layer}&STYLE=${this.wmtsParams.style}`;
        returnURL = `${returnURL}&FORMAT=${this.wmtsParams.format}&TILEMATRIXSET=${this.wmtsParams.tileMatrixSetId}&TILEMATRIX=${ident}&TILEROW=${tileRow}&TILECOL=${tileCol}`; 
        if (this.wmtsParams.requestParams) {
            const keys = Object.keys(this.wmtsParams.requestParams);
            if (keys && keys.length > 0) {
                for (var ii=0; ii < keys.length; ii++) {
                    returnURL=`${returnURL}&${keys[ii]}=${this.wmtsParams.requestParams[keys[ii]]}`;
                }
            }
        }
        return returnURL; 
    },

    createTile(coords, done) {
        const url = this.getTileUrl(coords);
        const img = document.createElement("img");
        img.setAttribute("role", "presentation");
    
        fetchImage(
          url,
          resp => {
            const reader = new FileReader();
            reader.onload = () => {
              img.src = reader.result;
            };
            reader.readAsDataURL(resp);
            done(null, img);
          },
          this.headers,
          this.abort
        );
        return img;
      },

      setParams: function (params, noRedraw) {
        L.extend(this.wmtsParams, params);
        if (!noRedraw) {
            this.redraw();
        }
        return this;
    },
    
    getDefaultMatrix : function () {
        /**
         * the matrix3857 represents the projection 
         * for in the IGN WMTS for the google coordinates.
         */
        var matrix3857 = new Array(22);
        for (var i= 0; i<22; i++) {
            matrix3857[i]= {
                identifier    :  "" + i,
                topLeftCorner : new L.LatLng(20037508.3428,-20037508.3428)
            };
        }
        return matrix3857;
    }
});

L.TileLayer.wmtsWithHeaders = function (url, options, headers) {
    return new L.TileLayer.WMTSWithHeaders(url, options, headers);
};

L.TileLayer.tileLayerWithHeaders = function (url, options, headers, abort) {
  return new L.TileLayer.TileLayerWithHeaders(url, options, headers, abort);
};
L.TileLayer.wmsHeader = function (url, options, headers, abort) {
  return new L.TileLayer.WMSHeader(url, options, headers, abort);
};

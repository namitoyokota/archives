import { HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonHttpClient, HttpClientOptions, UrlMap$v2 } from '@galileo/web_common-http';
import * as CommonHttp from '@galileo/web_common-http';
import { Coordinates$v1, Location$v1 } from '@galileo/web_common-libraries';
import * as Common from '@galileo/web_commonmap/_common';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HxDRQuery } from './abstractions/core.models';
import { GeolocationDataAccessor$v1 } from './geolocation-data-accessor.v1';

@Injectable({ providedIn: 'root' })
export class CommonmapDataService$v1 {

    @UrlMap$v2()
    private apiRootURI = 'api/commonMap/leaflet/v1';

    authToken$: BehaviorSubject<string>;

	private queryGen = new HxDRQuery();

    /** Data accessor for the v1 geolocation APIs */
    geolocation: GeolocationDataAccessor$v1;

    constructor(
        private http: CommonHttpClient
    ) {
        this.authToken$ = http.authenticationTokenSet$;

        this.geolocation = new GeolocationDataAccessor$v1(http);
    }

    /** Retrieves mapConfigurations */
    getMapPresets(): Observable<Common.MapPresetDtoLeaflet$v1[]> {
        const apiUrl = this.apiRootURI + '/mapPresets';
        const mapPresets = this.http.get<Common.MapPresetDtoLeaflet$v1[]>(apiUrl).pipe(
            map((response: any) => {
                if (response.statusCode === CommonHttp.HTTPCode.Ok) {
                    return response.result;
                }

                throw new Error(`Unexpected response - ${response.statusCode}; ${this.apiRootURI}`);
            }),
            catchError((err, caught) => {
                if (err.status === CommonHttp.HTTPCode.NotFound) {
                    return of([]);
                }
                return this.catchError(err);
            })
        );

        return mapPresets;
    }

    getMapLayers(): Observable<Common.MapLayerDtoLeaflet$v1[]> {
        const apiUrl = this.apiRootURI + '/mapLayerPresets';
        const layerPresets = this.http.get<Common.MapLayerDtoLeaflet$v1[]>(apiUrl).pipe(
            map((response: any) => {
                if (response.statusCode === CommonHttp.HTTPCode.Ok) {
                    return response.result;
                }

                throw new Error(`Unexpected response - ${response.statusCode}; ${this.apiRootURI}`);
            }),
            catchError((err, caught) => {
                if (err.status === CommonHttp.HTTPCode.NotFound) {
                    return of([]);
                }
                return this.catchError(err);
            })
        );

        return layerPresets;

    }

    getSystemDefinedMapPresets(): Observable<Common.MapPresetDtoLeaflet$v1[]> {
        const apiUrl = this.apiRootURI + '/systemDefinedMapPresets';
        const mapPresets = this.http.get<Common.MapPresetDtoLeaflet$v1[]>(apiUrl).pipe(
            map((response: any) => {
                if (response.statusCode === CommonHttp.HTTPCode.Ok) {
                    return response.result;
                }

                throw new Error(`Unexpected response - ${response.statusCode}; ${this.apiRootURI}`);
            }),
            catchError((err, caught) => {
                if (err.status === CommonHttp.HTTPCode.NotFound) {
                    return of([]);
                }
                return this.catchError(err);
            })
        );

        return mapPresets;
    }

    getSystemDefinedMapLayers(): Observable<Common.MapLayerDtoLeaflet$v1[]> {
        const apiUrl = this.apiRootURI + '/systemDefinedMapLayerPresets';
        const layerPresets = this.http.get<Common.MapLayerDtoLeaflet$v1[]>(apiUrl).pipe(
            map((response: any) => {
                if (response.statusCode === CommonHttp.HTTPCode.Ok) {
                    return response.result;
                }

                throw new Error(`Unexpected response - ${response.statusCode}; ${this.apiRootURI}`);
            }),
            catchError((err, caught) => {
                if (err.status === CommonHttp.HTTPCode.NotFound) {
                    return of([]);
                }
                return this.catchError(err);
            })
        );

        return layerPresets;

    }

    saveLayerPreset(layerPreset: Common.MapLayerDtoLeaflet$v1, addNew: boolean): Observable<Common.MapLayerDtoLeaflet$v1> {
        const apiUrl = this.apiRootURI + '/mapLayerPresets';
        let savedLayerPreset;
        if (addNew) {
            savedLayerPreset = this.http.post(apiUrl, layerPreset).pipe(
                map((response: any) => {
                    if (response.statusCode === 200 || response.statusCode === 201) {
                        return response.result;
                    }

                    throw new Error(`Unexpected response - ${response.statusCode}; ${this.apiRootURI}`);
                }),
                catchError((err, caught) => {
                    return this.catchError(err);
                })
            );
        } else {
            savedLayerPreset = this.http.put(apiUrl, layerPreset).pipe(
                map((response: any) => {
                    if (response.statusCode === 200 || response.statusCode === 201) {
                        return response.result;
                    }

                    throw new Error(`Unexpected response - ${response.statusCode}; ${this.apiRootURI}`);
                }),
                catchError((err, caught) => {
                    return this.catchError(err);
                })
            );
        }


        return (savedLayerPreset);

    }

    cloneLayerPreset(layerPreset: Common.MapLayerDtoLeaflet$v1): Observable<Common.MapLayerDtoLeaflet$v1> {
        const apiUrl = this.apiRootURI + '/cloneMapLayerPreset';
        let clonedLayer;
        clonedLayer = this.http.put(apiUrl, layerPreset).pipe(
            map((response: any) => {
                if (response.statusCode === 200 || response.statusCode === 201) {
                    return response.result;
                }

                throw new Error(`Unexpected response - ${response.statusCode}; ${this.apiRootURI}`);
            }),
            catchError((err, caught) => {
                return this.catchError(err);
            })
        );

        return (clonedLayer);

    }


    saveMapPreset(mapPreset: Common.MapPresetDtoLeaflet$v1, addNew: boolean): Observable<Common.MapPresetDtoLeaflet$v1> {
        const apiUrl = this.apiRootURI + '/mapPresets';
        let savedMapPreset;
        if (addNew) {
            savedMapPreset = this.http.post(apiUrl, mapPreset).pipe(
                map((response: any) => {
                    if (response.statusCode === 200 || response.statusCode === 201) {
                        return response.result;
                    }

                    throw new Error(`Unexpected response - ${response.statusCode}; ${this.apiRootURI}`);
                }),
                catchError((err, caught) => {
                    return this.catchError(err);
                })
            );
        } else {
            savedMapPreset = this.http.put(apiUrl, mapPreset).pipe(
                map((response: any) => {
                    if (response.statusCode === 200 || response.statusCode === 201) {
                        return response.result;
                    }
                    throw new Error(`Unexpected response - ${response.statusCode}; ${this.apiRootURI}`);
                }),
                catchError((err, caught) => {
                    return this.catchError(err);
                })
            );
        }
        return (savedMapPreset);

    }

	getWMSCapabilitiesForHxDR(layerURL:string, version:string, mapLayerId): Observable<any> {

		let tempURL = layerURL;
		const result = tempURL.indexOf('?');
		if (result === -1) {
			tempURL = tempURL + '?' + 'service=WMS&VERSION=' + version + '&request=GetCapabilities';
		} else {
			tempURL = tempURL + '&service=WMS&VERSION=' + version + '&request=GetCapabilities';
		}

		const temp = encodeURIComponent(tempURL);
		let layerId = '';
		if (mapLayerId) {
			layerId = '&mapLayerPresetId=' + mapLayerId;
		}

		let url;
		let options;
		const wmsURL = '?uri=' + temp;
		url = this.apiRootURI + '/proxy' + wmsURL + layerId;
		options = new HttpClientOptions({ httpOptions: { responseType: 'text' } });

		const wmsCapabilities = this.http.get<any>(url, options).pipe(
			map((response: any) => {
				return (response);
			}),
			catchError((err, caught) => {
				if (err.status === CommonHttp.HTTPCode.NotFound) {
					return of({});
				}
				return this.catchError(err);
			})
		);

		return wmsCapabilities;
	}

    getWMSCapabilities(mapLayer: Common.MapLayer$v1): Observable<any> {
        const versionOption = mapLayer.options.find((option) => option.name === 'version');
        const version = versionOption ? versionOption.value : '1.3.0';

        let tempURL = this.getUrlWithParams(mapLayer);

        const result = tempURL.indexOf('?');
        if (result === -1) {
            tempURL = tempURL + '?' + 'service=WMS&VERSION=' + version + '&request=GetCapabilities';
        } else {
            tempURL = tempURL + '&service=WMS&VERSION=' + version + '&request=GetCapabilities';
        }

        let url;
        let options;
        const localAccessOpt = mapLayer.getOption('localAccessOnly');
        if (!localAccessOpt || localAccessOpt.value === 'false') {
            let layerId = '';
            if (mapLayer.id) {
                layerId = '&mapLayerPresetId=' + mapLayer.id;
            }
            const wmsURL = '?uri=' + encodeURIComponent(tempURL);
            url = this.apiRootURI + '/proxy' + wmsURL + layerId;
            options = new HttpClientOptions({ httpOptions: { responseType: 'text' } });
        } else {
            options = new HttpClientOptions({
                httpOptions: {
                    responseType: 'text',
                },
                useStandardAuthentication: false
            });
            url = tempURL;
        }

        const wmsCapabilities = this.http.get<any>(url, options).pipe(
            map((response: any) => {
                return (response);
            }),
            catchError((err, caught) => {
                if (err.status === CommonHttp.HTTPCode.NotFound) {
                    return of({});
                }
                return this.catchError(err);
            })
        );

        return wmsCapabilities;
    }

    getWMSGetFeatureInfo(mapLayer: Common.MapLayer$v1, bbox: string, size: Common.PixelPoint$v1, point: Common.PixelPoint$v1): Observable<any> {
        const versionOption = mapLayer.options.find((option) => option.name === 'version');
        const version = versionOption ? versionOption.value : '1.3.0';

        let pointStr;
        let crsStr;
        if (version === '1.3.0') {
            pointStr = `i=${Math.round(point.x)}&j=${Math.round(point.y)}`;
            crsStr = 'crs=';
        } else {
            pointStr = `x=${Math.round(point.x)}&y=${Math.round(point.y)}`;
            crsStr = 'srs=';
        }

        let crsOption = mapLayer.getOption('crs');
        if (crsOption) {
            crsStr += crsOption.value;
        } else {
            crsStr += 'EPSG:4326';
        }

        let opt = mapLayer.getOption(Common.MapLayerOptionName.Format);
        let format;
        if (opt) {
            format = opt.value;
        } else {
            format = 'image/png';
        }

        opt = mapLayer.getOption(Common.MapLayerOptionName.FeatInfoFormat);
        let featInfoFormat;
        if (opt) {
            featInfoFormat = opt.value;
            if (featInfoFormat === 'application/geojson' || featInfoFormat === 'application/geo+json') {
                featInfoFormat = 'application/geo%252Bjson';
            } 
        } else {
            featInfoFormat = 'text/plain';
        }

        const layersStr = mapLayer.wmsLayers.join(',');

        
        let tempURL = this.getUrlWithParams(mapLayer);

        const result = tempURL.indexOf('?');
        if (result === -1) {
            tempURL += '?' 
        } else {
            tempURL += '&';
        }

        tempURL += `service=WMS&VERSION=${version}&request=GetFeatureInfo&styles=&format=${format}&bbox=${bbox}&${crsStr}&height=${size.y}`;
        tempURL += `&width=${size.x}&${pointStr}&layers=${layersStr}&query_layers=${layersStr}&info_format=${featInfoFormat}&feature_count=50`;

        let url;
        let options;
        const localAccessOpt = mapLayer.getOption('localAccessOnly');
        if (!localAccessOpt || localAccessOpt.value === 'false') {
            let layerId = '';
            if (mapLayer.id) {
                layerId = mapLayer.id;
            }
            url = this.apiRootURI + '/proxy';
            options = new HttpClientOptions({ 
                httpOptions: { 
                    responseType: 'text',
                    headers: new HttpHeaders({  
                        'uri': tempURL,
                        'mapLayerPresetId': mapLayer.id
                    })
                },
            });
        } else {
            options = new HttpClientOptions({
                httpOptions: {
                    responseType: 'text',
                },
                useStandardAuthentication: false
            });
            url = tempURL;
        }

        const wmsGetFeatureInfo = this.http.get<any>(url, options).pipe(
            map((response: any) => {
                return (response);
            }),
            catchError((err, caught) => {
                if (err.status === CommonHttp.HTTPCode.NotFound) {
                    return of({});
                }
                return this.catchError(err);
            })
        );

        return wmsGetFeatureInfo;
    }

    getWMSGetFeatureInfoForHxDR(layerUrl: string, mapLayer: Common.MapLayer$v1, bbox: string, size: Common.PixelPoint$v1, point: Common.PixelPoint$v1): Observable<any> {
        const versionOption = mapLayer.options.find((option) => option.name === 'version');
        const version = versionOption ? versionOption.value : '1.3.0';

        let pointStr;
        let crsStr;
        if (version === '1.3.0') {
            pointStr = `i=${Math.round(point.x)}&j=${Math.round(point.y)}`;
            crsStr = 'crs=';
        } else {
            pointStr = `x=${Math.round(point.x)}&y=${Math.round(point.y)}`;
            crsStr = 'srs=';
        }

        let crsOption = mapLayer.getOption('crs');
        if (crsOption) {
            crsStr += crsOption.value;
        } else {
            crsStr += 'EPSG:4326';
        }

        let opt = mapLayer.getOption(Common.MapLayerOptionName.Format);
        let format;
        if (opt) {
            format = opt.value;
        } else {
            format = 'image/png';
        }

        opt = mapLayer.getOption(Common.MapLayerOptionName.FeatInfoFormat);
        let featInfoFormat;
        if (opt) {
            featInfoFormat = opt.value;
            if (featInfoFormat === 'application/geojson' || featInfoFormat === 'application/geo+json') {
                featInfoFormat = 'application/geo%252Bjson';
            } 
        } else {
            featInfoFormat = 'text/plain';
        }

        const layersStr = mapLayer.wmsLayers.join(',');

        let tempURL = layerUrl;

        const result = tempURL.indexOf('?');
        if (result === -1) {
            tempURL += '?' 
        } else {
            tempURL += '&';
        }

        tempURL += `service=WMS&VERSION=${version}&request=GetFeatureInfo&styles=&format=${format}&bbox=${bbox}&${crsStr}&height=${size.y}`;
        tempURL += `&width=${size.x}&${pointStr}&layers=${layersStr}&query_layers=${layersStr}&info_format=${featInfoFormat}&feature_count=50`;

        let url;
        let options;
        const localAccessOpt = mapLayer.getOption('localAccessOnly');
        if (!localAccessOpt || localAccessOpt.value === 'false') {
            url = this.apiRootURI + '/proxy';
            options = new HttpClientOptions({ 
                httpOptions: { 
                    responseType: 'text',
                    headers: new HttpHeaders({  
                        'uri': tempURL,
                        'mapLayerPresetId': mapLayer.id
                    })
                },
            });
        } else {
            options = new HttpClientOptions({
                httpOptions: {
                    responseType: 'text',
                },
                useStandardAuthentication: false
            });
            url = tempURL;
        }

        const wmsGetFeatureInfo = this.http.get<any>(url, options).pipe(
            map((response: any) => {
                return (response);
            }),
            catchError((err, caught) => {
                if (err.status === CommonHttp.HTTPCode.NotFound) {
                    return of({});
                }
                return this.catchError(err);
            })
        );

        return wmsGetFeatureInfo;
    }

    private getUrlWithParams(mapLayer: Common.MapLayer$v1) {
        let url = mapLayer.url;
        let paramAdded = false;
        if (mapLayer.options) {
            for (const option of mapLayer.urlParams) {
                if (!paramAdded) {
                    url += '?';
                    paramAdded = true;
                } else {
                    url += '&';
                }
                url += option.name + '=' + option.value;
            }
        }

        return (url);
    }

    getWMTSCapabilities(mapLayer: Common.MapLayer$v1): Observable<any> {

        let tempURL = this.getUrlWithParams(mapLayer);

        const result = tempURL.indexOf('?');
        if (result === -1) {
            tempURL = tempURL + '?' + 'service=WMTS&request=GetCapabilities';
        } else {
            tempURL = tempURL + '&service=WMTS&request=GetCapabilities';
        }

        let url;
        let options;
        const localAccessOpt = mapLayer.getOption('localAccessOnly');
        if (!localAccessOpt || localAccessOpt.value === 'false') {
            let layerId = '';
            if (mapLayer.id) {
                layerId = '&mapLayerPresetId=' + mapLayer.id;
            }
            const wmtsURL = '?uri=' + encodeURIComponent(tempURL);
            url = this.apiRootURI + '/proxy' + wmtsURL + layerId;
            options = new HttpClientOptions({ httpOptions: { responseType: 'text' } });
        } else {
            options = new HttpClientOptions({
                httpOptions: {
                    responseType: 'text'
                },
                useStandardAuthentication: false
            });
            url = tempURL;
        }

        const wmtsCapabilities = this.http.get<any>(url, options).pipe(
            map((response: any) => {
                return (response);
            }),
            catchError((err, caught) => {
                if (err.status === CommonHttp.HTTPCode.NotFound) {
                    return of({});
                }
                return this.catchError(err);
            })
        );

        return wmtsCapabilities;
    }

	getWFSCapabilities(mapLayer: Common.MapLayer$v1): Observable<any> {
		const versionOption = mapLayer.options.find((option) => option.name === 'version');
		const version = versionOption ? versionOption.value : '2.0.0';

		let tempURL = this.getUrlWithParams(mapLayer);

		const result = tempURL.indexOf('?');
		if (result === -1) {
			tempURL = tempURL + '?' + 'service=WFS&VERSION=' + version + '&request=GetCapabilities';
		} else {
			tempURL = tempURL + '&service=WFS&VERSION=' + version + '&request=GetCapabilities';
		}

		let url;
		let options;
        const localAccessOpt = mapLayer.getOption('localAccessOnly');
        if (!localAccessOpt || localAccessOpt.value === 'false') {
			url = this.apiRootURI + '/proxy';
            options = new HttpClientOptions({ 
                httpOptions: { 
                    responseType: 'text',
                    headers: new HttpHeaders({  
                        'uri': tempURL,
                        'mapLayerPresetId': mapLayer.id
                    })
                },
            });
		} else {
			options = new HttpClientOptions({
				httpOptions: {
					responseType: 'text',
				},
				useStandardAuthentication: false
			});
			url = tempURL;
		}
		const wfsCapabilities = this.http.get<any>(url, options).pipe(
			map((response: any) => {
				return (response);
			}),
			catchError((err, caught) => {
				if (err.status === CommonHttp.HTTPCode.NotFound) {
					return of({});
				}
				return this.catchError(err);
			})
		);

		return wfsCapabilities;
	}

	getWFSDescribeFeatureType(mapLayer: Common.MapLayer$v1, typeName: string): Observable<any> {
		const versionOption = mapLayer.options.find((option) => option.name === 'version');
		const version = versionOption ? versionOption.value : '2.0.0';

		let tempURL = this.getUrlWithParams(mapLayer);

		const result = tempURL.indexOf('?');
		if (result === -1) {
			tempURL = tempURL + '?' + 'service=WFS&VERSION=' + version + '&request=DescribeFeatureType';
		} else {
			tempURL = tempURL + '&service=WFS&VERSION=' + version + '&request=DescribeFeatureType';
		}

        if (typeName) {
            tempURL = tempURL + `&typeNames=${typeName}`;

        }

		let url;
		let options;
        const localAccessOpt = mapLayer.getOption('localAccessOnly');
        if (!localAccessOpt || localAccessOpt.value === 'false') {
			url = this.apiRootURI + '/proxy';
            options = new HttpClientOptions({ 
                httpOptions: { 
                    responseType: 'text',
                    headers: new HttpHeaders({  
                        'uri': tempURL,
                        'mapLayerPresetId': mapLayer.id
                    })
                },
            });
		} else {
			options = new HttpClientOptions({
				httpOptions: {
					responseType: 'text',
				},
				useStandardAuthentication: false
			});
			url = tempURL;
		}
		const wfsCapabilities = this.http.get<any>(url, options).pipe(
			map((response: any) => {
				return (response);
			}),
			catchError((err, caught) => {
				if (err.status === CommonHttp.HTTPCode.NotFound) {
					return of({});
				}
				return this.catchError(err);
			})
		);

		return wfsCapabilities;
	}

    getHxDRWMSLayersFromCollections(mapLayer: Common.MapLayer$v1): Observable<any> {

        let hxdrInfo: any;
        const temp = encodeURIComponent(mapLayer.url);
        let layerId = '';
        if (mapLayer.id) {
            layerId = '&mapLayerPresetId=' + mapLayer.id;
        }

        const hxdrURL = '?uri=' + temp + '/graphql';
        const apiUrl = this.apiRootURI + '/proxy' + hxdrURL + layerId;
        const options = new HttpClientOptions({ httpOptions: { responseType: 'document' } });
        const body = {
            query: `{
            collections {
              title
              id
              features(limit: 2000) {
                total
                contents {
                  id
                  type
                  properties {
                    title
                    format
                    layerAddress {
                      ... on LayerAddressWms {
                        id
                        endpoint
                        label
                        datasetId
                        type
                        bounds
                        reference
                        imageFormat
                        versions
                      }
                    }
                  }
                }
              }
            }
          }`
        };
        try {
            hxdrInfo = this.http.post<any>(apiUrl, body).pipe(
                map((response: any) => {
                    return (response);
                }),
                catchError((err, caught) => {
                    if (err.status === CommonHttp.HTTPCode.NotFound) {
                        return of({});
                    }
                    return this.catchError(err);
                })
            );

        } catch (err) {
            return (this.catchError(err));
        }


        return hxdrInfo;
    }

    getHxDRWMSAssetsFromProjects(mapLayer: Common.MapLayer$v1): Observable<any> {

        let hxdrInfo: any;
        const temp = encodeURIComponent(mapLayer.url);
        let layerId = '';
        if (mapLayer.id) {
            layerId = '&mapLayerPresetId=' + mapLayer.id;
        }

        const hxdrURL = '?uri=' + temp + '/graphql';
        const apiUrl = this.apiRootURI + '/proxy' + hxdrURL + layerId;
        const options = new HttpClientOptions({ httpOptions: { responseType: 'document' } });
        const body = {
            query: `{
            getProjects(params: { filter: {byProjectName:""} }) {
                total
                contents {
                  totalAssets
                  name
                  id
                  rootFolder {
                    id
                    name
                    assets {
                      total
                      contents {
                        asset {
                          anchorPoint {
                            x
                            y
                            z
                          }
                          withEmbeddedGeoreference
                          artifacts {
                            total
                            contents {
                              id
                              type
                              addresses {
                                total
                                contents {
                                  ... on AddressWmsOutput {
                                    id
                                    endpoint
                                    label
                                    datasetId
                                    type
                                    bounds
                                    reference
                                    imageFormat
                                    versions
                                  }
                                }
                              }
                            }
                          }
                        }
                        name
                        id
                        description
                        assetType
                        assetStatus
                      }
                    }
                    folders {
                      id
                      name
                      description
                      assets {
                        total
                        contents {
                          asset {
                            id
                            anchorPoint {
                              x
                              y
                              z
                            }
                            withEmbeddedGeoreference
                            artifacts {
                              total
                              contents {
                                id
                                type
                                addresses {
                                  total
                                  contents {
                                    ... on AddressWmsOutput {
                                      id
                                      endpoint
                                      label
                                      datasetId
                                      type
                                      bounds
                                      reference
                                      imageFormat
                                      versions
                                    }
                                  }
                                }
                              }
                            }
                          }
                          name
                          description
                          id
                          assetType
                          assetStatus
                        }
                      }
                    }
                  }
                }
            }
        }`
        };
        try {
            hxdrInfo = this.http.post<any>(apiUrl, body).pipe(
                map((response: any) => {
                    return (response);
                }),
                catchError((err, caught) => {
                    if (err.status === CommonHttp.HTTPCode.NotFound) {
                        return of({});
                    }
                    return this.catchError(err);
                })
            );
        } catch (err) {
            return (this.catchError(err));
        }

        return hxdrInfo;
    }

    getHxDRWMSAssetsFromMyAssets(mapLayer: Common.MapLayer$v1): Observable<any> {

        let hxdrInfo: any;
        const temp = encodeURIComponent(mapLayer.url);
        let layerId = '';
        if (mapLayer.id) {
            layerId = '&mapLayerPresetId=' + mapLayer.id;
        }

        const hxdrURL = '?uri=' + temp + '/graphql';
        const apiUrl = this.apiRootURI + '/proxy' + hxdrURL + layerId;
        const options = new HttpClientOptions({ httpOptions: { responseType: 'document' } });
        const body = {
            query: `{
            getMyAssetsProject {
                totalAssets
                id
                name
                rootFolder {
                  id
                  name
                  assets {
                    total
                    contents {
                      asset {
                        id
                        anchorPoint {
                          x
                          y
                          z
                        }
                        withEmbeddedGeoreference
                        artifacts {
                          total
                          contents {
                            id
                            type
                            addresses {
                              total
                              contents {
                                ... on AddressWmsOutput {
                                    id
                                    endpoint
                                    label
                                    type
                                    bounds
                                    reference
                                    imageFormat
                                    versions
                                }
                              }
                            }
                          }
                        }
                      }
                      name
                      description
                      assetType
                      assetStatus
                    }
                  }
                  folders {
                    id
                    name
                    description
                    assets {
                      total
                      contents {
                        asset {
                          anchorPoint {
                            x
                            y
                            z
                          }
                          id
                          withEmbeddedGeoreference
                          artifacts {
                            total
                            contents {
                              id
                              type
                              addresses {
                                total
                                contents {
                                  ... on AddressWmsOutput {
                                      id
                                      endpoint
                                      label
                                      type
                                      bounds
                                      reference
                                      imageFormat
                                      versions
                                  }
                                }
                              }
                            }
                          }
                        }
                        name
                        description
                        assetType
                        assetStatus
                      }
                    }
                  }
                }
            }
        }`
        };
        try {
            hxdrInfo = this.http.post<any>(apiUrl, body).pipe(
                map((response: any) => {
                    return (response);
                }),
                catchError((err, caught) => {
                    if (err.status === CommonHttp.HTTPCode.NotFound) {
                        return of({});
                    }
                    return this.catchError(err);
                })
            );
        } catch (err) {
            return (this.catchError(err));
        }

        return hxdrInfo;
    }

    getHxDRLayersFromCollections(mapLayer: Common.MapLayer$v1): Observable<any> {

		let hxdrInfo: any;
		const temp = encodeURIComponent(mapLayer.url);
		let layerId = '';
		if (mapLayer.id) {
			layerId = '&mapLayerPresetId=' + mapLayer.id;
		}

		const hxdrURL = '?uri=' + temp + '/graphql';
		const apiUrl = this.apiRootURI + '/proxy' + hxdrURL + layerId;
		const options = new HttpClientOptions({ httpOptions: { responseType: 'document' } });
		const query = this.queryGen.createCollectionsQuery(mapLayer.format);
		const body = {
			query: query
		};
		try {
			hxdrInfo = this.http.post<any>(apiUrl, body).pipe(
				map((response: any) => {
					return (response);
				}),
				catchError((err, caught) => {
					if (err.status === CommonHttp.HTTPCode.NotFound) {
						return of({});
					}
					return this.catchError(err);
				})
			);

		} catch (err) {
			return (this.catchError(err));
		}


		return hxdrInfo;
	}

	getHxDRAssetsFromProjects(mapLayer: Common.MapLayer$v1): Observable<any> {

		let hxdrInfo: any;
		const temp = encodeURIComponent(mapLayer.url);
		let layerId = '';
		if (mapLayer.id) {
			layerId = '&mapLayerPresetId=' + mapLayer.id;
		}


		const hxdrURL = '?uri=' + temp + '/graphql';
		const apiUrl = this.apiRootURI + '/proxy' + hxdrURL + layerId;
		const options = new HttpClientOptions({ httpOptions: { responseType: 'document' } });
		const query = this.queryGen.createGetProjectsQuery(mapLayer.format);
		const body = {
			query: query
		};
		try {
			hxdrInfo = this.http.post<any>(apiUrl, body).pipe(
				map((response: any) => {
					return (response);
				}),
				catchError((err, caught) => {
					if (err.status === CommonHttp.HTTPCode.NotFound) {
						return of({});
					}
					return this.catchError(err);
				})
			);
		} catch (err) {
			return (this.catchError(err));
		}

		return hxdrInfo;
	}

	getHxDRAssetsFromMyAssets(mapLayer: Common.MapLayer$v1): Observable<any> {

		let hxdrInfo: any;
		const temp = encodeURIComponent(mapLayer.url);
		let layerId = '';
		if (mapLayer.id) {
			layerId = '&mapLayerPresetId=' + mapLayer.id;
		}

		const hxdrURL = '?uri=' + temp + '/graphql';
		const apiUrl = this.apiRootURI + '/proxy' + hxdrURL + layerId;
		const options = new HttpClientOptions({ httpOptions: { responseType: 'document' } });
		
		
		const query = this.queryGen.createGetMyAssetsProjectQuery(mapLayer.format);
		const body = {
			query: query
		};
		try {
			hxdrInfo = this.http.post<any>(apiUrl, body).pipe(
				map((response: any) => {
					return (response);
				}),
				catchError((err, caught) => {
					if (err.status === CommonHttp.HTTPCode.NotFound) {
						return of({});
					}
					return this.catchError(err);
				})
			);
		} catch (err) {
			return (this.catchError(err));
		}

		return hxdrInfo;
	}

	getHxDRAssetsFromFolder(folderId: string, mapLayer: Common.MapLayer$v1): Observable<any> {

		let hxdrInfo: any;
		const temp = encodeURIComponent(mapLayer.url);
		let layerId = '';
		if (mapLayer.id) {
			layerId = '&mapLayerPresetId=' + mapLayer.id;
		}

		const hxdrURL = '?uri=' + temp + '/graphql';
		const apiUrl = this.apiRootURI + '/proxy' + hxdrURL + layerId;
		const options = new HttpClientOptions({ httpOptions: { responseType: 'document' } });

		const query = this.queryGen.createGetFolderQuery(folderId, mapLayer.format);
		const body = {
			query: query
		};
		try {
			hxdrInfo = this.http.post<any>(apiUrl, body).pipe(
				map((response: any) => {
					return (response);
				}),
				catchError((err, caught) => {
					if (err.status === CommonHttp.HTTPCode.NotFound) {
						return of({});
					}
					return this.catchError(err);
				})
			);

		} catch (err) {
			return (this.catchError(err));
		}


		return hxdrInfo;
	}

    /** Call the /proxy endpoint with given uri */
    throughProxy$(uri): Observable<any> {
        let params = new HttpParams();
        params = params.append('mapLayerPresetId', '073ca436-778f-42a8-9d07-0dc3148c34b0');
        params = params.append('uri', encodeURIComponent(uri));

        const options: HttpClientOptions = new HttpClientOptions({
            httpOptions: {
                params: params
            }
        });

        return this.http.get<any>(`${this.apiRootURI}/proxy`, options).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((err, caught) => {
                if (err.status === CommonHttp.HTTPCode.NotFound) {
                    return of({});
                }
                return this.catchError(err);
            })
        );
    }

    private catchError(err) {
        if (err.error) {
            if (typeof err.error === 'string') {
                const errObj = JSON.parse(err.error);
                if (errObj?.errors?.length > 0) {
                    return throwError(errObj as CommonHttp.BaseErrorResponse);
                } else {
                    return throwError(err.error as CommonHttp.BaseErrorResponse);
                } 
            } else {
                return throwError(err.error as CommonHttp.BaseErrorResponse);
            }
        } else if (err.status || err.message) {
            return throwError({
                statusCode: err.status,
                errors: [err.message],
                errorId: null
            } as CommonHttp.BaseErrorResponse);
        } else {
            return throwError({
                statusCode: null,
                errors: [err],
                errorId: null
            } as CommonHttp.BaseErrorResponse);
        }
    }

    deleteLayerPreset(layerPreset: Common.MapLayerDtoLeaflet$v1): Observable<Common.MapLayerDtoLeaflet$v1> {
        const apiUrl = this.apiRootURI + '/mapLayerPresets/' + layerPreset.id;
        const result = this.http.delete(apiUrl).pipe(
            map((response: any) => {
                if (response.statusCode === 200 || response.statusCode === 201) {
                    return response.result;
                }

                throw new Error(`Unexpected response - ${response.statusCode}; ${this.apiRootURI}`);
            }),
            catchError((err, caught) => {
                return this.catchError(err);
            })
        );
        return result;

    }

    deleteMapPreset(mapPreset: Common.MapPresetDtoLeaflet$v1): Observable<Common.MapPresetDtoLeaflet$v1> {
        const apiUrl = this.apiRootURI + '/mapPresets/' + mapPreset.id;
        const result = this.http.delete(apiUrl).pipe(
            map((response: any) => {
                if (response.statusCode === 200 || response.statusCode === 201) {
                    return response.result;
                }

                throw new Error(`Unexpected response - ${response.statusCode}; ${this.apiRootURI}`);
            }),
            catchError((err, caught) => {
                return this.catchError(err);
            })
        );
        return result;
    }
}


import { Injectable } from '@angular/core';
import { HxDRLayerInfo, HxDRCollection, HxDRProject, HxDRLayer, HxDRFolder } from '@galileo/web_commonmap/_common';
import * as Common from '@galileo/web_commonmap/_common';
import { zip, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonmapDataService$v1 } from './commonmap-data.service';


@Injectable({ providedIn: 'root' })

export class HxDRHelperService {

    private layerInfoWMS = new Map<string, any>();
    private wmsLayersRequestCache = new Map<string, Promise<any>>();

    constructor(private dataSvc: CommonmapDataService$v1) {
    }

    /**
     * Retrieves all the WMS base layers available in HxDR
     * @param authorizationHeaders The authorization headers as retrieved with HxDRAuth
     * @return A promise response with a list of endpoints for WMS base layers
     */
     getAllHxDRWMSLayersAsync(mapLayer, refresh = false) {
        return new Promise<HxDRLayerInfo>(async (resolve, reject) => {
            if (refresh) {
                if (this.layerInfoWMS.has(mapLayer.id)) {
                    this.layerInfoWMS.delete(mapLayer.id);
                }

                if (this.wmsLayersRequestCache.has(mapLayer.id)) {
                    this.wmsLayersRequestCache.delete(mapLayer.id);
                }
            }

            let layerInfo: HxDRLayerInfo = this.layerInfoWMS.get(mapLayer.id);
            if (layerInfo) {
                resolve(layerInfo);
            } else {
                let requestPromise$: Promise<any>;

                const found = this.wmsLayersRequestCache.get(mapLayer.id);
                if (found) {
                    requestPromise$ = found;
                } else {
                    requestPromise$ = new Promise<any>(async (requestResolve, requestReject) => {
                        try {
                            layerInfo = new HxDRLayerInfo();
                            const dataReady = zip(
                                this.dataSvc.getHxDRLayersFromCollections(mapLayer).pipe(catchError((err) =>
                                    of({catchErrors: err}))),
                                this.dataSvc.getHxDRAssetsFromProjects(mapLayer).pipe(catchError((err) =>
                                    of({catchErrors: err}))),
                                this.dataSvc.getHxDRAssetsFromMyAssets(mapLayer).pipe(catchError((err) =>
                                    of({catchErrors: err}))));

                            dataReady.subscribe(async (val) => {
                                let allFailed = true;
                                if (val[0]) {
                                    if (val[0].errors || val[0].catchErrors) {
                                        if (this.isArray(val[0].errors) && val[0].errors.length > 0) {
                                            console.log('CommonMap - Error getting HxDRWMS Assets: ' + val[0].errors[0].message);
                                        } else if (val[0]?.catchErrors?.errors) {
                                            console.log('CommonMap - Error getting HxDRWMS Assets: ' + val[0].catchErrors.errors[0]);
                                        } else {
                                            console.log('CommonMap - Error getting HxDRWMS Assets');
                                        }
                                    } else {
                                        this.parseHxDRWMSCollections(val[0], layerInfo.collections);
                                        allFailed = false;
                                    }
                                }

                                if (val[1]) {
                                    if (val[1].errors || val[1].catchErrors) {
                                        if (this.isArray(val[1].errors) && val[1].errors.length > 0) {
                                            console.log('CommonMap - Error getting HxDRWMS Assets: ' + val[1].errors[0].message);
                                        } else if (val[1]?.catchErrors?.errors) {
                                            console.log('CommonMap - Error getting HxDRWMS Assets: ' + val[1].catchErrors.errors[0]);
                                        } else {
                                            console.log('CommonMap - Error getting HxDHxDRWMSR3D Assets');
                                        }
                                    } else {
                                        this.parseHxDRWMSGetProjects(val[1], layerInfo.projects);
                                        allFailed = false;
                                    }
                                }

                                if (val[2]) {
                                    if (val[2].errors || val[2].catchErrors) {
                                        if (this.isArray(val[2].errors) && val[2].errors.length > 0) {
                                            console.log('CommonMap - Error getting HxDRWMS Assets: ' + val[2].errors[0].message);
                                        } else if (val[2]?.catchErrors?.errors) {
                                            console.log('CommonMap - Error getting HxDRWMS Assets: ' + val[2].catchErrors.errors[0]);
                                        } else {
                                            console.log('CommonMap - Error getting HxDRWMS Assets');
                                        }
                                    } else {
                                        this.parseHxDRWMSMyAssetProject(val[2], layerInfo.myAssetsProject);
                                        allFailed = false;
                                    }
                                }

                                if (!allFailed) {
                                    this.layerInfoWMS.set(mapLayer.id, layerInfo);
                                    requestResolve(true);
                                } else {
                                    if (val[0]?.catchErrors) {
                                        requestReject(val[0].catchErrors);
                                    } else if (val[1]?.catchErrors) {
                                        requestReject(val[1].catchErrors);
                                    } else if (val[2]?.catchErrors) {
                                        requestReject(val[2].catchErrors);
                                    } else if (val[0].errors?.length > 0) {
                                        requestReject(val[0].errors);
                                    } else if (val[1].errors?.length > 0) {
                                        requestReject(val[1].errors);
                                    } else {
                                        requestReject(null);
                                    }
                                }
                            }, (err) => {
                                console.log('Error getting HxDRInfo in HxDRService.getAllHxDRWMSTilesLayersAsync');
                                requestReject(err.errors);
                            });
                        } catch (err) {
                            if (err?.errors) {
                                requestReject(err.errors[0]);
                            } else {
                                requestReject(null);
                            }
                        }
                    });
                    this.wmsLayersRequestCache.set(mapLayer.id, requestPromise$);
                }
                try {
                    requestPromise$.catch((reason) => {
                        if (reason?.errors?.length > 0) {
                            console.log('Error getting HxDR WMS Info - ' + reason.errors[0]);
                            reject(reason.errors[0]);
                        } else if (reason?.length > 0) {
                            console.log('Error getting HxDR WMS Info - ' + reason[0]);
                            reject(reason[0]);
                        } else {
                            console.log('Error getting HxDR WMS Info');
                            reject(reason);
                        }
                    }).then(() => {
                        layerInfo = this.layerInfoWMS.get(mapLayer.id);
                        resolve(layerInfo);
                    });
                } catch (err) {
                    console.log('Error in try/catch of HxdrService getting WMS layers - ' + err);
                    reject(err);
                }
            }
        });
    }
    sortByLayerLabel(a, b) {
        const name1 = a.label.toUpperCase();
        const name2 = b.label.toUpperCase();
        let compare = 0;
        if (name1 > name2) {
            compare = 1;
        } else if (name1 < name2) {
            compare = -1;
        }
        return (compare);
    }

    parseHxDRWMSCollections(jsonLayers, collections: HxDRCollection[]) {
        try {
            if (jsonLayers?.data?.collections) {
                const cols = jsonLayers.data.collections;
                if (cols?.length > 0) {
                    for (const col of cols) {
                        const collection = new HxDRCollection();
                        collection.title = col.title;
                        collection.id = col.id;
                        const features = col.features;
                        if (features.contents) {
                            for (const feature of features.contents) {
                                if (feature.properties?.layerAddress && feature.properties?.layerAddress?.endpoint &&
                                    feature.properties?.layerAddress?.datasetId) {
                                    const tileLayer = new HxDRLayer({
                                        id: feature.id,
                                        label: feature.properties.title,
                                        endpoint: feature.properties.layerAddress.endpoint,
                                        datasetId: feature.properties.layerAddress.datasetId,
                                        bounds: feature.properties.layerAddress.bounds
                                    });

                                    if (feature.properties.layerAddress.versions) {
                                        tileLayer.version = this.getWMSVersion(feature.properties.layerAddress.versions);
                                    }

                                    if (feature.properties.layerAddress.imageFormat) {
                                        tileLayer.imageFormat = feature.properties.layerAddress.imageFormat;
                                    }

                                    if (feature.properties.layerAddress.reference) {
                                        tileLayer.reference = feature.properties.layerAddress.reference;
                                    }

                                    collection.layers.push(tileLayer);
                                }
                            }
                        }
                        if (collection.layers.length > 0) {
                            collections.push(collection);
                            collection.layers.sort(this.sortByLayerLabel);
                        }
                    }
                }
            }
        } catch (err) {
            console.log('Error parsing HxDR WMS collections: ' + err.message);
        }
    }

    parseHxDRWMSGetProjects(jsonLayers, projects: HxDRProject[]) {
        try {
            if (jsonLayers?.data?.getProjects?.contents) {
                const projs = jsonLayers.data.getProjects.contents;
                if (projs?.length > 0) {
                    for (const proj of projs) {
                        const project = new HxDRProject();
                        project.id = proj.id;
                        project.name = proj.name;
                        project.rootFolder = this.parseHxDRWMSFolder(proj.rootFolder);
                        if (project.rootFolder.layers.length > 0 || project.rootFolder.folders.length > 0) {
                            projects.push(project);
                        }
                    }
                }
            }
        } catch (err) {
            console.log('Error getting HxDR WMS projects: ' + err.message);
        }
    }

    parseHxDRWMSMyAssetProject(jsonLayers, myAssetProject: HxDRProject) {
        try {
            if (jsonLayers?.data?.getMyAssetsProject) {
                const jsonProj = jsonLayers?.data?.getMyAssetsProject;
                myAssetProject.id = jsonProj.id;
                myAssetProject.name = jsonProj.name;
                myAssetProject.rootFolder = this.parseHxDRWMSFolder(jsonProj.rootFolder);
            }
        } catch (err) {
            console.log('Error parsing MyAssetProject: ' + err.message);
        }
    }

    parseHxDRWMSFolder(jsonFolder) {
        const folder = new HxDRFolder();
        try {
            if (jsonFolder?.assets?.contents) {
                folder.name = jsonFolder.name;
                folder.id = jsonFolder.id;
                folder.projectId = jsonFolder.project.id;
                const assets = jsonFolder.assets.contents;
                for (const asset of assets) {
                    if (asset.asset?.artifacts?.contents) {
                        for (const artifact of asset.asset.artifacts.contents) {
                            if (artifact.addresses?.contents) {
                                for (const address of artifact.addresses.contents) {
                                    if (address && address.endpoint && address.datasetId) {
                                        const tileLayer = new HxDRLayer();
                                        tileLayer.label = asset.name;
                                        tileLayer.id = address.id;
                                        tileLayer.endpoint = address.endpoint;
                                        tileLayer.datasetId = address.datasetId;
                                        folder.layers.push(tileLayer);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (jsonFolder?.folders?.contents) {
                const folders = jsonFolder.folders.contents;
                for (const subFold of folders) {
                    const subFolder = this.parseHxDRWMSFolder(subFold);
                    if (subFolder.layers.length > 0 || subFolder.folders.length > 0) {
                        folder.folders.push(subFolder);
                    }
                }
            }
        } catch (err) {
            console.log('Error parsing project folder:' + err.message);
        }
        return (folder);
    }

    getWMSVersion(versions: string[]) {
        if (versions) {
            if (versions.length === 0) {
                return('1.3.0');
            } else if (versions.length > 1) {
                let temp = versions.find( (ver) => ver === '1.3.0');
                if (temp) {
                    return(temp);
                } else {
                    temp = versions.find( (ver) => ver === '1.1.1');
                    if (temp) {
                        return(temp);
                    } else {
                        return('1.3.0');
                    }
                }
            } else {
                return(versions[0]);
            }
        } else {
            return('1.3.0');
        }
    }

    getHxDRWMSDisplayInfoAsync(mapLayer: Common.MapLayer$v1): Promise<any> {
        return new Promise<any>(async (resolve) => {
            try {
                const layerInfo = await this.getAllHxDRWMSLayersAsync(mapLayer);
                let info: any;
                if (layerInfo) {
                    const tileLayer = this.findLayerFromLayerInfo(mapLayer, layerInfo);
                    if (tileLayer) {
                        info = {
                            endpoint: tileLayer.endpoint,
                            bounds: tileLayer.bounds
                        };
                    }
                }
                resolve(info);
            } catch (err) {
                console.log('Error getting HxDRWMSDisplayInfo');
                resolve(null);
            }
        });
    }

    findLayerFromLayerInfo(mapLayer: Common.MapLayer$v1, layerInfo: HxDRLayerInfo) {
        const layerIdOpt = mapLayer.getOption('hxdrLayerId');
        if (layerIdOpt) {
            const layerId = layerIdOpt.value;
            for (const col of layerInfo.collections) {
                for (const layer of col.layers) {
                    if (layer.id === layerId) {
                        return (layer);
                    }
                }
            }
            if (layerInfo.myAssetsProject.rootFolder) {
                const layer = this.findLayerInFolder(mapLayer, layerInfo.myAssetsProject.rootFolder);
                if (layer) {
                    return (layer);
                }
            }
            for (const proj of layerInfo.projects) {
                const layer = this.findLayerInFolder(mapLayer, proj.rootFolder);
                return (layer);
            }
        }
        return (null);
    }

    findLayerInFolder(mapLayer: Common.MapLayer$v1, folder: HxDRFolder) {
        const layerIdOpt = mapLayer.getOption('hxdrLayerId');
        if (layerIdOpt) {
            const layerId = layerIdOpt.value;
            for (const layer of folder.layers) {
                if (layer.id === layerId) {
                    return (layer);
                }
            }
            for (const subFolder of folder.folders) {
                const layer = this.findLayerInFolder(mapLayer, subFolder);
                if (layer) {
                    return (layer);
                }
            }
        }
    }


    isArray(item: any) {
        return (Object.prototype.toString.call(item) === '[object Array]');
    }
}

import type { IApiUrlService } from "../interfaces/IApiUrlService";
import { inject, Container } from "aurelia-framework";
import { EndpointBase, QueryStringParameter } from "../endpoint-base";
import type { IAppSettingsService } from "../interfaces/IAppSettingsService";
import { isNullOrWhitespace, hasValue } from "../utilities/globals";
import { PublicAppSettings } from "../models/app-settings";
import { endianness } from "os";



export class ApiUrlService implements IApiUrlService {
    private defaultRemoteBaseUrl: string

    setDefaultRemoteBaseUrl(remoteBaseUrl: string) {
        this.defaultRemoteBaseUrl = remoteBaseUrl;
    }

    getUrl(endpoint: EndpointBase): string;
    getUrl(endpoint: EndpointBase, queryString: string | QueryStringParameter[]): string;
    getUrl(endpoint: EndpointBase, queryString: string | QueryStringParameter[], remoteBaseUrl: string): string;
    getUrl(endpoint: EndpointBase, queryString?: string | QueryStringParameter[], remoteBaseUrl?: string): string {
        if (hasValue(queryString)) {
            if (typeof queryString === 'string')
                return this.getUrlWithQueryString(endpoint, queryString, remoteBaseUrl);
            return this.getUrlWithQueryStringParameters(endpoint, queryString, remoteBaseUrl);
        }
        return this.getUrlWithoutQueryString(endpoint, remoteBaseUrl);
    }

    private combineRemoteBaseAndPath(remoteBaseUrl: string, path: string) {
        if (remoteBaseUrl.endsWith("/") && path.startsWith('/'))
            return `${remoteBaseUrl}${path.substring(1)}`;
        else if (!remoteBaseUrl.endsWith("/") && !path.startsWith('/'))
            return `${remoteBaseUrl}/${path.substring(1)}`;
        else
            return `${remoteBaseUrl}${path}`;
    }

    private getUrlWithoutQueryString(endpoint: EndpointBase, remoteBaseUrl?: string) {
        if (endpoint.isRemote) {
            if (isNullOrWhitespace(remoteBaseUrl)) {
                if (isNullOrWhitespace(this.defaultRemoteBaseUrl))
                    throw new Error('The requested url is at a remote site, the remote base url must be supplied. The ApiUrl service will attempt to default to appUrl for the remote base, however you may need to wait for the appSettings to be populated.  Await IAppSettingsService.getAppSettings() to ensure data is populated.');
                else
                    remoteBaseUrl = this.defaultRemoteBaseUrl;
            }
            return this.combineRemoteBaseAndPath(remoteBaseUrl, endpoint.getPath([]));
        }
        else
            return endpoint.getPath([]);
    }

    private getUrlWithQueryString(endpoint: EndpointBase, queryString: string, remoteBaseUrl?: string) {
        if (queryString.length > 0 && !queryString.startsWith('?') && !queryString.startsWith('/'))
            queryString = `?${queryString}`;
        if (endpoint.isRemote) {
            if (isNullOrWhitespace(remoteBaseUrl)) {
                if (isNullOrWhitespace(this.defaultRemoteBaseUrl))
                    throw new Error('The requested url is at a remote site, the remote base url must be supplied. The ApiUrl service will attempt to default to appUrl for the remote base, however you may need to wait for the appSettings to be populated.  Await IAppSettingsService.getAppSettings() to ensure data is populated.');
                else
                    remoteBaseUrl = this.defaultRemoteBaseUrl;
            }
            return this.combineRemoteBaseAndPath(remoteBaseUrl, `${endpoint.getPath([]).substring(1)}${queryString}`);
        }
        else
            return `${endpoint.getPath([])}${queryString}`;
    }

    private getUrlWithQueryStringParameters(endpoint: EndpointBase, parameters: QueryStringParameter[], remoteBaseUrl?: string) {
        if (endpoint.isRemote) {
            if (isNullOrWhitespace(remoteBaseUrl)) {
                if (isNullOrWhitespace(this.defaultRemoteBaseUrl))
                    throw new Error('The requested url is at a remote site, the remote base url must be supplied. The ApiUrl service will attempt to default to appUrl for the remote base, however you may need to wait for the appSettings to be populated.  Await IAppSettingsService.getAppSettings() to ensure data is populated.');
                else
                    remoteBaseUrl = this.defaultRemoteBaseUrl;
            }
            return this.combineRemoteBaseAndPath(remoteBaseUrl, endpoint.getPath(parameters));
        }
        else
            return endpoint.getPath(parameters);
    }
}



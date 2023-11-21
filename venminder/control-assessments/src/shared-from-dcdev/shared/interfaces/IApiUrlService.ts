import { EndpointBase, QueryStringParameter } from "../endpoint-base";

export interface IApiUrlService {
    setDefaultRemoteBaseUrl(remoteBaseUrl: string): void;
    getUrl(endpoint: EndpointBase): string;
    getUrl(endpoint: EndpointBase, queryString: string | QueryStringParameter[]): string;
    getUrl(endpoint: EndpointBase, queryString: string | QueryStringParameter[], remoteBaseUrl: string): string;
}
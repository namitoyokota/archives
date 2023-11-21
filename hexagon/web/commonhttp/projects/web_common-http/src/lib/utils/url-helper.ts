/**
 * Class for helping map urls
 */
// @dynamic
export class UrlHelper {

    /**
     * Similar to UrlMap$v2 logic, but in a helper method style  
     * @param url URL to map for attachments
     */
    static mapMediaUrl(url: string): string {
        const hostname = window.location.hostname;
        let apiRootURL = url;

        if (!apiRootURL || apiRootURL.toLowerCase().startsWith('http')) {
            return url;
        } else {
            if (apiRootURL.charAt(0) === '/') {
                apiRootURL = apiRootURL.substring(1);
            }
        }

        if (hostname === 'localhost.hxgnconnect.com') {
            apiRootURL = `https://localhost.hxgnconnect.com/${apiRootURL}`;
        } else {
            apiRootURL = `/${apiRootURL}`;
        }

        return apiRootURL;
    }
}

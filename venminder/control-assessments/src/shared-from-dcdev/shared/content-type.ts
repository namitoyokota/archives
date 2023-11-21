export enum ContentType {
    Json = 1,
    Html = 2,
    Text = 3,
    Form = 4,
    UrlEncoded = 5,
    Everything = 6
}

export class ContentTypeConverter {
    public static getContentTypeString(contentType: ContentType) {
        switch(contentType) {
            case ContentType.Form:
                return 'multipart/form-data';
            case ContentType.Html:
                return 'text/html';
            case ContentType.Json:
                return 'application/json';
            case ContentType.Text:
                return 'text/plain';
            case ContentType.UrlEncoded:
                return 'application/x-www-form-urlencoded';
            default:
                throw new Error('Unsupported Accept Type');
        }
    }

    public static getAcceptString(contentType: ContentType) {
        switch(contentType) {
            case ContentType.Html:
                return 'text/html';
            case ContentType.Json:
                return 'application/json';
            case ContentType.Text:
                return 'text/plain';
            case ContentType.Everything:
                return '*/*';
            default:
                throw new Error('Unsupported Accept Type');
        }
    }
}
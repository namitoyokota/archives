export enum Audience$v1 {
    provider = 'Provider',
    public = 'Public',
    unknown = 'Unknown'
}

export class Documentation$v1 {

    /** Documentation id. */
    id: string;

    /** Code sample id. */
    codeSampleId?: string;

    /** Code sample file name. */
    codeSampleFileName?: string;

    /** Description translation token. */
    descriptionToken?: string;

    /** Markdown id. */
    markdownId?: string;

    /** Markdown file name. */
    markdownFileName?: string;

    /** Name translation token. */
    nameToken?: string;

    /** Swagger page port number. */
    port?: number;

    /** Swagger page url. */
    url?: string;

    /** Who is the intended audience of the documentation. */
    audience?: Audience$v1;

    /** List of keywords for the documentation. */
    keywords?: string[];

    constructor(params: Documentation$v1 = {} as Documentation$v1) {
        const {
            id = '',
            codeSampleId = '',
            codeSampleFileName = '',
            descriptionToken = '',
            markdownId = '',
            markdownFileName = '',
            nameToken = '',
            port = 0,
            url = '',
            audience = Audience$v1.unknown,
            keywords = []
        } = params;

        this.id = id;
        this.codeSampleId = codeSampleId;
        this.codeSampleFileName = codeSampleFileName;
        this.descriptionToken = descriptionToken;
        this.markdownId = markdownId;
        this.markdownFileName = markdownFileName;
        this.nameToken = nameToken;
        this.port = port;
        this.url = url;
        this.audience = audience;
        this.keywords = keywords;
    }
}

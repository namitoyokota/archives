export enum Scope$v1 {
    global = '*',
    system = 'system',
    tenant = 'tenant'
}

export class Pipeline$v1 {

    /** Id of the pipeline run */
    runId: string;

    /** Id of the tenant pipeline was ran for */
    tenantId: string;

    /** Id of the parent pipeline if exists */
    parentPipeline?: string;

    /** List of capabilities used */
    capabilities?: string[];

    /** Current status of the pipeline */
    status?: string;

    /** Purpose of the pipeline */
    operation?: string;

    /** Start time of the run */
    startTime?: string;

    /** End time of the run */
    endTime?: string;

    /** Last modified time of the record */
    lastModifiedTime: string;

    /** Download link to the pipeline if available */
    downloadUrl?: string;

    /** Expiration date if download link available */
    downloadExpires?: string;

    /** Download size of the zip file */
    downloadSize?: string;

    /** Flag for whether backup is still available */
    isAvailable?: boolean;

    constructor(params: Pipeline$v1 = {} as Pipeline$v1) {
        const {
            runId = null,
            tenantId = null,
            parentPipeline = null,
            capabilities = null,
            status = null,
            operation = null,
            startTime = null,
            endTime = null,
            lastModifiedTime = null,
            downloadUrl = null,
            downloadExpires = null,
            downloadSize = null,
            isAvailable = null
        } = params;

        this.runId = runId;
        this.tenantId = tenantId;
        this.parentPipeline = parentPipeline;
        this.capabilities = capabilities;
        this.status = status;
        this.operation = operation;
        this.startTime = startTime;
        this.endTime = endTime;
        this.lastModifiedTime = lastModifiedTime;
        this.downloadUrl = downloadUrl;
        this.downloadExpires = downloadExpires;
        this.downloadSize = downloadSize;
        this.isAvailable = isAvailable;
    }
}

export class PropsChangedMsg {
    type?: string;
    value?: any;
    urlValid?: boolean;
    subdomainsValid?: boolean;
    urlParamsValid?: boolean;
    authParamsValid?: boolean;
    needToSave?: boolean;
    needToRefresh?: boolean;
    redrawOnly?: boolean;

    constructor(params = {} as PropsChangedMsg) {
        const {
            type,
            value,
            urlValid = false,
            subdomainsValid = false,
            urlParamsValid = false,
            authParamsValid = false,
            needToSave = false,
            needToRefresh = true,
            redrawOnly = false
        } = params;

        this.type = type;
        this.value = value;
        this.urlValid = urlValid;
        this.subdomainsValid = subdomainsValid;
        this.urlParamsValid = urlParamsValid;
        this.authParamsValid = authParamsValid;
        this.needToSave = needToSave;
        this.needToRefresh = needToRefresh;
        this.redrawOnly = redrawOnly;
    }
}

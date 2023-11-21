import { MapLayerOption$v1 } from './mapLayerOption.v1';

export class MapOptionParam {
    mapOption?: MapLayerOption$v1;
    isNameVisited?: boolean;
    isValueVisited?: boolean;
    isError?: boolean;
    valueHidden?: boolean;
    readOnly?: boolean;
    isNew?: boolean;
    valuePlaceholderToken?: any;
    lockBtnTooltipToken?: any;
    readOnlyTooltipToken?: any;
    origType?: string;
    needToSave?: boolean;

    constructor(params = {} as MapOptionParam) {
        const {
            mapOption = new MapLayerOption$v1(),
            isNameVisited = false,
            isValueVisited = false,
            isError = false,
            valueHidden = false,
            readOnly = false,
            isNew = false,
            valuePlaceholderToken,
            lockBtnTooltipToken,
            readOnlyTooltipToken,
            origType,
            needToSave = false
        } = params;

        this.mapOption = mapOption;
        this.isNameVisited = isNameVisited;
        this.isValueVisited = isValueVisited;
        this.isError = isError;
        this.valueHidden = valueHidden;
        this.readOnly = readOnly;
        this.isNew = isNew;
        this.valuePlaceholderToken = valuePlaceholderToken;
        this.lockBtnTooltipToken = lockBtnTooltipToken;
        this.readOnlyTooltipToken = readOnlyTooltipToken;
        this.origType = origType;
        this.needToSave = needToSave;
    }
}

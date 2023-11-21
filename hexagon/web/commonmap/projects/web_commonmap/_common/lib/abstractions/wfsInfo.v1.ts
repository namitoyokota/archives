import { TreeNode } from './tree-node.v1';

export class WFSOperation {
    name?: string;
    supportedFormats?: string[];
    constructor(params = {} as WFSOperation) {
        const {
            name,
            supportedFormats: outputFormats = [],
        } = params;
        this.name = name;
        this.supportedFormats = outputFormats;
    }
}
export class WFSFeatureType {
    defaultReference?: string;
    name?: string;
    title?: string;
    outputFormats?: string[];
    constructor(params = {} as WFSFeatureType) {
        const {
            defaultReference,
            name,
            outputFormats = [],
            title
        } = params;
        this.defaultReference = defaultReference;
        this.name = name;
        this.outputFormats = outputFormats;
        this.title = title;
    }
}

export class WFSCapabilities {
    featTypes?: WFSFeatureType[];
    operations?: WFSOperation[];
    version?: string;

    constructor(params = {} as WFSCapabilities) {
        const {
            featTypes = [],
            operations = [],
            version = '2.0.0'
        } = params;
        this.featTypes = featTypes;
        this.operations = operations;
        this.version = version;
    }
}

export class WFSInfo {
    featTypes?: WFSFeatureType[];
    featTypesTree?: TreeNode[];
    outputFormats?: string[];
    version?: string;

    constructor(params = {} as WFSInfo) {
        const {
            featTypes = [],
            featTypesTree = [],
            outputFormats = [],
            version = '2.0.0'
        } = params;
        this.featTypes = featTypes;
        this.featTypesTree = featTypesTree;
        this.outputFormats = outputFormats;
        this.version = version;
    }
}

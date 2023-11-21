/** Class representing the HxDR 3D Tiles Layer information */
export class HxDRLayerInfo {
    /** Collections */
    collections: HxDRCollection[];
    /** Projects  */
    projects: HxDRProject[];
    /** My Assets Project */
    myAssetsProject: HxDRProject;

    constructor(params = {} as HxDRLayerInfo) {
        const {
            collections = [],
            projects = [],
            myAssetsProject = new HxDRProject()
        } = params;

        this.collections = collections;
        this.projects = projects;
        this.myAssetsProject = myAssetsProject;
    }
}

export class HxDRCollection {
    /** id of the collection */
    id?: string;
    /** name of collection */
    title?: string;
    /** Layers */
    layers?: HxDRLayer[];

    constructor(params = {} as HxDRCollection) {
        const {
            id,
            title,
            layers = []
        } = params;

        this.id = id;
        this.title = title;
        this.layers = layers;
    }
}

export class HxDRProject {
    /** id of the project */
    id?: string;
    /** name of project */
    name?: string;
    /** root folder */
    rootFolder?: HxDRFolder;

    constructor(params = {} as HxDRProject) {
        const {
            id,
            name,
            rootFolder
        } = params;

        this.id = id;
        this.name = name;
        this.rootFolder = rootFolder;
    }
}

export class HxDRFolder {
    /** id of the folder */
    id?: string;
    /** Project id */
    projectId?: string;
    /** name of folder */
    name?: string;
    /** Layers */
    layers?: HxDRLayer[];
    /** Folders */
    folders?: HxDRFolder[];
    /** Parent Folder Id */
    parentFolderId?: string;
    /** Flag to indicate root folder */
    isRootFolder?: boolean;

    //* Flag to indicate if folder info has been queried
    queried = false;

    constructor(params = {} as HxDRFolder) {
        const {
            id,
            projectId,
            name,
            layers = [],
            folders = [],
            parentFolderId,
            isRootFolder = false,
            queried = false
        } = params;

        this.id = id;
        this.projectId = projectId;
        this.name = name;
        this.layers = layers;
        this.folders = folders;
        this.parentFolderId = parentFolderId;
        this.isRootFolder = isRootFolder;
        this.queried = queried;
    }
}

export enum ArtifactTypeEnum {
    IMAGE_2D_ORTHO = "IMAGE_2D_ORTHO",
    LIDAR = "LIDAR", 
    MESH = "MESH",
    PANORAMIC = "PANORAMIC",
    POINT_CLOUD = "POINT_CLOUD"
}

export class HxDRGeoreferenceVisiblity {
    type: ArtifactTypeEnum;
    visible: boolean;

    constructor(params = {} as HxDRGeoreferenceVisiblity) {
        const {
            type,
            visible
        } = params;

        this.type = type;
        this.visible = visible;
    }
}
export class HxDRGeoreference {
    id?: string;
    name?: string;
    anchorX?: number;
    anchorY?: number;
    anchorZ?: number;
    scaleX?: number;
    scaleY?: number;
    scaleZ?: number;
    altitude?: number;
    longitude?: number;
    latitude?: number;
    roll?: number;
    pitch?: number;
    yaw?: number;
    visible?: HxDRGeoreferenceVisiblity[];

    constructor(params = {} as HxDRGeoreference) {
        const {
            id,
            name,
            anchorX,
            anchorY,
            anchorZ,
            scaleX,
            scaleY,
            scaleZ,
            altitude,
            longitude,
            latitude,
            roll,
            pitch,
            yaw,
            visible = []
        } = params;

        this.id = id;
        this.name = name;
        this.anchorX = anchorX;
        this.anchorY = anchorY;
        this.anchorZ = anchorZ;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.scaleZ = scaleZ;
        this.altitude = altitude;
        this.longitude = longitude;
        this.latitude = latitude;
        this.roll = roll;
        this.pitch = pitch;
        this.yaw = yaw;

        this.visible = [];
        if (visible?.length > 0) {
            for (const vis of visible) {
                this.visible.push(new HxDRGeoreferenceVisiblity(vis))
            }
        }
    }
}

/** Class representing the HxDR 3D Tiles, HSPC, and WMS Layer information */
export class HxDRLayer {
    /** id of the layer */
    id?: string;
    /** Folder id */
    folderId?: string;
    /** Project id */
    projectId?: string;
    /** Layer label */
    label?: string;
    /** Layer endpoint */
    endpoint?: string;
    /** Quality Factor */
    qualityFactor?: number;
    /** EmbeddedGeoReference */
    withEmbeddedGeoreference?: boolean;
    /** AnchorPoint */
    anchorPoint?: any;
    /** GeoReferences */
    georeferences?: HxDRGeoreference[];

    // WMS properties

    /** WMS layer name */
    datasetId?: string;
    /** Image format of the wms layer */
    imageFormat?: string;
    /** Bounds of the wms layer */
    bounds?: any;
    /** Version supported by the wms streaming */
    version?: string;
    /** Reference of the wms layer */
    reference?: string;

    constructor(params = {} as HxDRLayer) {
        const {
            id,
            folderId,
            projectId,
            label,
            endpoint,
            qualityFactor,
            withEmbeddedGeoreference = false,
            anchorPoint,
            georeferences = [],
            datasetId,
            imageFormat,
            bounds,
            version = '1.3.0',
            reference
        } = params;

        this.id = id;
        this.folderId = folderId;
        this.projectId = projectId;
        this.label = label;
        this.endpoint = endpoint;
        this.qualityFactor = qualityFactor;
        this.withEmbeddedGeoreference = withEmbeddedGeoreference;
        this.anchorPoint = anchorPoint;
        this.datasetId = datasetId;
        this.imageFormat = imageFormat;
        this.bounds = bounds;
        this.version = version;
        this.reference = reference;
        
        this.georeferences = [];
        if (georeferences?.length > 0) { 
            for (const georef of georeferences) {
                this.georeferences.push(new HxDRGeoreference(georef));
            }
        }
    }
}

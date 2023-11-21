import { Point$v1 } from './point.v1';
import { Image$v1 } from './image.v1';

export class ImageInfo$v1 {
    id: string;
    image: Image$v1;
    imageSize: number[];
    anchors: Point$v1[];
    rotation: number;
    mapOrigin: Point$v1;
    constrainedTo90: boolean;
    maintainAspect: boolean;

    constructor(params = {} as ImageInfo$v1) {
        const {
            id,
            image,
            imageSize,
            anchors = [],
            rotation = 0,
            mapOrigin,
            constrainedTo90 = false,
            maintainAspect = false
        } = params;
        this.id = id;
        this.image = image;
        this.imageSize = imageSize;
        this.rotation = rotation;
        this.anchors = anchors;
        this.mapOrigin = mapOrigin;
        this.constrainedTo90 = constrainedTo90;
        this.constrainedTo90 = constrainedTo90;
    }
}

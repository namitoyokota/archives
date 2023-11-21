export interface Size {
    x: number;
    y: number;
}

/**
 * Represents the configuration options of a composition icon
 */
export class CompositeIconOptions$v1 {
    scaleSize?: Size;
    point?: Size;
    showStroke?: boolean;
    flipH?: boolean;
    flipV?: boolean;

    constructor(params: CompositeIconOptions$v1 = {} as CompositeIconOptions$v1) {
        const {
            scaleSize,
            point,
            showStroke = true,
            flipH = false,
            flipV = false
        } = params;

        this.scaleSize = scaleSize;
        this.point = point;
        this.showStroke = showStroke;
        this.flipH = flipH;
        this.flipV = flipV;
    }
}

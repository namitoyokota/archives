export class LayerInfo$v1 {
    /** Id of the layer */
    id: string;
    /** Name of the layer in the layer panel */
    name: string;

    constructor (params = {} as LayerInfo$v1) {
        const {
            id,
            name
        } = params;

        this.id = id;
        this.name = name;
    }
}

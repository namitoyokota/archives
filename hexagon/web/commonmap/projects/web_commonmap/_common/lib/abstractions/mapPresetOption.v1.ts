export class MapPresetOption$v1 {
    /** Name of the option */
    public name?: string;

    /** Value for the option */
    public value?: string;

    /** Data type for the option */
    public type?: string;

    constructor(params = {} as MapPresetOption$v1) {
        const {
            name = null,
            value = null,
            type  = null
        } = params;

        this.name = name;
        this.value = value;
        this.type = type;
    }
}

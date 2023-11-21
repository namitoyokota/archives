/** Class used to define a component type icon for a map marker.  This type of icon can only be used for
 *  a 2d marker.
 */
export class ComponentIcon$v1<T> {

    /** Component name defined by the capability for the marker being placed */
    componentName: string;

    /** Id of the capability that owns the component marker */
    capabilityId: string;

    /** Settings that will be injected when the component is created */
    componentSettings?: T;

    constructor(params = {} as ComponentIcon$v1<T>) {
        const {
            componentName,
            capabilityId,
            componentSettings
        } = params;
        this.componentName = componentName;
        this.capabilityId = capabilityId;
        this.componentSettings = componentSettings;
    }
}

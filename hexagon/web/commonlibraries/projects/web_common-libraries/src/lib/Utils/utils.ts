/**
 * Some common util methods
 */
// @dynamic
export class Utils {

    /**
     * @deprecated Do no deep copy on new code
     * Creates a deep copy of object passed in
     * @param param The object to copy
     */
    static deepCopy<T>(param: T): T {
        return JSON.parse(JSON.stringify(param));
    }
}

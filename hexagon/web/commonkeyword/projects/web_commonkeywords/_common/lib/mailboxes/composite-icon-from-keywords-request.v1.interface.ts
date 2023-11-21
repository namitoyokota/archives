/** Object that is passed when making a request to get
 * a composite icon from keywords.
 */
export interface CompositeIconFromKeywordsRequest {

    /** The ID of the capability to which the resource belongs */
    capabilityId: string;

    /** The industry with which the resource is associated */
    industry: string;

    /** A collection of keywords */
    keywords: string[];
}

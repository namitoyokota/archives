export class ListStep {

    constructor(token: string, optional = false, complete = false, visited = false, displayOptional = true) {
        this.token = token;
        this.optional = optional;
        this.complete = complete;
        this.visited = visited;
        this.displayOptional = displayOptional;
    }

    /** The language token */
    token: string;

    /** Whether the step is optional or not */
    optional: boolean;

    /** Represents whether the step is complete */
    complete: boolean;

    /** Represents if the step has been visited by the user. If so then it removes the blue 'unread' dot. */
    visited: boolean;

    /** Whether to display optional text or not */
    displayOptional: boolean;
}

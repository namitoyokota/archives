/** Class used to define an icon defined by a Canvas DOM element.  This type of icon can be used for
 *  a 3d markers only.
 */
export class CanvasIcon$v1 {

    /** String defining the htlm to use for the icon or an html element to use for the icon */
    html: any;

    constructor(html: any) {
        this.html = html;
    }
}

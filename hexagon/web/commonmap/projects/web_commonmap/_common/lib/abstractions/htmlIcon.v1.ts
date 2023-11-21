/** Class used to define a htlm type icon for a map marker.  This type of icon can be used for
 *  a 2d marker only.
 */
export class HtmlIcon$v1 {

    /** String defining the html to use for the icon or an html element to use for the icon */
    html: any;

    constructor(html: any) {
        this.html = html;
    }
}

import { inject, bindable, computedFrom } from "aurelia-framework";
import { isNullOrWhitespace } from "../../utilities/globals";



export class Loader {
    @bindable message: string = 'Loading, please wait...';
    @bindable isMsgStrong: boolean = true;
    @bindable private isLightColor: boolean = false;
    @bindable private isRelative = false;
    @bindable private isFixed = false;
    @bindable alignment: "center"|"left"|"right" = "center";
    @bindable noRow: boolean = false;

    private className = "";

    attached() {
        this.className = this.getClass();
    }

    private getClass() {
        if (this.isFixed) {
            return "fixed-loader";
        } else if (this.isRelative) {
            return "relative-loader";
        } else
            return "";
    }

    @computedFrom("message")
    get hasMessage(): boolean {
        return !isNullOrWhitespace(this.message);
    }

    get textAlignment(): string {
        if (this.alignment == "left") {
            return "text-left";
        }
        if (this.alignment == "right") {
            return "text-right";
        }
        return "text-center";
    }
}
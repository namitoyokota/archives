import { IBoolValueConverter } from "../interfaces/vm-grid-interfaces";

export class BoolStatusValueConverter {
    toView(value: boolean, converter: IBoolValueConverter) {
        if (value == null) {
            return '&mdash;';
        }
        return (value) ? converter.TrueState : converter.FalseState;
    }
}
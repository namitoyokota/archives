export class SanitizeValueConverter {
    toView(value: string) {
        if (!value || value.length === 0) {
            return "&mdash;";
        }
        return value;
    }
}
/**
 * Helper for working with colors
 */
// @dynamic
export class ColorHelper {

    /**
     * Converts a given color into an opacity value. Values will be between 1 and 0;
     * @param color Hex color values that looks like #000000ff
     * @returns 
     */
    static getOpacity(color: string): number {
        if (color.length < 9) {
            return 1
        }

        // Look at the last two numbers
        const rawVal = parseInt(color.slice(-2), 16);
        return +(rawVal / 255).toFixed(2); // Convert to a number between 1 an 0
    }

    /**
     * Converts a given opacity between 0 and 1 to the hex opacity
     * @param opacity The opacity to convert to hex opacity
     */
    static getOpacityHex(opacity: number): string {
        const raw = (opacity * 255).toString(16).split('.')[0].substring(0, 2);
        return  raw.length === 2 ? raw : '0' + raw;
    }

    /**
     * Returns true if two color are equal regardless of opacity
     * @param colorA 
     * @param colorB 
     */
    static compare(colorA: string, colorB: string): boolean {
        colorA = colorA.substring(0, 7);
        colorB = colorB.substring(0, 7);

        return colorA === colorB;
    }
}
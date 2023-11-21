import * as DOMPurify from 'dompurify';

export class DOMPurifySanitizer {
    /**
     * Sanitizes the provided input.
     * @param input The input to be sanitized.
     */
    sanitize(input: string): string {
        return DOMPurify.sanitize(input);
    }
}

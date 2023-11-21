export enum TimeoutLength {

        // A timeout in MILLISECONDS.  Use with operations that should happen very quickly.
        Short = 5000,

        // A timeout in MILLISECONDS.  Use with most operations.
        Standard = 30000,

        /// A timeout in MILLISECONDS.  Use with operations that may take a long time to execute.
        Long = 120000
}

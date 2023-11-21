/// Defines a set of constants for use in unit tests.
export class TestConstants {
    /** The maximum number of tests for a single test run */
    static SingleTestRun = 1;

    /** The maximum number of tests for a low-variance test run */
    static SmallTestRun = 10;

    /** The maximum number of tests for a standard-variance test run */
    static StandardTestRun = 100;

    /** The maximum number of tests for a high-variance test run */
    static LargeTestRun = 1000;
}

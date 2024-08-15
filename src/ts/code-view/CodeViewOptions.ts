/** Code view options. */
type CodeViewOptions = {
    /** Specifies lines of code to be highlighted. For example, the string format can be "1" to highlight the first line, "1-5" to highlight lines 1 through 5, or "2-4,6-8" to highlight lines 2 through 4 and 6 through 8. */
    highlight ?: string;
    /** Determines whether gutter should be visible (default = true). */
    showGutter ?: boolean;
    /** Determines whether line numbers should be visible (default = true). */
    showLineNumbers ?: boolean;
    /** Line height (default = 2). */
    lineHeight ?: number;
    /** Line height unit (default = "rem"). */
    lineHeightUnit ?: string;
    /** CSS classes that should be added to root element of code view. */
    cssClasses ?: string[];
}

export default CodeViewOptions;
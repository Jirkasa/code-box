import CodeViewOptions from "../code-view/CodeViewOptions";

/** Code box options. */
type CodeBoxOptions = {
    /** Determines whether the code box should be initialized just before it is scrolled into the viewport. By default, this option is enabled (if disabled, the code box is initialized immediately). This helps reduce the load on performance during page loading. */
    lazyInit ?: boolean;
    /** Specifies whether the first code view should be set as active by default if no other code view is set as active (default = false). */
    implicitActive ?: boolean;
    /** Default options for code views. */
    defaultCodeViewOptions ?: CodeViewOptions;
    /** Height of the element that is displayed when no code view is set as active. */
    noCodeViewSelectedElementHeight ?: string;
    /** Text of the element that is displayed when no code view is set as active (default = "No code view selected"). */
    noCodeViewSelectedText ?: string;
    /** Minimum number of lines in the code view that determines the minimal height of the code box when the code view is displayed. This value is not exact as it does not account for padding set by CSS styles; it is intended to set an optimal minimal height. */
    minCodeViewLinesCount ?: number;
}

export default CodeBoxOptions;
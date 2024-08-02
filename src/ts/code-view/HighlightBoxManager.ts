/** Manager of highlight box. */
class HighlightBoxManager {
    /** Function that is called when detach method is called. */
    public onDetach : (() => void) | null = null;
    /** Function that is called when unlinkCodeView method is called. */
    public onUnlinkCodeView : (() => void) | null = null;

    /**
     * Detaches highlight box.
     */
    public detach() : void {
        if (!this.onDetach) return;
        this.onDetach();
    }

    /**
     * Unlinks code view from highlight box.
     */
    public unlinkCodeView() : void {
        if (!this.onUnlinkCodeView) return;
        this.onUnlinkCodeView();
    }
}

export default HighlightBoxManager;
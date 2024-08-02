class HighlightBoxManager {
    public onDetach : (() => void) | null = null;
    public onUnlinkCodeView : (() => void) | null = null;

    public detach() : void {
        if (!this.onDetach) return;
        this.onDetach();
    }

    public unlinkCodeView() : void {
        if (!this.onUnlinkCodeView) return;
        this.onUnlinkCodeView();
    }
}

export default HighlightBoxManager;
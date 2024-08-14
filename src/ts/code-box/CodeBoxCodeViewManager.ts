/** Manager of code box code view. */
class CodeBoxCodeViewManager {
    /** Function, called when code view identifier should be changed. */
    public onIdentifierChange : ((newIdentifier : string) => void) | null = null;
    /** Function, called when code view should be unlinked from code box. */
    public onUnlinkCodeBox : (() => void) | null = null;

    /**
     * Changes identifier of code view.
     * @param newIdentifier New identifier.
     */
    public changeIdentifier(newIdentifier : string) : void {
        if (!this.onIdentifierChange) return;
        this.onIdentifierChange(newIdentifier);
    }

    /**
     * Unlinks code view from code box.
     */
    public unlinkCodeBox() : void {
        if (!this.onUnlinkCodeBox) return;
        this.onUnlinkCodeBox();
    }
}

export default CodeBoxCodeViewManager;
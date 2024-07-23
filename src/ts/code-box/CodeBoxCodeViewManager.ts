class CodeBoxCodeViewManager {
    public onIdentifierChange : ((newIdentifier : string) => void) | null = null;
    public onUnlinkCodeBox : (() => void) | null = null;

    public changeIdentifier(newIdentifier : string) : void {
        if (!this.onIdentifierChange) return;
        this.onIdentifierChange(newIdentifier);
    }

    public unlinkCodeBox() : void {
        if (!this.onUnlinkCodeBox) return;
        this.onUnlinkCodeBox();
    }
}

export default CodeBoxCodeViewManager;
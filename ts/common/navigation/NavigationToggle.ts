import Navigation from "./Navigation";

class NavigationToggle {
    private opened : boolean = false;
    private navigations : Navigation[];
    private toggleButton : HTMLElement;
    private toggleButtonCheckedCSSClass : string;

    constructor(toggleButton : HTMLElement, toggleButtonCheckedCSSClass : string, navigations : Array<Navigation>) {
        this.navigations = navigations;
        this.toggleButton = toggleButton;
        this.toggleButtonCheckedCSSClass = toggleButtonCheckedCSSClass;

        this.toggleButton.addEventListener("click", () => this.onToggleButtonClick());
    }

    public open() : void {
        this.opened = true;

        this.toggleButton.classList.add(this.toggleButtonCheckedCSSClass);
        for (let navigation of this.navigations) {
            navigation.open();
        }
    }

    public close() : void {
        this.opened = false;
        
        this.toggleButton.classList.remove(this.toggleButtonCheckedCSSClass);
            for (let navigation of this.navigations) {
                navigation.close();
            }
    }

    private onToggleButtonClick() : void {
        if (this.opened) {
            this.close();
        } else {
            this.open();
        }
    }
}

export default NavigationToggle;
export class DisplayComponentModel {
    mainMenu: boolean;
    footer: boolean;
    searchFooter: boolean;

    constructor(mainMenu: boolean, footer: boolean, searchFooter: boolean) {
        this.mainMenu = mainMenu;
        this.footer = footer;
        this.searchFooter = searchFooter;
    }
}
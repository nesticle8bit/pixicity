export class DisplayComponentModel {
    mainMenu: boolean;
    footer: boolean;
    searchFooter: boolean;
    submenu: boolean;

    constructor(mainMenu: boolean, footer: boolean, searchFooter: boolean, submenu: boolean) {
        this.mainMenu = mainMenu;
        this.footer = footer;
        this.searchFooter = searchFooter;
        this.submenu = submenu;
    }
}
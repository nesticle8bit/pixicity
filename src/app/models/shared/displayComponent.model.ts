export class DisplayComponentModel {
  mainMenu: boolean;
  footer: boolean;
  searchFooter: boolean;
  submenu: boolean;
  background: string;

  constructor(
    mainMenu: boolean,
    footer: boolean,
    searchFooter: boolean,
    submenu: boolean,
    background: string
  ) {
    this.mainMenu = mainMenu;
    this.footer = footer;
    this.searchFooter = searchFooter;
    this.submenu = submenu;
    this.background = background;
  }
}

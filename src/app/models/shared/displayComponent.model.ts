export class DisplayComponentModel {
  mainMenu: boolean;
  footer: boolean;
  searchFooter: boolean;
  submenu: boolean;
  /** URL del fondo de página (sin url(...)); vacía = sin fondo. */
  background: string;
  /** background-repeat del fondo de página. Opcional: sin valor se repite en mosaico. */
  backgroundRepeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';

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

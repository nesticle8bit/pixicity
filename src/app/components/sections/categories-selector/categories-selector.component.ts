import { Component, OnInit } from '@angular/core';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';

@Component({
  selector: 'app-categories-selector',
  templateUrl: './categories-selector.component.html',
  styleUrls: ['./categories-selector.component.scss']
})
export class CategoriesSelectorComponent implements OnInit {
  public display: boolean = false;
  public categorias: any[] = [];

  constructor(
    private httpParametrosService: IHttpParametrosService
  ) { }

  ngOnInit(): void {
    this.getCategorias();
  }

  getCategorias(): void {
    this.httpParametrosService.getCategoriasDropdown().subscribe((values: any) => {
      this.categorias = values;
    });
  }

}

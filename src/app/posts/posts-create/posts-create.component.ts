import { Component, OnInit } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';

@Component({
  selector: 'app-posts-create',
  templateUrl: './posts-create.component.html',
  styleUrls: ['./posts-create.component.scss']
})
export class PostsCreateComponent implements OnInit {
  public categorias: any[] = [];
  public etiquetas: any = [];

  constructor(
    private parametrosService: IHttpParametrosService
  ) { }

  ngOnInit(): void {
    this.getCategorias();
  }

  getCategorias(): void {
    this.parametrosService.getCategoriasDropdown().subscribe((value: any) => {
      this.categorias = value;
    });
  }

  addEtiqueta(event: MatChipInputEvent) {
    if (event.value) {
      this.etiquetas.add(event.value);
      event.chipInput!.clear();
    }
  }

  removeEtiqueta(etiqueta: string) {
    this.etiquetas.delete(etiqueta);
  }
}

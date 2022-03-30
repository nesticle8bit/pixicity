import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { PaginationService } from 'src/app/services/shared/pagination.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-borradores',
  templateUrl: './borradores.component.html',
  styleUrls: ['./borradores.component.scss'],
})
export class BorradoresComponent implements OnInit {
  public borradores: any[] = [];
  public categorias: any[] = [];
  public totalCount: number = 0;
  public formGroup: FormGroup;

  constructor(
    private displayService: DisplayComponentService,
    public paginationService: PaginationService,
    private postService: IHttpPostsService,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      search: '',
    });

    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
    });
  }

  ngOnInit(): void {
    this.getBorradores(0);
  }

  getBorradores(categoriaId: number): void {
    this.postService
      .getBorradores(this.formGroup?.value?.search, categoriaId)
      .subscribe((response: any) => {
        if (this.categorias?.length <= 0) {
          this.categorias = response.categorias;
        }

        this.borradores = response.data;
        this.totalCount = response.pagination.totalCount;
      });
  }

  filterByCategory(categoria: any): void {
    if (!categoria) {
      return;
    }

    this.getBorradores(categoria.categoria.id);
  }

  deleteBorrador(borrador: any): void {
    console.log(borrador);
    Swal.fire({
      title: !borrador.eliminado ? 'Eliminar Borrador' : 'Recuperar Borrador',
      text: `¿Seguro que deseas ${
        !borrador.eliminado ? 'eliminar' : 'recuperar'
      } este borrador?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: !borrador.eliminado ? `Borrar` : 'Recuperar',
      cancelButtonText: `Cancelar`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.postService
          .deletePost(borrador.id)
          .subscribe((response: boolean) => {
            Swal.fire({
              title: !borrador.eliminado ? 'Eliminado' : 'Recuperado',
              text: `El post ha sido ${
                !borrador.eliminado ? 'eliminado' : 'recuperado'
              } correctamente, ahora nadie lo podrá visualizar`,
              icon: 'success',
              timer: 3000,
            });

            borrador.eliminado = !borrador.eliminado;
          });
      }
    });
  }

  pageChange(event: PageEvent): void {
    this.paginationService.change(event);
    this.getBorradores(0);
  }
}

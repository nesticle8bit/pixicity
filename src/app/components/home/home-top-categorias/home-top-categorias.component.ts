import { TopCategoriaViewModel } from 'src/app/models/parametros/parametros-vm.model';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { RouterLink } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-home-top-categorias',
    templateUrl: './home-top-categorias.component.html',
    styleUrls: ['./home-top-categorias.component.scss'],
    imports: [RouterLink, MatTooltip],
})
export class HomeTopCategoriasComponent implements OnInit {
  private parametrosService = inject(IHttpParametrosService);

  private readonly destroyRef = inject(DestroyRef);

  public categorias: TopCategoriaViewModel[] = [];

  ngOnInit(): void {
    this.getTopCategorias();
  }

  getTopCategorias(): void {
    this.parametrosService
      .getTopCategorias(10)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.categorias = value ?? [];
      });
  }
}

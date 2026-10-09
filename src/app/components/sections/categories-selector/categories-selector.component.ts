import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-categories-selector',
    templateUrl: './categories-selector.component.html',
    styleUrls: ['./categories-selector.component.scss'],
    imports: [RouterLink]
})
export class CategoriesSelectorComponent implements OnInit {
  private httpParametrosService = inject(IHttpParametrosService);

  private readonly destroyRef = inject(DestroyRef);

  public display: boolean = false;
  public categorias: any[] = [];

  ngOnInit(): void {
    this.getCategorias();
  }

  getCategorias(): void {
    this.httpParametrosService
      .getCategoriasDropdown()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((values) => {
        this.categorias = values;
      });
  }

}

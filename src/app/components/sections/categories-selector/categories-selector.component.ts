import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';

@Component({
  standalone: false,
  selector: 'app-categories-selector',
  templateUrl: './categories-selector.component.html',
  styleUrls: ['./categories-selector.component.scss']
})
export class CategoriesSelectorComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public display: boolean = false;
  public categorias: any[] = [];

  constructor(
    private httpParametrosService: IHttpParametrosService
  ) { }

  ngOnInit(): void {
    this.getCategorias();
  }

  getCategorias(): void {
    this.httpParametrosService
      .getCategoriasDropdown()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((values: any) => {
        this.categorias = values;
      });
  }

}

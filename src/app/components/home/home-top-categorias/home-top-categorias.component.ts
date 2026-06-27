import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';

@Component({
  standalone: false,
  selector: 'app-home-top-categorias',
  templateUrl: './home-top-categorias.component.html',
  styleUrls: ['./home-top-categorias.component.scss'],
})
export class HomeTopCategoriasComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public categorias: any[] = [];

  constructor(private parametrosService: IHttpParametrosService) {}

  ngOnInit(): void {
    this.getTopCategorias();
  }

  getTopCategorias(): void {
    this.parametrosService
      .getTopCategorias(10)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: any[]) => {
        this.categorias = value ?? [];
      });
  }
}

import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpNoticiasService } from 'src/app/services/interfaces/httpNoticias.interface';
import { enNavegador } from '../../../shared/helpers/plataforma';

@Component({
    selector: 'app-main-ultimas-noticias',
    templateUrl: './main-ultimas-noticias.component.html',
    styleUrls: ['./main-ultimas-noticias.component.scss'],
})
export class MainUltimasNoticiasComponent implements OnInit {
  private noticiasService = inject(IHttpNoticiasService);

  private readonly destroyRef = inject(DestroyRef);
  private rotacion?: ReturnType<typeof setTimeout>;

  public noticias: any[] = [];
  public currentIndex = -1;

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => clearTimeout(this.rotacion));
    this.getNoticias();
  }

  getNoticias(): void {
    this.noticiasService
      .getAllNoticias()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.noticias = response;
        this.showNext();
      });
  }

  showNext() {
    this.currentIndex++;
    if (this.currentIndex >= this.noticias.length) {
      this.currentIndex = 0;
    }

    // Solo en el navegador: en el SSR este temporizador que se reprograma deja la app inestable y el render
    // nunca termina. Se cancela al destruir el componente (antes seguía corriendo para siempre).
    if (!enNavegador()) {
      return;
    }
    clearTimeout(this.rotacion);
    this.rotacion = setTimeout(() => this.showNext(), 6000);
  }
}

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

@Component({
  standalone: false,
  selector: 'app-main-ultimas-noticias',
  templateUrl: './main-ultimas-noticias.component.html',
  styleUrls: ['./main-ultimas-noticias.component.scss'],
})
export class MainUltimasNoticiasComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public noticias: any[] = [];
  public currentIndex = -1;

  constructor(private noticiasService: IHttpNoticiasService) {}

  ngOnInit(): void {
    this.getNoticias();
  }

  getNoticias(): void {
    this.noticiasService
      .getAllNoticias()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        this.noticias = response;
        this.showNext();
      });
  }

  showNext() {
    this.currentIndex++;
    if (this.currentIndex >= this.noticias.length) {
      this.currentIndex = 0;
    }

    setTimeout(() => {
      this.showNext();
    }, 6000);
  }
}

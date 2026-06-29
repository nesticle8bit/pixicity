import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  standalone: false,
  selector: 'app-mod-history',
  templateUrl: './mod-history.component.html',
  styleUrls: ['./mod-history.component.scss'],
})
export class ModHistoryComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public posts: any[] = [];

  constructor(
    private displayService: DisplayComponentService,
    private webService: IHttpWebService,
    private title: Title
  ) {
    this.title.setTitle(`Historial de moderación | Taringa - Inteligencia colectiva | Comunidad para Compartir Información`);
    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: ''
    });
  }

  ngOnInit(): void {
    this.getHistorialModeracion();
  }

  getHistorialModeracion(): void {
    this.webService.getHistorialModeracion().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      this.posts = response;
    });
  }
}

import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTooltip } from '@angular/material/tooltip';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AccionModeracion, ModeracionLog } from 'src/app/models/admin/moderacion.model';
import { IHttpModeracionService } from 'src/app/services/interfaces/httpModeracion.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';

/** Lo que hace el staff, para cualquier usuario con sesión: acción, a qué, qué cambió y por qué. */
@Component({
  selector: 'app-mod-history',
  templateUrl: './mod-history.component.html',
  styleUrls: ['./mod-history.component.scss'],
  imports: [FormsModule, RouterLink, MatPaginator, MatTooltip, UserPopoverDirective, TimeAgoPipe],
})
export class ModHistoryComponent implements OnInit {
  private displayService = inject(DisplayComponentService);
  private moderacionService = inject(IHttpModeracionService);
  private title = inject(Title);

  private readonly destroyRef = inject(DestroyRef);

  readonly acciones = signal<AccionModeracion[]>([]);
  readonly entradas = signal<ModeracionLog[]>([]);
  readonly total = signal(0);
  readonly cargando = signal(false);

  public pageIndex = 0;
  public readonly pageSize = 25;
  public accion: number | null = null;
  public moderador = '';

  constructor() {
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
    this.moderacionService.getAccionesHistorial().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((a) => this.acciones.set(a));
    this.getHistorial();
  }

  getHistorial(): void {
    this.cargando.set(true);
    this.moderacionService
      .getHistorial(this.pageIndex + 1, this.pageSize, { accion: this.accion, moderador: this.moderador })
      .pipe(finalize(() => this.cargando.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe((pagina) => {
        this.entradas.set(pagina?.data ?? []);
        this.total.set(pagina?.pagination?.totalCount ?? 0);
      });
  }

  /** Cambió un filtro: vuelve a la primera página. */
  filtrar(): void {
    this.pageIndex = 0;
    this.getHistorial();
  }

  /** Clic en un moderador de la tabla: ver solo lo suyo. */
  verDe(moderador: string): void {
    this.moderador = moderador;
    this.filtrar();
  }

  limpiar(): void {
    this.accion = null;
    this.moderador = '';
    this.filtrar();
  }

  pageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.getHistorial();
  }

  esSistema(entrada: ModeracionLog): boolean {
    return !entrada.staffUserName || entrada.staffUserName === 'Sistema';
  }

  /** Rojo para lo que quita, verde para lo que devuelve, azul para cambios. */
  tono(accion: number): string {
    if ([3, 4, 7, 11, 13, 15, 16].includes(accion)) return 'mh-badge--quita';
    if ([5, 8, 12, 14, 17].includes(accion)) return 'mh-badge--devuelve';
    return 'mh-badge--cambia';
  }
}

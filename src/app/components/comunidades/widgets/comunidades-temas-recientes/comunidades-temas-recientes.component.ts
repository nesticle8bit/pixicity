import { CargandoComponent } from '../../../shared/cargando/cargando.component';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpComunidadesService } from 'src/app/services/interfaces/httpComunidades.interface';
import { RouterLink } from '@angular/router';
import { UserPopoverDirective } from '../../../../shared/directives/userPopover.directive';
import { UserAvatarComponent } from '../../../addons/user-avatar/user-avatar.component';
import { TimeAgoPipe } from '../../../../shared/pipes/timeAgo.pipe';

@Component({
    selector: 'app-comunidades-temas-recientes',
    templateUrl: './comunidades-temas-recientes.component.html',
    styleUrls: ['./comunidades-temas-recientes.component.scss'],
    imports: [CargandoComponent, 
        RouterLink,
        UserPopoverDirective,
        UserAvatarComponent,
        TimeAgoPipe,
    ],
})
export class ComunidadesTemasRecientesComponent implements OnInit {
  private comunidadesService = inject(IHttpComunidadesService);

  private readonly destroyRef = inject(DestroyRef);

  public temas: any[] = [];
  public loading: boolean = true;

  ngOnInit(): void {
    this.comunidadesService.getTemasRecientes(15).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (v) => { this.temas = v ?? []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}

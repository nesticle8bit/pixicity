import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserPopoverDirective } from '../../../shared/directives/userPopover.directive';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';

export interface ComentarioReciente {
  usuario: string;
  titulo: string;
  link: any[];
}

@Component({
    selector: 'app-recent-comments-list',
    // Solo depende de sus inputs: se vuelve a evaluar únicamente cuando cambian.
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './recent-comments-list.component.html',
    imports: [
        MatTooltip,
        NgClass,
        RouterLink,
        UserPopoverDirective,
        TruncatePipe,
    ],
})
export class RecentCommentsListComponent {
  readonly comentarios = input<ComentarioReciente[] | null>([]);
  readonly cargando = input<boolean>(false);
  readonly mensajeVacio = input<string>('Aún no se han realizado comentarios');
  readonly actualizar = output<void>();
}

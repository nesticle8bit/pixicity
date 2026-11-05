import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogEnviarMPComponent } from 'src/app/components/dialogs/dialog-enviar-mp/dialog-enviar-mp.component';

/** Panel derecho de /mensajes cuando no hay conversación abierta. */
@Component({
  selector: 'app-mensajes-vacio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wa-vacio">
      <span class="wa-vacio__icono" aria-hidden="true"><i class="ti ti-messages"></i></span>
      <h2>Tus mensajes</h2>
      <p>Elige una conversación de la lista o empieza una nueva.</p>
      <button type="button" class="wa-vacio__boton" (click)="nuevo()">
        <i class="ti ti-message-plus" aria-hidden="true"></i> Mensaje nuevo
      </button>
    </div>
  `,
  styles: `
    :host { display: flex; flex: 1; min-height: 0; }
    .wa-vacio {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 32px 16px;
      text-align: center;
      color: light-dark(#5d6b75, #aeaeae);
      background: light-dark(#f6f8fa, #202d3a);
    }
    .wa-vacio__icono {
      display: grid;
      place-items: center;
      width: 84px;
      height: 84px;
      border-radius: 50%;
      background: light-dark(#e6f1f7, #1d3c4d);
      color: light-dark(#006595, #1e99d3);
      font-size: 2.4rem;
    }
    h2 { margin: 6px 0 0; font-size: 1.15rem; font-weight: 800; color: light-dark(#26323a, #c7d2da); }
    p { margin: 0; font-size: .9rem; }
    .wa-vacio__boton {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
      min-height: 38px;
      padding: 0 16px;
      border: 0;
      border-radius: 999px;
      background: light-dark(#006595, #1e99d3);
      color: #fff;
      font-weight: 700;
      cursor: pointer;
    }
  `,
})
export class MensajesVacioComponent {
  private dialog = inject(MatDialog);

  nuevo(): void {
    this.dialog.open(DialogEnviarMPComponent, { width: '780px', disableClose: true, data: {} });
  }
}

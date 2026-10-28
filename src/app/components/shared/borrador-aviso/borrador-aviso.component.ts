import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

/** Aviso "tenés un borrador sin publicar" con Recuperar / Descartar (ver BorradorLocal). */
@Component({
  selector: 'app-borrador-aviso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatIcon],
  template: `
    <div class="borrador-aviso" role="status">
      <mat-icon aria-hidden="true">history</mat-icon>
      <span class="borrador-aviso__texto">
        Tenés un borrador sin publicar guardado el {{ fecha() | date: "d 'de' MMMM, HH:mm" }}.
      </span>
      <span class="borrador-aviso__acciones">
        <button type="button" class="btn btn-sm btn-primary" (click)="recuperar.emit()">Recuperar</button>
        <button type="button" class="btn btn-sm btn-link" (click)="descartar.emit()">Descartar</button>
      </span>
    </div>
  `,
  styles: [
    `
      .borrador-aviso {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 12px;
        padding: 10px 14px;
        margin-bottom: 12px;
        border: 1px solid light-dark(#b6d4fe, #2a4770);
        border-radius: 6px;
        background: light-dark(#e7f1ff, #1b2e48);
        color: light-dark(#084298, #88b3f2);
        font-size: 14px;
      }
      .borrador-aviso__texto {
        flex: 1 1 220px;
      }
      .borrador-aviso__acciones {
        display: flex;
        gap: 4px;
      }
    `,
  ],
})
export class BorradorAvisoComponent {
  readonly fecha = input.required<number>();
  readonly recuperar = output<void>();
  readonly descartar = output<void>();
}

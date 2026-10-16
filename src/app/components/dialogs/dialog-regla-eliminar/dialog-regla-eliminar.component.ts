import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { ReglaProtocolo } from 'src/app/models/admin/moderacion.model';

export interface ReglaEliminarData {
  reglas: ReglaProtocolo[];
  /** Motivo con el que lo denunciaron: ayuda a elegir. */
  motivoDenuncia?: string | null;
}

/** Valor de cierre: la regla elegida ('' = eliminar sin citar regla) o undefined si se cancela. */
export type ReglaEliminarResultado = string | undefined;

/**
 * Antes de eliminar contenido reportado, el moderador elige qué regla del protocolo incumple. El autor recibe esa
 * regla en su aviso, así sabe qué no repetir.
 */
@Component({
  selector: 'app-dialog-regla-eliminar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton],
  template: `
    <h2 mat-dialog-title>Eliminar contenido</h2>
    <mat-dialog-content>
      @if (data.motivoDenuncia) {
      <p class="dre-motivo">Denunciado por: <strong>{{ data.motivoDenuncia }}</strong></p>
      }
      <p class="dre-ayuda">¿Qué regla del protocolo incumple? Se la citamos al autor en su aviso.</p>
      <div class="dre-lista" role="radiogroup" aria-label="Regla incumplida">
        @for (r of data.reglas; track r.id) {
        <label class="dre-opcion" [class.is-elegida]="elegida() === r.id">
          <input type="radio" name="regla" [value]="r.id" [checked]="elegida() === r.id" (change)="elegida.set(r.id)" />
          <span>
            <strong>{{ r.titulo }}</strong>
            <small>{{ r.descripcion }}</small>
          </span>
        </label>
        }
        <label class="dre-opcion" [class.is-elegida]="elegida() === ''">
          <input type="radio" name="regla" value="" [checked]="elegida() === ''" (change)="elegida.set('')" />
          <span><strong>Sin citar una regla</strong><small>El autor recibe un aviso genérico.</small></span>
        </label>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" mat-button mat-dialog-close>Cancelar</button>
      <button type="button" mat-flat-button color="warn" [disabled]="elegida() === null" (click)="confirmar()">Eliminar</button>
    </mat-dialog-actions>
  `,
  styles: `
    .dre-motivo, .dre-ayuda { margin: 0 0 10px; }
    .dre-ayuda { color: #6b7782; }
    .dre-lista { display: flex; flex-direction: column; gap: 6px; }
    .dre-opcion {
      display: flex; align-items: flex-start; gap: 10px; padding: 8px 10px;
      border: 1px solid #e6eaee; border-radius: 8px; cursor: pointer;
      span { display: flex; flex-direction: column; }
      small { color: #6b7782; }
      input { margin-top: 4px; }
      &.is-elegida { border-color: #c62828; background: #fff5f5; }
    }
  `,
})
export class DialogReglaEliminarComponent {
  readonly data = inject<ReglaEliminarData>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<DialogReglaEliminarComponent, ReglaEliminarResultado>>(MatDialogRef);

  /** null = nada elegido todavía. */
  readonly elegida = signal<string | null>(null);

  confirmar(): void {
    const regla = this.elegida();
    if (regla !== null) this.ref.close(regla);
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

export interface MotivoDenunciaData {
  /** Qué se denuncia, para el título ("comentario", "shout"...). */
  que: string;
  motivos: readonly string[];
}

const OTRO = 'Otro';
const MAX_DETALLE = 300;

/** Pide el motivo de una denuncia. Cierra con el motivo (string) o sin valor si se cancela. */
@Component({
  selector: 'app-dialog-motivo-denuncia',
  templateUrl: './dialog-motivo-denuncia.component.html',
  styleUrls: ['./dialog-motivo-denuncia.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton],
})
export class DialogMotivoDenunciaComponent {
  readonly data = inject<MotivoDenunciaData>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<DialogMotivoDenunciaComponent, string>>(MatDialogRef);

  readonly maxDetalle = MAX_DETALLE;
  readonly motivos = this.data.motivos.includes(OTRO) ? this.data.motivos : [...this.data.motivos, OTRO];
  readonly elegido = signal<string | null>(null);
  readonly detalle = signal('');
  readonly esOtro = computed(() => this.elegido() === OTRO);
  readonly valido = computed(() => !!this.elegido() && (!this.esOtro() || this.detalle().trim().length > 0));

  enviar(): void {
    if (!this.valido()) return;
    const detalle = this.detalle().trim();
    // "Otro" manda el texto; con un motivo de la lista, el detalle (si lo hay) va como aclaración.
    const motivo = this.esOtro() ? detalle : detalle ? `${this.elegido()}: ${detalle}` : this.elegido()!;
    this.ref.close(motivo.slice(0, MAX_DETALLE + 40));
  }
}

import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VisorImagenComponent, VisorImagenData } from './visor-imagen.component';

/** Abre una imagen a pantalla completa (fondo negro, ✕ arriba a la derecha) sin salir de la plataforma. */
@Injectable({ providedIn: 'root' })
export class VisorImagenService {
  private readonly dialog = inject(MatDialog);

  abrir(url: string, alt?: string): MatDialogRef<VisorImagenComponent> {
    return this.dialog.open(VisorImagenComponent, {
      data: { url, alt } satisfies VisorImagenData,
      width: '100vw',
      height: '100dvh',
      maxWidth: '100vw',
      maxHeight: '100dvh',
      panelClass: 'visor-imagen-panel',
      backdropClass: 'visor-imagen-fondo',
      ariaLabel: alt || 'Imagen ampliada',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
    });
  }
}

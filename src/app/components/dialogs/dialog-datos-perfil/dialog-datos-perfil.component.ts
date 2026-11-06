import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { EstadoViewModel, PaisViewModel } from 'src/app/models/parametros/parametros-vm.model';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

/** Lo que un moderador puede corregir de una cuenta: género, país y región. Cada cambio queda en la bitácora. */
@Component({
  selector: 'app-dialog-datos-perfil',
  templateUrl: './dialog-datos-perfil.component.html',
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton],
})
export class DialogDatosPerfilComponent implements OnInit {
  private dialogRef = inject<MatDialogRef<DialogDatosPerfilComponent>>(MatDialogRef);
  data = inject<{ usuarioId: number; userName: string }>(MAT_DIALOG_DATA);
  private securityService = inject(IHttpSecurityService);
  private parametrosService = inject(IHttpParametrosService);
  private notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup = inject(FormBuilder).group({
    genero: [null, Validators.required],
    paisId: [null, Validators.required],
    estadoId: [null, Validators.required],
    razon: [''],
  });
  public cargando = true;
  public guardando = false;
  public paises: PaisViewModel[] = [];
  public estados: EstadoViewModel[] = [];
  public readonly generos = [
    { value: 1, label: 'Masculino' },
    { value: 2, label: 'Femenino' },
    { value: 3, label: 'Otros' },
  ];

  ngOnInit(): void {
    this.parametrosService.getPaisesDropdown().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((paises) => (this.paises = paises));
    this.securityService
      .getDatosPerfil(this.data.usuarioId)
      .pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (datos) => {
          this.formGroup.patchValue(datos);
          this.getEstados(datos.paisId);
        },
        // Cuenta de staff o inexistente: el aviso ya salió y no hay nada que editar.
        error: () => this.dialogRef.close(false),
      });
  }

  /** Otro país: la región anterior pertenece al país viejo, así que se vacía. */
  cambiarPais(): void {
    this.formGroup.patchValue({ estadoId: null });
    this.getEstados(Number(this.formGroup.value.paisId));
  }

  private getEstados(paisId: number | null | undefined): void {
    this.estados = [];
    if (!paisId) return;
    this.parametrosService.getEstadosByPais(paisId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((estados) => (this.estados = estados));
  }

  guardar(): void {
    if (this.formGroup.invalid) return;
    const valor = this.formGroup.value;
    this.guardando = true;
    this.securityService
      .editarDatosPerfil(this.data.usuarioId, {
        genero: Number(valor.genero),
        paisId: Number(valor.paisId),
        estadoId: Number(valor.estadoId),
        razon: valor.razon?.trim() || null,
      })
      .pipe(finalize(() => (this.guardando = false)), takeUntilDestroyed(this.destroyRef))
      .subscribe((cambio) => {
        if (cambio) this.notificationService.success(`Los datos de ${this.data.userName} se actualizaron`, 'Guardado');
        else this.notificationService.info('No había cambios para guardar', 'Datos');
        this.dialogRef.close(cambio);
      });
  }
}

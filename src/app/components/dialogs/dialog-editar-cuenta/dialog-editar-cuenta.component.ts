import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { finalize } from 'rxjs';
import { CuentaAdminModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { DropdownViewModel, EstadoViewModel, PaisViewModel } from 'src/app/models/parametros/parametros-vm.model';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpRangosService } from 'src/app/services/interfaces/httpRangos.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

/** Edición de una cuenta por un administrador (/administracion/usuarios). Cada cambio queda en el historial de moderación. */
@Component({
  selector: 'app-dialog-editar-cuenta',
  templateUrl: './dialog-editar-cuenta.component.html',
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton, MatSlideToggle],
})
export class DialogEditarCuentaComponent implements OnInit {
  private dialogRef = inject<MatDialogRef<DialogEditarCuentaComponent>>(MatDialogRef);
  data = inject<{ usuarioId: number; userName: string }>(MAT_DIALOG_DATA);
  private formBuilder = inject(FormBuilder);
  private securityService = inject(IHttpSecurityService);
  private parametrosService = inject(IHttpParametrosService);
  private rangosService = inject(IHttpRangosService);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public cargando = true;
  public guardando = false;
  public rangos: DropdownViewModel[] = [];
  public paises: PaisViewModel[] = [];
  public estados: EstadoViewModel[] = [];
  public dosFactoresActivo = false;
  public userNameOriginal = '';
  public readonly generos = [
    { value: 1, label: 'Masculino' },
    { value: 2, label: 'Femenino' },
    { value: 3, label: 'Otros' },
  ];

  constructor() {
    this.formGroup = this.formBuilder.group({
      id: [this.data.usuarioId],
      userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      emailConfirmado: [false],
      rangoId: [null, Validators.required],
      puntos: [0, [Validators.required, Validators.min(0)]],
      genero: [null, Validators.required],
      paisId: [null, Validators.required],
      estadoId: [null, Validators.required],
      fechaNacimiento: ['', Validators.pattern(/^\d{1,2}\/\d{1,2}\/\d{4}$/)],
      nuevaPassword: ['', [Validators.minLength(6), Validators.maxLength(100)]],
      quitarDosFactores: [false],
      razon: [''],
    });
  }

  ngOnInit(): void {
    this.rangosService.getRangosDropdown().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((rangos) => (this.rangos = rangos));
    this.parametrosService.getPaisesDropdown().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((paises) => (this.paises = paises));

    this.securityService
      .getCuentaAdmin(this.data.usuarioId)
      .pipe(finalize(() => (this.cargando = false)), takeUntilDestroyed(this.destroyRef))
      .subscribe((cuenta) => {
        this.formGroup.patchValue({ ...cuenta, fechaNacimiento: cuenta.fechaNacimiento ?? '' });
        this.dosFactoresActivo = !!cuenta.dosFactoresActivo;
        this.userNameOriginal = cuenta.userName;
        this.getEstados(cuenta.paisId);
      });
  }

  /** Otro país: el estado anterior pertenece al país viejo, así que se vacía. */
  cambiarPais(): void {
    this.formGroup.patchValue({ estadoId: null });
    this.getEstados(Number(this.formGroup.value.paisId));
  }

  private getEstados(paisId: number | null | undefined): void {
    this.estados = [];
    if (!paisId) return;
    this.parametrosService.getEstadosByPais(paisId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((estados) => (this.estados = estados));
  }

  /** Renombrar, cambiar la contraseña o quitar el 2FA cierra todas las sesiones de la cuenta. */
  get cierraSesiones(): boolean {
    const valor = this.formGroup.value;
    return (!!valor.userName && valor.userName.trim() !== this.userNameOriginal) || !!valor.nuevaPassword || !!valor.quitarDosFactores;
  }

  async guardar(): Promise<void> {
    if (this.formGroup.invalid) return;
    const valor = this.formGroup.value;
    const renombra = valor.userName.trim() !== this.userNameOriginal;
    if (renombra && !await this.notificationService.confirm(
      `¿Renombrar a ${this.userNameOriginal} como ${valor.userName.trim()}? La dirección de su perfil cambia y las menciones viejas (@${this.userNameOriginal}) dejan de enlazarlo.`
    )) return;

    const cuenta: CuentaAdminModel = {
      ...valor,
      userName: valor.userName.trim(),
      nuevaPassword: valor.nuevaPassword || null,
      rangoId: Number(valor.rangoId),
      puntos: Number(valor.puntos),
      genero: Number(valor.genero),
      paisId: Number(valor.paisId),
      estadoId: Number(valor.estadoId),
      fechaNacimiento: valor.fechaNacimiento?.trim() || null,
    };

    this.guardando = true;
    this.securityService
      .editarCuentaAdmin(cuenta)
      .pipe(finalize(() => (this.guardando = false)), takeUntilDestroyed(this.destroyRef))
      .subscribe((cambio) => {
        if (cambio) this.notificationService.success(`La cuenta de ${cuenta.userName} se actualizó`, 'Guardado');
        else this.notificationService.info('No había cambios para guardar', 'Cuenta');
        this.dialogRef.close(cambio);
      });
  }
}

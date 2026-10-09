import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { SelectAutocompleteComponent } from '../../shared/select-autocomplete/select-autocomplete.component';
import { SelectOptionDirective } from '../../shared/select-autocomplete/select-template.directives';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatButton } from '@angular/material/button';
import { IHttpRangosService } from '../../../services/interfaces/httpRangos.interface';

@Component({
    selector: 'app-dialog-add-update-rango',
    templateUrl: './dialog-add-update-rango.component.html',
    styleUrls: ['./dialog-add-update-rango.component.scss'],
    imports: [
        MatDialogTitle,
        FormsModule,
        ReactiveFormsModule,
        CdkScrollable,
        MatDialogContent,
        SelectAutocompleteComponent,
        SelectOptionDirective,
        MatRadioGroup,
        MatRadioButton,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class DialogAddUpdateRangoComponent implements OnInit {
  private dialogRef = inject<MatDialogRef<DialogAddUpdateRangoComponent>>(MatDialogRef);
  private rangosService = inject(IHttpRangosService);
  data = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public iconos: string[] = [
    'administrador.png',
    'amateur.png',
    'aprendiz.gif',
    'avanzado.gif',
    'baneado.gif',
    'desarrollador.gif',
    'diamond.gif',
    'elite.gif',
    'experto.gif',
    'flamer.gif',
    'fullUser.gif',
    'gold.gif',
    'greatUser.gif',
    'inexperto.gif',
    'iniciado.gif',
    'moderador.gif',
    'novato.png',
    'oficial.gif',
    'platinum.gif',
    'regular.gif',
    'rockstar.gif',
    'silver.gif',
  ];

  public formGroup: FormGroup;

  constructor() {
    this.formGroup = this.formBuilder.group({
      id: 0,
      nombre: ['', Validators.required],
      icono: ['', Validators.required],
      tipo: [undefined, Validators.required],
      color: ['', Validators.required],
      puntos: [undefined],
      puntosDiarios: [10, [Validators.required, Validators.min(0), Validators.max(10000)]]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.formGroup.patchValue({
        id: this.data.id,
        nombre: this.data.nombre,
        icono: this.data.icono,
        tipo: this.data.tipo.toString(),
        color: this.data.color,
        puntos: this.data.puntos,
        puntosDiarios: this.data.puntosDiarios ?? 10
      });
    }
  }

  saveRango(): void {
    if (this.formGroup.invalid) {
      return;
    }

    const rango = Object.assign({}, this.formGroup.value);
    rango.tipo = parseInt(rango.tipo);

    this.rangosService.addUpdateRango(rango).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: number) => {
      if (value) {
        this.notificationService.success('El rango se ha guardado correctamente', 'Guardado');

        this.dialogRef.close(value);
      }
    });
  }
}

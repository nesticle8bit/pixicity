import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { SelectAutocompleteComponent } from '../../shared/select-autocomplete/select-autocomplete.component';
import { SelectLabelDirective, SelectOptionDirective } from '../../shared/select-autocomplete/select-template.directives';
import { NgStyle, JsonPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { IHttpRangosService } from '../../../services/interfaces/httpRangos.interface';

@Component({
    selector: 'app-dialog-change-rangos',
    templateUrl: './dialog-change-rangos.component.html',
    styleUrls: ['./dialog-change-rangos.component.scss'],
    imports: [
        MatDialogTitle,
        FormsModule,
        ReactiveFormsModule,
        CdkScrollable,
        MatDialogContent,
        SelectAutocompleteComponent,
        SelectLabelDirective,
        NgStyle,
        SelectOptionDirective,
        MatDialogActions,
        MatButton,
        MatDialogClose,
        JsonPipe,
    ],
})
export class DialogChangeRangosComponent implements OnInit {
  dialogRef = inject<MatDialogRef<DialogChangeRangosComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private rangosService = inject(IHttpRangosService);
  private formBuilder = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public rangos: any[] = [];

  constructor() {
    this.formGroup = this.formBuilder.group({
      id: 0,
      usuarioId: 0,
      icono: '',
      color: '',
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.formGroup.patchValue({
        id: this.data.id,
        usuarioId: this.data.usuarioId,
        icono: this.data.icono,
        color: this.data.color,
      });
    }

    this.rangosService.getRangosDropdown().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      this.rangos = response;
    });
  }

  changeRango(): void {
    if (this.formGroup.invalid) {
      return;
    }

    const obj = Object.assign({}, this.formGroup.value);

    this.rangosService.changeRango(obj).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.notificationService.success('El rango del usuario ha sido actualizado correctamente', 'Actualizado');

        this.dialogRef.close(obj.rango);
      }
    });
  }
}

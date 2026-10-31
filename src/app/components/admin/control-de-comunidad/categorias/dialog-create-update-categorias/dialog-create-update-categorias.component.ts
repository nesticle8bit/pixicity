import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { SelectAutocompleteComponent } from '../../../../shared/select-autocomplete/select-autocomplete.component';
import { SelectLabelDirective, SelectOptionDirective } from '../../../../shared/select-autocomplete/select-template.directives';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButton } from '@angular/material/button';
import { ICONOS_CATEGORIAS } from 'src/app/shared/helpers/iconos-categorias';

@Component({
    selector: 'app-dialog-create-update-categorias',
    templateUrl: './dialog-create-update-categorias.component.html',
    styleUrls: ['./dialog-create-update-categorias.component.scss'],
    imports: [
        MatDialogTitle,
        FormsModule,
        ReactiveFormsModule,
        CdkScrollable,
        MatDialogContent,
        SelectAutocompleteComponent,
        SelectLabelDirective,
        SelectOptionDirective,
        MatSlideToggle,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class DialogCreateUpdateCategoriasComponent implements OnInit {
  dialogRef = inject<MatDialogRef<DialogCreateUpdateCategoriasComponent>>(MatDialogRef);
  private parametrosService = inject(IHttpParametrosService);
  data = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public iconos = ICONOS_CATEGORIAS;
  public formGroup: FormGroup;

  constructor() {
    this.formGroup = this.formBuilder.group({
      id: this.data?.id ? this.data?.id : 0,
      eliminado: this.data?.eliminado ? this.data?.eliminado : false,
      nombre: [this.data?.nombre, Validators.required],
      icono: [this.data?.icono, Validators.required],
      seo: [this.data?.seo, Validators.required],
    });
  }

  ngOnInit(): void {}

  saveCategoria(): void {
    if (this.formGroup.invalid) {
      return;
    }

    const categoria = Object.assign({}, this.formGroup.value);

    this.parametrosService
      .saveCategoria(categoria)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        if (response) {
          this.notificationService.success('La categoría se ha guardado correctamente', 'Guardado');

          this.dialogRef.close(true);
        }
      });
  }
}

import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { SelectAutocompleteComponent } from '../../../../shared/select-autocomplete/select-autocomplete.component';
import { RichEditorComponent } from '../../../../shared/rich-editor/rich-editor.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dialog-create-update-paginas',
    templateUrl: './dialog-create-update-paginas.component.html',
    styleUrls: ['./dialog-create-update-paginas.component.scss'],
    imports: [
        MatDialogTitle,
        FormsModule,
        ReactiveFormsModule,
        CdkScrollable,
        MatDialogContent,
        SelectAutocompleteComponent,
        RichEditorComponent,
        MatSlideToggle,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class DialogCreateUpdatePaginasComponent implements OnInit {
  dialogRef = inject<MatDialogRef<DialogCreateUpdatePaginasComponent>>(MatDialogRef);
  private webService = inject(IHttpWebService);
  data = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public tipos: any[] = ['routerLink', 'link'];
  public targets: any[] = ['_blank', '_parent', '_self', '_top'];

  constructor() {
    this.formGroup = this.formBuilder.group({
      id: 0,
      titulo: ['', Validators.required],
      slug: [''],
      tipo: [''],
      target: [''],
      contenido: [''],
      eliminado: false,
    });

  }

  ngOnInit(): void {
    if (this.data) {
      this.formGroup.patchValue({
        id: this.data.id,
        titulo: this.data.titulo,
        slug: this.data.slug,
        tipo: this.data.tipo,
        target: this.data.target,
        contenido: this.data.contenido,
        eliminado: this.data.eliminado ?? false,
      });
    }
  }

  savePagina(): void {
    const value = Object.assign({}, this.formGroup.value);
    this.webService.savePagina(value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        if (value.id) {
          this.notificationService.success('La página se ha actualizado correctamente', 'Actualizar');
        } else {
          this.notificationService.success('La página se ha guardado correctamente', 'Guardar');
        }

        this.dialogRef.close(response);
      }
    });
  }
}

import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { IHttpNoticiasService } from 'src/app/services/interfaces/httpNoticias.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dialog-create-update-noticias',
    templateUrl: './dialog-create-update-noticias.component.html',
    styleUrls: ['./dialog-create-update-noticias.component.scss'],
    imports: [
        MatDialogTitle,
        FormsModule,
        ReactiveFormsModule,
        CdkScrollable,
        MatDialogContent,
        MatSlideToggle,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class DialogCreateUpdateNoticiasComponent implements OnInit {
  dialogRef = inject<MatDialogRef<DialogCreateUpdateNoticiasComponent>>(MatDialogRef);
  private noticiasService = inject(IHttpNoticiasService);
  data = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;

  constructor() {
    this.formGroup = this.formBuilder.group({
      id: 0,
      contenido: ['', Validators.required],
      eliminado: false,
    });
  }

  ngOnInit(): void {
    if (this.data?.id) {
      this.formGroup.patchValue({
        id: this.data?.id,
        contenido: this.data?.contenido,
        eliminado: this.data?.eliminado,
      });
    }
  }

  saveNoticia(): void {
    if (this.formGroup.invalid) {
      return;
    }

    const value = Object.assign({}, this.formGroup.value);

    if (value.id) {
      this.noticiasService.updateNoticias(value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
        this.notificationService.success('La noticia se ha actualizado correctamente', 'Actualizar');
        this.dialogRef.close(true);
      });
    } else {
      this.noticiasService.saveNoticias(value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
        this.notificationService.success('La noticia se ha guardado correctamente', 'Guardar');
        this.dialogRef.close(true);
      });
    }
  }
}

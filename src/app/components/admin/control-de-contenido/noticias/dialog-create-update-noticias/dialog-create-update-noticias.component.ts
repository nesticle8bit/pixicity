import { Component, DestroyRef, inject, Inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup , Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IHttpNoticiasService } from 'src/app/services/interfaces/httpNoticias.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-dialog-create-update-noticias',
  templateUrl: './dialog-create-update-noticias.component.html',
  styleUrls: ['./dialog-create-update-noticias.component.scss'],
})
export class DialogCreateUpdateNoticiasComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DialogCreateUpdateNoticiasComponent>,
    private noticiasService: IHttpNoticiasService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService
  ) {
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
      this.noticiasService.updateNoticias(value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
        this.notificationService.success('La noticia se ha actualizado correctamente', 'Actualizar');
        this.dialogRef.close(true);
      });
    } else {
      this.noticiasService.saveNoticias(value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
        this.notificationService.success('La noticia se ha guardado correctamente', 'Guardar');
        this.dialogRef.close(true);
      });
    }
  }
}

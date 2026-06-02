import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, DestroyRef, inject, Inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-dialog-create-update-paginas',
  templateUrl: './dialog-create-update-paginas.component.html',
  styleUrls: ['./dialog-create-update-paginas.component.scss'],
})
export class DialogCreateUpdatePaginasComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public tipos: any[] = ['routerLink', 'link'];
  public targets: any[] = ['_blank', '_parent', '_self', '_top'];

  constructor(
    public dialogRef: MatDialogRef<DialogCreateUpdatePaginasComponent>,
    private webService: IHttpWebService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService
  ) {
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
    this.webService.savePagina(value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
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

import { Component, DestroyRef, inject, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-dialog-create-update-censuras',
  templateUrl: './dialog-create-update-censuras.component.html',
  styleUrls: ['./dialog-create-update-censuras.component.scss'],
})
export class DialogCreateUpdateCensurasComponent {
  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DialogCreateUpdateCensurasComponent>,
    private formBuilder: FormBuilder,
    private parametrosService: IHttpParametrosService,
    private notificationService: NotificationService
  ) {
    this.formGroup = this.formBuilder.group({
      id: this.data?.id ?? 0,
      palabra: [this.data?.palabra, Validators.required],
      reemplazo: [this.data?.reemplazo],
    });
  }

  saveCensura(): void {
    if (this.formGroup.invalid) {
      return;
    }

    const censura = Object.assign({}, this.formGroup.value);

    this.parametrosService.saveCensura(censura).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      if (response) {
        this.notificationService.success('La palabra censurada se ha guardado correctamente', 'Guardado');
        this.dialogRef.close(true);
      }
    });
  }
}

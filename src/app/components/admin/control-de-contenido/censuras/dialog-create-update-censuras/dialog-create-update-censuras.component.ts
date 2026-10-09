import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dialog-create-update-censuras',
    templateUrl: './dialog-create-update-censuras.component.html',
    styleUrls: ['./dialog-create-update-censuras.component.scss'],
    imports: [
        MatDialogTitle,
        FormsModule,
        ReactiveFormsModule,
        CdkScrollable,
        MatDialogContent,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class DialogCreateUpdateCensurasComponent {
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject<MatDialogRef<DialogCreateUpdateCensurasComponent>>(MatDialogRef);
  private formBuilder = inject(FormBuilder);
  private parametrosService = inject(IHttpParametrosService);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;

  constructor() {
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

    this.parametrosService.saveCensura(censura).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.notificationService.success('La palabra censurada se ha guardado correctamente', 'Guardado');
        this.dialogRef.close(true);
      }
    });
  }
}

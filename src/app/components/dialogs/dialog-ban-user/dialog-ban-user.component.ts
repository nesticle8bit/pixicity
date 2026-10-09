import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dialog-ban-user',
    templateUrl: './dialog-ban-user.component.html',
    styleUrls: ['./dialog-ban-user.component.scss'],
    imports: [
        MatDialogTitle,
        FormsModule,
        ReactiveFormsModule,
        CdkScrollable,
        MatDialogContent,
        MatFormField,
        MatLabel,
        MatInput,
        MatDatepickerInput,
        MatDatepickerToggle,
        MatSuffix,
        MatDatepicker,
        MatRadioGroup,
        MatRadioButton,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class DialogBanUserComponent implements OnInit {
  private dialogRef = inject<MatDialogRef<DialogBanUserComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(FormBuilder);
  private securityService = inject(IHttpSecurityService);
  private notificationService = inject(NotificationService);

  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;

  constructor() {
    this.formGroup = this.formBuilder.group({
      id: [this.data.usuarioId],
      baneo: true,
      razonBaneo: ['', Validators.required],
      tiempoBaneado: [undefined],
      baneadoPermanente: 'false',
    });
  }

  ngOnInit(): void {}

  banearUsuario(): void {
    const usuario = Object.assign({}, this.formGroup.value);
    usuario.baneadoPermanente = usuario.baneadoPermanente === 'true';

    this.securityService.banUser(usuario).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.notificationService.success('El usuario ha sido baneado correctamente y se le ha notificado', 'Baneado');

        this.dialogRef.close(response);
      }
    });
  }
}

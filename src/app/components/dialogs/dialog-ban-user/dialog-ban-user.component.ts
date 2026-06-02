import { Component, DestroyRef, inject, Inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup , Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-dialog-ban-user',
  templateUrl: './dialog-ban-user.component.html',
  styleUrls: ['./dialog-ban-user.component.scss'],
})
export class DialogBanUserComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<DialogBanUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private securityService: IHttpSecurityService,
    private notificationService: NotificationService
  ) {
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

    this.securityService.banUser(usuario).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      if (response) {
        this.notificationService.success('El usuario ha sido baneado correctamente y se le ha notificado', 'Baneado');

        this.dialogRef.close(response);
      }
    });
  }
}

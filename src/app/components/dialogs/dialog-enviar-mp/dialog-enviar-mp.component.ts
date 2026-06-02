import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, DestroyRef, inject, Inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  standalone: false,
  selector: 'app-dialog-enviar-mp',
  templateUrl: './dialog-enviar-mp.component.html',
  styleUrls: ['./dialog-enviar-mp.component.scss'],
})
export class DialogEnviarMPComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public userName: string = '';

  constructor(
    private dialogRef: MatDialogRef<DialogEnviarMPComponent>,
    private mensajeService: IHttpMensajesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.formGroup = this.formBuilder.group({
      aUserName: ['', Validators.required],
      asunto: ['', Validators.required],
      contenido: ['', Validators.required],
      // captcha: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.data?.userName) {
      this.formGroup.patchValue({
        aUserName: this.data.userName,
      });
    }
  }

  enviarMP(): void {
    if (this.formGroup.invalid) {
      return;
    }

    this.userName = '';
    const mp = Object.assign({}, this.formGroup.value);

    this.mensajeService.sendMensajePrivado(mp).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      if (response?.type === 'username') {
        this.userName = response.message;
        this.formGroup.patchValue({
          aUserName: '',
        });

        return;
      }

      this.notificationService.success(`El mensaje privado enviado a ${mp.aUserName} se ha entregado correctamente`, 'Enviado');

      this.dialogRef.close(true);
    });
  }

  captchaResponse(value: string): void {
    this.formGroup.patchValue({
      captcha: value,
    });
  }
}

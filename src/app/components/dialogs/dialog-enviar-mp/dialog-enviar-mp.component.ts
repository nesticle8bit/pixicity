import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { RichEditorComponent } from '../../shared/rich-editor/rich-editor.component';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dialog-enviar-mp',
    templateUrl: './dialog-enviar-mp.component.html',
    styleUrls: ['./dialog-enviar-mp.component.scss'],
    imports: [
        MatDialogTitle,
        FormsModule,
        ReactiveFormsModule,
        CdkScrollable,
        MatDialogContent,
        MatFormField,
        MatLabel,
        MatInput,
        MatError,
        RichEditorComponent,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class DialogEnviarMPComponent implements OnInit {
  private dialogRef = inject<MatDialogRef<DialogEnviarMPComponent>>(MatDialogRef);
  private mensajeService = inject(IHttpMensajesService);
  data = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(FormBuilder);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  private readonly destroyRef = inject(DestroyRef);

  public formGroup: FormGroup;
  public userName: string = '';

  constructor() {
    this.formGroup = this.formBuilder.group({
      aUserName: ['', Validators.required],
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
    const mp = { ...this.formGroup.value, asunto: '' };

    this.mensajeService.sendMensajePrivado(mp).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response?.type === 'username') {
        this.userName = response.message;
        this.formGroup.patchValue({
          aUserName: '',
        });

        return;
      }

      if (response?.type === 'error') {
        this.notificationService.error(response.message, 'Error');

        return;
      }

      this.notificationService.success(`El mensaje privado enviado a ${mp.aUserName} se ha entregado correctamente`, 'Enviado');

      this.dialogRef.close(true);
      // Abre el chat con el destinatario para seguir la conversación.
      this.router.navigate(['/mensajes/chat', mp.aUserName]);
    });
  }

  captchaResponse(value: string): void {
    this.formGroup.patchValue({
      captcha: value,
    });
  }
}

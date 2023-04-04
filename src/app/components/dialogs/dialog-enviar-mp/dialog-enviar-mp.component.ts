import { Editor, Toolbar } from 'ngx-editor';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dialog-enviar-mp',
  templateUrl: './dialog-enviar-mp.component.html',
  styleUrls: ['./dialog-enviar-mp.component.scss'],
})
export class DialogEnviarMPComponent implements OnInit {
  public formGroup: FormGroup;
  public editor: Editor;
  public toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    ['text_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
    ['horizontal_rule', 'format_clear'],
  ];
  public userName: string = '';

  constructor(
    private dialogRef: MatDialogRef<DialogEnviarMPComponent>,
    private mensajeService: IHttpMensajesService,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      aUserName: ['', Validators.required],
      asunto: ['', Validators.required],
      contenido: ['', Validators.required],
    });

    this.editor = new Editor({
      history: true,
      keyboardShortcuts: true,
    });
  }

  ngOnInit(): void {}

  enviarMP(): void {
    if (this.formGroup.invalid) {
      return;
    }

    this.userName = '';
    const mp = Object.assign({}, this.formGroup.value);

    this.mensajeService.sendMensajePrivado(mp).subscribe((response: any) => {
      if (response?.type === 'username') {
        this.userName = response.message;
        this.formGroup.patchValue({
          aUserName: '',
        });

        return;
      }

      Swal.fire({
        title: 'Enviado',
        text: `El mensaje privado enviado a ${mp.aUserName} se ha entregado correctamente`,
        icon: 'success',
        timer: 3000,
      });

      this.dialogRef.close(true);
    });
  }
}

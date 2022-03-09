import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Validators } from 'ngx-editor';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dialog-ban-user',
  templateUrl: './dialog-ban-user.component.html',
  styleUrls: ['./dialog-ban-user.component.scss'],
})
export class DialogBanUserComponent implements OnInit {
  public formGroup: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<DialogBanUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private securityService: IHttpSecurityService
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

    this.securityService.banUser(usuario).subscribe((response: any) => {
      if (response) {
        Swal.fire({
          title: 'Baneado',
          text: 'El usuario ha sido baneado correctamente y se le ha notificado',
          icon: 'success',
          timer: 3000,
        });

        this.dialogRef.close(response);
      }
    });
  }
}

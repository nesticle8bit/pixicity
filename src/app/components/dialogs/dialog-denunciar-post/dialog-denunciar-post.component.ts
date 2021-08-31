import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dialog-denunciar-post',
  templateUrl: './dialog-denunciar-post.component.html',
  styleUrls: ['./dialog-denunciar-post.component.scss']
})
export class DialogDenunciarPostComponent implements OnInit {
  public formGroup: FormGroup;
  public razonDenuncia: any[] = [{
    id: 1,
    label: 'Re-post'
  },{
    id: 2,
    label: 'Se hace Spam'
  },{
    id: 3,
    label: 'Tiene links muertos'
  },{
    id: 4,
    label: 'Es racista o irrespetuoso'
  },{
    id: 5,
    label: 'Contiene información personal'
  },{
    id: 6,
    label: 'El título esta en mayúscula'
  },{
    id: 7,
    label: 'Contiene pedofilia'
  },{
    id: 8,
    label: 'Es gore o asqueroso'
  },{
    id: 9,
    label: 'Está mal la fuente'
  },{
    id: 10,
    label: 'Post demasiado pobre / Crap'
  },{
    id: 11,
    label: 'Pixicity! no es un foro'
  },{
    id: 12,
    label: 'No cumple con el protocolo'
  },{
    id: 13,
    label: 'Otra razón (por favor especificar)'
  }];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private postService: IHttpPostsService,
    private dialogRef: MatDialogRef<DialogDenunciarPostComponent>
  ) {
    this.formGroup = this.formBuilder.group({
      postId: [this.data?.id, Validators.required],
      razonDenunciaId: [undefined, Validators.required],
      comentarios: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  enviarDenuncia(): void {
    const form = Object.assign({}, this.formGroup.value);

    this.postService.reportPost(form).subscribe((response: any) => {
      if(response) {
        Swal.fire({
          title: 'Denunciado',
          text: `El post ${this.data?.titulo} ha sido denunciado correctamente, el equipo de modaración revisará en la brevedad`,
          icon: 'success',
          timer: 3000
        }).then(() => {
          this.dialogRef.close(response);
        });
      }
    });
  }
}

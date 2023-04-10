import { IHttpWebService } from 'src/app/services/interfaces/httpWeb.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Editor, Toolbar, Validators } from 'ngx-editor';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dialog-create-update-paginas',
  templateUrl: './dialog-create-update-paginas.component.html',
  styleUrls: ['./dialog-create-update-paginas.component.scss'],
})
export class DialogCreateUpdatePaginasComponent implements OnInit, OnDestroy {
  public formGroup: FormGroup;
  public tipos: any[] = ['routerLink', 'link'];
  public targets: any[] = ['_blank', '_parent', '_self', '_top'];
  public editor: Editor;
  public toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
    ['horizontal_rule', 'format_clear'],
  ];

  constructor(
    public dialogRef: MatDialogRef<DialogCreateUpdatePaginasComponent>,
    private webService: IHttpWebService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder
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

    this.editor = new Editor({
      history: true,
      keyboardShortcuts: true,
    });
  }

  ngOnDestroy(): void {
    this.editor.destroy();
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
    this.webService.savePagina(value).subscribe((response: any) => {
      if (response) {
        if (value.id) {
          Swal.fire({
            title: 'Actualizar',
            text: 'La página se ha actualizado correctamente',
            icon: 'success',
            timer: 3000,
          });
        } else {
          Swal.fire({
            title: 'Guardar',
            text: 'La página se ha guardado correctamente',
            icon: 'success',
            timer: 3000,
          });
        }

        this.dialogRef.close(response);
      }
    });
  }
}

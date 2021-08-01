import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { DialogPrevisualizarPostComponent } from 'src/app/components/dialogs/dialog-previsualizar-post/dialog-previsualizar-post.component';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { Editor, Toolbar } from 'ngx-editor';

@Component({
  selector: 'app-posts-create',
  templateUrl: './posts-create.component.html',
  styleUrls: ['./posts-create.component.scss']
})
export class PostsCreateComponent implements OnInit, OnDestroy {
  public editor: Editor;
  public formGroup: FormGroup;
  public categorias: any[] = [];
  public etiquetas: any = [];

  public toolbar: Toolbar = [
    ["bold", "italic"],
    ["underline", "strike"],
    ["blockquote"],
    ["ordered_list", "bullet_list"],
    [{ heading: ["h1", "h2", "h3", "h4", "h5", "h6"] }],
    ["link", "image"],
    ["text_color"],
    ["align_left", "align_center", "align_right", "align_justify"]
  ];

  constructor(
    private parametrosService: IHttpParametrosService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      titulo: ['', Validators.required],
      contenido: ['', Validators.required],
      categoria: [undefined, Validators.required],
      etiquetas: [[], Validators.required],
      quienPuedeComentar: [0, Validators.required],
      esPrivado: [false, Validators.required]
    });

    this.editor = new Editor();
  }

  ngOnInit(): void {
    this.getCategorias();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  getCategorias(): void {
    this.parametrosService.getCategoriasDropdown().subscribe((value: any) => {
      this.categorias = value;
    });
  }

  addEtiqueta(event: MatChipInputEvent) {
    if (event.value) {
      this.etiquetas.add(event.value);
      event.chipInput!.clear();
    }
  }

  removeEtiqueta(etiqueta: string) {
    this.etiquetas.delete(etiqueta);
  }

  previsualizar(): void {
    this.dialog.open(DialogPrevisualizarPostComponent, {
      width: '850px',
      data: this.formGroup.value?.contenido,
        disableClose: true
    });
  }
}

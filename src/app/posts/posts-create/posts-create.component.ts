import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { DialogPrevisualizarPostComponent } from 'src/app/components/dialogs/dialog-previsualizar-post/dialog-previsualizar-post.component';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { Editor, Toolbar } from 'ngx-editor';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

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
  public quienPuedeComentar: any = [
    {
      label: 'Todos pueden comentar',
      value: 0
    },
    {
      label: 'Nadie puede comentar',
      value: 1
    }];

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
    private formBuilder: FormBuilder,
    private postService: IHttpPostsService,
    private router: Router
  ) {
    this.formGroup = this.formBuilder.group({
      titulo: ['', Validators.required],
      contenido: ['', Validators.required],
      categoriaId: [undefined, Validators.required],
      etiquetas: [[], Validators.required],
      quienPuedeComentar: [0, Validators.required],
      esPrivado: [false, Validators.required],
      smileys: [false, Validators.required]
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

  publicarPost(): void {
    const post = Object.assign({}, this.formGroup.value);
    post.etiquetas = post.etiquetas.join();

    this.postService.savePost(post).subscribe((response: any) => {
      if(response) {
        Swal.fire({
          title: 'Creado',
          text: 'Se ha creado recientemente tu post 👋🏼',
          icon: 'success',
          timer: 3000
        }).then(() => {
          this.router.navigate(['']);
        });
      }
    });
  }
}

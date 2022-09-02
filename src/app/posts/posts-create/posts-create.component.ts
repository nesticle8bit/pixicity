import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { DialogPrevisualizarPostComponent } from 'src/app/components/dialogs/dialog-previsualizar-post/dialog-previsualizar-post.component';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { Editor, Toolbar } from 'ngx-editor';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';

@Component({
  selector: 'app-posts-create',
  templateUrl: './posts-create.component.html',
  styleUrls: ['./posts-create.component.scss'],
})
export class PostsCreateComponent implements OnInit, OnDestroy {
  public editor: Editor;
  public formGroup: FormGroup;
  public categorias: any[] = [];
  public etiquetas: any = [];
  public quienPuedeComentar: any = [
    {
      label: 'Todos pueden comentar',
      value: false,
    },
    {
      label: 'Nadie puede comentar',
      value: true,
    },
  ];
  public currentUser: JwtUserModel;
  public postId: number = 0;
  public esBorrador: boolean = false;
  public today = new Date();

  public toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  constructor(
    private parametrosService: IHttpParametrosService,
    private displayService: DisplayComponentService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private postService: IHttpPostsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private securityService: IHttpSecurityService
  ) {
    this.currentUser = this.securityService.getCurrentUser();

    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: ''
    });

    this.formGroup = this.formBuilder.group({
      id: 0,
      titulo: ['', [Validators.required, Validators.maxLength(80)]],
      contenido: ['', Validators.required],
      categoriaId: [undefined, Validators.required],
      etiquetas: [[], Validators.required],
      esPrivado: false,
      sinComentarios: false,
      smileys: false,
      esBorrador: false
    });

    this.activatedRoute.paramMap.subscribe((value: any) => {
      this.postId = +value.get('id');

      if (!this.postId) {
        return;
      }

      this.postService.getPostById(this.postId).subscribe((response: any) => {
        if (
          this.currentUser.usuario.rango !== 'Administrador' &&
          this.currentUser.usuario.rango !== 'Moderador' &&
          this.currentUser.usuario.userName != response.post.usuario.userName
        ) {
          this.router.navigate(['']);

          Swal.fire({
            title: 'Actualizar Post',
            text: 'Oye cerebrito!, no puedes actualizar el post de otra persona 😥',
            icon: 'warning',
          });
        }

        this.setPostOnEdit(response.post);
      });
    });

    this.editor = new Editor();
  }

  ngOnInit(): void {
    this.getCategorias();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  setPostOnEdit(post: any): void {
    let etiquetas = post.etiquetas.split(',');
    etiquetas = etiquetas.map((tag: string) => {
      return tag.trim();
    });

    this.formGroup.patchValue({
      id: this.postId,
      titulo: post.titulo,
      contenido: post.contenido,
      categoriaId: post.categoria.id,
      etiquetas: etiquetas,
      smileys: post.smileys,
      esPrivado: post.esPrivado,
      sinComentarios: post.sinComentarios,
      esBorrador: post.esBorrador
    });
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
      disableClose: true,
    });
  }

  publicarPost(): void {
    const post = Object.assign({}, this.formGroup.value);
    post.etiquetas = post.etiquetas.join();
    post.esBorrador = false;

    const categoria = this.categorias.filter(
      (categoria: any) => categoria.id === post.categoriaId
    )[0];

    if (!this.postId) {
      this.postService.savePost(post).subscribe((response: any) => {
        if (response) {
          Swal.fire({
            title: 'Creado',
            text: 'Se ha creado recientemente tu post 👋🏼',
            icon: 'success',
            timer: 3000,
          }).then(() => {
            this.router.navigate(['']);
          });
        }
      });

      return;
    }

    this.postService.updatePost(post).subscribe((response: any) => {
      if (response) {
        Swal.fire({
          title: 'Actualizado',
          text: 'Se ha actualizado recientemente tu post 👋🏼, ahora lo podrás visualizar con los cambios realizados',
          icon: 'success',
        }).then(() => {
          this.router.navigate([
            `/posts/${categoria.nombre.toLowerCase()}/${post.id}/${
              post.titulo
            }`,
          ]);
        });
      }
    });
  }

  guardarBorrador(): void {
    if (this.formGroup.invalid) {
      return;
    }

    const post = Object.assign({}, this.formGroup.value);
    post.etiquetas = post.etiquetas.join();
    post.esBorrador = this.esBorrador = true;

    if (!this.postId) {
      this.postService.savePost(post).subscribe((response: any) => {
        if (response) {
          this.postId = response;
          this.today = new Date();

          this.formGroup.patchValue({
            id: response
          });
        }
      });

      return;
    }

    this.postService.updatePost(post).subscribe((response: any) => {
      if (response) {
        this.today = new Date();

        this.formGroup.patchValue({
          id: response
        });
      }
    });
  }
}

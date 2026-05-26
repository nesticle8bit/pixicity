import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { DialogPrevisualizarPostComponent } from 'src/app/components/dialogs/dialog-previsualizar-post/dialog-previsualizar-post.component';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpPostsService } from 'src/app/services/interfaces/httpPosts.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { DisplayComponentService } from 'src/app/services/shared/displayComponents.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Title } from '@angular/platform-browser';
import { PostsGeneratorComponent } from '../posts-generator/posts-generator.component';

@Component({
  standalone: false,
  selector: 'app-posts-create',
  templateUrl: './posts-create.component.html',
  styleUrls: ['./posts-create.component.scss'],
})
export class PostsCreateComponent implements OnInit, OnDestroy {
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
  public separatorKeysCodes = [ENTER, COMMA] as const;
  public relatedPosts: any[] = [];

  constructor(
    private parametrosService: IHttpParametrosService,
    private displayService: DisplayComponentService,
    private securityService: IHttpSecurityService,
    private postService: IHttpPostsService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private title: Title,
    private notificationService: NotificationService
  ) {
    this.currentUser = this.securityService.getCurrentUser();

    this.displayService.setDisplay({
      mainMenu: true,
      footer: true,
      searchFooter: true,
      submenu: true,
      background: '',
    });

    this.formGroup = this.formBuilder.group({
      id: 0,
      titulo: ['', [Validators.required, Validators.maxLength(80)]],
      contenido: ['', Validators.required],
      categoriaId: [undefined, Validators.required],
      etiquetas: [],
      esPrivado: false,
      sinComentarios: false,
      smileys: false,
      esBorrador: false,
    });

    this.activatedRoute.paramMap.subscribe((value: any) => {
      this.postId = +value.get('id');

      if (!this.postId) {
        this.title.setTitle(
          `Crear post | Taringas - Inteligencia colectiva | Comunidad para Compartir Información`
        );
        return;
      }

      this.title.setTitle(
        `Actualizar post | Taringas - Inteligencia colectiva | Comunidad para Compartir Información`
      );
      this.postService.getPostById(this.postId).subscribe((response: any) => {
        if (
          this.currentUser.usuario.rango !== 'Administrador' &&
          this.currentUser.usuario.rango !== 'Moderador' &&
          this.currentUser.usuario.userName != response.post.usuario.userName
        ) {
          this.router.navigate(['']);

          this.notificationService.warning('Oye cerebrito!, no puedes actualizar el post de otra persona 😥', 'Actualizar Post');
        }

        this.setPostOnEdit(response.post);
      });
    });

  }

  ngOnInit(): void {
    this.getCategorias();
  }

  ngOnDestroy(): void {}

  setPostOnEdit(post: any): void {
    this.etiquetas = post.etiquetas
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0);

    this.formGroup.patchValue({
      id: this.postId,
      titulo: post.titulo,
      contenido: post.contenido,
      categoriaId: post.categoria.id,
      etiquetas: this.etiquetas,
      smileys: post.smileys,
      esPrivado: post.esPrivado,
      sinComentarios: post.sinComentarios,
      esBorrador: post.esBorrador,
    });
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.etiquetas.push(value);
      this.formGroup.patchValue({ etiquetas: this.etiquetas });
    }
    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    const index = this.etiquetas.indexOf(tag);
    if (index >= 0) {
      this.etiquetas.splice(index, 1);
      this.formGroup.patchValue({ etiquetas: this.etiquetas });
    }
  }

  getCategorias(): void {
    this.parametrosService.getCategoriasDropdown().subscribe((value: any) => {
      this.categorias = value;
    });
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
    post.etiquetas = this.etiquetas.join();
    post.esBorrador = false;

    const categoria = this.categorias.filter(
      (categoria: any) => categoria.id === post.categoriaId
    )[0];

    if (!this.postId) {
      this.postService.savePost(post).subscribe((response: any) => {
        if (response) {
          this.notificationService.success('Se ha creado recientemente tu post 👋🏼', 'Creado');
          this.router.navigate(['']);
        }
      });
    } else {
      this.postService.updatePost(post).subscribe((response: any) => {
        if (response) {
          this.notificationService.success('Se ha actualizado recientemente tu post 👋🏼, ahora lo podrás visualizar con los cambios realizados', 'Actualizado');
          this.router.navigate([
            `/posts/${categoria.nombre.toLowerCase()}/${post.id}/${post.titulo}`,
          ]);
        }
      });
    }
  }

  guardarBorrador(): void {
    if (this.formGroup.invalid) {
      return;
    }

    const post = Object.assign({}, this.formGroup.value);
    post.etiquetas = this.etiquetas.join();
    post.esBorrador = this.esBorrador = true;

    if (!this.postId) {
      this.postService.savePost(post).subscribe((response: any) => {
        if (response) {
          this.postId = response;
          this.today = new Date();

          this.formGroup.patchValue({
            id: response,
            esBorrador: true,
          });
        }
      });
    } else {
      this.postService.updatePost(post).subscribe((response: any) => {
        if (response) {
          this.today = new Date();

          this.formGroup.patchValue({
            id: response,
            esBorrador: true,
          });
        }
      });
    }
  }

  postGenerator(): void {
    const dialogRef = this.dialog.open(PostsGeneratorComponent, {
      width: '980px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((response: any) => {
      if (response) {
        this.formGroup.patchValue({
          contenido: response,
        });
      }
    });
  }

  getPostsRelatedByTitle(): void {
    const titulo = this.formGroup.value.titulo;

    if (!titulo || titulo.length < 5) {
      this.relatedPosts = [];
      return;
    }

    this.postService
      .getPostsRelatedByTitle(titulo)
      .subscribe((response: any) => {
        this.relatedPosts = response || [];
      });
  }
}

import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
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

// Palabras vacías (es/en) que no sirven como etiqueta.
const STOP_WORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'lo', 'al', 'del', 'de', 'y', 'e', 'o', 'u', 'ni', 'que',
  'en', 'con', 'sin', 'por', 'para', 'pero', 'sino', 'como', 'cómo', 'cuando', 'cuándo', 'donde', 'dónde', 'qué',
  'quién', 'cuál', 'este', 'esta', 'esto', 'estos', 'estas', 'ese', 'esa', 'eso', 'esos', 'esas', 'aquel', 'aquella',
  'mi', 'tu', 'su', 'sus', 'mis', 'tus', 'nos', 'les', 'ser', 'son', 'era', 'fue', 'hay', 'han', 'has', 'hasta',
  'desde', 'entre', 'sobre', 'tras', 'ante', 'bajo', 'muy', 'más', 'mas', 'menos', 'ya', 'sí', 'no', 'todo', 'todos',
  'toda', 'todas', 'cada', 'otro', 'otra', 'otros', 'otras', 'algo', 'tan', 'tanto', 'así', 'aquí', 'allí', 'hoy',
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'are', 'was', 'you', 'your', 'how', 'what', 'why',
]);

const MAX_AUTO_TAGS = 6;

@Component({
  standalone: false,
  selector: 'app-posts-create',
  templateUrl: './posts-create.component.html',
  styleUrls: ['./posts-create.component.scss'],
})
export class PostsCreateComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);

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

  // Etiquetas generadas a partir del título (se reemplazan si el título cambia; las manuales no se tocan).
  public autoTags = new Set<string>();
  private lastAutoTitulo = '';

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

    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: any) => {
      this.postId = +value.get('id');

      if (!this.postId) {
        this.title.setTitle(
          `Crear post | Taringa - Inteligencia colectiva | Comunidad para Compartir Información`
        );
        return;
      }

      this.title.setTitle(
        `Actualizar post | Taringa - Inteligencia colectiva | Comunidad para Compartir Información`
      );
      this.postService.getPostById(this.postId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
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
    this.watchRelatedPosts();
  }

  ngOnDestroy(): void {}

  // - Progreso -
  get hasContenido(): boolean {
    const html: string = this.formGroup.value?.contenido || '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0 || /<(img|iframe|video)/i.test(html);
  }

  get pasos(): { label: string; ok: boolean }[] {
    return [
      { label: 'Título', ok: (this.formGroup.value?.titulo || '').trim().length >= 3 },
      { label: 'Categoría', ok: !!this.formGroup.value?.categoriaId },
      { label: 'Contenido', ok: this.hasContenido },
      { label: 'Al menos 4 etiquetas', ok: this.etiquetas.length >= 4 },
    ];
  }

  get progreso(): number {
    const pasos = this.pasos;
    return Math.round((pasos.filter((p) => p.ok).length / pasos.length) * 100);
  }

  // - Etiquetas automáticas -
  /** Al terminar de escribir el título, sugiere etiquetas a partir de sus palabras clave. */
  onTituloBlur(): void {
    const titulo = (this.formGroup.value?.titulo || '').trim();

    // Un post ya publicado conserva sus etiquetas: sólo se sugiere en posts nuevos, borradores o sin etiquetas.
    const puedeSugerir = !this.postId || this.formGroup.value?.esBorrador || this.etiquetas.length === 0;

    if (!puedeSugerir || titulo.length < 3 || titulo === this.lastAutoTitulo) {
      return;
    }

    this.aplicarEtiquetasAutomaticas(titulo);
  }

  /** Botón "Sugerir del título": fuerza la sugerencia aunque el título no haya cambiado. */
  regenerarEtiquetas(): void {
    const titulo = (this.formGroup.value?.titulo || '').trim();

    if (titulo.length >= 3) {
      this.aplicarEtiquetasAutomaticas(titulo);
    }
  }

  private aplicarEtiquetasAutomaticas(titulo: string): void {
    this.lastAutoTitulo = titulo;

    // Quita las automáticas anteriores (si siguen ahí) y conserva las manuales.
    this.etiquetas = this.etiquetas.filter((tag: string) => !this.autoTags.has(tag));
    this.autoTags.clear();

    const existentes = new Set(this.etiquetas.map((tag: string) => tag.toLowerCase()));

    for (const tag of this.extraerPalabrasClave(titulo)) {
      if (!existentes.has(tag)) {
        this.etiquetas.push(tag);
        this.autoTags.add(tag);
      }
    }

    this.formGroup.patchValue({ etiquetas: this.etiquetas });
  }

  /** Palabras clave del título: sin stop-words, únicas, las más largas (más específicas) hasta el máximo. */
  private extraerPalabrasClave(titulo: string): string[] {
    const palabras = (titulo.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter(
      (palabra) => palabra.length >= 3 && !STOP_WORDS.has(palabra)
    );

    const unicas = Array.from(new Set(palabras));

    return unicas
      .map((palabra, orden) => ({ palabra, orden }))
      .sort((a, b) => b.palabra.length - a.palabra.length)
      .slice(0, MAX_AUTO_TAGS)
      .sort((a, b) => a.orden - b.orden)
      .map((x) => x.palabra);
  }

  setPostOnEdit(post: any): void {
    // No pisar con sugerencias automáticas las etiquetas ya guardadas del post.
    this.lastAutoTitulo = (post.titulo || '').trim();

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
    if (value && !this.etiquetas.some((tag: string) => tag.toLowerCase() === value.toLowerCase())) {
      this.etiquetas.push(value);
      this.formGroup.patchValue({ etiquetas: this.etiquetas });
    }
    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    const index = this.etiquetas.indexOf(tag);
    if (index >= 0) {
      this.etiquetas.splice(index, 1);
      this.autoTags.delete(tag);
      this.formGroup.patchValue({ etiquetas: this.etiquetas });
    }
  }

  getCategorias(): void {
    this.parametrosService.getCategoriasDropdown().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: any) => {
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
      this.postService.savePost(post).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
        if (response) {
          this.notificationService.success('Se ha creado recientemente tu post 👋🏼', 'Creado');
          this.router.navigate(['']);
        }
      });
    } else {
      this.postService.updatePost(post).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
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
      this.postService.savePost(post).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
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
      this.postService.updatePost(post).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
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
      maxWidth: '94vw',
      disableClose: true,
      panelClass: 'pg-dialog',
      autoFocus: false,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: any) => {
      if (response) {
        this.formGroup.patchValue({
          contenido: response,
        });
      }
    });
  }

  private watchRelatedPosts(): void {
    this.formGroup
      .get('titulo')!
      .valueChanges.pipe(
        map((value: string) => (value || '').trim()),
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((titulo: string) =>
          titulo.length >= 3
            ? this.postService.getPostsRelatedByTitle(titulo)
            : of([])
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response: any) => {
        this.relatedPosts = response || [];
      });
  }
}

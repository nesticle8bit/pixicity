import { AvisoProtocoloComponent } from '../../aviso-protocolo/aviso-protocolo.component';
import { Component, DestroyRef, ElementRef, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { Tendencia } from 'src/app/models/mi/mi-vm.model';
import { IHttpMiService } from 'src/app/services/interfaces/httpMi.interface';
import { ShoutViewModel } from 'src/app/models/perfil/shout-vm.model';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { EmojisPopoverService } from '../../../bottom-sheets/bottom-sheets-emojis/emojis-popover.service';
import { ShoutMediaComponent } from '../../../addons/shout-media/shout-media.component';
import { UserAvatarComponent } from '../../../addons/user-avatar/user-avatar.component';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { comprimirImagen } from 'src/app/shared/helpers/comprimir-imagen';

/** Clasificación en cliente para la vista previa (el backend la recalcula al guardar). */
export function detectarTipoShout(url: string): string {
  if (!url) return 'Texto';
  const u = url.toLowerCase();
  if (!/^https?:\/\//.test(u)) return 'Texto';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'Video';
  if (u.includes('spotify.com')) return 'Spotify';
  if (/\.(jpg|jpeg|png|gif|webp|bmp|avif)(\?.*)?$/.test(u)) return 'Foto';
  return 'Enlace';
}

/** "#ro" justo antes del cursor (mismo criterio de caracteres que HashtagHelper del API). */
const TAG_EN_CURSOR = /(?:^|[^\p{L}\p{N}_&])#([\p{L}\p{N}_]{1,40})$/u;

/** Tamaño máximo que se acepta elegir (antes de comprimir). */
const MAX_BYTES_ORIGINAL = 20 * 1024 * 1024;

/** "¿Qué estás pensando?": publica un shout (texto, emojis y un enlace o una imagen) en el muro de `perfilId`. */
@Component({
  selector: 'app-shout-composer',
  templateUrl: './shout-composer.component.html',
  styleUrls: ['./shout-composer.component.scss'],
  imports: [ReactiveFormsModule, UserAvatarComponent, ShoutMediaComponent, AvisoProtocoloComponent],
})
export class ShoutComposerComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly perfilService = inject(IHttpPerfilService);
  private readonly emojis = inject(EmojisPopoverService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly miService = inject(IHttpMiService);
  private readonly notificaciones = inject(NotificationService);

  /** Muro donde se publica (el propio en /mi). */
  readonly perfilId = input.required<number>();
  readonly publicado = output<void>();

  readonly currentUser = inject(IHttpSecurityService).getCurrentUser();
  readonly enviando = signal(false);
  /** Subiendo la imagen elegida (se comprime antes en el navegador). */
  readonly subiendoImagen = signal(false);
  /** La URL actual es una imagen que subí desde el composer (no un enlace pegado). */
  readonly imagenSubida = signal(false);
  emojisAbierto = false;
  readonly detectarTipo = detectarTipoShout;

  private readonly campoShout = viewChild<ElementRef<HTMLTextAreaElement>>('campoShout');

  readonly formGroup = this.formBuilder.nonNullable.group({
    comentario: ['', Validators.required],
    perfilId: [0, Validators.required],
    tipo: 1,
    url: [''],
  });

  /** Autocompletado de #hashtags: sugerencias para el tag que se está escribiendo. */
  readonly hashtags = signal<Tendencia[]>([]);
  readonly hashtagActivo = signal(0);
  private readonly buscarTag = new Subject<string | null>();

  constructor() {
    effect(() => this.formGroup.patchValue({ perfilId: this.perfilId() }));

    this.buscarTag
      .pipe(
        debounceTime(180),
        distinctUntilChanged(),
        switchMap((prefijo) => (prefijo ? this.miService.buscarHashtags(prefijo, 6) : of([]))),
        takeUntilDestroyed(),
      )
      .subscribe((lista) => {
        // Si el usuario ya escribió el tag completo y es la única opción, no hace falta sugerirlo.
        const actual = this.tagEnCursor()?.toLowerCase();
        this.hashtags.set(lista.length === 1 && lista[0].tag === actual ? [] : lista);
        this.hashtagActivo.set(0);
      });
  }

  private tagEnCursor(): string | null {
    const campo = this.campoShout()?.nativeElement;
    if (!campo || campo.selectionStart !== campo.selectionEnd) return null;
    return campo.value.slice(0, campo.selectionStart).match(TAG_EN_CURSOR)?.[1] ?? null;
  }

  alEscribir(): void {
    this.buscarTag.next(this.tagEnCursor()?.toLowerCase() ?? null);
  }

  teclaCampo(e: KeyboardEvent): void {
    const lista = this.hashtags();
    if (!lista.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const paso = e.key === 'ArrowDown' ? 1 : -1;
      this.hashtagActivo.update((i) => (i + paso + lista.length) % lista.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      this.elegirHashtag(lista[this.hashtagActivo()].tag);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.cerrarHashtags();
    }
  }

  cerrarHashtags(): void {
    this.hashtags.set([]);
    this.buscarTag.next(null);
  }

  /** Reemplaza el "#ro" que se está escribiendo por "#rock " y deja el cursor después. */
  elegirHashtag(tag: string): void {
    const campo = this.campoShout()?.nativeElement;
    const parcial = this.tagEnCursor();
    if (!campo || parcial == null) return this.cerrarHashtags();
    const cursor = campo.selectionStart;
    const inicio = cursor - parcial.length;
    const despues = campo.value.slice(cursor);
    const nuevo = campo.value.slice(0, inicio) + tag + (despues.startsWith(' ') ? '' : ' ') + despues;
    this.formGroup.patchValue({ comentario: nuevo });
    campo.value = nuevo;
    const pos = inicio + tag.length + 1;
    campo.setSelectionRange(pos, pos);
    campo.focus();
    this.cerrarHashtags();
  }

  async abrirEmojis(boton: HTMLElement): Promise<void> {
    await this.emojis.alternar(boton, {
      alElegir: (emoji) => this.insertarEmoji(emoji),
      noTapar: this.campoShout()?.nativeElement,
      alCerrar: (porTeclado) => {
        this.emojisAbierto = false;
        if (porTeclado) this.campoShout()?.nativeElement.focus();
      },
    });
    this.emojisAbierto = this.emojis.estaAbiertoPara(boton);
  }

  /** Inserta en el cursor del textarea (o reemplaza la selección) y deja el cursor después del emoji. */
  private insertarEmoji(emoji: string): void {
    const campo = this.campoShout()?.nativeElement;
    const texto = this.formGroup.value.comentario ?? '';
    const inicio = campo?.selectionStart ?? texto.length;
    const fin = campo?.selectionEnd ?? texto.length;
    const nuevo = texto.slice(0, inicio) + emoji + texto.slice(fin);
    this.formGroup.patchValue({ comentario: nuevo });
    if (campo) {
      campo.value = nuevo;
      campo.setSelectionRange(inicio + emoji.length, inicio + emoji.length);
    }
  }

  /** Elegir imagen: se comprime (1080 px, WebP) y se sube; la URL queda en el shout como si fuera un enlace a imagen. */
  async elegirImagen(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) await this.subirImagen(file);
  }

  /** Pegar una captura en el texto la sube como imagen del shout. */
  async alPegar(event: ClipboardEvent): Promise<void> {
    const file = [...(event.clipboardData?.files ?? [])].find((f) => f.type.startsWith('image/'));
    if (!file) return;
    event.preventDefault();
    await this.subirImagen(file);
  }

  private async subirImagen(file: File): Promise<void> {
    if (this.subiendoImagen()) return;
    if (!file.type.startsWith('image/')) {
      this.notificaciones.error('Solo puedes subir imágenes', 'Archivo no válido');
      return;
    }
    if (file.size > MAX_BYTES_ORIGINAL) {
      this.notificaciones.error('La imagen es demasiado grande (máximo 20 MB)', 'Imagen');
      return;
    }

    this.subiendoImagen.set(true);
    const comprimida = await comprimirImagen(file);
    this.perfilService
      .subirImagenShout(comprimida)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (url) => {
          this.subiendoImagen.set(false);
          if (!url) return;
          this.formGroup.patchValue({ url });
          this.imagenSubida.set(true);
        },
        error: () => this.subiendoImagen.set(false),
      });
  }

  quitarMedia(): void {
    this.formGroup.patchValue({ url: '' });
    this.imagenSubida.set(false);
  }

  publicar(): void {
    const shout = this.formGroup.getRawValue();
    if (!shout.comentario.trim() || !shout.perfilId || this.enviando() || this.subiendoImagen()) return;

    this.enviando.set(true);
    this.perfilService
      .createShout(shout as unknown as Partial<ShoutViewModel>)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.enviando.set(false);
          if (response) {
            this.formGroup.patchValue({ comentario: '', url: '' });
            this.imagenSubida.set(false);
            this.cerrarHashtags();
            this.publicado.emit();
          }
        },
        error: () => this.enviando.set(false),
      });
  }
}

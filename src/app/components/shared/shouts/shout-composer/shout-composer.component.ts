import { Component, DestroyRef, ElementRef, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShoutViewModel } from 'src/app/models/perfil/shout-vm.model';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { EmojisPopoverService } from '../../../bottom-sheets/bottom-sheets-emojis/emojis-popover.service';
import { ShoutMediaComponent } from '../../../addons/shout-media/shout-media.component';
import { UserAvatarComponent } from '../../../addons/user-avatar/user-avatar.component';

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

/** "¿Qué estás pensando?": publica un shout (texto, emojis y un enlace opcional) en el muro de `perfilId`. */
@Component({
  selector: 'app-shout-composer',
  templateUrl: './shout-composer.component.html',
  styleUrls: ['./shout-composer.component.scss'],
  imports: [ReactiveFormsModule, UserAvatarComponent, ShoutMediaComponent],
})
export class ShoutComposerComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly perfilService = inject(IHttpPerfilService);
  private readonly emojis = inject(EmojisPopoverService);
  private readonly destroyRef = inject(DestroyRef);

  /** Muro donde se publica (el propio en /mi). */
  readonly perfilId = input.required<number>();
  readonly publicado = output<void>();

  readonly currentUser = inject(IHttpSecurityService).getCurrentUser();
  readonly enviando = signal(false);
  emojisAbierto = false;
  readonly detectarTipo = detectarTipoShout;

  private readonly campoShout = viewChild<ElementRef<HTMLTextAreaElement>>('campoShout');

  readonly formGroup = this.formBuilder.nonNullable.group({
    comentario: ['', Validators.required],
    perfilId: [0, Validators.required],
    tipo: 1,
    url: [''],
  });

  constructor() {
    effect(() => this.formGroup.patchValue({ perfilId: this.perfilId() }));
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

  publicar(): void {
    const shout = this.formGroup.getRawValue();
    if (!shout.comentario.trim() || !shout.perfilId || this.enviando()) return;

    this.enviando.set(true);
    this.perfilService
      .createShout(shout as unknown as Partial<ShoutViewModel>)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.enviando.set(false);
          if (response) {
            this.formGroup.patchValue({ comentario: '', url: '' });
            this.publicado.emit();
          }
        },
        error: () => this.enviando.set(false),
      });
  }
}

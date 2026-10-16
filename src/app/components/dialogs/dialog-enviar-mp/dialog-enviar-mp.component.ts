import { Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { UsuarioAvatarViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { IHttpMensajesService } from 'src/app/services/interfaces/httpMensajes.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { IHttpUsuarioPerfilService } from 'src/app/services/interfaces/httpUsuarioPerfil.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { TurnstileComponent } from '../../addons/turnstile/turnstile.component';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { RichEditorComponent } from '../../shared/rich-editor/rich-editor.component';

/** Datos opcionales al abrir: el destinatario ya elegido (desde un perfil o el panel admin). */
export interface EnviarMPData {
  userName?: string;
  avatar?: string | null;
}

/**
 * "Mensaje nuevo": elegir destinatario (con sugerencias), escribir y enviar. Abrir una conversación nueva pide el
 * captcha de Cloudflare como el registro; el staff no lo ve (el API tampoco se lo pide).
 */
@Component({
  selector: 'app-dialog-enviar-mp',
  templateUrl: './dialog-enviar-mp.component.html',
  styleUrls: ['./dialog-enviar-mp.component.scss'],
  imports: [
    MatDialogTitle,
    ReactiveFormsModule,
    MatDialogContent,
    RichEditorComponent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    UserAvatarComponent,
    TurnstileComponent,
  ],
})
export class DialogEnviarMPComponent implements OnInit {
  private readonly dialogRef = inject<MatDialogRef<DialogEnviarMPComponent>>(MatDialogRef);
  private readonly mensajeService = inject(IHttpMensajesService);
  private readonly usuarioPerfilService = inject(IHttpUsuarioPerfilService);
  private readonly securityService = inject(IHttpSecurityService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly data = inject<EnviarMPData | null>(MAT_DIALOG_DATA);

  readonly formGroup = inject(FormBuilder).nonNullable.group({
    aUserName: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9_.-]{2,40}$/)]],
    contenido: ['', Validators.required],
  });

  /** Destinatario fijo (vino en data): se muestra como tarjeta en vez del campo. */
  readonly destinatarioFijo = !!this.data?.userName;
  readonly sugerencias = signal<UsuarioAvatarViewModel[]>([]);
  readonly activa = signal(0);
  readonly enviando = signal(false);
  /** Error junto al campo del destinatario (no existe, eres tú…). */
  readonly errorDestinatario = signal('');
  readonly error = signal('');

  /** Clave de Turnstile; null = el API no tiene captcha o el usuario es staff. */
  readonly captchaSiteKey = signal<string | null>(null);
  private captchaToken = '';
  private readonly captcha = viewChild<TurnstileComponent>('captcha');

  ngOnInit(): void {
    if (this.data?.userName) this.formGroup.patchValue({ aUserName: this.data.userName });

    const rango = this.securityService.getCurrentUser()?.usuario?.rango;
    if (rango !== 'Administrador' && rango !== 'Moderador') {
      this.securityService
        .getCaptchaSiteKey()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((clave) => this.captchaSiteKey.set(clave));
    }

    // Sugerencias de destinatario al escribir (mismo endpoint que las @menciones).
    this.formGroup.controls.aUserName.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((texto) => {
          const limpio = texto.trim().replace(/^@/, '');
          return limpio.length >= 1 && !this.destinatarioFijo ? this.usuarioPerfilService.sugerirMenciones(limpio) : of([]);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((l) => {
        const actual = this.formGroup.controls.aUserName.value.trim().replace(/^@/, '').toLowerCase();
        this.sugerencias.set(l.length === 1 && l[0].userName.toLowerCase() === actual ? [] : l.slice(0, 6));
        this.activa.set(0);
      });
  }

  get sinCaptcha(): boolean {
    return !!this.captchaSiteKey() && !this.captchaToken;
  }

  elegir(u: UsuarioAvatarViewModel): void {
    this.formGroup.patchValue({ aUserName: u.userName });
    this.errorDestinatario.set('');
    this.sugerencias.set([]);
  }

  teclaDestinatario(e: KeyboardEvent): void {
    const lista = this.sugerencias();
    if (!lista.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.activa.update((i) => (i + (e.key === 'ArrowDown' ? 1 : -1) + lista.length) % lista.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.elegir(lista[this.activa()]);
    } else if (e.key === 'Escape') {
      e.stopPropagation(); // que no cierre el diálogo: solo la lista
      this.sugerencias.set([]);
    }
  }

  cerrarSugerencias(): void {
    setTimeout(() => this.sugerencias.set([]), 150);
  }

  /** Ctrl/Cmd + Enter envía desde el editor. */
  atajoEnviar(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      this.enviarMP();
    }
  }

  captchaResponse(token: string): void {
    this.captchaToken = token;
  }

  enviarMP(): void {
    if (this.formGroup.invalid || this.enviando() || this.sinCaptcha) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.error.set('');
    this.errorDestinatario.set('');
    const mp = { ...this.formGroup.getRawValue(), aUserName: this.formGroup.getRawValue().aUserName.trim().replace(/^@/, ''), asunto: '' };
    this.enviando.set(true);

    this.mensajeService
      .sendMensajePrivado(mp, this.captchaToken || null)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.enviando.set(false);
          if (response?.type === 'username') {
            this.errorDestinatario.set(response.message);
            this.reiniciarCaptcha();
            return;
          }
          if (response?.type === 'error' || response?.type === 'captcha') {
            this.error.set(response.message);
            this.reiniciarCaptcha();
            return;
          }

          this.notificationService.success(`Tu mensaje a @${mp.aUserName} se entregó correctamente`, 'Enviado');
          this.dialogRef.close(true);
          // Abre el chat con el destinatario para seguir la conversación.
          this.router.navigate(['/mensajes/chat', mp.aUserName]);
        },
        error: () => {
          this.enviando.set(false);
          this.reiniciarCaptcha();
        },
      });
  }

  /** Cada token sirve una sola vez: tras un intento fallido se pide otro. */
  private reiniciarCaptcha(): void {
    this.captchaToken = '';
    this.captcha()?.reiniciar();
  }
}

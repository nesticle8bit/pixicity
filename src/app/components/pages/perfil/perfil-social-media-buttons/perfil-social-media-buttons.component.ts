import { Subscription } from 'rxjs';
import { Component, DestroyRef, inject, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { IHttpUsuarioPerfilService } from '../../../../services/interfaces/httpUsuarioPerfil.interface';

interface RedSocial {
  nombre: string;
  icono: string;
  /** null: no hay perfil público al que enlazar (usuario de Discord): se copia al hacer clic. */
  url: string | null;
  usuario: string;
}

/** Base de cada red: el perfil guarda solo el nombre de usuario. */
const REDES: { campo: string; nombre: string; icono: string; base: string }[] = [
  { campo: 'instagram', nombre: 'Instagram', icono: 'ti-brand-instagram', base: 'https://instagram.com/' },
  { campo: 'facebook', nombre: 'Facebook', icono: 'ti-brand-facebook', base: 'https://facebook.com/' },
  { campo: 'twitter', nombre: 'X', icono: 'ti-brand-x', base: 'https://x.com/' },
  { campo: 'youtube', nombre: 'YouTube', icono: 'ti-brand-youtube', base: 'https://youtube.com/@' },
  { campo: 'tiktok', nombre: 'TikTok', icono: 'ti-brand-tiktok', base: 'https://tiktok.com/@' },
  { campo: 'lastfm', nombre: 'Last.fm', icono: 'ti-brand-lastfm', base: 'https://www.last.fm/user/' },
];

/**
 * Discord no tiene URL por nombre de usuario: el ID numérico va a discord.com/users/{id} y una invitación a
 * discord.gg/{código}; un nombre de usuario se muestra tal cual (sin enlace).
 */
export function redDiscord(valor: string | null | undefined): RedSocial | null {
  const texto = (valor ?? '').trim().replace(/^@/, '');
  if (!texto) return null;
  const base = { nombre: 'Discord', icono: 'ti-brand-discord' };
  const invitacion = texto.match(/^(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord(?:app)?\.com\/invite)\/([\w-]+)\/?$/i);
  if (invitacion) return { ...base, usuario: 'discord.gg/' + invitacion[1], url: 'https://discord.gg/' + invitacion[1] };
  const perfil = texto.match(/^(?:https?:\/\/)?(?:www\.)?discord(?:app)?\.com\/users\/(\d{15,21})\/?$/i)?.[1] ?? texto.match(/^\d{15,21}$/)?.[0];
  if (perfil) return { ...base, usuario: perfil, url: 'https://discord.com/users/' + perfil };
  return { ...base, usuario: texto, url: null };
}

/** Redes sociales del usuario en la columna lateral del perfil. Sin redes cargadas no ocupa lugar. */
@Component({
  selector: 'app-perfil-social-media-buttons',
  templateUrl: './perfil-social-media-buttons.component.html',
  styleUrls: ['./perfil-social-media-buttons.component.scss'],
})
export class PerfilSocialMediaButtonsComponent {
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(NotificationService);
  private carga?: Subscription;

  public redes: RedSocial[] = [];

  @Input() set usuarioId(value: number | null | undefined) {
    this.redes = [];
    if (value) {
      this.getSocialMedia(value);
    }
  }

  /** Usuario de Discord sin enlace: se copia para agregarlo desde la app. */
  async copiar(red: RedSocial): Promise<void> {
    try {
      await navigator.clipboard.writeText(red.usuario);
      this.notificationService.success(`Usuario de ${red.nombre} copiado`, red.nombre);
    } catch {
      this.notificationService.error('No se pudo copiar', red.nombre);
    }
  }

  private getSocialMedia(usuarioId: number): void {
    // Cancela la carga anterior: si cambia el input, una respuesta vieja no pisa a la nueva.
    this.carga?.unsubscribe();
    this.carga = this.usuarioPerfilService
      .getSocialMediaByUsuarioId(usuarioId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((respuesta) => {
        const datos = respuesta as Record<string, string | null> | null;
        this.redes = REDES.flatMap((red) => {
          // Algunos guardan "@usuario" o la URL completa: se queda solo el nombre.
          const usuario = (datos?.[red.campo] ?? '').trim().replace(/^https?:\/\/[^/]+\//i, '').replace(/^@/, '').replace(/\/+$/, '');
          return usuario ? [{ nombre: red.nombre, icono: red.icono, usuario, url: red.base + encodeURIComponent(usuario) }] : [];
        });
        const discord = redDiscord(datos?.['discord']);
        if (discord) this.redes.push(discord);
      });
  }
}

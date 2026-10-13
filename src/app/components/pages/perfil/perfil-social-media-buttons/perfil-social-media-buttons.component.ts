import { Subscription } from 'rxjs';
import { Component, DestroyRef, inject, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpUsuarioPerfilService } from '../../../../services/interfaces/httpUsuarioPerfil.interface';

interface RedSocial {
  nombre: string;
  icono: string;
  url: string;
  usuario: string;
}

/** Base de cada red: el perfil guarda solo el nombre de usuario. */
const REDES: { campo: string; nombre: string; icono: string; base: string }[] = [
  { campo: 'instagram', nombre: 'Instagram', icono: 'ti-brand-instagram', base: 'https://instagram.com/' },
  { campo: 'facebook', nombre: 'Facebook', icono: 'ti-brand-facebook', base: 'https://facebook.com/' },
  { campo: 'twitter', nombre: 'X', icono: 'ti-brand-x', base: 'https://x.com/' },
  { campo: 'youtube', nombre: 'YouTube', icono: 'ti-brand-youtube', base: 'https://youtube.com/@' },
  { campo: 'tiktok', nombre: 'TikTok', icono: 'ti-brand-tiktok', base: 'https://tiktok.com/@' },
];

/** Redes sociales del usuario en la columna lateral del perfil. Sin redes cargadas no ocupa lugar. */
@Component({
  selector: 'app-perfil-social-media-buttons',
  templateUrl: './perfil-social-media-buttons.component.html',
  styleUrls: ['./perfil-social-media-buttons.component.scss'],
})
export class PerfilSocialMediaButtonsComponent {
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);
  private readonly destroyRef = inject(DestroyRef);
  private carga?: Subscription;

  public redes: RedSocial[] = [];

  @Input() set usuarioId(value: number | null | undefined) {
    this.redes = [];
    if (value) {
      this.getSocialMedia(value);
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
      });
  }
}

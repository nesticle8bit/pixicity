import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PalabraSilenciada, UsuarioSilenciado } from 'src/app/models/seguridad/silencios.model';
import { IHttpSilenciosService } from 'src/app/services/interfaces/httpSilencios.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { UserAvatarComponent } from '../../../addons/user-avatar/user-avatar.component';

/** Cuenta > Silenciados: personas y palabras que no quiero ver en mi muro. */
@Component({
  selector: 'app-account-silenciados',
  templateUrl: './account-silenciados.component.html',
  styleUrl: './account-silenciados.component.scss',
  imports: [FormsModule, RouterLink, UserAvatarComponent],
})
export class AccountSilenciadosComponent implements OnInit {
  private readonly silencios = inject(IHttpSilenciosService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly usuarios = signal<UsuarioSilenciado[]>([]);
  readonly palabras = signal<PalabraSilenciada[]>([]);
  readonly cargado = signal(false);
  nuevaPalabra = '';
  agregando = false;

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.silencios
      .getSilencios()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (s) => {
          this.usuarios.set(s.usuarios);
          this.palabras.set(s.palabras);
          this.cargado.set(true);
        },
        error: () => this.cargado.set(true),
      });
  }

  agregarPalabra(): void {
    const palabra = this.nuevaPalabra.trim();
    if (palabra.length < 2 || this.agregando) return;
    this.agregando = true;
    this.silencios
      .agregarPalabra(palabra)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.agregando = false;
          this.nuevaPalabra = '';
          this.cargar();
        },
        error: (e: unknown) => {
          this.agregando = false;
          this.notificationService.error(e instanceof Error ? e.message : 'No se pudo silenciar', 'Silenciados');
        },
      });
  }

  quitarPalabra(p: PalabraSilenciada): void {
    this.silencios
      .quitarPalabra(p.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.palabras.update((l) => l.filter((x) => x.id !== p.id)));
  }

  dejarDeSilenciar(u: UsuarioSilenciado): void {
    this.silencios
      .alternarUsuario(u.userName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.usuarios.update((l) => l.filter((x) => x.id !== u.id));
        this.notificationService.success(`Vuelves a ver a @${u.userName} en tu muro`, 'Silenciados');
      });
  }
}

import { JwtUserModel } from 'src/app/models/security/jwtUser.model';
import { PerfilRef, SIN_PERFIL } from 'src/app/models/seguridad/seguridad-vm.model';
import { IHttpPerfilService } from 'src/app/services/interfaces/httpPerfil.interface';
import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output, ElementRef, viewChild } from '@angular/core';
import { EmojisPopoverService } from '../../bottom-sheets/bottom-sheets-emojis/emojis-popover.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { ShoutMediaComponent } from '../../addons/shout-media/shout-media.component';
import { ProfileShoutsWallComponent } from '../profile-shouts-wall/profile-shouts-wall.component';

@Component({
    selector: 'app-profile-shouts',
    templateUrl: './profile-shouts.component.html',
    styleUrls: ['./profile-shouts.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        UserAvatarComponent,
        ShoutMediaComponent,
        ProfileShoutsWallComponent,
    ],
})
export class ProfileShoutsComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private perfilService = inject(IHttpPerfilService);
  private securityService = inject(IHttpSecurityService);

  private readonly destroyRef = inject(DestroyRef);

  public reloadShouts: boolean = false;
  public emojisAbierto = false;
  private readonly emojis = inject(EmojisPopoverService);
  private readonly campoShout = viewChild<ElementRef<HTMLTextAreaElement>>('campoShout');
  private _user: PerfilRef = SIN_PERFIL;

  @Input() set user(value: PerfilRef | null) {
    this._user = value ?? SIN_PERFIL;

    if (value && value.id) {
      this.formGroup.patchValue({
        perfilId: value.id,
      });
    }
  }

  get user(): PerfilRef {
    return this._user;
  }

  public formGroup: FormGroup;
  public currentUser?: JwtUserModel;

  constructor() {
    this.formGroup = this.formBuilder.group({
      comentario: ['', Validators.required],
      perfilId: [0, Validators.required],
      tipo: 1,
      url: [''],
    });

    this.currentUser = this.securityService.getCurrentUser();
  }

  ngOnInit(): void {}

  // Clasificación en cliente para la vista previa del composer (el backend la recalcula al guardar).
  detectarTipo(url: string): string {
    if (!url) return 'Texto';
    const u = url.toLowerCase();
    if (!/^https?:\/\//.test(u)) return 'Texto';
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 'Video';
    if (u.includes('spotify.com')) return 'Spotify';
    if (/\.(jpg|jpeg|png|gif|webp|bmp|avif)(\?.*)?$/.test(u)) return 'Foto';
    return 'Enlace';
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
    const texto: string = this.formGroup.value.comentario ?? '';
    const inicio = campo?.selectionStart ?? texto.length;
    const fin = campo?.selectionEnd ?? texto.length;
    const nuevo = texto.slice(0, inicio) + emoji + texto.slice(fin);
    this.formGroup.patchValue({ comentario: nuevo });
    if (campo) {
      campo.value = nuevo;
      campo.setSelectionRange(inicio + emoji.length, inicio + emoji.length);
    }
  }

  createShout(): void {
    this.reloadShouts = false;
    const shout = Object.assign({}, this.formGroup.value);

    if (!shout || !shout.comentario) {
      return;
    }

    this.perfilService.createShout(shout).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.formGroup.patchValue({
          comentario: '',
          url: '',
        });

        this.reloadShouts = true;
      }
    });
  }
}

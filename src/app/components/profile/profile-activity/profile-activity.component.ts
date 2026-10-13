import { Subscription } from 'rxjs';
import { PerfilRef, SIN_PERFIL } from 'src/app/models/seguridad/seguridad-vm.model';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { TipoActividadIconComponent } from '../../addons/tipo-actividad-icon/tipo-actividad-icon.component';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';
import { IHttpUsuarioPerfilService } from '../../../services/interfaces/httpUsuarioPerfil.interface';
import { RouterLink } from '@angular/router';
import { UserAvatarComponent } from '../../addons/user-avatar/user-avatar.component';
import { ActividadViewModel } from 'src/app/models/logs/logs-vm.model';

@Component({
    selector: 'app-profile-activity',
    templateUrl: './profile-activity.component.html',
    styleUrls: ['./profile-activity.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        TipoActividadIconComponent,
        TimeAgoPipe,
        RouterLink,
        UserAvatarComponent,
    ],
})
export class ProfileActivityComponent implements OnInit {
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);
  private formBuilder = inject(FormBuilder);

  private readonly destroyRef = inject(DestroyRef);
  private cargaGetActividadUsuario?: Subscription;

  private _user: PerfilRef = SIN_PERFIL;

  @Input() set user(value: PerfilRef | null) {
    this._user = value ?? SIN_PERFIL;

    // Sin id todavía (el padre arranca con {}): no pedir datos de usuarioId=undefined.
    if (value?.id) {
      this.getActividadUsuario();
    }
  }

  get user(): PerfilRef {
    return this._user;
  }

  public formGroup: FormGroup;
  public grupos: { titulo: string; items: ActividadViewModel[] }[] = [];
  public cargado = false;

  get hayActividad(): boolean {
    return this.grupos.some((g) => g.items.length > 0);
  }

  /** Filtro por tipo, agrupado. Los valores son los de TipoActividad en el API. */
  readonly filtros: { grupo: string; tipos: { key: string; value: number }[] }[] = [
    {
      grupo: 'Posts',
      tipos: [
        { key: 'Post nuevo', value: 1 },
        { key: 'Post favorito', value: 2 },
        { key: 'Post votado', value: 3 },
        { key: 'Post recomendado', value: 4 },
        { key: 'Comentario nuevo', value: 5 },
        { key: 'Comentario votado', value: 6 },
        { key: 'Siguiendo un post', value: 7 },
      ],
    },
    {
      grupo: 'Shouts',
      tipos: [
        { key: 'Publicaciones en muro', value: 10 },
        { key: 'Le gusta un shout', value: 11 },
        { key: 'Shout compartido', value: 13 },
      ],
    },
    {
      grupo: 'Fotos',
      tipos: [
        { key: 'Foto nueva', value: 9 },
        { key: 'Foto comentada', value: 12 },
      ],
    },
    {
      grupo: 'Comunidades',
      tipos: [
        { key: 'Comunidad creada', value: 14 },
        { key: 'Se unió a una comunidad', value: 15 },
        { key: 'Tema nuevo', value: 16 },
        { key: 'Tema comentado', value: 17 },
      ],
    },
    {
      grupo: 'Usuarios',
      tipos: [
        { key: 'Siguiendo un usuario', value: 8 },
        { key: 'Rango alcanzado', value: 18 },
      ],
    },
  ];

  constructor() {
    this.formGroup = this.formBuilder.group({
      tipoActividad: '',
    });
  }

  ngOnInit(): void {}

  getActividadUsuario(): void {
    if (!this.user.id) {
      return;
    }

    // Cancela la carga anterior: si cambia el input, una respuesta vieja no pisa a la nueva.

    this.cargaGetActividadUsuario?.unsubscribe();

    this.cargaGetActividadUsuario = this.usuarioPerfilService
      .getActividadUsuario(this.user.id, this.formGroup.value.tipoActividad)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.grupos = [
          { titulo: 'Hoy', items: response?.hoy ?? [] },
          { titulo: 'Ayer', items: response?.ayer ?? [] },
          { titulo: 'Semanas Anteriores', items: response?.semana ?? [] },
          { titulo: 'Actividad más antigua', items: response?.mes ?? [] },
        ];
        this.cargado = true;
      });
  }
}

import { Subscription } from 'rxjs';
import { PerfilRef, SIN_PERFIL } from 'src/app/models/seguridad/seguridad-vm.model';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import { TipoActividadIconComponent } from '../../addons/tipo-actividad-icon/tipo-actividad-icon.component';
import { TimeAgoPipe } from '../../../shared/pipes/timeAgo.pipe';
import { IHttpUsuarioPerfilService } from '../../../services/interfaces/httpUsuarioPerfil.interface';

@Component({
    selector: 'app-profile-activity',
    templateUrl: './profile-activity.component.html',
    styleUrls: ['./profile-activity.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        TipoActividadIconComponent,
        TimeAgoPipe,
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
  public actividad: any;
  public tipoActividades: any = [
    {
      key: 'Post Nuevo',
      value: 1,
    },
    {
      key: 'Post Favorito',
      value: 2,
    },
    {
      key: 'Post Votado',
      value: 3,
    },
    {
      key: 'Post Recomendado',
      value: 4,
    },
    {
      key: 'Comentario Nuevo',
      value: 5,
    },
    {
      key: 'Comentario Votado',
      value: 6,
    },
    {
      key: 'Siguiendo un Post',
      value: 7,
    },
    {
      key: 'Siguiendo un Usuario',
      value: 8,
    },
    {
      key: 'Foto Nueva',
      value: 9,
    },
    {
      key: 'Publicaciones en Muro',
      value: 10,
    },
    {
      key: 'Le Gusta un Shout',
      value: 11,
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
        this.actividad = response;
      });
  }
}

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

  private _user: any;

  @Input() set user(value: any) {
    this._user = value;

    if (value) {
      this.getActividadUsuario();
    }
  }

  get user(): any {
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
    this.usuarioPerfilService
      .getActividadUsuario(this.user.id, this.formGroup.value.tipoActividad)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.actividad = response;
      });
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';

@Component({
  selector: 'app-profile-activity',
  templateUrl: './profile-activity.component.html',
  styleUrls: ['./profile-activity.component.scss'],
})
export class ProfileActivityComponent implements OnInit {
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

  constructor(
    private securityService: IHttpSecurityService,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      tipoActividad: '',
    });
  }

  ngOnInit(): void {}

  getActividadUsuario(): void {
    this.securityService
      .getActividadUsuario(this.user.id, this.formGroup.value.tipoActividad)
      .subscribe((response: any) => {
        this.actividad = response;
      });
  }
}

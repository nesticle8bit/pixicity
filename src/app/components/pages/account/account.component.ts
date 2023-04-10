import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogChangeAvatarComponent } from 'src/app/components/dialogs/dialog-change-avatar/dialog-change-avatar.component';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  public currentUser: any;
  public changeEmailStatus: boolean = false;
  public currentStep: number = 0;
  public paises: any[] = [];
  public estados: any[] = [];
  public generos: any[] = [
    {
      value: 1,
      label: 'Masculino',
    },
    {
      value: 2,
      label: 'Femenino',
    },
    {
      value: 3,
      label: 'Otro',
    },
  ];

  public dias: any[] = [];
  public meses: any[] = [
    {
      label: 'Enero',
      value: '01',
    },
    {
      label: 'Febrero',
      value: '02',
    },
    {
      label: 'Marzo',
      value: '03',
    },
    {
      label: 'Abril',
      value: '04',
    },
    {
      label: 'Mayo',
      value: '05',
    },
    {
      label: 'Junio',
      value: '06',
    },
    {
      label: 'Julio',
      value: '07',
    },
    {
      label: 'Agosto',
      value: '08',
    },
    {
      label: 'Septiembre',
      value: '09',
    },
    {
      label: 'Octubre',
      value: '10',
    },
    {
      label: 'Noviembre',
      value: '11',
    },
    {
      label: 'Diciembre',
      value: '12',
    },
  ];
  public years: any[] = [];

  public estadosCiviles: string[] = [
    'Sin respuesta',
    'Soltero/a',
    'Con novio/a',
    'Casado/a',
    'Divorciado/a',
    'Viudo/a',
    'En algo...',
  ];

  public hijos: string[] = [
    'Sin respuesta',
    'No tengo',
    'Algún día',
    'Está en camino',
    'No son lo mío',
    'Tengo, vivo con ellos',
    'Tengo, no vivo con ellos',
  ];

  public vivoCon: string[] = [
    'Sin respuesta',
    'Sólo',
    'Con mis padres',
    'Con mi pareja',
    'Con amigos',
    'Otro',
  ];

  public colorCabello: string[] = [
    'Sin respuesta',
    'Negro',
    'Castaño oscuro',
    'Castaño claro',
    'Rubio',
    'Pelirrojo',
    'Gris',
    'Verde',
    'Naranja',
    'Morado',
    'Azul',
    'Canoso',
    'Teñido',
    'Rapado',
    'Calvo',
  ];

  public colorOjos: string[] = [
    'Sin respuesta',
    'Negros',
    'Marrones',
    'Celestes',
    'Verdes',
    'Grises',
  ];

  public complexiones: string[] = [
    'Sin respuesta',
    'Delgado/a',
    'Atlético',
    'Normal',
    'Algunos kilos de más',
    'Corpulento/a',
  ];

  public dietas: string[] = [
    'Sin respuesta',
    'Vegetariana',
    'Lacto Vegetariana',
    'Orgánica',
    'De todo',
    'Comida basura',
  ];

  public fumoAlcohol: string[] = [
    'Sin respuesta',
    'No',
    'Casualmente',
    'Socialmente',
    'Regularmente',
    'Mucho',
  ];

  public estudios: string[] = [
    'Sin respuesta',
    'Sin Estudios',
    'Primario completo',
    'Secundario en curso',
    'Secundario completo',
    'Terciario en curso',
    'Terciario completo',
    'Universitario en curso',
    'Universitario completo',
    'Post-grado en curso',
    'Post-grado completo',
  ];

  public sector: string[] = [
    'Sin respuesta',
    'Abastecimiento',
    'Administración',
    'Apoderado Aduanal',
    'Asesoría en Comercio Exterior',
    'Asesoría Legal Internacional',
    'Asistente de Tráfico',
    'Auditoría',
    'Calidad',
    'Call Center',
    'Capacitación Comercio Exterior',
    'Comercial',
    'Comercio Exterior',
    'Compras',
    'Compras Internacionales/Importación',
    'Comunicación Social',
    'Comunicaciones Externas',
    'Comunicaciones Internas',
    'Consultoría',
    'Consultorías Comercio Exterior',
    'Contabilidad',
    'Control de Gestión',
    'Creatividad',
    'Diseño',
    'Distribución',
    'E-commerce',
    'Educación',
    'Finanzas',
    'Finanzas Internacionales',
    'Gerencia / Dirección General',
    'Impuestos',
    'Ingeniería',
    'Internet',
    'Investigación y Desarrollo',
    'Jóvenes Profesionales',
    'Legal',
    'Logística',
    'Mantenimiento',
    'Marketing',
    'Medio Ambiente',
    'Mercadotecnia Internacional',
    'Multimedia',
    'Otra',
    'Pasantías',
    'Periodismo',
    'Planeamiento',
    'Producción',
    'Producción e Ingeniería',
    'Recursos Humanos',
    'Relaciones Institucionales / Públicas',
    'Salud',
    'Seguridad Industrial',
    'Servicios',
    'Soporte Técnico',
    'Tecnología',
    'Tecnologías de la Información',
    'Telecomunicaciones',
    'Telemarketing',
    'Traducción',
    'Transporte',
    'Ventas',
    'Ventas Internacionales/Exportación',
  ];

  public formGroupCuenta: FormGroup;
  public formGroupPerfil: FormGroup;
  public formGroupCambiarContrasena: FormGroup;
  public formGroupPersonalizacion: FormGroup;

  constructor(
    private securityService: IHttpSecurityService,
    private parametrosService: IHttpParametrosService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    this.formGroupCuenta = this.formBuilder.group({
      avatar: '',
      userName: '',
      email: ['', Validators.email],
      paisId: [undefined, Validators.required],
      estadoId: [undefined, Validators.required],
      genero: [undefined, Validators.required],
      dia: [undefined, Validators.required],
      mes: [undefined, Validators.required],
      año: [undefined, Validators.required],
    });

    this.formGroupPerfil = this.formBuilder.group({
      completeName: [''],
      personalMessage: [''],
      website: [''],
      instagram: [''],
      facebook: [''],
      twitter: [''],
      tiktok: [''],
      youtube: [''],
      like1: [false],
      like2: [false],
      like3: [false],
      like4: [false],
      like_all: [false],
      estadoCivil: [''],
      hijos: [''],
      vivoCon: [''],

      altura: [''],
      peso: [''],
      colorCabello: [''],
      colorOjos: [''],
      complexion: [''],
      dieta: [''],
      tatuajes: [false],
      piercings: [false],
      fumo: [''],
      alcohol: [''],

      estudios: [''],
      profesion: [''],
      empresa: [''],
      sector: [''],
      interesesProfesionales: [''],
      habilidadesProfesionales: [''],

      misIntereses: [''],
      hobbies: [''],
      seriesTV: [''],
      musicaFavorita: [''],
      deportesFavoritos: [''],
      librosFavoritos: [''],
      peliculasFavoritas: [''],
      comidaFavorita: [''],
      misHeroesSon: [''],
    });

    this.formGroupCambiarContrasena = this.formBuilder.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', Validators.required],
        confirmPassword: [''],
      },
      { validators: this.checkPasswords }
    );

    this.formGroupPersonalizacion = this.formBuilder.group({
      profileBackground: ''
    });

    this.getCurrentPerfilInfo();
  }

  getCurrentPerfilInfo(): void {
    this.securityService.getCurrentPerfilInfo().subscribe((response: any) => {
      if (response) {
        this.formGroupPerfil.patchValue({
          completeName: response.perfil.completeName,
          personalMessage: response.perfil.personalMessage,
          website: response.perfil.website,
          instagram: response.perfil.instagram,
          facebook: response.perfil.facebook,
          twitter: response.perfil.twitter,
          tiktok: response.perfil.tiktok,
          youtube: response.perfil.youtube,
          like1: response.perfil.like1,
          like2: response.perfil.like2,
          like3: response.perfil.like3,
          like4: response.perfil.like4,
          like_all: response.perfil.like_All,
          estadoCivil: response.perfil.estadoCivil,
          hijos: response.perfil.hijos,
          vivoCon: response.perfil.vivoCon,
          altura: response.perfil.altura,
          peso: response.perfil.peso,
          colorCabello: response.perfil.colorCabello,
          colorOjos: response.perfil.colorOjos,
          complexion: response.perfil.complexion,
          dieta: response.perfil.dieta,
          tatuajes: response.perfil.tatuajes,
          piercings: response.perfil.piercings,
          fumo: response.perfil.fumo,
          alcohol: response.perfil.alcohol,
          estudios: response.perfil.estudios,
          profesion: response.perfil.profesion,
          empresa: response.perfil.empresa,
          sector: response.perfil.sector,
          interesesProfesionales: response.perfil.interesesProfesionales,
          habilidadesProfesionales: response.perfil.habilidadesProfesionales,
          misIntereses: response.perfil.misIntereses,
          hobbies: response.perfil.hobbies,
          seriesTV: response.perfil.seriesTV,
          musicaFavorita: response.perfil.musicaFavorita,
          deportesFavoritos: response.perfil.deportesFavoritos,
          librosFavoritos: response.perfil.librosFavoritos,
          peliculasFavoritas: response.perfil.peliculasFavoritas,
          comidaFavorita: response.perfil.comidaFavorita,
          misHeroesSon: response.perfil.misHeroesSon,
        });

        this.formGroupPersonalizacion.patchValue({
          profileBackground: response.background
        });
      }
    });
  }

  checkPasswords: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    let pass = group?.get('newPassword')?.value;
    let confirmPass = group?.get('confirmPassword')?.value;

    if (!pass || !confirmPass) {
      return null;
    }

    return pass === confirmPass ? null : { notSame: true };
  };

  ngOnInit(): void {
    this.getCurrentUser();
    this.getPaises();
    this.initFechas();
  }

  getCurrentUser(): void {
    this.securityService.getLoggedUserByJwt().subscribe((value: any) => {
      if (value) {
        const fechaNacimiento = value.fechaNacimiento?.split('/');

        this.formGroupCuenta.patchValue({
          avatar: value.avatar,
          userName: value.userName,
          email: value.email,
          genero: value.genero,
          paisId: value.paisId,
          estadoId: value.estadoId,
          dia: fechaNacimiento[0],
          mes: fechaNacimiento[1],
          año: fechaNacimiento[2],
        });

        this.getEstadosByPais(value?.paisId);
      }
    });
  }

  initFechas(): void {
    for (let index = 0; index < 31; index++) {
      this.dias.push(index + 1);
    }

    for (let index = new Date().getFullYear() - 1; index > 1919; index--) {
      this.years.push(index);
    }
  }

  getPaises(): void {
    this.parametrosService.getPaisesDropdown().subscribe((values: any) => {
      this.paises = values;
    });
  }

  getEstadosByPais(paisId: number): void {
    if (!paisId) {
      return;
    }

    this.parametrosService.getEstadosByPais(paisId).subscribe((values: any) => {
      this.estados = values;
    });
  }

  changeEmail(): void {
    this.changeEmailStatus = !this.changeEmailStatus;
  }

  updateUsuario(): void {
    const cuenta = Object.assign({}, this.formGroupCuenta.value);
    cuenta.fechaNacimiento = `${cuenta.dia}/${cuenta.mes}/${cuenta.año}`;

    this.securityService.updateUsuario(cuenta).subscribe((response: any) => {
      if (response) {
        Swal.fire({
          title: 'Actualizado',
          text: 'La información de la cuenta ha sido actualizado correctamente',
          icon: 'success',
          timer: 3000,
        });
      }
    });
  }

  changePassword(): void {
    const passwords = Object.assign({}, this.formGroupCambiarContrasena.value);

    this.securityService
      .changePassword(passwords)
      .subscribe((response: any) => {
        if (response) {
          this.formGroupCambiarContrasena.patchValue({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });

          Swal.fire({
            title: 'Actualizado',
            text: 'La contraseña ha sido actualizada correctamente',
            icon: 'success',
            timer: 3000,
          });
        }
      });
  }

  savePerfilInfo(): void {
    const perfil = Object.assign({}, this.formGroupPerfil.value);

    this.securityService.savePerfilInfo(perfil).subscribe((response: any) => {
      if (response) {
        Swal.fire({
          title: 'Actualizado',
          text: 'Los cambios fueron aceptados y serán aplicados',
          icon: 'success',
          timer: 3000,
        });
      }
    });
  }

  changeAvatar(): void {
    const dialogRef = this.dialog.open(DialogChangeAvatarComponent, {
      width: '350px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((value: any) => {
      if (value) {
        this.formGroupCuenta.patchValue({
          avatar: value,
        });

        const currentUser = this.securityService.getCurrentUser();
        currentUser.usuario.avatar = value;

        this.securityService.setUserToLocalStorage(currentUser);
      }
    });
  }

  saveFormGroupPersonalizacion(): void {
    const personalization = Object.assign({}, this.formGroupPersonalizacion.value);

    this.securityService.changeBackgroundProfile(personalization).subscribe((value: string) => {
      Swal.fire({
        title: 'Actualizado',
        text: 'El background de tu perfil ha sido actualizado correctamente',
        icon: 'success',
        timer: 3000
      })
    });
  }
}

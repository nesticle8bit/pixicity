import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { IHttpParametrosService } from 'src/app/services/interfaces/httpParametros.interface';
import { IHttpSecurityService } from 'src/app/services/interfaces/httpSecurity.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  public currentUser: any;
  public changeEmailStatus: boolean = false;
  public paises: any[] = [];
  public estados: any[] = [];
  public generos: any[] = [{
    value: 1,
    label: 'Masculino'
  },
  {
    value: 2,
    label: 'Femenino'
  },
  {
    value: 3,
    label: 'Otro'
  }];

  public dias: any[] = [];
  public meses: any[] = [
    {
      label: 'Enero',
      value: '01'
    },
    {
      label: 'Febrero',
      value: '02'
    },
    {
      label: 'Marzo',
      value: '03'
    },
    {
      label: 'Abril',
      value: '04'
    },
    {
      label: 'Mayo',
      value: '05'
    },
    {
      label: 'Junio',
      value: '06'
    },
    {
      label: 'Julio',
      value: '07'
    },
    {
      label: 'Agosto',
      value: '08'
    },
    {
      label: 'Septiembre',
      value: '09'
    },
    {
      label: 'Octubre',
      value: '10'
    },
    {
      label: 'Noviembre',
      value: '11'
    },
    {
      label: 'Diciembre',
      value: '12'
    }
  ];
  public years: any[] = [];
  public formGroupCuenta: FormGroup;
  public formGroupCambiarContrasena: FormGroup;

  constructor(
    private securityService: IHttpSecurityService,
    private parametrosService: IHttpParametrosService,
    private formBuilder: FormBuilder
  ) {
    this.formGroupCuenta = this.formBuilder.group({
      email: ['', Validators.email],
      paisId: [undefined, Validators.required],
      estadoId: [undefined, Validators.required],
      genero: [undefined, Validators.required],
      dia: [undefined, Validators.required],
      mes: [undefined, Validators.required],
      año: [undefined, Validators.required]
    });

    this.formGroupCambiarContrasena = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['']
    }, { validators: this.checkPasswords });
  }

  checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    let pass = group?.get('newPassword')?.value;
    let confirmPass = group?.get('confirmPassword')?.value;

    if (!pass || !confirmPass) {
      return null;
    }

    return pass === confirmPass ? null : { notSame: true }
  }

  ngOnInit(): void {
    this.getCurrentUser();
    this.getPaises();
    this.initFechas();
  }

  getCurrentUser(): void {
    this.securityService.getLoggedUserByJwt().subscribe((value: any) => {
      console.log(value);
      if (value) {
        const fechaNacimiento = value.fechaNacimiento?.split('/');

        this.formGroupCuenta.patchValue({
          email: value.email,
          genero: value.genero,
          paisId: value.paisId,
          estadoId: value.estadoId,
          dia: fechaNacimiento[0],
          mes: fechaNacimiento[1],
          año: fechaNacimiento[2]
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

  changePassword(): void {
    const passwords = Object.assign({}, this.formGroupCambiarContrasena.value);

    this.securityService.changePassword(passwords).subscribe((response: any) => {
      if (response) {
        this.formGroupCambiarContrasena.patchValue({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        Swal.fire({
          title: 'Actualizado',
          text: 'La contraseña ha sido actualizada correctamente',
          icon: 'success',
          timer: 3000
        });
      }
    });
  }
}

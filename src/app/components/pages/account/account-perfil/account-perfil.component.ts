import { Component, DestroyRef, effect, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { UsuarioPerfilViewModel } from 'src/app/models/seguridad/seguridad-vm.model';
import { IHttpUsuarioPerfilService } from 'src/app/services/interfaces/httpUsuarioPerfil.interface';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { SelectAutocompleteComponent } from '../../../shared/select-autocomplete/select-autocomplete.component';
import {
  COLOR_CABELLO,
  COLOR_OJOS,
  COMPLEXIONES,
  DIETAS,
  ESTADOS_CIVILES,
  ESTUDIOS,
  FUMO_ALCOHOL,
  HIJOS,
  SECTORES,
  VIVO_CON,
} from './account-perfil.opciones';

/** Cuenta > Perfil: datos del perfil extendido en pasos (acordeón). El padre carga el perfil y lo pasa por input. */
@Component({
  selector: 'app-account-perfil',
  templateUrl: './account-perfil.component.html',
  styleUrls: ['../account.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatCheckbox,
    MatButton,
    MatIcon,
    SelectAutocompleteComponent,
  ],
})
export class AccountPerfilComponent {
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);
  private notificationService = inject(NotificationService);
  private formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly perfil = input<UsuarioPerfilViewModel | null>(null);

  public currentStep = 0;

  readonly estadosCiviles = ESTADOS_CIVILES;
  readonly hijos = HIJOS;
  readonly vivoCon = VIVO_CON;
  readonly colorCabello = COLOR_CABELLO;
  readonly colorOjos = COLOR_OJOS;
  readonly complexiones = COMPLEXIONES;
  readonly dietas = DIETAS;
  readonly fumoAlcohol = FUMO_ALCOHOL;
  readonly estudios = ESTUDIOS;
  readonly sector = SECTORES;

  public formGroupPerfil: FormGroup = this.formBuilder.group({
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

  constructor() {
    // Rellena el formulario cuando llega (o cambia) el perfil del padre.
    effect(() => {
      const p = this.perfil();
      if (!p) {
        return;
      }
      // like_All viene así del API; el formulario usa like_all.
      this.formGroupPerfil.patchValue({ ...p, like_all: p.like_All });
    });
  }

  savePerfilInfo(): void {
    const perfil = Object.assign({}, this.formGroupPerfil.value);

    this.usuarioPerfilService.savePerfilInfo(perfil).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.notificationService.success('Los cambios fueron aceptados y serán aplicados', 'Actualizado');
      }
    });
  }
}

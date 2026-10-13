import { Component, DestroyRef, inject, Input } from '@angular/core';
import { PerfilRef, SIN_PERFIL } from 'src/app/models/seguridad/seguridad-vm.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IHttpUsuarioPerfilService } from '../../../services/interfaces/httpUsuarioPerfil.interface';

interface Dato {
  label: string;
  valor: string;
  enlace?: string;
}

interface Seccion {
  titulo: string;
  icono: string;
  datos: Dato[];
}

type Perfil = Record<string, string | boolean | number | null | undefined>;

/** Texto si el campo tiene contenido. */
function texto(perfil: Perfil, campo: string): string {
  const valor = perfil[campo];
  return typeof valor === 'string' ? valor.trim() : typeof valor === 'number' ? String(valor) : '';
}

/** Pestaña Información: solo muestra lo que el usuario completó en /cuenta → Perfil. */
@Component({
  selector: 'app-profile-information',
  templateUrl: './profile-information.component.html',
  styleUrls: ['./profile-information.component.scss'],
})
export class ProfileInformationComponent {
  private usuarioPerfilService = inject(IHttpUsuarioPerfilService);
  private readonly destroyRef = inject(DestroyRef);

  private _user: PerfilRef = SIN_PERFIL;

  @Input() set user(value: PerfilRef | null) {
    this._user = value ?? SIN_PERFIL;
    this.secciones = [];
    this.cargado = false;
    if (this._user.id) {
      this.getPerfilInfo(this._user.id);
    }
  }

  get user(): PerfilRef {
    return this._user;
  }

  public secciones: Seccion[] = [];
  public cargado = false;

  private getPerfilInfo(usuarioId: number): void {
    this.usuarioPerfilService
      .getPerfilInfoByUserId(usuarioId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (perfil) => {
          this.secciones = perfil ? ProfileInformationComponent.armarSecciones(perfil as unknown as Perfil) : [];
          this.cargado = true;
        },
        error: () => (this.cargado = true),
      });
  }

  /** Agrupa los campos completados; una sección sin datos no se muestra. */
  static armarSecciones(perfil: Perfil): Seccion[] {
    const dato = (label: string, campo: string, sufijo = ''): Dato[] => {
      const valor = texto(perfil, campo);
      return valor ? [{ label, valor: valor + sufijo }] : [];
    };

    // Solo enlaces http(s): el campo es texto libre.
    const web = texto(perfil, 'website');
    const sitio: Dato[] = /^https?:\/\//i.test(web) ? [{ label: 'Sitio web', valor: web.replace(/^https?:\/\//i, ''), enlace: web }] : [];

    const busca = [
      perfil['like1'] && 'Hacer amigos',
      perfil['like2'] && 'Conocer gente con mis intereses',
      perfil['like3'] && 'Conocer gente para negocios',
      perfil['like4'] && 'Encontrar pareja',
      perfil['like_All'] && 'De todo',
    ].filter((x): x is string => !!x);

    const marcas = [perfil['tatuajes'] && 'Tatuajes', perfil['piercings'] && 'Piercings'].filter((x): x is string => !!x);

    const secciones: Seccion[] = [
      {
        titulo: 'Sobre mí',
        icono: 'ti-user',
        datos: [...sitio, ...dato('Estudios', 'estudios'), ...(busca.length ? [{ label: 'Le gustaría', valor: busca.join(', ') }] : [])],
      },
      {
        titulo: 'Trabajo',
        icono: 'ti-briefcase',
        datos: [
          ...dato('Profesión', 'profesion'),
          ...dato('Empresa', 'empresa'),
          ...dato('Sector', 'sector'),
          ...dato('Intereses profesionales', 'interesesProfesionales'),
          ...dato('Habilidades', 'habilidadesProfesionales'),
        ],
      },
      {
        titulo: 'Vida personal',
        icono: 'ti-home-heart',
        datos: [...dato('Estado civil', 'estadoCivil'), ...dato('Hijos', 'hijos'), ...dato('Vive con', 'vivoCon')],
      },
      {
        titulo: '¿Cómo es?',
        icono: 'ti-mood-smile',
        datos: [
          ...dato('Altura', 'altura', ' cm'),
          ...dato('Peso', 'peso', ' kg'),
          ...dato('Pelo', 'colorCabello'),
          ...dato('Ojos', 'colorOjos'),
          ...dato('Físico', 'complexion'),
          ...(marcas.length ? [{ label: 'Tiene', valor: marcas.join(' y ') }] : []),
        ],
      },
      {
        titulo: 'Hábitos',
        icono: 'ti-coffee',
        datos: [...dato('Dieta', 'dieta'), ...dato('Fuma', 'fumo'), ...dato('Alcohol', 'alcohol')],
      },
      {
        titulo: 'Favoritos',
        icono: 'ti-heart',
        datos: [
          ...dato('Intereses', 'misIntereses'),
          ...dato('Hobbies', 'hobbies'),
          ...dato('Series', 'seriesTV'),
          ...dato('Música', 'musicaFavorita'),
          ...dato('Deportes y equipos', 'deportesFavoritos'),
          ...dato('Libros', 'librosFavoritos'),
          ...dato('Películas', 'peliculasFavoritas'),
          ...dato('Comida', 'comidaFavorita'),
          ...dato('Sus héroes', 'misHeroesSon'),
        ],
      },
    ];

    return secciones.filter((s) => s.datos.length > 0);
  }
}

import { ProfileInformationComponent } from './profile-information.component';

describe('ProfileInformationComponent.armarSecciones', () => {
  it('perfil vacío: ninguna sección (antes mostraba "País: Pendiente" e idiomas inventados)', () => {
    const secciones = ProfileInformationComponent.armarSecciones({ tatuajes: false, piercings: false, like1: false });

    expect(secciones).toEqual([]);
  });

  it('solo muestra lo completado y lee "misIntereses" (antes buscaba "intereses", que no existe)', () => {
    const secciones = ProfileInformationComponent.armarSecciones({
      profesion: 'Diseñador',
      misIntereses: 'Fotografía',
      altura: '180',
      tatuajes: true,
      like1: true,
      like4: true,
    });

    expect(secciones.map((s) => s.titulo)).toEqual(['Sobre mí', 'Trabajo', '¿Cómo es?', 'Favoritos']);
    const datos = secciones.flatMap((s) => s.datos);
    expect(datos).toContain({ label: 'Intereses', valor: 'Fotografía' });
    expect(datos).toContain({ label: 'Altura', valor: '180 cm' });
    expect(datos).toContain({ label: 'Tiene', valor: 'Tatuajes' });
    expect(datos).toContain({ label: 'Le gustaría', valor: 'Hacer amigos, Encontrar pareja' });
  });

  it('el sitio web solo es enlace si es http(s)', () => {
    const web = (url: string) => ProfileInformationComponent.armarSecciones({ website: url }).flatMap((s) => s.datos);

    expect(web('https://mi.sitio/a')).toEqual([{ label: 'Sitio web', valor: 'mi.sitio/a', enlace: 'https://mi.sitio/a' }]);
    expect(web('javascript:alert(1)')).toEqual([]);
  });
});

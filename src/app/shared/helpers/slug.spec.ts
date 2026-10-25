import { slugUrl } from './slug';

// Mismos casos que SlugHelperTests del API: los dos tienen que dar exactamente lo mismo.
describe('slugUrl', () => {
  const casos: [string | null, string][] = [
    ['Iron Man (2008) | 2160p | REMUX | Dual', 'iron-man-2008-2160p-remux-dual'],
    ['Ranma ½ S3E4 | La ceremonia del té latino', 'ranma-s3e4-la-ceremonia-del-te-latino'],
    ['Se7en | 4K 10bit DV+HDR10 DTS-HD MA 5.1', 'se7en-4k-10bit-dv-hdr10-dts-hd-ma-5-1'],
    ['Resident Evil Afterlife [2010 | 1080p | HDR10]', 'resident-evil-afterlife-2010-1080p-hdr10'],
    ['Call of Duty®: Modern Warfare® 4', 'call-of-duty-modern-warfare-4'],
    ['🎬 Pedidos de series y películas: ¡dinos qué buscás!', 'pedidos-de-series-y-peliculas-dinos-que-buscas'],
    ['AÑO NUEVO, ¿Qué tal?', 'ano-nuevo-que-tal'],
    ['Pingüino Ünico', 'pinguino-unico'],
    ['ガンダム 2024', 'ガンダム-2024'],
    ['Привет мир', 'привет-мир'],
    ['🔥🔥🔥', 'sin-titulo'],
    ['', ''],
    [null, ''],
  ];

  for (const [titulo, esperado] of casos) {
    it(`"${titulo}" → "${esperado}"`, () => expect(slugUrl(titulo)).toBe(esperado));
  }

  it('corta un título largo en un guion, sin pasarse de 80', () => {
    const slug = slugUrl(Array(20).fill('palabra').join(' '));

    expect(slug.length).toBeLessThanOrEqual(80);
    expect(slug.endsWith('palabra')).toBeTrue();
    expect(slug).not.toContain('--');
  });
});

import { embedYoutube, enlaceYoutube, videoYoutube } from './youtube';

describe('youtube', () => {
  const ID = 'dQw4w9WgXcQ';

  it('reconoce los formatos de enlace de YouTube', () => {
    [
      `https://www.youtube.com/watch?v=${ID}`,
      `https://m.youtube.com/watch?feature=share&v=${ID}`,
      `youtube.com/watch?v=${ID}`,
      `https://youtu.be/${ID}`,
      `https://www.youtube.com/shorts/${ID}`,
      `https://www.youtube.com/live/${ID}?si=abc`,
      `https://www.youtube.com/embed/${ID}`,
      `https://www.youtube-nocookie.com/embed/${ID}`,
      `https://music.youtube.com/watch?v=${ID}&list=RD`,
    ].forEach((url) => expect(videoYoutube(url)?.id).withContext(url).toBe(ID));
  });

  it('descarta lo que no es un video de YouTube', () => {
    [
      '',
      'hola mundo',
      `mira https://youtu.be/${ID}`,
      'https://www.youtube.com/@canal',
      'https://www.youtube.com/watch?v=corto',
      `https://youtube.com.evil.com/watch?v=${ID}`,
      `https://vimeo.com/${ID}`,
    ].forEach((url) => expect(videoYoutube(url)).withContext(url).toBeNull());
  });

  it('lee el segundo de inicio', () => {
    expect(videoYoutube(`https://youtu.be/${ID}?t=90`)!.inicio).toBe(90);
    expect(videoYoutube(`https://www.youtube.com/watch?v=${ID}&t=1m30s`)!.inicio).toBe(90);
    expect(videoYoutube(`https://www.youtube.com/embed/${ID}?start=15`)!.inicio).toBe(15);
    expect(videoYoutube(`https://youtu.be/${ID}?t=raro`)!.inicio).toBe(0);
  });

  it('arma el enlace y el reproductor', () => {
    expect(enlaceYoutube({ id: ID, inicio: 0 })).toBe(`https://www.youtube.com/watch?v=${ID}`);
    expect(embedYoutube({ id: ID, inicio: 5 }, true)).toBe(`https://www.youtube-nocookie.com/embed/${ID}?autoplay=1&start=5`);
  });
});

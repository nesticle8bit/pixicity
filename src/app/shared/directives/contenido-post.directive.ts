import { afterRenderEffect, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';
import { idUnico, LENGUAJES_CODIGO, slugTitulo } from '../helpers/contenido-post';
import { CLASE_VIDEO_YOUTUBE, embedYoutube, videoYoutube } from '../helpers/youtube';

type HLJSApi = typeof import('highlight.js').default;

// highlight.js se carga solo cuando el post tiene código, y con un subconjunto de lenguajes (no el paquete completo).
let hljsCargado: Promise<HLJSApi> | null = null;
function cargarHljs(): Promise<HLJSApi> {
  hljsCargado ??= (async () => {
    const hljs = (await import('highlight.js/lib/core')).default;
    const langs = await Promise.all([
      import('highlight.js/lib/languages/bash'),
      import('highlight.js/lib/languages/powershell'),
      import('highlight.js/lib/languages/dockerfile'),
      import('highlight.js/lib/languages/yaml'),
      import('highlight.js/lib/languages/json'),
      import('highlight.js/lib/languages/xml'),
      import('highlight.js/lib/languages/css'),
      import('highlight.js/lib/languages/javascript'),
      import('highlight.js/lib/languages/typescript'),
      import('highlight.js/lib/languages/python'),
      import('highlight.js/lib/languages/csharp'),
      import('highlight.js/lib/languages/java'),
      import('highlight.js/lib/languages/php'),
      import('highlight.js/lib/languages/sql'),
      import('highlight.js/lib/languages/cpp'),
      import('highlight.js/lib/languages/go'),
      import('highlight.js/lib/languages/rust'),
      import('highlight.js/lib/languages/ini'),
      import('highlight.js/lib/languages/nginx'),
      import('highlight.js/lib/languages/plaintext'),
    ]);
    LENGUAJES_CODIGO.forEach((l, i) => hljs.registerLanguage(l.id, langs[i].default));
    return hljs;
  })();
  return hljsCargado;
}

/**
 * Mejora el HTML de un post ya pintado (solo en el navegador; en el SSR no corre):
 * - bloques de código con colores por lenguaje y botón "Copiar"
 * - ids en los H2/H3 para el índice (ver `indiceDeContenido`)
 * - imágenes que se amplían al hacer clic
 * - videos de YouTube (miniatura enlazada) que se cambian por el reproductor al hacer clic
 *
 *   <div class="contenido" [appContenidoPost]="post.contenido">…[innerHTML]…</div>
 */
@Directive({ selector: '[appContenidoPost]' })
export class ContenidoPostDirective {
  /** El HTML que se pinta dentro: cada vez que cambia se vuelve a procesar. */
  readonly appContenidoPost = input<string | null | undefined>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private visor: HTMLElement | null = null;

  constructor() {
    afterRenderEffect(() => {
      this.appContenidoPost();
      this.asignarIds();
      void this.mejorarCodigo();
    });

    this.host.addEventListener('click', this.alHacerClic);
    inject(DestroyRef).onDestroy(() => {
      this.host.removeEventListener('click', this.alHacerClic);
      this.cerrarVisor();
    });
  }

  private asignarIds(): void {
    const usados = new Map<string, number>();
    this.host.querySelectorAll<HTMLElement>('h2, h3').forEach((h) => {
      const texto = (h.textContent || '').replace(/\s+/g, ' ').trim();
      if (texto) h.id = idUnico(slugTitulo(texto), usados);
    });
  }

  private async mejorarCodigo(): Promise<void> {
    const bloques = Array.from(this.host.querySelectorAll<HTMLElement>('pre')).filter((pre) => !pre.dataset['listo']);
    if (!bloques.length) return;

    bloques.forEach((pre) => {
      pre.dataset['listo'] = '1';
      // innerText respeta los <br> que deja el editor como saltos de línea
      const codigo = pre.innerText.replace(/\n$/, '');
      pre.textContent = codigo;
      pre.dataset['codigo'] = codigo;
      pre.appendChild(this.botonCopiar(pre));
    });

    let hljs: HLJSApi;
    try {
      hljs = await cargarHljs();
    } catch {
      return; // sin colores, el código se sigue viendo y copiando
    }
    const ids = LENGUAJES_CODIGO.map((l) => l.id).filter((id) => id !== 'plaintext');
    bloques.forEach((pre) => {
      if (!pre.isConnected) return;
      const codigo = pre.dataset['codigo'] || '';
      const elegido = Array.from(pre.classList).find((c) => c.startsWith('language-'))?.slice('language-'.length);
      if (elegido === 'plaintext') return;
      const resultado = elegido && hljs.getLanguage(elegido)
        ? hljs.highlight(codigo, { language: elegido, ignoreIllegals: true })
        : hljs.highlightAuto(codigo, ids);
      // Detección automática poco segura: mejor sin colores que con colores equivocados
      if (!elegido && resultado.relevance < 5) return;

      const boton = pre.querySelector('.code-copy');
      const code = document.createElement('code');
      code.className = 'hljs';
      code.innerHTML = resultado.value; // highlight.js escapa el texto
      pre.textContent = '';
      pre.append(code);
      if (boton) pre.append(boton);
      const lenguaje = elegido || resultado.language;
      const nombre = LENGUAJES_CODIGO.find((l) => l.id === lenguaje)?.nombre;
      if (nombre) pre.dataset['etiqueta'] = nombre; // se muestra en lugar de "Código
    });
  }

  private botonCopiar(pre: HTMLElement): HTMLButtonElement {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'code-copy';
    boton.setAttribute('aria-label', 'Copiar código');
    boton.innerHTML = '<i class="ti ti-copy" aria-hidden="true"></i><span>Copiar</span>';
    boton.addEventListener('click', async (e) => {
      e.stopPropagation();
      const texto = boton.querySelector('span')!;
      try {
        await navigator.clipboard.writeText(pre.dataset['codigo'] || '');
        texto.textContent = '¡Copiado!';
        boton.classList.add('is-ok');
      } catch {
        texto.textContent = 'No se pudo copiar';
      }
      setTimeout(() => {
        texto.textContent = 'Copiar';
        boton.classList.remove('is-ok');
      }, 1800);
    });
    return boton;
  }

  //  Visor de imágenes

  private readonly alHacerClic = (event: MouseEvent): void => {
    const video = event.target instanceof Element ? event.target.closest<HTMLElement>(`figure.${CLASE_VIDEO_YOUTUBE}`) : null;
    // Ctrl/Cmd+clic sigue abriendo el video en YouTube
    if (video && !event.ctrlKey && !event.metaKey && this.host.contains(video) && this.reproducir(video)) {
      event.preventDefault();
      return;
    }
    const img = event.target instanceof HTMLImageElement ? event.target : null;
    // Las imágenes que son enlaces siguen su enlace; los íconos chicos no se amplían
    if (!img || img.closest('a') || img.naturalWidth < 120) return;
    event.preventDefault();
    this.abrirVisor(img);
  };

  // Hasta el clic solo se descarga la miniatura: el reproductor de YouTube pesa cientos de KB por video
  private reproducir(figura: HTMLElement): boolean {
    const enlace = figura.querySelector('a');
    const video = videoYoutube(enlace?.getAttribute('href'));
    if (!enlace || !video) return false;
    const iframe = document.createElement('iframe');
    iframe.src = embedYoutube(video, true);
    iframe.title = 'Video de YouTube';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    enlace.replaceWith(iframe);
    figura.classList.add('is-reproduciendo');
    return true;
  }

  private readonly alPresionarTecla = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this.cerrarVisor();
  };

  private abrirVisor(img: HTMLImageElement): void {
    this.cerrarVisor();
    const visor = document.createElement('div');
    visor.className = 'img-visor';
    visor.setAttribute('role', 'dialog');
    visor.setAttribute('aria-modal', 'true');
    visor.setAttribute('aria-label', 'Imagen ampliada');

    const grande = document.createElement('img');
    grande.src = img.currentSrc || img.src;
    grande.alt = img.alt;

    const cerrar = document.createElement('button');
    cerrar.type = 'button';
    cerrar.className = 'img-visor__cerrar';
    cerrar.setAttribute('aria-label', 'Cerrar');
    cerrar.innerHTML = '<i class="ti ti-x" aria-hidden="true"></i>';

    const pie = img.closest('figure')?.querySelector('figcaption')?.textContent?.trim();
    visor.append(grande);
    if (pie) {
      const texto = document.createElement('p');
      texto.className = 'img-visor__pie';
      texto.textContent = pie;
      visor.append(texto);
    }
    visor.append(cerrar);
    visor.addEventListener('click', () => this.cerrarVisor());

    document.body.append(visor);
    document.addEventListener('keydown', this.alPresionarTecla);
    this.visor = visor;
    cerrar.focus();
  }

  private cerrarVisor(): void {
    if (!this.visor) return;
    this.visor.remove();
    this.visor = null;
    document.removeEventListener('keydown', this.alPresionarTecla);
  }
}

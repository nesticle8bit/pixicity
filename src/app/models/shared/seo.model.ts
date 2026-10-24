export class SEOModel {
  title: string;
  description: string;
  type: string;
  imageURL: string;
  tags: string[];
  canonical?: string;
  /** JSON-LD (schema.org) especifico de la pagina. */
  jsonLd?: Record<string, unknown>;
  /** true => noindex,follow (paginas sin valor para buscadores). */
  noIndex?: boolean;
  /** Status HTTP que debe reportar el prerender (404 en paginas inexistentes). */
  statusCode?: number;
  /** Metadatos Open Graph de articulo (solo si type === 'article'). */
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;

  constructor(
    title: string,
    description: string,
    type: string,
    imageURL: string,
    tags: string[],
    canonical?: string,
    jsonLd?: Record<string, unknown>,
    noIndex?: boolean,
    statusCode?: number
  ) {
    this.title = title;
    this.description = description;
    this.type = type;
    this.imageURL = imageURL;
    this.tags = tags;
    this.canonical = canonical;
    this.jsonLd = jsonLd;
    this.noIndex = noIndex;
    this.statusCode = statusCode;
  }
}

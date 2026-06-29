export class SEOModel {
  title: string;
  description: string;
  type: string;
  imageURL: string;
  tags: string[];
  canonical?: string;

  constructor(
    title: string,
    description: string,
    type: string,
    imageURL: string,
    tags: string[],
    canonical?: string
  ) {
    this.title = title;
    this.description = description;
    this.type = type;
    this.imageURL = imageURL;
    this.tags = tags;
    this.canonical = canonical;
  }
}

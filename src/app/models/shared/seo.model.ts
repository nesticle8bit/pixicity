export class SEOModel {
  title: string;
  description: string;
  type: string;
  imageURL: string;
  tags: string[];

  constructor(
    title: string,
    description: string,
    type: string,
    imageURL: string,
    tags: string[]
  ) {
    this.title = title;
    this.description = description;
    this.type = type;
    this.imageURL = imageURL;
    this.tags = tags;
  }
}

/** Object representing hyperlink data */
export class Hyperlink$v1 {
  /** Title of the link */
  text?: string;

  /** Attached link */
  href?: string;

  constructor(params: Hyperlink$v1 = {} as Hyperlink$v1) {
    const {
      text: name = null,
      href: url = null
    } = params;

    this.text = name;
    this.href = url;
  }
}

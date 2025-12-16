export class PollAlternative {
  constructor(
    private id: string,
    private text: string,
    private imageUrl?: string | null
  ) { }

  getId(): string {
    return this.id;
  }

  getText(): string {
    return this.text;
  }

  getImageUrl(): string | null | undefined {
    return this.imageUrl;
  }
}


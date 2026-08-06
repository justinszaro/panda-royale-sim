export default class Die {
  sides: number;
  value: number | null;
  readonly id: string;
  isGlittery: boolean = false;
  static color?: string;

  constructor(faces: number) {
    this.sides = faces;
    this.value = null;
    this.id = Die.generateId();
  }

  private static generateId(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }

    return `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
  }

  public roll(): number {
    this.value = Math.floor(Math.random() * this.sides) + 1;
    return this.value;
  }

  public get color(): string | undefined {
    return (this.constructor as typeof Die).color;
  }
}

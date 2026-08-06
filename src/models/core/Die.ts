import { generateId } from "./utils";

export default class Die {
  sides: number;
  value: number | null;
  readonly id: string;
  isGlittery: boolean = false;
  static color?: string;

  constructor(faces: number) {
    this.sides = faces;
    this.value = null;
    this.id = generateId();
  }

  public roll(): number {
    this.value = Math.floor(Math.random() * this.sides) + 1;
    return this.value;
  }

  public get color(): string | undefined {
    return (this.constructor as typeof Die).color;
  }
}

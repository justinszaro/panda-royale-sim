import { generateId } from "./utils";

/**
 * Base class for all dice in the game.
 *
 * Concrete die types extend this class to add color semantics, special rolling
 * behaviour, or additional properties (e.g. glitter, tradability).
 */
export default class Die {
  /** Number of faces on the die. */
  sides: number;

  /** Most recently rolled value, or `null` if the die has not been rolled yet. */
  value: number | null;

  /** Stable, unique identifier for this die instance. */
  readonly id: string;

  /** Whether the die has a glittery finish (used by some scoring rules). */
  isGlittery: boolean = false;

  /** Display colour associated with this die type. Defined on subclasses. */
  static color?: string;

  /**
   * @param faces - Number of faces (sides) the die should have.
   */
  constructor(faces: number) {
    this.sides = faces;
    this.value = null;
    this.id = generateId();
  }

  /**
   * Rolls the die and records the result.
   *
   * @returns The rolled value in the range `[1, sides]`.
   */
  public roll(): number {
    this.value = Math.floor(Math.random() * this.sides) + 1;
    return this.value;
  }

  /**
   * Returns the colour string declared on the concrete subclass, or `undefined`
   * for the base `Die` class which has no colour.
   */
  public get color(): string | undefined {
    return (this.constructor as typeof Die).color;
  }
}

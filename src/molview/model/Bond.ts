import { MolViewColorMode } from "../MolView";
import type { IMolRenderer } from "../renderer/IMolRenderer";
import type { Atom } from "./Atom";
import { RenderableObject } from "./RenderableObject";

export interface BondInitializer {
  id: string;
  t: number;
  a1: Atom;
  a2: Atom;
}

export interface BondConfiguration {
  estimateBondTypes: boolean;
  colorMode: MolViewColorMode;
}

/**
 * Renderable Bond
 */
export class Bond extends RenderableObject {
  color: string;
  type: number;

  constructor(init: BondInitializer, config: BondConfiguration) {
    super();
    this._atoms = [init.a1, init.a2];
    this.id = init.id;

    this._atoms[0].addBond(this);

    this._atoms[1].addBond(this);
    this.calculateLength();
    // Optionally use a heuristic to determine which type of bond to display (info not in official PDB spec)
    this.type = config.estimateBondTypes ? this.estimatedBondType() : init.t;
    // color for the type of bond
    this.setColorMode(config.colorMode);
  }

  private _atoms: Atom[];

  public get atoms(): Atom[] {
    return this._atoms.slice();
  }

  private _length: number;

  public get length(): number {
    return this._length;
  }

  public estimatedBondType(): number {
    const single: number = this._atoms[0].elementData.singleBondRadius + this._atoms[1].elementData.singleBondRadius;
    const double: number = this._atoms[0].elementData.doubleBondRadius + this._atoms[1].elementData.doubleBondRadius;
    const triple: number = this._atoms[0].elementData.tripleBondRadius + this._atoms[1].elementData.tripleBondRadius;

    const compares = [single, double, triple].map((v) => Math.abs(v - this.length));
    // find index of minimum comparison difference
    const minIndex = compares.reduce((iMin, x, i, arr) => (x < arr[iMin] ? i : iMin), 0);
    return 1 + minIndex;
  }

  public render(renderer: IMolRenderer): void {
    super.render(renderer);
    renderer.addRenderableObject(this);
  }

  public setColorMode(mode: MolViewColorMode): void {
    if (!this.type) {
      throw new Error("bond type is undefined");
    }

    switch (mode) {
      case "cpk": // i.e. "element color"
        this.color = ["0000FF", "8822FF", "2299FF"][this.type - 1];
        break;

      case "amino_acid":
        // TODO
        break;
    }
  }

  /**
   * Calculates distance between
   */
  private calculateLength(): void {
    this.loc = this._atoms[0].loc.clone();
    this.loc.add(this._atoms[1].loc);
    this.loc.multiplyScalar(0.5);
    this._length = 100 * this._atoms[0].loc.distanceTo(this._atoms[1].loc);
  }
}

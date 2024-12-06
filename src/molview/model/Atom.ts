import { Vector3 } from "three";
import { AminoAcidData } from "../AminoAcidData";
import { ElementData } from "../ElementData";
import type { IMolRenderer } from "../renderer/IMolRenderer";
import type { Bond } from "./Bond";
import { RenderableObject } from "./RenderableObject";
import { MolViewAtomRadiusMode, MolViewColorMode } from "../MolView";

export interface AtomInitializer {
  altLoc: number;
  chainId: number;
  charge: number;
  color?: number;
  element2: string;
  element: string;
  iCode: string;
  id: string;
  occupancy: string;
  resName: string;
  resSeq: string;
  segId: number;
  serial: number;
  tempFactor: number;
  x: number;
  y: number;
  z: number;
}

export interface AtomConfiguration {
  colorMode: MolViewColorMode;
  radiusMode: MolViewAtomRadiusMode;
  radiusScale: number;
}

/**
 * Renderable Atom
 */
export class Atom extends RenderableObject {
  readonly elementData: ElementData;
  radius: number;
  color: number;
  name: string;
  element: string; // first chars of elemName
  element2: string;

  private altLoc: number;
  private tempFactor: number;
  private serial: number;
  private chainID: number;
  private segID: number;
  private charge: number;
  private resName: string;
  private resSeq: string;
  private iCode: string;
  private occupancy: string;

  constructor(init: AtomInitializer, config: AtomConfiguration) {
    super();
    this.elementData = ElementData.getData(init.element);
    if (!this.elementData) {
      // unsupported ATOM record
      console.warn("bad ATOM symbol: " + init.element);
      return;
    }

    this.element = init.element;
    this.id = init.id;
    this.altLoc = init.altLoc;
    this.resName = init.resName;
    this.chainID = init.chainId;
    this.resSeq = init.resSeq;
    this.iCode = init.iCode;
    this.occupancy = init.occupancy;
    this.tempFactor = init.tempFactor;
    this.segID = init.segId;
    this.element2 = init.element2;
    this.charge = init.charge;
    this.name = this.elementData.name;
    this.color = init.color || this.elementData.color;

    const radiusScale: number = config.radiusScale;
    const hRadius = ElementData.getData("H").radius;

    switch (config.radiusMode) {
      case "accurate":
        this.radius = radiusScale * this.elementData.radius;
        break;
      case "reduced":
        this.radius =
          radiusScale *
          (config.radiusScale * this.elementData.radius +
            (1 - config.radiusScale) * hRadius);
        break;
      case "uniform":
      default:
        this.radius = radiusScale * hRadius;
    }

    this.setColorMode(config.colorMode);

    this.charge = 0;
    this._bonds = [];
  }

  private _bonds: Bond[];

  /**
   * All bonds connected to this Atom (read-only)
   * @returns {Bond[]}
   */
  public get bonds(): Bond[] {
    return this._bonds.slice();
  }

  /**
   * Set the location in 3D space for this Atom
   * @param x
   * @param y
   * @param z
   */
  public setLocation(x: number, y: number, z: number): void {
    this.loc = new Vector3(x, y, z);
  }

  public addBond(bond: Bond): void {
    this._bonds.push(bond);
  }

  public render(renderer: IMolRenderer): void {
    super.render(renderer);
    renderer.addRenderableObject(this);
  }

  public setColorMode(colorMode: MolViewColorMode): void {
    switch (colorMode) {
      case "cpk": // i.e. "element color"
        this.color = this.elementData.color || ElementData.getData("C").color;
        break;

      case "amino_acid": {
        const aaData = AminoAcidData.getData(this.resName).color;
        this.color = aaData ? aaData : 0xcccccc;
        break;
      }
    }
  }
}

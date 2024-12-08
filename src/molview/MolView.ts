import { Vector3 } from "three";
import { Messages } from "./Messages";
import { PDBParser } from "./PDBParser";
import { Utility } from "./Utility";
import { Atom } from "./model/Atom";
import type { Molecule } from "./model/Molecule";
import type { RenderableObject } from "./model/RenderableObject";
import type { IMolRenderer } from "./renderer/IMolRenderer";
import { ThreeJsRenderer } from "./renderer/ThreeJsRenderer";

/**
 * String constants for MolView
 */
export type MolViewAtomRadiusMode = "accurate" | "reduced" | "uniform";
export type MolViewColorMode = "cpk" | "amino_acid";
export type MolViewSelectionMode = "none" | "identify" | "distance" | "rotation" | "torsion";
export type MolViewRenderMode = "ball_and_stick" | "space_fill" | "sticks";

export class MolViewConstants {
  public static readonly ATOM_RADIUS_REDUCED_SCALE = 0.25;
}

/**
 * Information returned to client on selection
 */
export interface ContextInfo {
  atoms: Atom[];
  message?: string;
  distance?: number;
  rotationAngle?: number;
  torsionAngle?: number;
}

/**
 * Global configuration for MolView
 */
export interface Configuration {
  colorMode: MolViewColorMode;
  renderMode: MolViewRenderMode;
  selectionMode: MolViewSelectionMode;
  atomRadiusMode: MolViewAtomRadiusMode;
  atomRadiusScale: number;
  rotationVertical: number;
  rotationHorizontal: number;
  zoom: number;
  selectable: boolean;
  autoCenter: boolean;
  estimateBondTypes: boolean;
  pdbUrl: string | undefined;
  pdbData: string | undefined;
  domElement: string; // DOM element id to attach molecule renderer
  onInfoUpdated: ((info: ContextInfo) => void);
}

export const defaultConfiguration: Configuration = {
  colorMode: "cpk",
  renderMode: "ball_and_stick",
  selectionMode: "none",
  atomRadiusMode: "reduced",
  atomRadiusScale: 1.0,
  selectable: true,
  zoom: 1.0,
  rotationVertical: 0,
  rotationHorizontal: 0,
  autoCenter: true,
  pdbUrl: undefined,
  pdbData: undefined,
  domElement: "wglContent",
  estimateBondTypes: true,
  onInfoUpdated: () => { }
}

/**
 * MolView - a simple 3D molecule viewer.
 * For instructions, please read README.md
 */
export class MolView {
  private selections: Atom[];
  private molecule: Molecule | undefined;
  private renderer: IMolRenderer;
  private initialized: boolean = false;
  private config: Configuration
  private nativeElement: HTMLElement;

  constructor(params: Partial<Configuration>) {

    this.config = Object.assign({}, defaultConfiguration, params);

    // get the DOM element to which we should attach the renderer & info display
    this.nativeElement = Utility.getElement(this.config.domElement)!;

    this.renderer = new ThreeJsRenderer();

    this.selections = [];

    // load the molecule from the init settings
    if (this.config.pdbUrl) {
      this.loadPDB(this.config.pdbUrl);
    } else if (this.config.pdbData) {
      this.setPDBData(this.config.pdbData);
    }
  }

  init() {
    if (this.nativeElement) {
      if (!this.initialized) {
        console.debug("Initializing renderer");
        this.renderer.init(this.nativeElement, this.config);
        this.nativeElement.onclick = (event) => {
          console.log("click event", event);
          this.handleSelect(event);
        }
        this.initialized = true;
      } else {
        console.debug("Resetting renderer");
        this.renderer.reset();
      }
    }
  }

  loadPDB(pdbUrl: string): void {
    if (!pdbUrl) {
      console.warn("empty 3D molecule name");
    }
    fetch(pdbUrl)
      .then(response => response.text())
      .then(data => {
        this.config.pdbData = data;
        this.setPDBData(data);
      })
      .catch(error => console.error("Failed to load PDB data:", error));
  }

  setRenderMode(mode: MolViewRenderMode): void {
    this.config.renderMode = mode;
    this.clearSelections();
    // rebuild and redraw the molecule
    this.renderer.reset();
    this.molecule?.render(this.renderer);
  }

  setSelectionMode(mode: MolViewSelectionMode): void {
    this.config.selectionMode = mode;
    this.clearSelections();
    this.updateInfo();
    // redraw the molecule (without rebuilding)
    this.renderer.render();
  }

  setPDBData(pdbData: string): void {
    this.molecule = PDBParser.parsePDB(pdbData, this.config);

    console.debug("Molecule loaded:", this.molecule);

    this.clearDisplay();
    this.init();

    if (this.config.autoCenter) {
      this.molecule.center();
    }

    // render the molecule as 3d items
    this.molecule.render(this.renderer);

    // draw the molecule on screen
    this.renderer.render();
  }

  private handleSelect(event: MouseEvent): void {
    if (!this.molecule || !this.config.selectable) {
      console.info("Molecule not loaded or not selectable");
      return;
    }

    const selObj: RenderableObject = this.renderer.getSelectedObject(event)!;
    if (!(selObj instanceof Atom)) {
      return;
    }

    const index: number = this.selections.indexOf(selObj);

    if (index > -1) {
      // already selected so deselect	if possible
      if (index === 0) {
        this.renderer.deselect(selObj);
        if (this.selections.length >= 2) {
          const bondBetween = this.molecule.getBondBetween(selObj, this.selections[1]);
          if (bondBetween) {
            this.renderer.deselect(bondBetween);
          }
        }
        this.selections.shift();
      } else if (index === this.selections.length - 1) {
        this.renderer.deselect(selObj);
        if (this.selections.length >= 2) {
          const bondBetween = this.molecule.getBondBetween(selObj, this.selections[this.selections.length - 2]);
          if (bondBetween) {
            this.renderer.deselect(bondBetween);
          }
        }
        this.selections.pop();
      }
      this.updateInfo();
      this.renderer.render();
      return;
    }

    if (this.config.selectionMode === "identify" && this.selections.length >= 1) {
      // clear current but allow a different selection
      this.clearSelections();
    }

    if (
      (this.config.selectionMode === "distance" && this.selections.length >= 2) ||
      (this.config.selectionMode === "rotation" && this.selections.length >= 3) ||
      (this.config.selectionMode === "torsion" && this.selections.length >= 4)
    ) {
      // too many selected for current mode
      return;
    }

    if (
      this.selections.length > 0 &&
      (this.config.selectionMode === "rotation" ||
        this.config.selectionMode === "torsion")
    ) {
      // check that requested selected atom is neighbor of existing selection before growing selection
      const neighbors: RenderableObject[] = this.molecule.getNeighbors(selObj);

      if (neighbors.indexOf(this.selections[0]) > -1) {
        // neighbor of first selection
        this.renderer.select(selObj);
        const bondBetween = this.molecule.getBondBetween(selObj, this.selections[0]);
        if (bondBetween) {
          // put a visual selection on the bond
          this.renderer.select(bondBetween);
          // add to beginning selected atoms
          this.selections.unshift(selObj);
        }
      } else if (neighbors.indexOf(this.selections[this.selections.length - 1]) > -1) {
        // neighbor of last selection
        this.renderer.select(selObj);
        const bondBetween = this.molecule.getBondBetween(selObj, this.selections[this.selections.length - 1]);
        if (bondBetween) {
          // put a visual selection on the bond
          this.renderer.select(bondBetween);
          // add to end of selected atoms
          this.selections.push(selObj);
        }
      }
    } else {
      // no restrictions in other modes so just add the selection
      this.renderer.select(selObj);
      this.selections.push(selObj);
    }
    this.updateInfo();
    this.renderer.render();
  }

  private clearSelections(): void {
    this.renderer.deselectAll();
    this.selections = [];
  }

  private updateInfo(): void {
    switch (this.config.selectionMode) {
      case "identify":
        this.displayIdentify();
        break;
      case "distance":
        this.displayDistance();
        break;
      case "rotation":
        this.displayRotation();
        break;
      case "torsion":
        this.displayTorsion();
        break;
    }
  }

  private displayIdentify(): void {
    if (this.selections.length < 1) {
      this.config.onInfoUpdated({ atoms: [...this.selections], message: Messages.INSTRUCT_IDENTIFY });
      return;
    }
    const a: Atom = this.selections[0];
    const text: string = `${a.name} (${a.element})`;

    this.config.onInfoUpdated({ atoms: [...this.selections], message: text });
  }

  private displayDistance(): void {
    if (this.selections.length < 2) {
      this.config.onInfoUpdated({ atoms: [...this.selections], message: Messages.INSTRUCT_DISTANCE });
      return;
    }
    const d: number = this.selections[0].loc.distanceTo(this.selections[1].loc);
    const text: string = `${d.toFixed(4)} nm
${this.selections[0].element} - ${this.selections[1].element}`;

    this.config.onInfoUpdated({ atoms: this.selections.slice(0, 2), message: text, distance: d });
  }

  private displayRotation(): void {
    if (this.selections.length < 3) {
      this.config.onInfoUpdated({ atoms: [...this.selections], message: Messages.INSTRUCT_ROTATION });
      return;
    }
    const v: Vector3 = new Vector3().subVectors(this.selections[0].loc, this.selections[1].loc);
    const w: Vector3 = new Vector3().subVectors(this.selections[2].loc, this.selections[1].loc);
    const ang: number = Utility.r2d(v.angleTo(w));

    if (ang === null || Number.isNaN(ang)) {
      this.config.onInfoUpdated({
        atoms: [...this.selections],
        message: "Invalid atoms selected. Please select a chain of 3 atoms.",
      });
      return;
    }

    const text: string =
      `${ang.toFixed(4)} degrees
${this.selections[0].element} - ${this.selections[1].element} - ${this.selections[2].element}`;

    this.config.onInfoUpdated({ atoms: this.selections.slice(0, 3), message: text, rotationAngle: ang });
  }

  private displayTorsion(): void {
    if (this.selections.length < 4) {
      this.config.onInfoUpdated({ atoms: [...this.selections], message: Messages.INSTRUCT_TORSION });
      return;
    }
    const u: Vector3 = new Vector3().subVectors(this.selections[1].loc, this.selections[0].loc);
    const v: Vector3 = new Vector3().subVectors(this.selections[2].loc, this.selections[1].loc);
    const w: Vector3 = new Vector3().subVectors(this.selections[3].loc, this.selections[2].loc);
    const uXv: Vector3 = u.cross(v);
    const vXw: Vector3 = v.cross(w);
    const ang: number = uXv && vXw ? Utility.r2d(uXv.angleTo(vXw)) : Number.NaN;
    if (ang === null || Number.isNaN(ang)) {
      this.config.onInfoUpdated({
        atoms: [...this.selections],
        message: "Invalid atoms selected. Please select a chain of 4 atoms.",
      });
      return;
    }

    const text: string =
      `${ang.toFixed(4)} degrees
${this.selections[0].element} - ${this.selections[1].element} - ${this.selections[2].element} - ${this.selections[3].element}`;

    this.config.onInfoUpdated({ atoms: this.selections.slice(0, 4), message: text, torsionAngle: ang });
  }

  private clearDisplay(): void {
    this.config.onInfoUpdated({ atoms: [] });
  }
}

export default MolView;
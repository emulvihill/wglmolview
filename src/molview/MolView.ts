import {Vector3} from "three";
import {Configuration} from "./Configuration";
import {Constants} from "./Constants";
import {Messages} from "./Messages";
import {PDBParser} from "./PDBParser";
import {Utility} from "./Utility";
import {Atom} from "./model/Atom";
import type {Molecule} from "./model/Molecule";
import type {RenderableObject} from "./model/RenderableObject";
import type {IMolRenderer} from "./renderer/IMolRenderer";
import {ThreeJsRenderer} from "./renderer/ThreeJsRenderer";

export interface ContextInfo {
  atoms: Atom[];
  message?: string;
  distance?: number;
  rotationAngle?: number;
  torsionAngle?: number;
}

export interface ConstructorParams {
  pdbUrl?: string;
  pdbData?: string;
  domElement?: string;
  onInfoUpdated?: (info: ContextInfo) => void;
}

export type MolViewRenderMode = "ball_and_stick" | "space_fill" | "sticks";

export type MolViewSelectionMode = "identify" | "distance" | "rotation" | "torsion";

/**
 * MolView - a simple 3D molecule viewer.
 * For instructions, please read README.md
 */
export class MolView {
  private selections: Atom[];
  private molecule: Molecule | undefined;
  private renderer: IMolRenderer;
  private domElement: HTMLElement;
  private initialized: boolean = false;
  private onInfoUpdated: (info: ContextInfo) => void;

  constructor(params: ConstructorParams) {
    // get the DOM element to which we should attach the renderer & info display
    this.domElement = Utility.getElement(params.domElement || Configuration.domElement)!;
    this.onInfoUpdated = params.onInfoUpdated;

    this.renderer = new ThreeJsRenderer();

    this.selections = [];

    // load the molecule from the init settings
    if (params.pdbUrl) {
      this.loadPDB(params.pdbUrl);
    } else if (params.pdbData) {
      Configuration.pdbData = params.pdbData;
      this.setPDBData(params.pdbData);
    }
  }

  init() {
    if (this.domElement) {
      if (!this.initialized) {
        console.log("Initializing renderer");
        this.renderer.init(this.domElement);
        this.domElement.onclick = (event) => this.handleSelect(event);
        this.initialized = true;
      } else {
        console.log("Resetting renderer");
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
        Configuration.pdbData = data;
        this.setPDBData(data);
      })
      .catch(error => console.error("Failed to load PDB data:", error));
  }

  setRenderMode(mode: MolViewRenderMode): void {
    Configuration.renderMode = mode;
    this.clearSelections();
    // rebuild and redraw the molecule
    this.renderer.reset();
    this.molecule?.render(this.renderer);
  }

  setSelectionMode(mode: MolViewSelectionMode): void {
    Configuration.selectionMode = mode;
    this.clearSelections();
    this.updateInfo();
    // redraw the molecule (without rebuilding)
    this.renderer.render();
  }

  setPDBData(pdbData: string): void {
    this.molecule = PDBParser.parsePDB(pdbData);

    this.clearDisplay();
    this.init();

    if (Configuration.autoCenter) {
      this.molecule.center();
    }

    // render the molecule as 3d items
    this.molecule.render(this.renderer);

    // draw the molecule on screen
    this.renderer.render();
  }

  private handleSelect(event: MouseEvent): void {
    if (!this.molecule || !Configuration.selectable) {
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

    if (Configuration.selectionMode === Constants.SELECTIONMODE_IDENTIFY && this.selections.length >= 1) {
      // clear current but allow a different selection
      this.clearSelections();
    }

    if (
      (Configuration.selectionMode === Constants.SELECTIONMODE_DISTANCE && this.selections.length >= 2) ||
      (Configuration.selectionMode === Constants.SELECTIONMODE_ROTATION && this.selections.length >= 3) ||
      (Configuration.selectionMode === Constants.SELECTIONMODE_TORSION && this.selections.length >= 4)
    ) {
      // too many selected for current mode
      return;
    }

    if (
      this.selections.length > 0 &&
      (Configuration.selectionMode === Constants.SELECTIONMODE_ROTATION ||
        Configuration.selectionMode === Constants.SELECTIONMODE_TORSION)
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
    switch (Configuration.selectionMode) {
      case Constants.SELECTIONMODE_IDENTIFY:
        this.displayIdentify();
        break;
      case Constants.SELECTIONMODE_DISTANCE:
        this.displayDistance();
        break;
      case Constants.SELECTIONMODE_ROTATION:
        this.displayRotation();
        break;
      case Constants.SELECTIONMODE_TORSION:
        this.displayTorsion();
        break;
    }
  }

  private displayIdentify(): void {
    if (this.selections.length < 1) {
      this.onInfoUpdated({atoms: [...this.selections], message: Messages.INSTRUCT_IDENTIFY});
      return;
    }
    const a: Atom = this.selections[0];
    const text: string = `${a.name} (${a.element})`;

    this.onInfoUpdated({atoms: [...this.selections], message: text});
  }

  private displayDistance(): void {
    if (this.selections.length < 2) {
      this.onInfoUpdated({atoms: [...this.selections], message: Messages.INSTRUCT_DISTANCE});
      return;
    }
    const d: number = this.selections[0].loc.distanceTo(this.selections[1].loc);
    const text: string = `${d.toFixed(4)} nm
${this.selections[0].element} - ${this.selections[1].element}`;

    this.onInfoUpdated({atoms: this.selections.slice(0, 2), message: text, distance: d});
  }

  private displayRotation(): void {
    if (this.selections.length < 3) {
      this.onInfoUpdated({atoms: [...this.selections], message: Messages.INSTRUCT_ROTATION});
      return;
    }
    const v: Vector3 = new Vector3().subVectors(this.selections[0].loc, this.selections[1].loc);
    const w: Vector3 = new Vector3().subVectors(this.selections[2].loc, this.selections[1].loc);
    const ang: number = Utility.r2d(v.angleTo(w));

    if (ang === null || Number.isNaN(ang)) {
      this.onInfoUpdated({
        atoms: [...this.selections],
        message: "Invalid atoms selected. Please select a chain of 3 atoms.",
      });
      return;
    }

    const text: string =
      `${ang.toFixed(4)} degrees
${this.selections[0].element} - ${this.selections[1].element} - ${this.selections[2].element}`;

    this.onInfoUpdated({atoms: this.selections.slice(0, 3), message: text, rotationAngle: ang});
  }

  private displayTorsion(): void {
    if (this.selections.length < 4) {
      this.onInfoUpdated({atoms: [...this.selections], message: Messages.INSTRUCT_TORSION});
      return;
    }
    const u: Vector3 = new Vector3().subVectors(this.selections[1].loc, this.selections[0].loc);
    const v: Vector3 = new Vector3().subVectors(this.selections[2].loc, this.selections[1].loc);
    const w: Vector3 = new Vector3().subVectors(this.selections[3].loc, this.selections[2].loc);
    const uXv: Vector3 = u.cross(v);
    const vXw: Vector3 = v.cross(w);
    const ang: number = uXv && vXw ? Utility.r2d(uXv.angleTo(vXw)) : Number.NaN;
    if (ang === null || Number.isNaN(ang)) {
      this.onInfoUpdated({
        atoms: [...this.selections],
        message: "Invalid atoms selected. Please select a chain of 4 atoms.",
      });
      return;
    }

    const text: string =
      `${ang.toFixed(4)} degrees
${this.selections[0].element} - ${this.selections[1].element} - ${this.selections[2].element} - ${this.selections[3].element}`;

    this.onInfoUpdated({atoms: this.selections.slice(0, 4), message: text, torsionAngle: ang});
  }

  private clearDisplay(): void {
    this.onInfoUpdated({atoms: []});
  }
}

export default MolView;
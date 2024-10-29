/*
 * =================================================================================================
 *
 * 	WebGL MolView
 * 	Copyright 2013-2017 Eric Mulvihill. All Rights Reserved.
 *
 * 	This program is free software. You can redistribute and/or modify it
 * 	in accordance with the terms of the accompanying license agreement.
 *
 * =================================================================================================
 */

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

/**
 * MolView - a simple 3D molecule viewer.
 * For instructions, please read README.md
 */
export class MolView {
  private selections: Atom[];
  private molecule: Molecule | undefined;
  private renderer: IMolRenderer;
  private domElement: HTMLElement;
  private infoElement: HTMLElement;
  private initialized: boolean = false;

  constructor(params: {
    pdbUrl?: string;
    pdbData?: string;
    domElement?: string;
    infoElement?: string;
  }) {
    this.renderer = new ThreeJsRenderer();

    this.selections = [];

    // load the molecule from the init settings
    if (params.pdbUrl) {
      this.loadPDB(params.pdbUrl);
    } else if (params.pdbData) {
      Configuration.pdbData = params.pdbData;
      this.renderPDBData(params.pdbData);
    }

    // get the DOM element to which we should attach the renderer & info display
    this.domElement = Utility.getElement(params.domElement || Configuration.domElement)!;
    this.infoElement = Utility.getElement(params.infoElement || Configuration.infoElement)!;
  }

  loadPDB(pdbUrl: string): void {
    if (!pdbUrl) {
      console.warn("empty 3D molecule name");
    }
    fetch(pdbUrl).then((response) =>
      response.text().then((data) => {
        Configuration.pdbData = data;
        this.renderPDBData(data);
      }),
    );
  }

  setRenderMode(mode: string): void {
    Configuration.renderMode = mode;
    this.clearSelections();
    // rebuild and redraw the molecule
    this.renderer.reset();
    this.molecule?.render(this.renderer);
  }

  setSelectionMode(mode: string): void {
    Configuration.selectionMode = mode;
    this.clearSelections();
    this.updateInfoDisplay();
    // redraw the molecule (without rebuilding)
    this.renderer.render();
  }

  private renderPDBData(pdbData: string): void {
    this.molecule = PDBParser.parsePDB(pdbData);

    this.updateDisplay("");

    if (this.domElement && !this.initialized) {
      this.renderer.init(this.domElement);
      this.domElement.onclick = (event) => this.handleSelect(event);
    } else {
      this.renderer.reset();
    }

    this.molecule = PDBParser.parsePDB(pdbData);

    if (Configuration.autoCenter) {
      this.molecule.center();
    }

    // render the molecule as 3d items
    this.molecule.render(this.renderer);

    // draw the molecule on screen
    this.renderer.render();

    this.initialized = true;
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
      this.updateInfoDisplay();
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
    this.updateInfoDisplay();
    this.renderer.render();
  }

  private clearSelections(): void {
    this.renderer.deselectAll();
    this.selections = [];
  }

  private updateInfoDisplay(): void {
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
      this.updateDisplay(Messages.INSTRUCT_IDENTIFY);
      return;
    }
    const a: Atom = this.selections[0];
    const text: string = a.name + " (" + a.element + ")";

    this.updateDisplay(text);
  }

  private displayDistance(): void {
    if (this.selections.length < 2) {
      this.updateDisplay(Messages.INSTRUCT_DISTANCE);
      return;
    }
    const d: number = this.selections[0].loc.distanceTo(this.selections[1].loc);
    const text: string = d.toFixed(4) + " nm\n" + this.selections[0].element + " - " + this.selections[1].element;

    this.updateDisplay(text);
  }

  private displayRotation(): void {
    if (this.selections.length < 3) {
      this.updateDisplay(Messages.INSTRUCT_ROTATION);
      return;
    }
    const v: Vector3 = new Vector3().subVectors(this.selections[0].loc, this.selections[1].loc);
    const w: Vector3 = new Vector3().subVectors(this.selections[2].loc, this.selections[1].loc);
    const ang: number = v.angleTo(w);

    if (!ang) {
      this.updateDisplay("Invalid atoms selected. Please select a chain of 3 atoms.");
      return;
    }

    const text: string =
      Utility.r2d(ang).toFixed(4) +
      " degrees\n" +
      this.selections[0].element +
      " - " +
      this.selections[1].element +
      " - " +
      this.selections[2].element;
    this.updateDisplay(text);
  }

  private displayTorsion(): void {
    if (this.selections.length < 4) {
      this.updateDisplay(Messages.INSTRUCT_TORSION);
      return;
    }
    const u: Vector3 = new Vector3().subVectors(this.selections[1].loc, this.selections[0].loc);
    const v: Vector3 = new Vector3().subVectors(this.selections[2].loc, this.selections[1].loc);
    const w: Vector3 = new Vector3().subVectors(this.selections[3].loc, this.selections[2].loc);
    const uXv: Vector3 = u.cross(v);
    const vXw: Vector3 = v.cross(w);
    const ang: number = uXv && vXw ? uXv.angleTo(vXw) : Number.NaN;
    if (ang === null) {
      this.updateDisplay("Invalid atoms selected. Please select a chain of 4 atoms.");
      return;
    }

    const text: string =
      Utility.r2d(ang).toFixed(4) +
      " degrees\n" +
      this.selections[0].element +
      " - " +
      this.selections[1].element +
      " - " +
      this.selections[2].element +
      " - " +
      this.selections[3].element;
    this.updateDisplay(text);
  }

  private updateDisplay(str: string): void {
    this.infoElement.textContent = str;
  }
}

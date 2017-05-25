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

import {Configuration} from "./Configuration";
import {Constants} from "./Constants";
import {Messages} from "./Messages";
import {Atom} from "./model/Atom";
import {Bond} from "./model/Bond";
import {Molecule} from "./model/Molecule";
import {RenderableObject} from "./model/RenderableObject";
import {PDBParser} from "./PDBParser";
import {IMolRenderer} from "./renderer/IMolRenderer";
import {ThreeJsRenderer} from "./renderer/ThreeJsRenderer";
import {Utility} from "./Utility";

import {Vector3} from "three";

export class MolView {
    private selections: Atom[];
    private molecule: Molecule;
    private renderer: IMolRenderer;
    private domElement: HTMLElement;
    private infoElement: HTMLElement;
    private initialized: boolean;

    constructor(params: {
        pdbUrl?: string, pdbData?: string
    }) {
        this.renderer = new ThreeJsRenderer();

        // this is where selections are stored
        this.selections = [];

        // load the molecule from the init settings
        if (params.pdbUrl) {
            this.loadPDB(params.pdbUrl);
        } else if (params.pdbData) {
            this.renderPDBData(params.pdbData);
        }
    }

    loadPDB(pdbUrl: string): void {
        if (!pdbUrl) {
            console.warn("empty 3D molecule name");
        }
        fetch(pdbUrl).then(response => response.text()
            .then(data => {
                Configuration.pdbData = data;
                this.renderPDBData(data);
            }));
    }

    setRenderMode(mode: string): void {
        Configuration.renderMode = mode;
        this.clearSelections();
        this.renderer.render();
    }

    setSelectionMode(mode: string): void {
        Configuration.selectionMode = mode;
        this.clearSelections();
        this.renderer.render();
    }

    private onMouseWheel(event: MouseWheelEvent): void {
        Configuration.zoom += event.wheelDelta / 50.0;
        this.renderer.render();
    }

    private renderPDBData(pdbData: string): void {

        this.molecule = PDBParser.parsePDB(pdbData);

        // get the DOM element to which we should attach
        this.domElement = document.getElementById(Configuration.domElement)!;
        this.infoElement = document.getElementById(Configuration.infoElement)!;
        this.infoElement.innerHTML = "";

        if (!this.initialized) {
            this.renderer.init(this.domElement);
        } else {
            this.renderer.reset();
        }
        if (!this.initialized) {
            this.domElement.onclick = event => this.handleSelect(event);
            this.domElement.onmousewheel = event => this.onMouseWheel(event);
            this.infoElement.onclick = event => this.updateInfoDisplay();
        }

        this.molecule = PDBParser.parsePDB(pdbData);

        if (Configuration.autoCenter === true) {
            this.molecule.center();
        }

        // render the molecule as 3d items
        this.molecule.render(this.renderer);

        // draw the molecule on screen
        this.renderer.render();

        this.initialized = true;
    }

    private handleSelect(event: MouseEvent): void {
        if (Configuration.selectable === false) {
            return;
        }

        const selObj: RenderableObject = this.renderer.getSelectedObject(event)!;
        if (!(selObj instanceof Atom)) {
            return;
        }

        const index: number = this.selections.indexOf(selObj);

        if (index > -1) {
            // already selected so deselect	if possible
            let connectingBonds: Bond[];
            if (index === 0) {
                this.renderer.deselect(selObj);
                if (this.selections.length >= 2) {
                    connectingBonds = this.molecule.getBonds(selObj, this.selections[1]);
                    if (connectingBonds && connectingBonds.length > 0) {
                        this.renderer.deselect(connectingBonds[0]);
                    }
                }
                this.selections.shift();
            } else if (index === this.selections.length - 1) {
                this.renderer.deselect(selObj);
                if (this.selections.length >= 2) {
                    connectingBonds = this.molecule.getBonds(selObj, this.selections[this.selections.length - 2]);
                    if (connectingBonds && connectingBonds.length > 0) {
                        this.renderer.deselect(connectingBonds[0]);
                    }
                }
                this.selections.pop();
            }
            this.renderer.render();
            return;
        }

        if (Configuration.selectionMode === Constants.SELECTIONMODE_IDENTIFY && this.selections.length >= 1) {
            this.clearSelections();
        }

        if ((Configuration.selectionMode === Constants.SELECTIONMODE_DISTANCE && this.selections.length >= 2) ||
            (Configuration.selectionMode === Constants.SELECTIONMODE_ROTATION && this.selections.length >= 3) ||
            (Configuration.selectionMode === Constants.SELECTIONMODE_TORSION && this.selections.length >= 4)) {
            // too many selected
            return;
        }

        if (this.selections.length > 0 &&
            (Configuration.selectionMode === Constants.SELECTIONMODE_ROTATION ||
            Configuration.selectionMode === Constants.SELECTIONMODE_TORSION)) {
            // check for neighborness before selecting
            const neighbors: RenderableObject[] = this.molecule.getNeighbors(selObj);

            if (neighbors.indexOf(this.selections[0]) > -1) {
                this.renderer.select(selObj);
                this.renderer.select(this.molecule.getBonds(selObj, this.selections[0])[0]);
                this.selections.unshift(selObj);
            } else if (neighbors.indexOf(this.selections[this.selections.length - 1]) > -1) {
                this.renderer.select(selObj);
                this.renderer.select(this.molecule.getBonds(selObj, this.selections[this.selections.length - 1])[0]);
                this.selections.push(selObj);
            }
        } else {
            // no restrictions in other modes
            this.renderer.select(selObj);
            this.selections.push(selObj);
        }

        this.renderer.render();
    }

    private clearSelections(): void {
        this.renderer.deselectAll();
        this.selections = [];
    }

    private updateInfoDisplay(): void {
        switch (Configuration.selectionMode) {
            case Constants.SELECTIONMODE_IDENTIFY :
                this.displayIdentify();
                break;
            case Constants.SELECTIONMODE_DISTANCE :
                this.displayDistance();
                break;
            case Constants.SELECTIONMODE_ROTATION :
                this.displayRotation();
                break;
            case Constants.SELECTIONMODE_TORSION :
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

        const text: string = Utility.r2d(ang).toFixed(4) + " degrees\n" +
            this.selections[0].element + " - " + this.selections[1].element + " - " + this.selections[2].element;
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
        const ang: number = (uXv && vXw) ? uXv.angleTo(vXw) : NaN;
        if (ang === null) {
            this.updateDisplay("Invalid atoms selected. Please select a chain of 4 atoms.");
            return;
        }

        const text: string = Utility.r2d(ang).toFixed(4) + " degrees\n" +
            this.selections[0].element + " - " + this.selections[1].element + " - " +
            this.selections[2].element + " - " + this.selections[3].element;
        this.updateDisplay(text);
    }

    private updateDisplay(str: string): void {
        this.infoElement.innerText = str;
    }
}

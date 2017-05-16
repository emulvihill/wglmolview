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

import {Molecule} from "./model/Molecule";
import {Configuration} from "./Configuration";
import {ThreeJsRenderer} from "./renderer/ThreeJsRenderer";
import {RenderableObject} from "./model/RenderableObject";
import {Atom} from "./model/Atom";
import {Bond} from "./model/Bond";
import {Constants} from "./Constants";
import {Messages} from "./Messages";
import {Vector3} from "three";
import {Utility} from "./Utility";
import {IMolRenderer} from "./renderer/IMolRenderer";
export class MolView {
    private selections: Atom[];
    private molecule: Molecule;
    private renderer: IMolRenderer;
    private domElement: HTMLElement;
    private infoElement: HTMLElement;
    private display: HTMLTextAreaElement;
    private renderToolbar: HTMLDivElement;
    private selectionToolbar: HTMLDivElement;
    private config: Configuration;
    private initialized: Boolean;

    constructor(params?: Object) {
        Configuration.newConfig(params);
        this.config = Configuration.getConfig();
        this.renderer = new ThreeJsRenderer();

        // this is where selections are stored
        this.selections = [];

        // load the molecule from the init settings
        if (this.config.pdbUrl) {
            this.loadPDB(this.config.pdbUrl);
        } else if (this.config.pdbData) {
            this.renderPDBData();
        }
    }

    private onMouseWheel(event: MouseWheelEvent): void {
        let oldZoom: number = this.config.zoom;
        this.config.zoom = oldZoom + event.wheelDelta / 50.0;
        this.renderer.render();
    }

    public loadPDB(pdbUrl: string): void {
        if (!pdbUrl) {
            console.warn("empty 3D molecule name");
        }
        fetch(pdbUrl).then(response => {
            response.text().then(data => {
                this.config.pdbData = data;
                this.renderPDBData();
            })

        });
    }

    setRenderMode(mode: string): void {
        this.config.renderMode = mode;
        this.clearSelections();
        this.renderer.render();
    }

    setSelectionMode(mode: string): void {
        this.config.selectionMode = mode;
        this.clearSelections();
        this.renderer.render();
    }

    private renderPDBData(): void {
        this.molecule = new Molecule();

        // get the DOM element to attach to
        // - assume we've got jQuery to hand
        this.domElement = document.getElementById(this.config.domElement)!;
        //this.domElement.empty();
        this.infoElement = document.getElementById(this.config.infoElement)!;
        this.infoElement.innerHTML = "";

        if (!this.initialized) {
            this.renderer.init(this.domElement);
        } else {
            this.renderer.reset();
        }
        if (!this.initialized) {
            this.domElement.click = () => {
                this.handleSelect(<MouseEvent><any>event);
            }
            this.domElement.click = () => {
                this.updateInfoDisplay();
            }

        }

        this.molecule.parsePDB(this.config.pdbData);

        if (this.config.autoCenter === true) {
            this.molecule.center();
        }

        // render the molecule as 3d items
        this.molecule.render(this.renderer);

        // load initial render mode
        //this.renderer.setRenderMode(this.config.renderMode);

        // draw the molecule on screen
        this.renderer.render();

        this.initialized = true;
    }


    private handleSelect(event: MouseEvent): void {
        if (this.config.selectable === false) return;

        let obj: RenderableObject = this.renderer.getSelectedObject(event)!;
        if (!(obj instanceof Atom)) return;

        let selAtom = <Atom>obj;

        let index: number = this.selections.indexOf(selAtom);

        if (index > -1) {
            // already selected so deselect	if possible
            let connectingBonds: Bond[];
            if (index === 0) {
                this.renderer.deselect(selAtom);
                if (this.selections.length >= 2) {
                    connectingBonds = this.molecule.getBonds(selAtom, this.selections[1]);
                    if (connectingBonds && connectingBonds.length > 0) {
                        this.renderer.deselect(connectingBonds[0]);
                    }
                }
                this.selections.shift();
            }
            else if (index === this.selections.length - 1) {
                this.renderer.deselect(selAtom);
                if (this.selections.length >= 2) {
                    connectingBonds = this.molecule.getBonds(selAtom, this.selections[this.selections.length - 2]);
                    if (connectingBonds && connectingBonds.length > 0) {
                        this.renderer.deselect(connectingBonds[0]);
                    }
                }
                this.selections.pop();
            }
            this.renderer.render();
            return;
        }

        if (this.config.selectionMode === Constants.SELECTIONMODE_IDENTIFY && this.selections.length >= 1) this.clearSelections();

        if ((this.config.selectionMode === Constants.SELECTIONMODE_DISTANCE && this.selections.length >= 2) ||
            (this.config.selectionMode === Constants.SELECTIONMODE_ROTATION && this.selections.length >= 3) ||
            (this.config.selectionMode === Constants.SELECTIONMODE_TORSION && this.selections.length >= 4)) {
            // too many selected
            return;
        }

        if (this.selections.length > 0 &&
            (this.config.selectionMode === Constants.SELECTIONMODE_ROTATION ||
            this.config.selectionMode === Constants.SELECTIONMODE_TORSION)) {
            // check for neighborness before selecting
            let neighbors: RenderableObject[] = this.molecule.getNeighbors(selAtom);

            if (neighbors.indexOf(this.selections[0]) > -1) {
                this.renderer.select(selAtom);
                this.renderer.select(this.molecule.getBonds(selAtom, this.selections[0])[0]);
                this.selections.unshift(selAtom);
            }
            else if (neighbors.indexOf(this.selections[this.selections.length - 1]) > -1) {
                this.renderer.select(selAtom);
                this.renderer.select(this.molecule.getBonds(selAtom, this.selections[this.selections.length - 1])[0]);
                this.selections.push(selAtom);
            }
        }
        else {
            // no restrictions in other modes
            this.renderer.select(selAtom);
            this.selections.push(selAtom);
        }

        this.renderer.render();
    }


    private clearSelections(): void {
        this.renderer.deselectAll();
        this.selections = [];
    }


    private updateInfoDisplay(): void {
        switch (this.config.selectionMode) {
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
        let a: Atom = this.selections[0];
        let text: string = a.name + " (" + a.element + ")";

        this.updateDisplay(text);
    }


    private displayDistance(): void {
        if (this.selections.length < 2) {
            this.updateDisplay(Messages.INSTRUCT_DISTANCE);
            return;
        }
        let d: number = this.selections[0].loc.distanceTo(this.selections[1].loc);
        let text: string = d.toFixed(4) + " nm\n" + this.selections[0].element + " - " + this.selections[1].element;

        this.updateDisplay(text);
    }


    private displayRotation(): void {
        if (this.selections.length < 3) {
            this.updateDisplay(Messages.INSTRUCT_ROTATION);
            return;
        }
        let v: Vector3 = new Vector3().subVectors(this.selections[0].loc, this.selections[1].loc);
        let w: Vector3 = new Vector3().subVectors(this.selections[2].loc, this.selections[1].loc);
        let ang: number = v.angleTo(w);

        if (!ang) {
            this.updateDisplay("Invalid atoms selected. Please select a chain of 3 atoms.");
            return;
        }

        let text: string = Utility.r2d(ang).toFixed(4) + " degrees\n" +
            this.selections[0].element + " - " + this.selections[1].element + " - " + this.selections[2].element;
        this.updateDisplay(text);
    }


    private displayTorsion(): void {
        if (this.selections.length < 4) {
            this.updateDisplay(Messages.INSTRUCT_TORSION);
            return;
        }
        let u: Vector3 = new Vector3().subVectors(this.selections[1].loc, this.selections[0].loc);
        let v: Vector3 = new Vector3().subVectors(this.selections[2].loc, this.selections[1].loc);
        let w: Vector3 = new Vector3().subVectors(this.selections[3].loc, this.selections[2].loc);
        let uXv: Vector3 = u.cross(v);
        let vXw: Vector3 = v.cross(w);
        let ang: number = (uXv && vXw) ? uXv.angleTo(vXw) : NaN;
        if (ang === null) {
            this.updateDisplay("Invalid atoms selected. Please select a chain of 4 atoms.");
            return;
        }

        let text: string = Utility.r2d(ang).toFixed(4) + " degrees\n" +
            this.selections[0].element + " - " + this.selections[1].element + " - " +
            this.selections[2].element + " - " + this.selections[3].element;
        this.updateDisplay(text);
    }

    private updateDisplay(str: string): void {
        this.infoElement.innerText = str;
    }
}
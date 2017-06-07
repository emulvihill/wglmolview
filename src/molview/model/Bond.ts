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

import {BondInitializer} from "./BondInitializer";
import {Configuration} from "../Configuration";
import {Constants} from "../Constants";
import {IMolRenderer} from "../renderer/IMolRenderer";
import {Atom} from "./Atom";
import {RenderableObject} from "./RenderableObject";

/**
 * Renderable Bond
 */
export class Bond extends RenderableObject {
    private _atoms: Atom[];
    color: string;
    type: number;
    private _length: number;

    public get atoms(): Atom[] {
        return this._atoms.slice();
    }
    public get length(): number {
        return this._length;
    }

    constructor(init: BondInitializer) {
        super();
        this.type = init.t;
        this._atoms = [init.a1, init.a2];
        this.id = init.id;

        // color for the type of bond
        this.setColorMode(Constants.COLORMODE_CPK);

        this._atoms[0].addBond(this);
        this._atoms[1].addBond(this);
    }

    public calculateLength(): void {
        this.loc = this._atoms[0].loc.clone();
        this.loc.add(this._atoms[1].loc);
        this.loc.multiplyScalar(0.5);
        this._length = 100 * this._atoms[0].loc.distanceTo(this._atoms[1].loc);
    }

    public render(renderer: IMolRenderer): void {
        renderer.addRenderableObject(this);
    }

    public setColorMode(mode: string): void {
        if (!this.type) {
            throw new Error("bond type is undefined");
        }

        switch (mode) {
            case Constants.COLORMODE_CPK:  // i.e. "element color"
                this.color = ["0000FF", "8822FF", "2299FF"][this.type - 1];
                break;

            case Constants.COLORMODE_AMINO_ACID:
                // TO DO
                break;
        }
    }
}

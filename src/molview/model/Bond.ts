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

import {BondInitializer} from "../BondInitializer";
import {Configuration} from "../Configuration";
import {Constants} from "../Constants";
import {IMolRenderer} from "../renderer/IMolRenderer";
import {Atom} from "./Atom";
import {RenderableObject} from "./RenderableObject";

export class Bond extends RenderableObject {
    atoms: Atom[];
    color: string;
    type: number;

    private lengthFrames: number[];

    public get length(): number {
        return this.lengthFrames[this.mframe];
    }

    public set length(len: number) {
        this.lengthFrames[this.mframe] = len;
    }

    constructor(init: BondInitializer) {
        super();
        this.type = init.t;
        this.atoms = [init.a1, init.a2];
        this.id = init.id;
        this.mframe = 0;
        this.lengthFrames = new Array(Configuration.maxFrames);

        // color for the type of bond
        this.setColorMode(Constants.COLORMODE_CPK);

        this.atoms[0].addBond(this);
        this.atoms[1].addBond(this);
    }

    public addToMframe(mframe: number): void {
        this.loc = this.atoms[0].loc.clone();
        this.loc.add(this.atoms[1].loc);
        this.loc.multiplyScalar(0.5);
        this.length = 100 * this.atoms[0].loc.distanceTo(this.atoms[1].loc);
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

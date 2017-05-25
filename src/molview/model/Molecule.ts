﻿/*
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
import {IMolRenderer} from "../renderer/IMolRenderer";
import {Atom} from "./Atom";
import {Bond} from "./Bond";
import {MoleculeInitializer} from "./MoleculeInitializer";
import {RenderableObject} from "./RenderableObject";

export class Molecule extends RenderableObject {

    private maxMframe: number;
    private currentMframe: number;
    private title: string;
    private header: object;
    private compound: object;
    private residueSequence: object;
    private objects: Array<Atom|Bond>;
    private selections: RenderableObject[];

    constructor(init: MoleculeInitializer) {
        super();

        this.objects = init.objects;
        this.title = init.title;
        this.header = init.header;
        this.compound = init.compound;
        this.selections = [];
        this.residueSequence = {};
        this.currentMframe = 0;
        this.maxMframe = 0;
    }

    render(renderer: IMolRenderer): void {
        for (const obj of this.objects) {
            obj.render(renderer);
        }
    }

    public set mframe(mframe: number) {
        // go to a particular frame in a multi frame model

        for (const obj of this.objects) {
            obj.mframe = mframe;
        }

        this.currentMframe = mframe;
    }

    public getBonds(atom1: Atom, atom2: Atom): Bond[] {
        // returns either a list of names of bonds attached to single atom (one parameter)
        // or a single bond between two atoms (two parameters)
        let res: Bond[] = [];
        if (!atom1) {
            // bad call
            throw new Error("error in call to getBonds");
        } else if (!atom2) {
            res = atom1.bonds;
        } else {
            for (let i: number = 0; i < atom1.bonds.length; i++) {
                const b1: Bond = atom1.bonds[i];
                if (b1.atoms[0] === atom2 || b1.atoms[1] === atom2) {
                    res = [b1];
                }
            }
        }

        return res;
    }

    public setColorMode(m: string): void {
        for (const obj of this.objects) {
            obj.setColorMode(m);
        }
    }

    public addSelection(obj: RenderableObject): void {
        if (!obj) {
            throw new Error("invalid selection");
        }

        this.selections.push(obj);
    }

    public removeSelection(obj: RenderableObject): void {
        if (!obj) {
            throw new Error("invalid selection");
        }

        this.selections.splice(this.selections.indexOf(obj), 1);
    }

    public getNeighbors(obj: RenderableObject): RenderableObject[] {
        if (!obj) {
            throw new Error("invalid object in getNeighbors()");
        }
        // return the atoms that are directly connected to this atom / bond
        const res: RenderableObject[] = [];

        if (obj instanceof Atom) {
            for (let i: number = 0; i < obj.bonds.length; i++) {
                if (obj.bonds[i].atoms[0] === obj) {
                    res.push(obj.bonds[i].atoms[1]);
                } else {
                    res.push(obj.bonds[i].atoms[0]);
                }
            }
        } else if (obj instanceof Bond) {
            res.push(obj.atoms[0], obj.atoms[1]);
        }

        return res;
    }

    public get numAtoms(): number {
        return this.objects.filter(o => o instanceof Atom).length;
    }

    public get numBonds(): number {
        return this.objects.filter(o => o instanceof Bond).length;
    }

    /**
     * Adjust the loc of each object by the average offset of all objects
     */
    public center(): void {
        const center: Vector3 = new Vector3(0, 0, 0);
        let numAtoms: number = 0;
        for (const obj of this.objects) {
            if (obj instanceof Atom) {
                center.add(obj.loc);
                numAtoms++;
            }
        }
        center.multiplyScalar(-1.0 / numAtoms);
        for (const obj of this.objects) {
            obj.loc.add(center);
        }
    }
}

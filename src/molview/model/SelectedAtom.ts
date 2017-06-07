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
import {RenderableObject} from "./RenderableObject";
import {Atom} from "./Atom";
import {IMolRenderer} from "../renderer/IMolRenderer";

/**
 * Renderable selection visualization for an Atom
 */
export class SelectedAtom extends RenderableObject {
    atom: Atom;
    radius: number;

    constructor(atom: Atom) {
        super();
        this.atom = atom;
        this.radius = 1.05 * atom.radius;
    }

    public render(renderer: IMolRenderer): void {
        renderer.addRenderableObject(this);
    }
}

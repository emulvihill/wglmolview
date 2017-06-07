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
import {Configuration} from "../Configuration";
import {IMolRenderer} from "../renderer/IMolRenderer";
import {ViewObject} from "../renderer/ViewObject";

/**
 * Base 3D Renderable, any WebGL objects should extend this and add specific properties
 * View is handled by associated ViewObject.
 * Each Renderable will have a related ViewObject subclass to implement graphics API
 */
export class RenderableObject {
    id: string;
    viewObject: ViewObject;
    private locFrames: Vector3[];
    private currFrame: number;

    constructor() {
        this.locFrames = new Array(Configuration.maxFrames);    // per frame
    }

    public get loc(): Vector3 {
        return this.locFrames[this.currFrame];
    }

    public set loc(num: Vector3) {
        this.locFrames[this.currFrame] = num;
    }

    public get mframe(): number {
        return this.currFrame;
    }

    public set mframe(mframe: number) {
        this.currFrame = mframe;
    }

    render(renderer: IMolRenderer): void {
        console.info("rendering " + this.id);
    }
}

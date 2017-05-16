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
import {ViewObject} from "../renderer/ThreeJsRenderer";
export class RenderableObject {
    id: string;
    private _loc: Vector3[];
    private _mframe: number;
    viewObject: ViewObject;

    constructor() {
        this._loc = new Array(Configuration.getConfig().maxFrames);    // per frame
    }

    public get loc(): Vector3 {
        return this._loc[this._mframe];
    }

    public set loc(num: Vector3) {
        this._loc[this._mframe] = num;
    }

    public get mframe(): number {
        return this._mframe;
    }

    public set mframe(mframe: number) {
        this._mframe = mframe;
    }

    render(renderer: IMolRenderer): void {
    }
}
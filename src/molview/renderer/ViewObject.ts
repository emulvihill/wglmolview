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

import {Mesh} from "three";
import {RenderableObject} from "../model/RenderableObject";

/**
 * Wrapper for graphics API's 3D object reference
 */
export class ViewObject extends Mesh {
    modelObject: RenderableObject;
}

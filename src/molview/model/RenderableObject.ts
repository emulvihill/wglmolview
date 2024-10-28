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
import type { Vector3 } from "three";
import type { IMolRenderer } from "../renderer/IMolRenderer";
import type { ViewObject } from "../renderer/ViewObject";

/**
 * Base 3D Renderable, any WebGL objects should extend this and add specific properties
 * View is handled by associated ViewObject.
 * Each Renderable will have a related ViewObject subclass to implement graphics API
 */
export class RenderableObject {
  id: string;
  viewObject: ViewObject;
  loc: Vector3;

  render(renderer: IMolRenderer): void {
    console.info("rendering " + this.id);
  }
}

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

import type {RenderableObject} from "../model/RenderableObject";

/**
 * Interface for graphics rendering API
 * Extend this class to display molecules using a specific API (WebGL, etc)
 */
export interface IMolRenderer {
  init(domElement: HTMLElement): void;

  reset(): void;

  addRenderableObject(obj: RenderableObject): void;

  render(): void;

  getSelectedObject(event: MouseEvent): RenderableObject | undefined;

  select(obj: RenderableObject): void;

  deselect(obj: RenderableObject): void;

  deselectAll(): void;

  animate(step: number): void;
}

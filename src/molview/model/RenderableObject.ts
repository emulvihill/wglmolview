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
    console.log(`rendering ${this.id} using renderer ${renderer.getName()}`);
  }
}

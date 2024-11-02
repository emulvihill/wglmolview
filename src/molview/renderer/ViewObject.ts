import {Mesh} from "three";
import type {RenderableObject} from "../model/RenderableObject";

/**
 * Wrapper for graphics API's 3D object reference
 */
export class ViewObject extends Mesh {
  modelObject: RenderableObject;
}

import {Mesh} from "three";
import {RenderableObject} from "../model/RenderableObject";

export class ViewObject extends Mesh {
    modelObject: RenderableObject;
}

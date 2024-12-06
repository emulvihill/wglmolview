import type { RenderableObject } from "../model/RenderableObject";
import { Configuration } from "../MolView";

/**
 * Interface for graphics rendering API
 * Extend this class to display molecules using a specific API (WebGL, etc)
 */
export interface IMolRenderer {

  getName(): string;

  init(domElement: HTMLElement, configuration: Configuration): void;

  reset(): void;

  addRenderableObject(obj: RenderableObject): void;

  render(): void;

  getSelectedObject(event: MouseEvent): RenderableObject | undefined;

  select(obj: RenderableObject): void;

  deselect(obj: RenderableObject): void;

  deselectAll(): void;

  animate(step: number): void;
}

﻿/**
 * Various and sundry utilities
 */
export class Utility {
  public static r2d(radians: number): number {
    return (360.0 / (2.0 * Math.PI)) * radians;
  }

  public static getElement(s: string): HTMLElement {
    return document.getElementById(s)! || console.log("HtmlElement " + s + " not found");
  }
}

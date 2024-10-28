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

import { Vector3 } from "three";
import { AminoAcidData } from "../AminoAcidData";
import { Configuration } from "../Configuration";
import { Constants } from "../Constants";
import { ElementData } from "../ElementData";
import type { IMolRenderer } from "../renderer/IMolRenderer";
import type { AtomInitializer } from "./AtomInitializer";
import type { Bond } from "./Bond";
import { RenderableObject } from "./RenderableObject";

/**
 * Renderable Atom
 */
export class Atom extends RenderableObject {
  readonly elementData: ElementData;
  radius: number;
  color: number;
  name: string;
  element: string; // first chars of elemName
  element2: string;

  private altLoc: number;
  private tempFactor: number;
  private serial: number;
  private chainID: number;
  private segID: number;
  private charge: number;
  private resName: string;
  private resSeq: string;
  private iCode: string;
  private occupancy: string;

  private _bonds: Bond[];

  /**
   * All bonds connected to this Atom (read-only)
   * @returns {Bond[]}
   */
  public get bonds(): Bond[] {
    return this._bonds.slice();
  }

  constructor(init: AtomInitializer) {
    super();
    this.elementData = ElementData.getData(init.element);
    if (!this.elementData) {
      // unsupported ATOM record
      console.warn("bad ATOM symbol: " + init.element);
      return;
    }

    this.element = init.element;
    this.id = init.id;
    this.altLoc = init.altLoc;
    this.resName = init.resName;
    this.chainID = init.chainId;
    this.resSeq = init.resSeq;
    this.iCode = init.iCode;
    this.occupancy = init.occupancy;
    this.tempFactor = init.tempFactor;
    this.segID = init.segId;
    this.element2 = init.element2;
    this.charge = init.charge;
    this.name = this.elementData.name;
    this.color = init.color || this.elementData.color;

    const radiusScale: number = Configuration.atomRadiusScale;
    const hRadius = ElementData.getData("H").radius;

    switch (Configuration.atomRadiusMode) {
      case Constants.ATOM_RADIUS_ACCURATE:
        this.radius = radiusScale * this.elementData.radius;
        break;
      case Constants.ATOM_RADIUS_REDUCED:
        this.radius =
          radiusScale *
          (Constants.ATOM_RADIUS_REDUCED_SCALE * this.elementData.radius +
            (1 - Constants.ATOM_RADIUS_REDUCED_SCALE) * hRadius);
        break;
      case Constants.ATOM_RADIUS_UNIFORM:
      default:
        this.radius = radiusScale * hRadius;
    }

    this.charge = 0;
    this._bonds = [];
  }

  /**
   * Set the location in 3D space for this Atom
   * @param x
   * @param y
   * @param z
   */
  public setLocation(x: number, y: number, z: number): void {
    this.loc = new Vector3(x, y, z);
  }

  public addBond(bond: Bond): void {
    this._bonds.push(bond);
  }

  public render(renderer: IMolRenderer): void {
    renderer.addRenderableObject(this);
  }

  public setColorMode(colorMode: string): void {
    switch (colorMode) {
      case Constants.COLORMODE_CPK: // i.e. "element color"
        this.color = this.elementData.color || ElementData.getData("C").color;
        break;

      case Constants.COLORMODE_AMINO_ACID:
        const aaData = AminoAcidData.getData(this.resName).color;
        this.color = aaData ? aaData : 0xcccccc;
        break;
    }
  }
}

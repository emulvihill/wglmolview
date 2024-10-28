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
import { Configuration } from "../Configuration";
import { Constants } from "../Constants";
import type { IMolRenderer } from "../renderer/IMolRenderer";
import { Atom } from "./Atom";
import { Bond } from "./Bond";
import type { MoleculeInitializer } from "./MoleculeInitializer";
import { RenderableObject } from "./RenderableObject";

/**
 * Renderable Molecule
 */
export class Molecule extends RenderableObject {
  private title: string;
  private header: object;
  private compound: object;
  private residueSequence: object;
  private objects: Array<Atom | Bond>;
  private selections: RenderableObject[];

  constructor(init: MoleculeInitializer) {
    super();

    this.objects = init.objects;
    this.title = init.title;
    this.header = init.header;
    this.compound = init.compound;
    this.selections = [];
    this.residueSequence = {};
  }

  render(renderer: IMolRenderer): void {
    this.objects
      .filter((o) => {
        // We filter bonds in space-fill mode and atoms in sticks mode
        return !(
          (Configuration.renderMode === Constants.RENDERMODE_STICKS && o instanceof Atom) ||
          (Configuration.renderMode === Constants.RENDERMODE_SPACE_FILL && o instanceof Bond)
        );
      })
      .forEach((o) => o.render(renderer));
  }

  /**
   * Returns either a list of names of bonds attached to single atom (one parameter)
   * or a single bond between two atoms (two parameters)
   * @param atom1
   * @returns {Bond[]} List of bonds attached to one
   */
  public getBonds(atom1: Atom): Bond[] {
    if (!atom1) {
      // bad call
      throw new Error("error in call to getBonds");
    }

    return atom1.bonds;
  }

  /**
   * Returns the bond between any two atoms. if no bond exists, return undefined
   * @param atom1
   * @param atom2
   * @returns Bond | undefined
   */
  public getBondBetween(atom1: Atom, atom2: Atom): Bond | undefined {
    if (!atom1 || !atom2) {
      // bad call
      throw new Error("error in call to getBonds");
    }

    return atom1.bonds.find((b) => b.atoms[0] === atom2 || b.atoms[1] === atom2);
  }

  public setColorMode(m: string): void {
    this.objects.forEach((o) => o.setColorMode(m));
  }

  /**
   * Adds a selection state to a component object
   * @param obj
   */
  public addSelection(obj: RenderableObject): void {
    if (!obj) {
      throw new Error("invalid selection");
    }

    this.selections.push(obj);
  }

  /**
   * Remove the selection state from a component object
   * @param obj
   */
  public removeSelection(obj: RenderableObject): void {
    if (!obj) {
      throw new Error("invalid selection");
    }

    this.selections.splice(this.selections.indexOf(obj), 1);
  }

  /**
   * Return the atoms that are directly connected to this atom / bond
   * @param obj
   * @returns {RenderableObject[]}
   */
  public getNeighbors(obj: RenderableObject): Atom[] {
    if (!obj) {
      throw new Error("invalid object in getNeighbors()");
    }

    const res: Atom[] = [];

    if (obj instanceof Atom) {
      obj.bonds.forEach((b) => {
        res.push(obj === b.atoms[0] ? b.atoms[1] : b.atoms[0]);
      });
    } else if (obj instanceof Bond) {
      res.push(obj.atoms[0], obj.atoms[1]);
    }

    return res;
  }

  public get numAtoms(): number {
    return this.objects.filter((o) => o instanceof Atom).length;
  }

  public get numBonds(): number {
    return this.objects.filter((o) => o instanceof Bond).length;
  }

  /**
   * Adjust the loc of each object by the average offset of all objects
   */
  public center(): void {
    const center: Vector3 = new Vector3(0, 0, 0);
    let numAtoms = 0;
    for (const obj of this.objects) {
      if (obj instanceof Atom) {
        center.add(obj.loc);
        numAtoms++;
      }
    }
    center.multiplyScalar(-1.0 / numAtoms);
    for (const obj of this.objects) {
      obj.loc.add(center);
    }
  }
}

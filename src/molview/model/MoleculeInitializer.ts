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

import type { Atom } from "./Atom";
import type { Bond } from "./Bond";

/**
 * Initializer for Molecule
 */
export class MoleculeInitializer {
  objects: Array<Atom | Bond>;
  title: string;
  header: object;
  compound: object;
}

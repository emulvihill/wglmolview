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

import type {Atom} from "./Atom";

/**
 * Initializer for Bond
 */
export class BondInitializer {
  id: string;
  t: number;
  a1: Atom;
  a2: Atom;
}

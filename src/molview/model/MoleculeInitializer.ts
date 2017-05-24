﻿/*
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

import {Atom} from "./Atom";
import {Bond} from "./Bond";

export class MoleculeInitializer {
    objects: (Atom|Bond)[];
    title: string;
    header: Object;
    compound: Object;
}

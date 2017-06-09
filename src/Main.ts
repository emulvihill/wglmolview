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

import {Constants} from "./molview/Constants";
import {MolView} from "./molview/MolView";
import {Utility} from "./molview/Utility";

/**
 * Launches MolView on window.onLoad.  Include this script in an HTML page.
 */
window.onload = function onLoad(event: Event) {

    // Modify baseUrl & pdbUrl as appropriate to your deployment environment
    let mv: MolView = new MolView({
        pdbUrl: "pdb/aa/ala.pdb"
    });

    let element = Utility.getElement("renderStick");
    element.onclick = (e) => {
        mv.setRenderMode(Constants.RENDERMODE_STICKS);
    };

    Utility.getElement("renderBall").onclick = (e) => {
        mv.setRenderMode(Constants.RENDERMODE_BALL_AND_STICK);
    };

    Utility.getElement("renderBlob").onclick = (e) => {
        mv.setRenderMode(Constants.RENDERMODE_SPACE_FILL);
    };

    Utility.getElement("selectionInfo").onclick = (e) => {
        mv.setSelectionMode(Constants.SELECTIONMODE_IDENTIFY);
    };

    Utility.getElement("selectionDistance").onclick = (e) => {
        mv.setSelectionMode(Constants.SELECTIONMODE_DISTANCE);
    };

    Utility.getElement("selectionRotation").onclick = (e) => {
        mv.setSelectionMode(Constants.SELECTIONMODE_ROTATION);
    };

    Utility.getElement("selectionTorsion").onclick = (e) => {
        mv.setSelectionMode(Constants.SELECTIONMODE_TORSION);
    };

    // molecule selection dropdown
    Utility.getElement("pdbSelect").onchange = (e) => {
        mv.loadPDB((e.target as HTMLSelectElement).value);
    };
};

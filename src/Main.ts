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
    const mv: MolView = new MolView({
        pdbUrl: "pdb/aa/ala.pdb"
    });

    const element = Utility.getElement("renderStick");
    element.onclick = () => {
        mv.setRenderMode(Constants.RENDERMODE_STICKS);
    };

    Utility.getElement("renderBall").onclick = () => {
        mv.setRenderMode(Constants.RENDERMODE_BALL_AND_STICK);
    };

    Utility.getElement("renderBlob").onclick = () => {
        mv.setRenderMode(Constants.RENDERMODE_SPACE_FILL);
    };

    Utility.getElement("selectionInfo").onclick = () => {
        mv.setSelectionMode(Constants.SELECTIONMODE_IDENTIFY);
    };

    Utility.getElement("selectionDistance").onclick = () => {
        mv.setSelectionMode(Constants.SELECTIONMODE_DISTANCE);
    };

    Utility.getElement("selectionRotation").onclick = () => {
        mv.setSelectionMode(Constants.SELECTIONMODE_ROTATION);
    };

    Utility.getElement("selectionTorsion").onclick = () => {
        mv.setSelectionMode(Constants.SELECTIONMODE_TORSION);
    };

    // molecule selection dropdown
    Utility.getElement("pdbSelect").onchange = e => {
        mv.loadPDB((e.target as HTMLSelectElement).value);
    };
};

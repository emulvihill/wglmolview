/*
 * =================================================================================================
 *
 * 	WebGL MolView
 * 	Copyright 2013-2024 Eric Mulvihill. All Rights Reserved.
 *
 * 	This program is free software. You can redistribute and/or modify it
 * 	in accordance with the terms of the accompanying license agreement.
 *
 * =================================================================================================
 */

import type {Configuration} from "./molview/Configuration";
import {Constants} from "./molview/Constants";
import {MolView} from "./molview/MolView";
import {Utility} from "./molview/Utility";

interface Window {
  [molview_config: string]: object;
}

/**
 * Launches MolView on window.onLoad.  Include this script in an HTML page.
 */
window.onload = function onLoad() {
  // Modify baseUrl & pdbUrl as appropriate to your deployment environment
  const config: object = ((window as unknown as Window).molview_config as Configuration) || {
    pdbUrl: "pdb/aa/ala.pdb",
    domElement: "wglContent",
    infoElement: "wglInfo",
  };
  console.log(config);
  const mv: MolView = new MolView(config);

  try {
    // Rendering options
    Utility.getElement("renderStick").onclick = () => {
      mv.setRenderMode(Constants.RENDERMODE_STICKS);
    };

    Utility.getElement("renderBall").onclick = () => {
      mv.setRenderMode(Constants.RENDERMODE_BALL_AND_STICK);
    };

    Utility.getElement("renderBlob").onclick = () => {
      mv.setRenderMode(Constants.RENDERMODE_SPACE_FILL);
    };

    // Selection options
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

    // Molecule selection dropdown
    Utility.getElement("pdbSelect").onchange = (e) => {
      mv.loadPDB((e.target as HTMLSelectElement).value);
    };
  } catch (e) {
    // May not be running from HTML page with controls
    console.log(e);
  }
};

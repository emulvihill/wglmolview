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

import { Constants } from "./Constants";

/**
 * Global configuration for MolView
 */
export class Configuration {
  public static renderQuality: string = Constants.RENDERQUALITY_HIGH;
  public static renderMode: string = Constants.RENDERMODE_BALL_AND_STICK;
  public static selectionMode: string = Constants.SELECTIONMODE_IDENTIFY;
  public static atomRadiusMode: string = Constants.ATOM_RADIUS_REDUCED;
  public static atomRadiusScale = 1.0;
  public static selectable = true;
  public static zoom = 1.0;
  public static autoCenter = true;
  public static baseUrl = "";
  public static pdbUrl = "";
  public static pdbData: string;
  public static domElement = "wglContent"; // DOM element id to attach molecule renderer
  public static infoElement = "wglInfo"; // DOM element id to write info text output
  public static estimateBondTypes = true;
}

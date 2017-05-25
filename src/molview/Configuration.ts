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
import {Constants} from "./Constants";

export class Configuration {

    public static renderQuality: string = Constants.RENDERQUALITY_HIGH;
    public static renderMode: string = Constants.RENDERMODE_BALL_AND_STICK;
    public static selectionMode: string = Constants.SELECTIONMODE_IDENTIFY;
    public static atomRadiusMode: string = Constants.ATOM_RADIUS_REDUCED;
    public static atomRadiusScale: number = 1.0;
    public static selectable: boolean = true;
    public static maxFrames: number = 99;
    public static zoom: number = 1.0;
    public static autoCenter: boolean = true;
    public static baseUrl: string = "";
    public static pdbUrl: string = "";
    public static pdbData: string;
    public static domElement: string = "wgl-content"; // dom element to attach molecule renderer
    public static infoElement: string = "wgl-info"; // dom element to set info text output
}

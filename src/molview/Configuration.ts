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

    private static config: Configuration;

    renderQuality: string = Constants.RENDERQUALITY_HIGH;
    renderMode: string = Constants.RENDERMODE_BALL_AND_STICK;
    selectionMode: string = Constants.SELECTIONMODE_IDENTIFY;
    atomRadiusMode: string = Constants.ATOM_RADIUS_REDUCED;
    atomRadiusScale: number = 1.0;
    selectable: Boolean = true;
    maxFrames: number = 99;
    zoom: number = 1.0;
    autoCenter: Boolean = true;
    baseUrl: string = "";
    pdbUrl: string = "";
    pdbData: string;
    domElement: string; // dom element to attach molecule renderer
    infoElement: string; // dom element to set info text output

    constructor(parameters: string[]) {

        if (parameters) {
            for (let p in parameters) {
                this[p] = parameters[p];
            }
        }
    };

    public static newConfig(parameters): void {
        Configuration.config = new Configuration(parameters);
    }

    public static getConfig(): Configuration {
        return Configuration.config;
    }
}
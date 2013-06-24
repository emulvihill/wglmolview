/*
 * =================================================================================================
 *
 * 	WebGL MolView
 * 	Copyright 2013 Eric Mulvihill. All Rights Reserved.
 *
 * 	This program is free software. You can redistribute and/or modify it
 * 	in accordance with the terms of the accompanying license agreement.
 *
 * =================================================================================================
 */
module molview
{
    /// <reference path="Constants.ts" />

    export class Configuration {

        private static config:molview.Configuration;

        renderQuality:string = Constants.RENDERQUALITY_HIGH;
        renderMode:string = Constants.RENDERMODE_BALL_AND_STICK;
        selectionMode:string = Constants.SELECTIONMODE_IDENTIFY;
        atomRadiusMode:string = Constants.ATOM_RADIUS_REDUCED;
        atomRadiusScale:number = 1.0;
        bondRadiusScale:number = 1.0;
        selectable:bool = true;
        maxFrames:number = 99;
        zoom:number = 1.0;
        autoCenter:bool = true;
        baseUrl:string = "";
        pdbUrl:string = "";
        pdbData:string;
        domElement:string; // dom element to attach molecule renderer
        infoElement:string; // dom element to set info text output

        constructor(parameters) {

            if (parameters) {
                for (p in parameters) {
                    this[p] = parameters[p];
                }
            }
        };

        public static newConfig(parameters):void
        {
            config = new molview.Configuration(parameters);
        }

        public static getConfig():molview.Configuration {
            return config;
        }
    }
}
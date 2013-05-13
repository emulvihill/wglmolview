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
        pdbUrl:string;
        pdbData:string;

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
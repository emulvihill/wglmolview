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

import {RenderableObject} from "./RenderableObject";
import {DataObject, ElementData} from "../ElementData";
import {Bond} from "./Bond";
import {Configuration} from "../Configuration";
import {Constants} from "../Constants";
import {Vector3} from "three";
import {IMolRenderer} from "../renderer/IMolRenderer";
import {AminoAcidData} from "../AminoAcidData";
export class AtomInitializer {
    serial: number;
    elemName: string;
    element: string;
    altLoc: number;
    resName: string;
    chainId: number;
    resSeq: string;
    iCode: string;
    x: number;
    y: number;
    z: number;
    occupancy: string;
    tempFactor: number;
    segId: number;
    element2: string;
    charge: number;
}

export class Atom extends RenderableObject {
    radius: number;
    color: number;
    name: string;
    element: string;   // first chars of elemName
    element2: string;
    elemName: string;  // short 4-char pdb name

    private altLoc: number;
    private tempFactor: number;
    private serial: number;
    private chainID: number;
    private segID: number;
    private charge: number[];
    private resName: string;
    private resSeq: string;
    private iCode: string;
    private occupancy: string;

    private _bonds: Bond[][];
    public get bonds(): Bond[] {
        return this._bonds[this.mframe];
    }

    constructor(init: AtomInitializer) {
        super();


        let edata: DataObject = ElementData.getData(init.element);
        if (!edata) {
            // unsupported ATOM record
            console.warn("bad ATOM symbol: " + init.element);
            return;
        }
        this.element = init.element;
        this.id = init.serial.toString();
        this.altLoc = init.altLoc;
        this.resName = init.resName;
        this.chainID = init.chainId;
        this.resSeq = init.resSeq;
        this.iCode = init.iCode;
        this.occupancy = init.occupancy;
        this.tempFactor = init.tempFactor;
        this.segID = init.segId;
        this.element2 = init.element2;
        this.charge = [init.charge];

        this.name = edata.name;
        this.color = edata.color;

        let radiusScale: number = Configuration.getConfig().atomRadiusScale;
        switch (Configuration.getConfig().atomRadiusMode) {
            case Constants.ATOM_RADIUS_ACCURATE:
                this.radius = radiusScale * edata.radius;
                break;
            case Constants.ATOM_RADIUS_REDUCED:
                this.radius = radiusScale * (Constants.ATOM_RADIUS_REDUCED_SCALE * edata.radius + (1 - Constants.ATOM_RADIUS_REDUCED_SCALE) * ElementData.getData("H").radius);
                break;
            case Constants.ATOM_RADIUS_UNIFORM:
            default:
                this.radius = radiusScale * ElementData.getData("H").radius;
        }

        this.charge = new Array(Configuration.getConfig().maxFrames);  // per frame
        this._bonds = new Array(Configuration.getConfig().maxFrames);   // per frame
        for (let i: number = 0; i <= Configuration.getConfig().maxFrames; i++) {
            this._bonds[i] = [];
        }

    }

    public addToMframe(x: number, y: number, z: number, c: number, mframe: number): void {
        this.mframe = mframe;
        this.loc = new Vector3(x, y, z);
        this.charge[mframe] = c;
    }


    public addBond(bond: Bond): void {
        this._bonds[this.mframe].push(bond);
    }


    public render(renderer: IMolRenderer): void {
        renderer.addRenderableObject(this);
    }


    public setColorMode(colorMode: string): void {

        switch (colorMode) {
            case Constants.COLORMODE_CPK:  // i.e. "element color"
                let edata: DataObject = ElementData.getData(this.element);
                this.color = edata ? edata.color : ElementData.getData("C").color;
                break;

            case Constants.COLORMODE_AMINO_ACID:
                let aaData = AminoAcidData.getData(this.resName).color;
                this.color = aaData ? aaData : 0xCCCCCC;
                break;
        }
    }
}
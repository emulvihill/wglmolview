/*
 * =================================================================================================
 *
 * 	WebGL MolView
 * 	Copyright 2013-2015 Eric Mulvihill. All Rights Reserved.
 *
 * 	This program is free software. You can redistribute and/or modify it
 * 	in accordance with the terms of the accompanying license agreement.
 *
 * =================================================================================================
 */
module molview
{
export class Constants
{
	public static CONTAINER_ATOM:string = "atomContainer";
	public static CONTAINER_BOND:string = "bondContainer";

	public static SELECTION:string = "selection";
	
    public static SELECTION_MAX_MOUSETRAVEL:number = 8;

	public static ATOM_RADIUS_ACCURATE:string = "accurate";
	public static ATOM_RADIUS_REDUCED:string = "reduced";
	public static ATOM_RADIUS_UNIFORM:string = "uniform";

	public static ATOM_RADIUS_REDUCED_SCALE:number = 0.25;
	
	public static COLORMODE_CPK:string = "cpk";
	public static COLORMODE_AMINO_ACID:string = "amino_acid";

	public static BOND_DOUBLE_RADIUS:number = 0.8;
	public static BOND_TRIPLE_RADIUS:number = 0.7;
	
	public static SELECTIONMODE_IDENTIFY:string = "identify";
	public static SELECTIONMODE_DISTANCE:string = "distance";
    public static SELECTIONMODE_ROTATION:string = "rotation";
	public static SELECTIONMODE_TORSION:string = "torsion";
	
	public static RENDERMODE_BALL_AND_STICK:string = "ball_and_stick";
	public static RENDERMODE_SPACE_FILL:string = "space_fill";
	public static RENDERMODE_STICKS:string = "sticks";
		
	public static RENDERQUALITY_PREVIEW:string = "preview";
	public static RENDERQUALITY_LOW:string = "low";
	public static RENDERQUALITY_NORMAL:string = "normal";
	public static RENDERQUALITY_HIGH:string = "high";
	
}
}
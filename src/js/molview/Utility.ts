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

export class Utility
{
	public static r2d(radians:number):number
	{
		return 360.0 / (2.0*Math.PI) * radians;
	}
}
}
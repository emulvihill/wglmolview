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
export class AminoAcidData
{
		private static aminoAcidColors:Object =
		{
		ALA:{color:"9D9D9D"},
		ARG:{color:"0F46C8"},
		ASN:{color:"00ADAD"},
		ASP:{color:"B40707"},
		CYS:{color:"B4B400"},
		GLU:{color:"B40707"},
		GLN:{color:"00ADAD"},
		GLY:{color:"B8B8B8"},
		HIS:{color:"6666A5"},
		ILE:{color:"0B660B"},
		LEU:{color:"0B660B"},
		LYS:{color:"0F46C8"},
		MET:{color:"B4B400"},
		PHE:{color:"272785"},
		PRO:{color:"AD7666"},
		SER:{color:"C47600"},
		THR:{color:"C47600"},
		TRP:{color:"8D468D"},
		TYR:{color:"272785"},
		VAL:{color:"0B660B"}
		};

	public static getData(aa:string):Object
	{
		return Object(aminoAcidColors[aa]);
	}
	
}
}
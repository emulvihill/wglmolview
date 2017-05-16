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
export class AminoAcidData {
    private static aminoAcidColors: { [key: string]: { color: number } } =
        {
            ALA: {color: 0x9D9D9D},
            ARG: {color: 0x0F46C8},
            ASN: {color: 0x00ADAD},
            ASP: {color: 0xB40707},
            CYS: {color: 0xB4B400},
            GLU: {color: 0xB40707},
            GLN: {color: 0x00ADAD},
            GLY: {color: 0xB8B8B8},
            HIS: {color: 0x6666A5},
            ILE: {color: 0x0B660B},
            LEU: {color: 0x0B660B},
            LYS: {color: 0x0F46C8},
            MET: {color: 0xB4B400},
            PHE: {color: 0x272785},
            PRO: {color: 0xAD7666},
            SER: {color: 0xC47600},
            THR: {color: 0xC47600},
            TRP: {color: 0x8D468D},
            TYR: {color: 0x272785},
            VAL: {color: 0x0B660B}
        };

    public static getData(aa: string): { color: number } {
        return AminoAcidData.aminoAcidColors[aa];
    }

}
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

/**
 * Amino Acid constants
 */
export class AminoAcidData {
  private static aminoAcidColors: { [key: string]: { color: number } } = {
    ALA: {color: 0x9d9d9d},
    ARG: {color: 0x0f46c8},
    ASN: {color: 0x00adad},
    ASP: {color: 0xb40707},
    CYS: {color: 0xb4b400},
    GLN: {color: 0x00adad},
    GLU: {color: 0xb40707},
    GLY: {color: 0xb8b8b8},
    HIS: {color: 0x6666a5},
    ILE: {color: 0x0b660b},
    LEU: {color: 0x0b660b},
    LYS: {color: 0x0f46c8},
    MET: {color: 0xb4b400},
    PHE: {color: 0x272785},
    PRO: {color: 0xad7666},
    SER: {color: 0xc47600},
    THR: {color: 0xc47600},
    TRP: {color: 0x8d468d},
    TYR: {color: 0x272785},
    VAL: {color: 0x0b660b},
  };

  public static getData(aa: string): { color: number } {
    return AminoAcidData.aminoAcidColors[aa];
  }
}

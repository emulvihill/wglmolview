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

import {BondInitializer} from "./model/BondInitializer";
import {Atom} from "./model/Atom";
import {AtomInitializer} from "./model/AtomInitializer";
import {Bond} from "./model/Bond";
import {Molecule} from "./model/Molecule";

/**
 * Parses .PDB molecule definition format.
 */
export class PDBParser {

    static parsePDB(pdb: string, mframe: number = 0): Molecule {
        const objects: Array<Atom | Bond> = [];
        const pdbArray: string[] = pdb.split("\n");
        let compound: object = {};
        let header: object = {};
        let title: string = "";

        for (const currLine of pdbArray) {

            const recordType: string = currLine.substring(0, 6);

            switch (recordType) {
                case "SEQRES":
                    /*
                     --        COLUMNS        DATA TYPE       FIELD         DEFINITION
                     --        ---------------------------------------------------------------------------------
                     --        1 -  6        Record name     "SEQRES"
                     --        9 - 10        Integer         serNum        Serial number of the SEQRES record for the
                     current chain.  Starts at 1 and increments by one each line.
                     --        Reset to 1 for each chain.
                     --        12             Character       chainID       Chain identifier.  This may be any single
                     legal character, including a blank which is used if there is only one chain.
                     --        14 - 17        Integer         numRes        Number of residues in the chain. This value
                     is repeated on every record.
                     --        20 - 22        Residue name    resName       Residue name.
                     --        24 - 26        Residue name    resName       Residue name.
                     --        28 - 30        Residue name    resName       Residue name.
                     --        32 - 34        Residue name    resName       Residue name.
                     --        36 - 38        Residue name    resName       Residue name.
                     --        40 - 42        Residue name    resName       Residue name.
                     --        44 - 46        Residue name    resName       Residue name.
                     --        48 - 50        Residue name    resName       Residue name.
                     --        52 - 54        Residue name    resName       Residue name.
                     --        56 - 58        Residue name    resName       Residue name.
                     --        60 - 62        Residue name    resName       Residue name.
                     --        64 - 66        Residue name    resName       Residue name.
                     --        68 - 70        Residue name    resName       Residue name.
                     */

                    break;

                case "HEADER" :
                    /*
                     -- The HEADER record uniquely identifies a PDB entry through the idCode field. This record also
                     provides a classification for the entry. Finally, it contains the date the coordinates were

                     deposited at the PDB.
                     --        COLUMNS        DATA TYPE       FIELD           DEFINITION
                     --        1 -  6        Record name     "HEADER"
                     --        11 - 50        String(40)      classification  Classifies the molecule(s)
                     --        51 - 59        Date            depDate         Deposition date.  This is the date the
                     coordinates were received by the PDB
                     --        63 - 66        IDcode          idCode          This identifier is unique within PDB
                     */
                    header = {
                        classification: currLine.substring(10, 50),
                        depDate: currLine.substring(50, 59),
                        idCode: currLine.substring(62, 66)
                    };

                    break;

                case "TITLE ":
                    /*
                     -- The TITLE record contains a title for the experiment or analysis that is represented
                     in the entry. It should identify an entry in the PDB in the same way that a title identifies
                     a paper.
                     --COLUMNS        DATA TYPE       FIELD          DEFINITION
                     ----------------------------------------------------------------------------------
                     -- 1 -  6        Record name     "TITLE "
                     -- 9 - 10        Continuation    continuation   Allows concatenation of multiple  records
                     --11 - 70        String          title          Title of the experiment.
                     */
                    title = currLine.substring(10, 70);

                    break;

                case "COMPND":
                    /*
                     -- The COMPND record describes the macromolecular contents of an entry.
                     --  COLUMNS        DATA TYPE         FIELD          DEFINITION
                     --  ----------------------------------------------------------------------------------
                     --   1 -  6        Record name       "COMPND"
                     --   9 - 10        Continuation      continuation   Allows concatenation of multiple records.
                     --  11 - 70        Specification     compound       Description of the molecular list components.
                     */
                    compound = {continuation: currLine.substring(8, 10), compound: currLine.substring(10, 70)};

                    break;

                case "COLOR ":
                    /*
                     -- this is not a part of the normal PDB spec.
                     --  COLUMNS        DATA TYPE         FIELD          DEFINITION
                     --  ----------------------------------------------------------------------------------
                     --   1 -  6        Record name       "COLOR "
                     --   7 - 30        String            id             identifier for the object to be recolored
                     --   31 - 36       RRGGBB            newcolor       new color in RRGGBB hex string format
                     */
                    const id = currLine.substring(6, 30).trim();
                    const newcolor: string = currLine.substring(30, 36);
                    const obj: Atom | Bond = objects.filter(o => o.id === id)[0];
                    if (obj) {
                        obj.color = newcolor;
                    }
                    break;

                case "ATOM  ":
                case "HETATM":
                    /*
                     --COLUMNS        DATA TYPE       FIELD          DEFINITION
                     --------------------------------------------------------------------------------
                     --  1 -  6        Record name     "HETATM"
                     --  7 - 11        Integer         serial         Atom serial number.
                     -- 13 - 16        Atom            name           Atom name.
                     -- 17             Character       altLoc         Alternate location indicator.
                     -- 18 - 20        Residue name    resName        Residue name.
                     -- 22             Character       chainID        Chain identifier.
                     -- 23 - 26        Integer         resSeq         Residue sequence number.
                     -- 27             AChar           iCode          Code for insertion of residues.
                     -- 31 - 38        Real(8.3)       x              Orthogonal coordinates for X.
                     -- 39 - 46        Real(8.3)       y              Orthogonal coordinates for Y.
                     -- 47 - 54        Real(8.3)       z              Orthogonal coordinates for Z.
                     -- 55 - 60        Real(6.2)       occupancy      Occupancy.
                     -- 61 - 66 b       Real(6.2)       tempFactor     Temperature factor.
                     -- 73 - 76        LString(4)      segID          Segment identifier; left-justified.
                     -- 77 - 78        LString(2)      element        Element symbol; right-justified.
                     -- 79 - 80        LString(2)      charge         Charge on the atom.
                     */

                    const serial = parseInt(currLine.substring(6, 11), 10);
                    const init: AtomInitializer = {
                        id: "atom" + serial,
                        serial,
                        element: currLine.substring(12, 14).trim(),
                        altLoc: parseInt(currLine.substring(16, 17), 10),
                        resName: currLine.substring(17, 20),
                        chainId: parseInt(currLine.substring(21, 22), 10),
                        resSeq: currLine.substring(22, 26),
                        iCode: currLine.substring(26, 27),
                        x: parseFloat(currLine.substring(30, 38)),
                        y: parseFloat(currLine.substring(38, 46)),
                        z: parseFloat(currLine.substring(46, 54)),
                        occupancy: currLine.substring(60, 66),
                        tempFactor: parseFloat(currLine.substring(72, 76)),
                        segId: parseInt(currLine.substring(76, 78), 10),
                        element2: currLine.substring(78, 80).trim(),
                        charge: parseInt(currLine.substring(80, 81), 10)
                    };

                    const atom: Atom =
                        objects.find(o => o.id === "atom" + serial) as Atom || new Atom(init);

                    if (atom && atom.name) {
                        objects.push(atom);
                        // add the object to current frame
                        atom.addToMframe(init.x, init.y, init.z, init.charge, mframe);
                    }

                    break;

                case "CONECT":
                case "CONEC2":
                case "CONEC3":
                    /*
                     -- COLUMNS         DATA TYPE        FIELD           DEFINITION
                     ---------------------------------------------------------------------------------
                     --  1 -  6         Record name      "CONECT"
                     --  7 - 11         Integer          serial          Atom serial number
                     -- 12 - 16         Integer          serial          Serial number of bonded atom
                     -- 17 - 21         Integer          serial          Serial number of bonded atom
                     -- 22 - 26         Integer          serial          Serial number of bonded atom
                     -- 27 - 31         Integer          serial          Serial number of bonded atom
                     -- 32 - 36         Integer          serial          Serial number of hydrogen bonded atom
                     -- 37 - 41         Integer          serial          Serial number of hydrogen bonded atom
                     -- 42 - 46         Integer          serial          Serial number of salt bridged atom
                     -- 47 - 51         Integer          serial          Serial number of hydrogen bonded atom
                     -- 52 - 56         Integer          serial          Serial number of hydrogen bonded atom
                     -- 57 - 61         Integer          serial          Serial number of salt bridged atom
                     */
                    const cAtom: number = parseInt(currLine.substring(6, 11), 10);
                    const s: number[] = [parseInt(currLine.substring(11, 16), 10),
                        parseInt(currLine.substring(16, 21), 10),
                        parseInt(currLine.substring(21, 26), 10),
                        parseInt(currLine.substring(26, 31), 10)];
                    const h: number[] = [parseInt(currLine.substring(31, 36), 10),
                        parseInt(currLine.substring(36, 41), 10),
                        parseInt(currLine.substring(41, 46), 10),
                        parseInt(currLine.substring(46, 51), 10)];
                    const sb: number[] = [parseInt(currLine.substring(51, 56), 10),
                        parseInt(currLine.substring(56, 61), 10)];

                    if (cAtom === 0) {
                        throw new Error("error in line: " + currLine);
                    }
                    // Unofficial PDB extension, CONECT -> single bond, CONECT2 -> double bond, CONEC3 -> triple bond
                    const tStr = currLine.substring(5, 6);
                    const t: number = (tStr === "2") ? 2 : (tStr === "3") ? 3 : 1;

                    for (let cb: number = 0; cb < 4; cb++) {
                        if (s[cb] > cAtom) {
                            const a1: Atom = objects.find(o => o.id === "atom" + cAtom) as Atom;
                            const a2: Atom = objects.find(o => o.id === "atom" + s[cb]) as Atom;
                            // make the bond and add to current frame
                            if (a1 && a2) {
                                const bondId: string = a1.id + "-" + a2.id;
                                let bond: Bond = objects.find(o => o.id === "bond" + bondId) as Bond;
                                if (!bond) {
                                    // no bond exists here
                                    bond = new Bond({t, a1, a2, id: bondId});
                                    objects.push(bond);
                                }
                                bond.addToMframe(mframe);
                            }
                        }
                    }

                    break;

                case "END   ":
                case "TER   ":
                    break;

            } // end switch
        }

        return new Molecule({objects, compound, header, title});
    }
}

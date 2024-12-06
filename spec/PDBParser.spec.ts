import { Molecule } from "../src/molview/model/Molecule";
import { Configuration, defaultConfiguration } from "../src/molview/MolView";
import { PDBParser } from "../src/molview/PDBParser";
import { beforeAll, describe, expect, it } from "vitest";
import { resolve } from "path";
import { readFileSync } from "fs";
// @vitest-environment jsdom

describe("PDBParser", () => {

    let pdbData: string;
    let config: Configuration;

    beforeAll(async () => {
        // Read the file contents into pdbData
        const filePath = resolve(__dirname, "./data/ala.pdb");
        pdbData = readFileSync(filePath, "utf-8");

        // need dom elements to exist
        document.createElement("wglContent");
        document.createElement("wglInfo");
        config = Object.assign({}, defaultConfiguration, {
            domElement: "wglContent",
            infoElement: "wglInfo",
            pdbData: pdbData
        });
    });

    it("creates parser", () => {
        const parser = new PDBParser();
        expect(parser).toBeTruthy();
    });

    it("parses ala.pdb", () => {
        const mol: Molecule = PDBParser.parsePDB(pdbData, config);
        expect(mol).toBeTruthy();
        expect(mol.numAtoms).toEqual(13);
        expect(mol.numBonds).toEqual(13);
    });
});

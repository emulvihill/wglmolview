import type {Atom} from "./Atom";
import type {Bond} from "./Bond";

/**
 * Initializer for Molecule
 */
export class MoleculeInitializer {
  objects: Array<Atom | Bond>;
  title: string;
  header: object;
  compound: object;
}

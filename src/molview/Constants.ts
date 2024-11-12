/**
 * String constants for MolView
 */
export class Constants {
    public static readonly ATOM_RADIUS_ACCURATE: string = "accurate";
    public static readonly ATOM_RADIUS_REDUCED: string = "reduced";
    public static readonly ATOM_RADIUS_UNIFORM: string = "uniform";

    public static readonly ATOM_RADIUS_REDUCED_SCALE: number = 0.25;

    public static readonly COLORMODE_CPK: string = "cpk";
    public static readonly COLORMODE_AMINO_ACID: string = "amino_acid";

    public static readonly SELECTIONMODE_IDENTIFY: string = "identify";
    public static readonly SELECTIONMODE_DISTANCE: string = "distance";
    public static readonly SELECTIONMODE_ROTATION: string = "rotation";
    public static readonly SELECTIONMODE_TORSION: string = "torsion";

    public static readonly RENDERMODE_BALL_AND_STICK: string = "ball_and_stick";
    public static readonly RENDERMODE_SPACE_FILL: string = "space_fill";
    public static readonly RENDERMODE_STICKS: string = "sticks";
}
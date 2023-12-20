import p5 from "p5";

export interface Shape {
    x: number;
    y: number;
    size: number;

    draw(p: p5): void;
    move(dx: number, dy: number): void;
}
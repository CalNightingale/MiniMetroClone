import p5 from "p5";

// Define the abstract class Shape
export abstract class Shape {
    x: number;
    y: number;
    size: number;
    color: string;

    constructor(x: number, y: number, size: number, color: string) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
    }

    draw(p: p5): void {
        p.fill(this.color);
    }

    // Concrete implementation of move, can be used by all subclasses
    move(dx: number, dy: number): void {
        this.x += dx;
        this.y += dy;
    }

    isMouseOver(x: number, y: number): boolean {
        return x > this.x && x < this.x + this.size
        && y > this.y && y < this.y + this.size;
    }
}

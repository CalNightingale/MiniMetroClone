import p5 from "p5";

export class Circle {
    x: number;
    y: number;
    radius: number;

    constructor(x: number, y: number, radius: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    draw(p: p5): void {
        p.ellipse(this.x, this.y, this.radius * 2);
    }

    move(dx: number, dy: number): void {
        this.x += dx;
        this.y += dy;
      }
}


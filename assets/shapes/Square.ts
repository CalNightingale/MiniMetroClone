import p5 from "p5";
import { Shape } from "./Shape";
import { Constants } from "../constants";

export class Square extends Shape{
    constructor(x: number, y: number, size: number, color: string) {
        super(x, y, size, color);
    }

    draw(p: p5): void {
        super.draw(p);
        p.square(this.x, this.y, this.size);
    }

    move(dx: number, dy: number): void {
        this.x += dx;
        this.y += dy;
    }
}


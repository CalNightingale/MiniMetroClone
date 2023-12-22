import p5 from "p5";
import { Shape } from "./Shape";
import { Constants } from "../constants";

export class Triangle extends Shape{
    constructor(x: number, y: number, size: number, color: string) {
        super(x, y, size, color);
    }

    draw(p: p5): void {
        super.draw(p);
        p.triangle( this.x, this.y + this.size,
                    this.x + this.size, this.y + this.size,
                    this.x + this.size/2, this.y);
    }
}


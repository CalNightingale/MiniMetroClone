import p5 from "p5";
import { Shape } from "./Shape.js";
import { Constants } from "../constants.js";

export class Square extends Shape{
    constructor(x: number, y: number, size: number, color: p5.Color) {
        super(x, y, size, color);
    }

    draw(p: p5): void {
        super.draw(p);
        p.strokeWeight(Constants.STATION_OUTLINE);
        p.square(this.x, this.y, this.size);
    }

    move(dx: number, dy: number): void {
        this.x += dx;
        this.y += dy;
    }
}


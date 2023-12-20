import p5 from "p5";
import { Shape } from "./Shape.js";
import { Constants } from "../constants.js";

export class Square implements Shape{
    x: number;
    y: number;
    size: number;

    constructor(x: number, y: number, size: number) {
        this.x = x;
        this.y = y;
        this.size = size;
    }

    draw(p: p5): void {
        p.strokeWeight(Constants.STATION_OUTLINE);
        p.square(this.x, this.y, this.size);
    }

    move(dx: number, dy: number): void {
        this.x += dx;
        this.y += dy;
    }
}


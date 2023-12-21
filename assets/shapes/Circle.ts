import p5 from "p5";
import { Shape } from "./Shape";
import { Constants } from "../constants";

export class Circle extends Shape{
    constructor(x: number, y: number, radius: number, color: p5.Color) {
        super(x, y, radius * 2, color); // Call the constructor of the abstract class
    }

    draw(p: p5): void {
        super.draw(p);
        p.strokeWeight(Constants.STATION_OUTLINE);
        p.ellipse(this.x + this.size/2, this.y + this.size/2, this.size);
    }
}


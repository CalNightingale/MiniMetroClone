import p5 from "p5";
import { Shape } from "./Shape";
import { Constants } from "../constants";

export class TrainShape extends Shape {
    static noseToSizeRatio = 0.3;
    angle: number;

    // train shape defined by its center
    constructor(x: number, y: number, color: string) {
        super(x, y, Constants.TRAIN_LENGTH, color);
        this.angle = 0;
    }

    draw(p: p5) {
        p.push();
        p.strokeWeight(0);
        p.fill(this.color);
        p.rectMode('center');
        p.rect(this.x, this.y, this.size, this.size*Constants.TRAIN_ASPECT);
        p.pop();
    }
}
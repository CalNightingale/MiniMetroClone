import p5 from "p5";
import { Line } from "./Line";
import { Constants } from "../constants";


export class LineEnd {
    line: Line;
    rotation: number;

    constructor(line: Line, rotation: number) {
        this.line = line;
        this.rotation = rotation;
    }

    draw(p: p5, x: number, y: number) {
        // make station center the origin
        p.push();
        p.strokeWeight(0);
        p.translate(x,y);
        p.rotate(this.rotation);
        const baseX = -Constants.EDGE_WIDTH/2;
        const baseY = -Constants.EDGE_WIDTH/2;
        p.fill(this.line.getColor());
        p.rect(baseX,baseY,Constants.LINE_END_BASE_LENGTH,Constants.EDGE_WIDTH);
        p.rectMode('center');
        const endCenterY = Constants.LINE_END_BASE_LENGTH - baseY;
        p.rect(Constants.LINE_END_BASE_LENGTH, 0, Constants.EDGE_WIDTH, Constants.LINE_END_BASE_LENGTH);
        p.pop();
    }
}
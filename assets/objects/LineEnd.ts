import p5 from "p5";
import { Line } from "./Line";
import { Constants } from "../constants";
import { Station } from "./Station";


export class LineEnd {
    line: Line;
    station: Station;
    rotation: number;

    constructor(line: Line, station: Station, rotation: number) {
        this.line = line;
        this.station = station;
        this.rotation = rotation;
    }

    containsPoint(x: number, y: number): boolean {
        console.log(`LE C P`);
        // Translate the point back
        const translatedX = x - this.station.getCenterX();
        const translatedY = y - this.station.getCenterY();
    
        // Rotate the point back
        const cosTheta = Math.cos(-this.rotation);
        const sinTheta = Math.sin(-this.rotation);
        const rotatedX = translatedX * cosTheta - translatedY * sinTheta;
        const rotatedY = translatedX * sinTheta + translatedY * cosTheta;
    
        // Rectangle 1 (Base)
        const baseX = -Constants.EDGE_WIDTH / 2;
        const baseY = -Constants.EDGE_WIDTH / 2;
        const baseWidth = Constants.LINE_END_BASE_LENGTH;
        const baseHeight = Constants.EDGE_WIDTH;
    
        const inBaseRect = rotatedX >= baseX && rotatedX <= (baseX + baseWidth) &&
                           rotatedY >= baseY && rotatedY <= (baseY + baseHeight);
    
        // Rectangle 2 (End Cap)
        const capX = Constants.LINE_END_BASE_LENGTH - Constants.EDGE_WIDTH / 2;
        const capY = -Constants.LINE_END_BASE_LENGTH / 2;
        const capWidth = Constants.EDGE_WIDTH;
        const capHeight = Constants.LINE_END_BASE_LENGTH;
    
        const inCapRect = rotatedX >= capX && rotatedX <= (capX + capWidth) &&
                          rotatedY >= capY && rotatedY <= (capY + capHeight);
    
        return inBaseRect || inCapRect;
    }
    

    draw(p: p5) {
        p.push();
        // set color/stroke
        p.strokeWeight(0);
        p.fill(this.line.getColor());
        // make station center the origin
        p.translate(this.station.getCenterX(), this.station.getCenterY());
        // apply rotation
        p.rotate(this.rotation);
        const baseX = -Constants.EDGE_WIDTH/2;
        const baseY = -Constants.EDGE_WIDTH/2;
        // draw base rectangle
        p.rect(baseX,baseY,Constants.LINE_END_BASE_LENGTH,Constants.EDGE_WIDTH);
        // draw end cap rectangle (easier to switch to center mode than calculate corner)
        p.rectMode('center');
        p.rect(Constants.LINE_END_BASE_LENGTH, 0, Constants.EDGE_WIDTH, Constants.LINE_END_BASE_LENGTH);
        p.pop();
    }
}
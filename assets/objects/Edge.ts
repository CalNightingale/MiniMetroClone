import p5 from "p5";
import { Station } from "./Station"
import { StationPort } from "./StationPort";
import { Constants } from "../constants";
import { Line } from "./Line";

export class Edge {
    from: Station; 
    to: Station;
    fromPort: StationPort;
    toPort: StationPort;
    jointX: number;
    jointY: number;

    constructor(from: Station, to: Station) {
        this.from = from;
        this.to = to;
        [this.fromPort, this.toPort, this.jointX, this.jointY] = this.computePorts();
    }

    // return dx, dy for vector
    static getDirectionVector(port: StationPort): {x: number, y: number}{
        switch (port) {
            case StationPort.N:  return {x: 0, y: 1};
            case StationPort.NE: return {x: 1, y: 1};
            case StationPort.E:  return {x: 1, y: 0};
            case StationPort.SE: return {x: 1, y: -1};
            case StationPort.S:  return {x: 0, y: -1};
            case StationPort.SW: return {x: -1, y: -1};
            case StationPort.W:  return {x: -1, y: 0};
            case StationPort.NW: return {x: -1, y: 1};
            default:             return {x: 0, y: 0};
        }
    }

    static isCardinal(port: StationPort): boolean {
        return port == StationPort.N || port == StationPort.E || port == StationPort.S || port == StationPort.W; 
    }

    computePorts(): [StationPort, StationPort, number, number] {
        let fromPort: StationPort, toPort: StationPort;
        let jointX = this.from.getCenterX();
        let jointY = this.from.getCenterY();
        let dx = this.to.x - this.from.x;
        let dy = this.to.y - this.from.y;

        if (this.from.x === this.to.x) {
            // Vertical line
            fromPort = this.from.y < this.to.y ? StationPort.S : StationPort.N;
            toPort = this.from.y < this.to.y ? StationPort.N : StationPort.S;
        } else if (this.from.y === this.to.y) {
            // Horizontal line
            fromPort = this.from.x < this.to.x ? StationPort.E : StationPort.W;
            toPort = this.from.x < this.to.x ? StationPort.W : StationPort.E;
        } else {
            if (dx > 0) {
                // east
                if (dy > 0) {
                    // south(east)
                    toPort = StationPort.NW;
                    if (Math.abs(dx) > Math.abs(dy)) {
                        // more east than south
                        fromPort = StationPort.E;
                    } else {
                        // more south than east
                        fromPort = StationPort.S;
                    }
                } else {
                    // north(east)
                    toPort = StationPort.SW;
                    if (Math.abs(dx) > Math.abs(dy)) {
                        // more east than north
                        fromPort = StationPort.E;
                    } else {
                        // more north than east
                        fromPort = StationPort.N;
                    }
                }
            } else {
                // west
                if (dy > 0) {
                    // south(west)
                    toPort = StationPort.NE;
                    if (Math.abs(dx) > Math.abs(dy)) {
                        // more west than south
                        fromPort = StationPort.W;
                    } else {
                        // more south than west
                        fromPort = StationPort.S;
                    }
                } else {
                    // north(west)
                    toPort = StationPort.SE;
                    if (Math.abs(dx) > Math.abs(dy)) {
                        // more west than north
                        fromPort = StationPort.W;
                    } else {
                        // more north than west
                        fromPort = StationPort.N;
                    }
                }
            }
        }

        if (fromPort == StationPort.E || fromPort == StationPort.W) {
            // moving horizontally
            jointX = this.from.getCenterX() + dx-dy;
            jointY = this.from.getCenterY();
        } else if (fromPort == StationPort.N || fromPort == StationPort.S) {
            jointX = this.from.getCenterX();
            jointY = this.from.getCenterY() + dy-dx;
        } else {
            throw new Error("Bad edge direction vector");
        }
        return [fromPort, toPort, jointX, jointY];
    }

    findJointPoints(): [number, number, number, number] {
        return [0,0,0,0];
    }

    draw(p: p5) {
        // Draw the first line to the joint
        p.line(this.from.getCenterX(), this.from.getCenterY(), this.jointX, this.jointY);

        // Draw the second line from the joint to the destination
        p.line(this.jointX, this.jointY, this.to.getCenterX(), this.to.getCenterY());
    }
}
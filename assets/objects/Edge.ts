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
    jointPct: number;
    totalLength: number;
    originalAngle: number;
    targetAngle: number;

    constructor(from: Station, to: Station) {
        this.from = from;
        this.to = to;
        [this.fromPort, this.toPort, this.jointX, this.jointY] = this.computePorts();
        this.jointPct = this.getPctElapsed(this.jointX, this.jointY);
        this.totalLength = this.getDistToJoint(this.from.x, this.from.y) + 
                            this.getDistToJoint(this.to.x, this.to.y);
        //console.log(`New edge has joint pct ${this.jointPct}`);
        const oppositeDir = Edge.getDirectionVector(this.toPort);
        const newDir = {x: oppositeDir.x * -1, y: oppositeDir.y * -1};
        this.targetAngle = this.boundAngle(Edge.getAngleFromDirectionVector(newDir));
        this.originalAngle = this.boundAngle(Edge.getAngleFromDirectionVector(Edge.getDirectionVector(this.fromPort)));
        console.log(`Created new edge with fromPort ${this.fromPort} and toPort ${this.toPort}`)
    }

    // return dx, dy for vector
    static getDirectionVector(port: StationPort): {x: number, y: number}{
        switch (port) {
            case StationPort.N:  return {x: 0, y: -1};
            case StationPort.NE: return {x: 1, y: -1};
            case StationPort.E:  return {x: 1, y: 0};
            case StationPort.SE: return {x: 1, y: 1};
            case StationPort.S:  return {x: 0, y: 1};
            case StationPort.SW: return {x: -1, y: 1};
            case StationPort.W:  return {x: -1, y: 0};
            case StationPort.NW: return {x: -1, y: -1};
            default:             return {x: 0, y: 0};
        }
    }

    static getAngleFromDirectionVector(vector: { x: number, y: number }): number {
        return Math.atan2(vector.y, vector.x);
    }

    static isCardinal(port: StationPort): boolean {
        return port == StationPort.N || port == StationPort.E || port == StationPort.S || port == StationPort.W; 
    }

    /**
     * Find version of a given angle bounded by 0 and 2PI using recursion
     * @param angle potential unbounded angle
     * @returns angle clamped in range
     */
    boundAngle(angle: number): number {
        if (angle < 0) return this.boundAngle(angle + 2*Math.PI);
        else if (angle > 2*Math.PI) return this.boundAngle(angle - 2*Math.PI);
        else return angle;
    }
    
    getAngleDelta() {
        return this.targetAngle - this.originalAngle;
    }

    getInterpolatedAngle(pct: number) {
        return this.originalAngle + (this.targetAngle - this.originalAngle) * pct;
    }

    getDistToJoint(x: number, y: number) {
        let dx = this.jointX - x;
        let dy = this.jointY - y;
        return Math.sqrt(dx*dx + dy*dy);
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

    /**
     * Assuming you began at this.from, determine whether (x,y) is along the path
     * (falls on the line this.from -> (jointX, jointY) or line (jointX, jointY) -> this.to)
     * If it does not, throw an error
     * If it does, return the percentage of the edge that has been traversed
     * @param x 
     * @param y 
     */
    getPctElapsed(x: number, y: number): number {
        // Helper function to calculate distance between two points
        const dist = (x1: number, y1: number, x2: number, y2: number): number => {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        };
    
        // Total length of the edge
        const totalLength = dist(this.from.getCenterX(), this.from.getCenterY(), this.jointX, this.jointY) +
                            dist(this.jointX, this.jointY, this.to.getCenterX(), this.to.getCenterY());
    
        // Distance from 'from' to the given point
        const distFromStart = dist(this.from.getCenterX(), this.from.getCenterY(), x, y);
        // Distance from the given point to 'to'
        const distToEnd = dist(x, y, this.to.getCenterX(), this.to.getCenterY());
    
        // Check if the point lies on the line segment from 'from' to 'joint'
        if (distFromStart + dist(x, y, this.jointX, this.jointY) === dist(this.from.getCenterX(), this.from.getCenterY(), this.jointX, this.jointY)) {
            return distFromStart / totalLength;
        }
        // Check if the point lies on the line segment from 'joint' to 'to'
        else if (dist(x, y, this.jointX, this.jointY) + distToEnd === dist(this.jointX, this.jointY, this.to.getCenterX(), this.to.getCenterY())) {
            return (dist(this.from.getCenterX(), this.from.getCenterY(), this.jointX, this.jointY) + dist(x, y, this.jointX, this.jointY)) / totalLength;
        }
    
        // If the point is not on either of the line segments
        throw new Error("Point is not along the path of the edge");
    }

    draw(p: p5) {
        // Draw the first line to the joint
        p.line(this.from.getCenterX(), this.from.getCenterY(), this.jointX, this.jointY);

        // Draw the second line from the joint to the destination
        p.line(this.jointX, this.jointY, this.to.getCenterX(), this.to.getCenterY());
    }
}
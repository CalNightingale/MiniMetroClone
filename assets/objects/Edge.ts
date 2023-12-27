import p5 from "p5";
import { Station } from "./Station"
import { StationPort } from "./StationPort";
import { Line } from "./Line";

export class Edge {
    from: Station; 
    to: Station;
    line: Line;
    fromPort: StationPort;
    toPort: StationPort;
    jointX: number;
    jointY: number;
    jointPct: number;
    totalLength: number;
    originalAngle: number;
    targetAngle: number;
    toOffset: {x: number, y: number};
    fromOffset: {x: number, y: number};

    constructor(from: Station, to: Station, line: Line) {
        this.from = from;
        this.to = to;
        this.line = line;
        // offsets at each station, an
        this.toOffset = {x: 0, y: 0};
        this.fromOffset = {x: 0, y: 0};
        [this.fromPort, this.toPort, this.jointX, this.jointY] = this.computePorts();
        this.jointPct = this.getPctElapsed(this.jointX, this.jointY);
        this.totalLength = this.getDistToJoint(this.from.x, this.from.y) + 
                            this.getDistToJoint(this.to.x, this.to.y);
        //console.log(`New edge has joint pct ${this.jointPct}`);
        const oppositeDir = Edge.getDirectionVector(this.toPort);
        const newDir = {x: oppositeDir.x * -1, y: oppositeDir.y * -1};
        this.targetAngle = Edge.getAngle(this.toPort, false);
        this.originalAngle = Edge.getAngle(this.fromPort, false);
        console.log(`Created new edge with fromPort ${this.fromPort} (${this.originalAngle}) and toPort ${this.toPort} (${this.targetAngle})`)
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

    static getAngle(port: StationPort, reversed: boolean): number {
        let res: number;
        
        switch (port) {
            case StationPort.N:  res = Math.PI/2;
            break;
            case StationPort.NE: res = -Math.PI/4;
            break;
            case StationPort.E:  res = 0;
            break;
            case StationPort.SE: res = Math.PI/4;
            break;
            case StationPort.S:  res = Math.PI/2;
            break;
            case StationPort.SW: res = -Math.PI/4;
            break;
            case StationPort.W:  res = 0;
            break;
            case StationPort.NW: res = Math.PI/4;
            break;
        }
        return res;
    }

    static normalizeVector(vector: { x: number, y: number }): { x: number, y: number } {
        const magnitude = Math.sqrt(vector.x*vector.x + vector.y*vector.y);
        return {x: vector.x/magnitude, y: vector.y/magnitude};
    } 

    static getAngleFromDirectionVector(vector: { x: number, y: number }): number {
        return Math.atan2(vector.y, vector.x);
    }

    static isCardinal(port: StationPort): boolean {
        return port == StationPort.N || port == StationPort.E || port == StationPort.S || port == StationPort.W; 
    }

    touchesStation(s: Station): boolean {
        return s == this.to || s == this.from;
    }

    getJointPos(): {x: number, y: number} {
        return {x: this.jointX + this.toOffset.x + this.fromOffset.x,
                y: this.jointY + this.toOffset.y + this.fromOffset.y};
    }

    setOffset(offset: {x: number, y: number}, station: Station): void {
        console.log(`OFFSET SET CALL ${offset.x}, ${offset.y}`);
        if (station == this.to) {
            this.toOffset = offset;
        } else if (station == this.from) {
            this.fromOffset = offset;
        } else throw new Error(`Edge ${this} attempted to add offset to station ${station}`);        
    }

    /**
     * Find version of a given angle bounded between -PI/2 and PI/2 using recursion
     * @param angle potential unbounded angle
     * @returns angle clamped in range
     */
    boundAngle(angle: number): number {
        if (angle < -Math.PI/2) return this.boundAngle(angle + Math.PI);
        else if (angle > Math.PI/2) return this.boundAngle(angle - Math.PI);
        else return angle;
    }
    
    getAngleDelta() {
        return this.targetAngle - this.originalAngle;
    }

    getInterpolatedAngle(pct: number) {
        if (pct < 0 || pct >= 1) {
            console.warn(`interpolation function received pct ${pct}`);
        }
        const angleDiff = this.targetAngle - this.originalAngle;
        if (Math.abs(angleDiff) != Math.PI/4) {
            console.error(`Difference between target and original angle is ${angleDiff}`);
        }
        return this.originalAngle + (this.targetAngle - this.originalAngle) * pct;
    }

    getDistToJoint(x: number, y: number) {
        const jointPos = this.getJointPos();
        const dx = jointPos.x - x;
        const dy = jointPos.y - y;
        return Math.sqrt(dx*dx + dy*dy);
    }

    computePorts(): [StationPort, StationPort, number, number] {
        let fromPort: StationPort, toPort: StationPort;
        let jointX = this.from.getCenterX();
        let jointY = this.from.getCenterY();
        const dx = this.to.x - this.from.x;
        const dy = this.to.y - this.from.y;
        const amtLongerAxisIsLongerBy = Math.abs(Math.abs(dx)-Math.abs(dy));

        if (this.from.x === this.to.x) {
            // Vertical line
            fromPort = this.from.y < this.to.y ? StationPort.S : StationPort.N;
            toPort = this.from.y < this.to.y ? StationPort.N : StationPort.S;
        } else if (this.from.y === this.to.y) {
            // Horizontal line
            fromPort = this.from.x < this.to.x ? StationPort.E : StationPort.W;
            toPort = this.from.x < this.to.x ? StationPort.W : StationPort.E;
        } else if (dx === dy) {
            // west to east
            if (this.from.x < this.to.x) { // NW to SE
                if (this.from.y < this.to.y) {
                    fromPort = StationPort.SE;
                    toPort = StationPort.NW;
                } else { // SW TO NE
                    fromPort = StationPort.NE;
                    toPort = StationPort.SW;
                }
            } else {
                if (this.from.y < this.to.y) { // NE TO SW
                    fromPort = StationPort.SW;
                    toPort = StationPort.NE;
                } else { // SE to NW
                    fromPort = StationPort.NW;
                    toPort = StationPort.SE;
                }
            }
        } else {
            if (dx > 0) {
                // east
                if (dy > 0) {
                    // south(east)
                    toPort = StationPort.NW;
                    if (Math.abs(dx) > Math.abs(dy)) {
                        // more east than south
                        fromPort = StationPort.E;
                        jointX = this.from.getCenterX() + amtLongerAxisIsLongerBy;
                        jointY = this.from.getCenterY();
                    } else {
                        // more south than east
                        fromPort = StationPort.S;
                        jointX = this.from.getCenterX();
                        jointY = this.from.getCenterY() + amtLongerAxisIsLongerBy;
                    }
                } else {
                    // north(east)
                    toPort = StationPort.SW;
                    if (Math.abs(dx) > Math.abs(dy)) {
                        // more east than north
                        fromPort = StationPort.E;
                        jointX = this.from.getCenterX() + amtLongerAxisIsLongerBy;
                        jointY = this.from.getCenterY();
                    } else {
                        // more north than east
                        fromPort = StationPort.N;
                        jointX = this.from.getCenterX();
                        jointY = this.from.getCenterY() - amtLongerAxisIsLongerBy;
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
                        jointX = this.from.getCenterX() - amtLongerAxisIsLongerBy;
                        jointY = this.from.getCenterY();
                    } else {
                        // more south than west
                        fromPort = StationPort.S;
                        jointX = this.from.getCenterX();
                        jointY = this.from.getCenterY() + amtLongerAxisIsLongerBy;
                    }
                } else {
                    // north(west)
                    toPort = StationPort.SE;
                    if (Math.abs(dx) > Math.abs(dy)) {
                        // more west than north
                        fromPort = StationPort.W;
                        jointX = this.from.getCenterX() - amtLongerAxisIsLongerBy;
                        jointY = this.from.getCenterY();
                    } else {
                        // more north than west
                        fromPort = StationPort.N;
                        jointX = this.from.getCenterX();
                        jointY = this.from.getCenterY() - amtLongerAxisIsLongerBy;
                    }
                }
            }
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
        const jointPos = this.getJointPos();
        // Draw the first line to the joint
        p.line(this.from.getCenterX(), this.from.getCenterY(), jointPos.x, jointPos.y);

        // Draw the second line from the joint to the destination
        p.line(jointPos.x, jointPos.y, this.to.getCenterX(), this.to.getCenterY());
    }

    toString(): string {
        return `(${this.from.id}) -> (${this.to.id})`;
    }
}
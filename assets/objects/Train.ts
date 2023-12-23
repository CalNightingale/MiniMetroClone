import p5 from "p5";
import { Shape } from "../shapes/Shape";
import { TrainShape } from "../shapes/TrainShape";
import { Person } from "./Person";
import { Constants } from "../constants";
import { Station } from "./Station";
import { Line } from "./Line";
import { StationPort } from "./StationPort";
import { Edge } from "./Edge";

export class Train {
    private visual: TrainShape;
    private passengers: Person[];
    private moveDirection: {x: number, y: number} = {x: 0, y: 0};
    edge: Edge;
    private framesAtStation; // -1 if not at station, set to 0 if at station
    private reachedJoint: boolean;
    private lastDistToJoint: number;
    reachedDest: boolean;
    reversed: boolean;

    constructor(edge: Edge) {
        // create visual
        let x = edge.from.getCenterX();
        let y = edge.from.getCenterY();
        this.visual = new TrainShape(x, y);
        this.visual.angle = edge.originalAngle;

        // other initialization
        this.passengers = [];
        this.edge = edge;
        this.reversed = false;
        this.setMoveDir(Edge.getDirectionVector(edge.fromPort));
        
        // movement-related stuff
        this.framesAtStation = 0;
        this.reachedJoint = false;
        this.reachedDest = false;
        this.lastDistToJoint = -1;
    }

    setMoveDir(dir: {x: number, y: number}): void {
        let magnitude = Math.sqrt(dir.x*dir.x + dir.y*dir.y);
        this.moveDirection = {x: dir.x/magnitude, y: dir.y/magnitude};
    }

    // invert and return movement direction
    invertMoveDirection(): {x: number, y: number} {
        let newMD = {x: -this.moveDirection.x, y: -this.moveDirection.y};
        console.log(`INVERTED MD; it is now ${newMD.x},${newMD.y}`);
        this.moveDirection = newMD;
        return this.moveDirection;
    } 

    getDestination(): Station {
        return this.reversed ? this.edge.from : this.edge.to;
    }

    reroute(nextEdge: Edge): void {
        console.log(`REROUTE CALL RECEIVED EDGE ${nextEdge} (current edge: ${this.edge})`);
        if (nextEdge == this.edge) {
            this.reversed = !this.reversed;
            console.log(`staying on same edge. Reversed is now ${this.reversed}`);
            this.invertMoveDirection();
        } else {
            // if edges are in opposite directions, must flip reverse
            if (this.edge.to == nextEdge.to) {
                console.log(`Edges in opposite directions`);
                this.reversed = !this.reversed;
                this.setMoveDir(Edge.getDirectionVector(nextEdge.toPort));
                if (this.reversed) {
                    this.visual.angle = nextEdge.targetAngle;
                } else {
                    this.visual.angle = nextEdge.originalAngle;
                }  
            } else {
                console.log(`Edges in same direction`);
                // if edges are in same direction, continue
                this.setMoveDir(Edge.getDirectionVector(nextEdge.fromPort));
                this.visual.angle = nextEdge.originalAngle;
            }
        }
        this.edge = nextEdge;
        this.reachedDest = false;
        this.reachedJoint = false;
        this.lastDistToJoint = -1;
        this.framesAtStation = 0;
        console.log(`after routing, edge is now ${this.edge}. Moving in direction ${this.moveDirection.x}, ${this.moveDirection.y}`);
    }

    // move in {moveDirection} by {speed}
    move() {
        // if stopped at station
        if (this.framesAtStation > -1) {
            // increment frames
            this.framesAtStation++;
            if (this.framesAtStation >= Constants.STATION_PAUSE_LENGTH) {
                this.framesAtStation = -1;
            }
            return;
        }
        let distToJoint = this.edge.getDistToJoint(this.visual.x, this.visual.y);
        if (this.lastDistToJoint < 0) {
            console.log(`Skipping joint detection; lastDist was 0`);
        } else if (distToJoint > this.lastDistToJoint && !this.reachedJoint) {
            // if we are getting farther from the joint, we must have passed it
            console.log(`JOINT (${this.edge.jointX}, ${this.edge.jointY}) PASS DETECTED (curdist ${distToJoint} > lastdist ${this.lastDistToJoint})`);
            this.reachedJoint = true;
            let oppositeDir = Edge.getDirectionVector(this.reversed ? this.edge.fromPort : this.edge.toPort);
            let newDir = {x: oppositeDir.x * -1, y: oppositeDir.y * -1};
            this.setMoveDir(newDir);
            this.visual.x = this.edge.jointX;
            this.visual.y = this.edge.jointY;
        }
        this.lastDistToJoint = distToJoint;

        // apply smoothing if within threshold of joint
        if (distToJoint < Constants.TURN_SMOOTHING_THRESHOLD) {
    
            // Calculate the fraction of the transition completed
            let transitionCompletionPct = 0;
            if (!this.reachedJoint) {
                // If the joint has not been reached, interpolate from 0% at the start of the transition to 50% at the joint
                transitionCompletionPct = (Constants.TURN_SMOOTHING_THRESHOLD - distToJoint) / Constants.TURN_SMOOTHING_THRESHOLD * 0.5;
            } else {
                // If the joint has been reached, interpolate from 50% just past the joint to 100% at the end of the transition
                transitionCompletionPct = 0.5 + distToJoint / Constants.TURN_SMOOTHING_THRESHOLD * 0.5;
            }
            // Linear interpolation of the angle
            let interpAngle = this.edge.getInterpolatedAngle(transitionCompletionPct);
            this.visual.angle = this.reversed ? this.edge.targetAngle - interpAngle : interpAngle;
        } else if (this.reachedJoint) {
            // clamp angle post-joint to exactly the target angle
            this.visual.angle = this.reversed ? this.edge.originalAngle : this.edge.targetAngle;
        }

        // if we've passed the joint and are now as far or farther than the to station, we're there!
        let passedJointAndOutOfRange = this.reachedJoint && distToJoint >= 
            this.edge.getDistToJoint(this.getDestination().getCenterX(), 
            this.getDestination().getCenterY());
        if (passedJointAndOutOfRange) {
            console.log(`DESTINATION REACHED`);
            this.reachedDest = true;
            this.visual.x = this.getDestination().getCenterX();
            this.visual.y = this.getDestination().getCenterY();
        } else {
            this.visual.x += this.moveDirection.x * Constants.TRAIN_SPEED;
            this.visual.y += this.moveDirection.y * Constants.TRAIN_SPEED;
        }
    }

    disembarkPassengers() {
        if (!this.reachedDest) {
            throw new Error(`TRIED TO DISEMBARK PASSENGERS BEFORE REACHING DESTINATION`);
        }
        // filter out the passengers whose destination matches the current station's type
        this.passengers = this.passengers.filter(passenger => {
            return passenger.destination != this.getDestination().stationType;
        });
    }

    loadPassengers() {
        if (this.reachedDest) {
            throw new Error(`TRIED TO LOAD PASSENGERS BEFORE REROUTING`);
        }

    }

    draw(p: p5, trainColor: string) {
        if (!this.reachedDest) this.move();
        p.push();
        p.translate(this.visual.x, this.visual.y);
        p.rotate(this.visual.angle);
        p.translate(-this.visual.x, -this.visual.y);
        // draw the train itself
        this.visual.draw(p);
        // draw the passengers
        this.drawPassengers(p, trainColor);
        p.pop();
    }

    addPassenger(passenger: Person) {
        this.passengers.push(passenger);
    }

    drawPassengers(p: p5, trainColor: string): void {
        p.strokeWeight(0);

        // Calculate the total grid size
        let passengerSize = Constants.PERSON_SIZE * Constants.PASSENGER_SIZE_MULTIPLIER;
        //console.log(passengerSize);
        let gridWidth = 3 * passengerSize + 2 * Constants.PERSON_OFFSET;
        let gridHeight = 2 * passengerSize + Constants.PERSON_OFFSET;
        let trainHeight = Constants.TRAIN_LENGTH*Constants.TRAIN_ASPECT;

        if (gridWidth >= Constants.TRAIN_LENGTH) {
            throw new Error(`Passenger grid too wide for train`);
        }
        if (gridHeight >= trainHeight) {
            throw new Error(`Passenger grid too tall for train`);
        }

        // get starting position of the grid
        let trainUpperLeftX = this.visual.x - Constants.TRAIN_LENGTH / 2;
        let trainUpperLeftY = this.visual.y - trainHeight / 2; 
        let startX = trainUpperLeftX + (Constants.TRAIN_LENGTH - gridWidth) / 2;
        let startY = trainUpperLeftY + (trainHeight - gridHeight) / 2;

        // draw passengers in a 2x3 grid
        let passengerIndex = 0;
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
                if (passengerIndex >= this.passengers.length) break;
                let x = startX + col * (passengerSize + Constants.PERSON_OFFSET);
                let y = startY + row * (passengerSize + Constants.PERSON_OFFSET);
                let person = this.passengers[passengerIndex];
                person.drawPassenger(p, x, y, trainColor);
                passengerIndex++;
            }
        }
    }
}
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
    private edge: Edge;
    private framesAtStation; // -1 if not at station, set to 0 if at station
    private reachedJoint: boolean;
    private lastDistToJoint: number;
    reachedDest: boolean;

    constructor(edge: Edge) {
        // create visual
        let x = edge.from.getCenterX();
        let y = edge.from.getCenterY();
        this.visual = new TrainShape(x, y);
        this.visual.angle = edge.originalAngle;

        // other initialization
        this.passengers = [];
        this.edge = edge;
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
        console.log(this.moveDirection);
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
            // do nothing
        } else if (distToJoint > this.lastDistToJoint && !this.reachedJoint) {
            // if we are getting farther from the joint, we must have passed it
            console.log(`JOINT PASS DETECTED`);
            this.reachedJoint = true;
            let oppositeDir = Edge.getDirectionVector(this.edge.toPort);
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
            this.visual.angle = this.edge.getInterpolatedAngle(transitionCompletionPct);
        } else if (this.reachedJoint){
            this.visual.angle = this.edge.targetAngle;
        }

        // if we've passed the joint and are now as far or farther than the to station, we're there!
        if (this.reachedJoint && distToJoint >= this.edge.getDistToJoint(this.edge.to.getCenterX(), 
                                                                         this.edge.to.getCenterY())) {
            this.reachedDest = true;
            this.visual.x = this.edge.to.getCenterX();
            this.visual.y = this.edge.to.getCenterY();
        } else {
            this.visual.x += this.moveDirection.x * Constants.TRAIN_SPEED;
            this.visual.y += this.moveDirection.y * Constants.TRAIN_SPEED;
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
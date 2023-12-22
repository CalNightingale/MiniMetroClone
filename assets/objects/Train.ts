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
    visual: TrainShape;
    passengers: Person[];
    moveDirection: {x: number, y: number};

    constructor(spawnStation: Station, fromPort: StationPort) {
        let x = spawnStation.getCenterX();
        let y = spawnStation.getCenterY();
        this.visual = new TrainShape(x, y);
        this.passengers = [];
        this.moveDirection = Edge.getDirectionVector(fromPort);
    }

    draw(p: p5, trainColor: string) {
        // draw the train itself
        this.visual.draw(p);
        // draw the passengers
        this.drawPassengers(p, trainColor);
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
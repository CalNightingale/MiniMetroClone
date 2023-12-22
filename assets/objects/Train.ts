import p5 from "p5";
import { Shape } from "../shapes/Shape";
import { TrainShape } from "../shapes/TrainShape";
import { Person } from "./Person";
import { Constants } from "../constants";

export class Train {
    visual: Shape;
    passengers: Person[];
    line: string;

    constructor(x: number, y: number, line: string, color: p5.Color) {
        this.visual = new TrainShape(x, y, color);
        this.line = line;
        this.passengers = [];
    }

    draw(p: p5) {
        // draw the train itself
        this.visual.draw(p);
        // draw the passengers
        this.drawPassengers(p);
    }

    addPassenger(passenger: Person) {
        this.passengers.push(passenger);
    }

    drawPassengers(p: p5): void {
        p.strokeWeight(0);

        // Calculate the total grid size
        let passengerSize = Constants.PERSON_SIZE * Constants.PASSENGER_SIZE_MULTIPLIER;
        let gridWidth = 3 * passengerSize + 2 * Constants.PERSON_OFFSET;
        let gridHeight = 2 * passengerSize + Constants.PERSON_OFFSET;
        let trainHeight = Constants.TRAIN_LENGTH*Constants.TRAIN_ASPECT;

        if (gridWidth >= Constants.TRAIN_LENGTH) {
            throw new Error(`Passenger grid too wide for train`);
        }
        if (gridHeight >= trainHeight) {
            throw new Error(`Passenger grid too tall for train`);
        }

        // Starting position for the grid
        let trainUpperLeftX = this.visual.x - Constants.TRAIN_LENGTH / 2;
        let trainUpperLeftY = this.visual.y - trainHeight / 2; 
        let startX = trainUpperLeftX + (Constants.TRAIN_LENGTH - gridWidth) / 2;
        let startY = trainUpperLeftY + (trainHeight - gridHeight) / 2;

        // Draw the squares in a 2x3 grid
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
                let passengerIndex = col + row;
                if (passengerIndex >= this.passengers.length) break;
                let x = startX + col * (Constants.PERSON_SIZE + Constants.PERSON_OFFSET);
                let y = startY + row * (Constants.PERSON_SIZE + Constants.PERSON_OFFSET);
                let person = this.passengers[passengerIndex];
                person.drawPassenger(p, x, y, this.line);
            }
        }
    }
}
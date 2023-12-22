import p5 from 'p5';
import { StationType } from './StationType';
import { Constants } from '../constants';

export class Person {
    destination: StationType;

    constructor(destination: StationType) {
        this.destination = destination;
    }

    drawWaiting(p: p5, x: number, y: number): void {
        p.fill('black');
        p.square(x, y, Constants.PERSON_SIZE);
    }

    drawPassenger(p: p5, x: number, y: number, line: string) {
        p.push();
        let trainColor = p.color(line);
        
        // Create the lighter color
        let passengerColor = p.lerpColor(trainColor, p.color('white'), Constants.PASSENGER_LIGHTNESS_FACTOR);
        p.fill(passengerColor);
        p.square(x,y,Constants.PERSON_SIZE * Constants.PASSENGER_SIZE_MULTIPLIER);
        p.pop();
    }

    toString(): string {
        return `${this.destination}`
    }
}

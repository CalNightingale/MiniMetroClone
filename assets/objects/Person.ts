import p5 from 'p5';
import { StationType } from './StationType';
import { Constants } from '../constants';
import { Circle } from '../shapes/Circle';
import { Square } from '../shapes/Square';
import { Triangle } from '../shapes/Triangle';
import { Shape } from '../shapes/Shape';

export class Person {
    destination: StationType;
    visual: Shape;

    constructor(destination: StationType) {
        this.destination = destination;
        let startPos = {x: -1000, y: -1000};
        switch (this.destination) {
            case StationType.Circle:
                this.visual = new Circle(startPos.x, startPos.y, Constants.PERSON_SIZE, 'black');
                break;
            case StationType.Square:
                this.visual = new Square(startPos.x, startPos.y, Constants.PERSON_SIZE, 'black');
                break;
            case StationType.Triangle:
                this.visual = new Triangle(startPos.x, startPos.y, Constants.PERSON_SIZE, 'black');
                break;
        }
    }

    draw(p: p5, x: number, y: number, size: number) {
        this.visual.draw(p);
    }

    drawWaiting(p: p5, x: number, y: number): void {
        this.visual.x = x;
        this.visual.y = y;
        this.visual.size = Constants.PERSON_SIZE;
        this.visual.draw(p);
    }

    drawPassenger(p: p5, x: number, y: number, line: string) {
        let trainColor = p.color(line);
        // create lighter passenger color
        let passengerColor = p.lerpColor(trainColor, p.color('white'), Constants.PASSENGER_LIGHTNESS_FACTOR);
        this.visual.size = Constants.PERSON_SIZE * Constants.PASSENGER_SIZE_MULTIPLIER;
        this.visual.x = x;
        this.visual.y = y;
        this.visual.color = passengerColor.toString();
        this.visual.draw(p);
    }

    toString(): string {
        return `${this.destination}`
    }
}

import p5 from 'p5';
import { StationType } from './StationType';
import { Constants } from '../constants';

export class Person {
    destination: StationType;

    constructor(destination: StationType) {
        this.destination = destination;
    }

    draw(p: p5, x: number, y: number): void {
        p.square(x, y, Constants.PERSON_SIZE);
    }

    toString(): string {
        return `${this.destination}`
    }
}

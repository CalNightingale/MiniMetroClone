import p5 from 'p5';
import { StationType } from './StationType';
import { Constants } from '../constants';
import { Shape } from '../shapes/Shape';
import { Circle } from '../shapes/Circle';
import { Triangle } from '../shapes/Triangle';
import { Square } from '../shapes/Square';
import { Person } from './Person';

export class Station {
    static lastID = 0;

    x: number;
    y: number;
    id: number;
    size: number;
    visual: Shape;
    people: Person[];
    stationType: StationType;
    outlineColor: string;

    constructor(x: number, y: number, stationType: StationType, p: p5) {
        this.x = x;
        this.y = y;
        this.size = Constants.STATION_SIZE;
        this.stationType = stationType;
        this.outlineColor = 'black';
        this.people = [];
        this.id = Station.lastID++; // Assign a unique ID to the station.
        switch (this.stationType) {
            case StationType.Circle:
                this.visual = new Circle(x, y, this.size/2, p.color('white'));
                break;
            case StationType.Square:
                this.visual = new Square(x, y, this.size, p.color('white'));
                break;
            case StationType.Triangle:
                this.visual = new Triangle(x, y, this.size, p.color('white'));
                break;
        }
    }

    setOutlineColor(newColor: string): void {
        this.outlineColor = newColor;
    }

    draw(p: p5): void {
        p.stroke(this.outlineColor);
        // first draw visual
        this.visual.draw(p);
        // now draw people
        this.drawPeople(p);
    }

    drawPeople(p: p5): void {
        p.strokeWeight(0);
        p.fill('black');
        for (let i = 0; i < this.people.length; i++) {
            let personToDraw = this.people[i];
            let personX = this.x + this.size + Constants.PERSON_XOFFSET * (i+1) 
                                + Constants.PERSON_SIZE * i;
            let personY = this.y - Constants.PERSON_SIZE; // TODO MULTIROW???
            personToDraw.draw(p, personX, personY);
        }
    }

    getCenterX(): number {
        return this.x + this.size/2;
    }

    getCenterY(): number {
        return this.y + this.size/2;
    }

    move(dx: number, dy: number): void {
        this.x += dx;
        this.y += dy;
        this.visual.move(dx, dy)
    }

    isMouseOver(x: number, y: number): boolean {
        return this.visual.isMouseOver(x, y);
    }

    addPerson(person: Person): void {
        console.log(`Adding person ${person.toString()} to station ${this.toString()}`)
        this.people.push(person);
    }

    removePerson(): Person | undefined {
        return this.people.pop();
    }

    toString(): string {
        // Assuming the station has an 'id' property that is unique
        return `Station(${this.id}) at coordinates (${this.x}, ${this.y})`;
    }
}
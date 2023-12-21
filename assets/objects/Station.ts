import p5 from 'p5';
import { StationType } from './StationType.js';
import { Constants } from '../constants.js';
import { Shape } from '../shapes/Shape.js';
import { Circle } from '../shapes/Circle.js';
import { Triangle } from '../shapes/Triangle.js';
import { Square } from '../shapes/Square.js';

export class Station {
    x: number;
    y: number;
    id: number;
    size: number;
    visual: Shape;
    stationType: StationType;
    outlineColor: string;
    static lastID = 0;

    constructor(x: number, y: number, stationType: StationType, p: p5) {
        this.x = x;
        this.y = y;
        this.size = Constants.STATION_SIZE;
        this.stationType = stationType;
        this.outlineColor = 'black';
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
        this.visual.draw(p);
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

    isMouseOver(p: p5): boolean {
        return this.visual.isMouseOver(p);
    }

    toString(): string {
        // Assuming the station has an 'id' property that is unique
        return `Station(${this.id}) at coordinates (${this.x}, ${this.y})`;
    }
}
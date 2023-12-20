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
    size: number;
    visual: Shape;
    stationType: StationType;

    constructor(x: number, y: number, stationType: StationType) {
        this.x = x;
        this.y = y;
        this.size = Constants.STATION_SIZE;
        this.stationType = stationType;
        switch (this.stationType) {
            case StationType.Circle:
                this.visual = new Circle(x, y, this.size/2);
                break;
            case StationType.Square:
                this.visual = new Square(x, y, this.size);
                break;
            case StationType.Triangle:
                this.visual = new Triangle(x, y, this.size);
                break;
        }
    }

    draw(p: p5): void {
        this.visual.draw(p);
    }

    move(dx: number, dy: number): void {
        this.x += dx;
        this.y += dy;
        this.visual.move(dx, dy)
    }
}
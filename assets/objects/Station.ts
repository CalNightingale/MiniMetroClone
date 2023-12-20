import p5 from 'p5';
import { StationType } from './StationType.js';
import { Constants } from '../constants.js';

export class Station {
    x: number;
    y: number;
    size: number;
    stationType: StationType;

    constructor(x: number, y: number, stationType: StationType) {
        this.x = x;
        this.y = y;
        this.size = Constants.STATION_SIZE;
        this.stationType = stationType;
    }

    draw(p: p5): void {
        switch (this.stationType) {
            case StationType.Circle:
                p.ellipse(this.x + this.size/2, this.y + this.size/2, this.size);
                break;
            case StationType.Square:
                p.square(this.x, this.y, this.size);
                break;
            case StationType.Triangle:
                p.triangle( this.x, this.y + this.size,
                            this.x + this.size, this.y + this.size,
                            this.x + this.size/2, this.y);
                break;
        }
        
    }

    move(dx: number, dy: number): void {
        this.x += dx;
        this.y += dy;
    }
}
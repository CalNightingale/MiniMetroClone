import p5 from 'p5';
import { Station } from './objects/Station';
import { Constants } from './constants';
import { Edge } from './objects/Edge';
import { Train } from './objects/Train';
import { Line } from './objects/Line';

export class StationGraph {
    private stations: Station[];
    private edges: Edge[];
    private lines: Line[];
    private trains: Train[];
    private activeLine: number;

    constructor() {
        this.stations = [];
        this.edges = [];
        this.trains = [];
        this.lines = [new Line('red'), new Line('green'), new Line('blue')];
        this.activeLine = 0;
    }

    getActiveLine(): Line | null {
        if (this.lines.length == 0) return null;
        return this.lines[this.activeLine];
    }

    addStation(station: Station): void {
        if (this.stations.indexOf(station) > -1) {
            throw new Error(`Station with id ${station.id} already exists.`);
        }
        this.stations.push(station);
    }

    addEdge(fromStation: Station, toStation: Station, line: Line): void {
        // Check if the edge already exists in either direction
        const edgeExists = this.edges.some(edge =>
            (edge.from === fromStation && edge.to === toStation) ||
            (edge.from === toStation && edge.to === fromStation)
        );

        if (fromStation == toStation) {
            console.log(`Ignoring self-edge at station ${fromStation.toString()}`)
            return;
        }

        if (!edgeExists) {
            console.log(`Adding edge from ${fromStation.toString()} to ${toStation.toString()}`);
            // update station ports
            let newEdge = new Edge(fromStation, toStation);
            this.lines[this.activeLine].addEdge(newEdge);
            // add to logical edge list
            this.edges.push(newEdge);
        } else {
            console.log(`Edge from ${fromStation.toString()} to ${toStation.toString()} already exists.`);
        }
    }

    draw(p: p5): void {
        // draw line if dragging
        p.strokeWeight(Constants.EDGE_WIDTH);
        if (this.isDragging && this.dragStartStation && this.dragEndPoint) {
            p.stroke(this.lines[this.activeLine].getColor());
            p.line(this.dragStartStation.getCenterX(), this.dragStartStation.getCenterY(), 
                    this.dragEndPoint.x, this.dragEndPoint.y);
        }

        // then draw lines (lines handle trains)
        this.lines.forEach(line => line.draw(p));

        // then draw stations
        this.stations.forEach(station => station.draw(p));
    }

    keyPressed(p: p5): void {
        this.stations.forEach( (station) => {
            switch (p.keyCode) {
                case p.LEFT_ARROW:
                  station.move(-5, 0);
                  break;
                case p.RIGHT_ARROW:
                  station.move(5, 0);
                  break;
                case p.UP_ARROW:
                  station.move(0, -5);
                  break;
                case p.DOWN_ARROW:
                  station.move(0, 5);
                  break;
              }
        })
    }

    // Add these properties to the StationGraph class
    public isDragging: boolean = false;
    private dragStartStation: Station | null = null;
    private dragEndPoint: { x: number, y: number } | null = null;

    // Call this method when a drag starts
    startDrag(station: Station): void {
        this.isDragging = true;
        this.dragStartStation = station;
        this.dragStartStation.setOutlineColor(this.lines[this.activeLine].getColor());
    }

    // Call this method when the drag ends
    endDrag(endStation: Station | undefined): void {
        this.isDragging = false;
        if (this.dragStartStation) {
            this.dragStartStation.setOutlineColor('black');
        }
        if (endStation) {
            // reset end station color
            endStation.setOutlineColor('black');
        }
        if (this.dragStartStation && endStation) {
            // add edge to graph
            this.addEdge(this.dragStartStation, endStation, this.lines[this.activeLine])
        }
        this.dragStartStation = null;
        this.dragEndPoint = null;
    }

    // Call this method during a drag to update the end point
    updateDragPoint(x: number, y: number): void {
        if (this.isDragging) {
            let hoveredStation = this.getStationAtMouse(x, y);
            if (hoveredStation) {
                hoveredStation.setOutlineColor(this.lines[this.activeLine].getColor());
            } else {
                // either we've never hovered, or we used to be and no longer are
                let oldHoveredStation = null;
                if (this.dragEndPoint) {
                    oldHoveredStation = this.getStationAtMouse(this.dragEndPoint.x, this.dragEndPoint.y);
                    if (oldHoveredStation && oldHoveredStation != this.dragStartStation) {
                        oldHoveredStation.setOutlineColor('black');
                    }
                }
            }
            // update drag end point
            this.dragEndPoint = { x, y };
        }
    }

    // Additional methods like removing stations, finding paths, etc. can be added here.
    // Add this method to the StationGraph class
    getStationAtMouse(x: number | null, y: number | null): Station | undefined {
        //console.log(`MOUSE CHECK: ${x}, ${y}`);
        if (!x || !y) {
            return undefined;
        }
        for (let station of this.stations) {
            if (station.isMouseOver(x, y)) {
                return station;
            }
        }
        return undefined; // No station is under the mouse
    }

}

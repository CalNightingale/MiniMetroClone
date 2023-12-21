import p5 from 'p5';
import { Station } from './objects/Station';

type Edge = { from: Station, to: Station, line: string };

export class StationGraph {
    private stations: Map<string, Station>;
    private edges: Edge[];
    private lines: string[];
    private activeLine: number;

    constructor() {
        this.stations = new Map<string, Station>();
        this.edges = [];
        this.lines = ['red', 'green', 'blue'];
        this.activeLine = 0;
    }

    addStation(id: string, station: Station): void {
        if (this.stations.has(id)) {
            throw new Error(`Station with id ${id} already exists.`);
        }
        this.stations.set(id, station);
    }

    addEdge(fromStation: Station, toStation: Station, line: string): void {
        // Check if the edge already exists in either direction
        const edgeExists = this.edges.some(edge =>
            (edge.from === fromStation && edge.to === toStation) ||
            (edge.from === toStation && edge.to === fromStation)
        );

        if (!edgeExists) {
            console.log(`Adding edge from ${fromStation.toString()} to ${toStation.toString()}`);
            this.edges.push({ from: fromStation, to: toStation, line });
        } else {
            console.log(`Edge from ${fromStation.toString()} to ${toStation.toString()} already exists.`);
        }
    }

    draw(p: p5): void {
        // draw line if dragging
        if (this.isDragging && this.dragStartStation && this.dragEndPoint) {
            p.stroke('red');
            p.line(this.dragStartStation.getCenterX(), this.dragStartStation.getCenterY(), 
                    this.dragEndPoint.x, this.dragEndPoint.y);
        }

        // then draw edges
        this.edges.forEach(edge => {
            p.stroke(edge.line);
            p.line(edge.from.getCenterX(), edge.from.getCenterY(), 
                    edge.to.getCenterX(), edge.to.getCenterY());
        });

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
        let activeLineColorName = this.lines[this.activeLine];
        this.dragStartStation.setOutlineColor(activeLineColorName);
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
            let activeLineColorName = this.lines[this.activeLine];
            this.addEdge(this.dragStartStation, endStation, activeLineColorName)
        }
        this.dragStartStation = null;
        this.dragEndPoint = null;
    }

    // Call this method during a drag to update the end point
    updateDragPoint(x: number, y: number): void {
        if (this.isDragging) {
            this.dragEndPoint = { x, y };
        }
    }

    // Additional methods like removing stations, finding paths, etc. can be added here.
    // Add this method to the StationGraph class
    getStationAtMouse(p: p5): Station | undefined {
        for (let [id, station] of this.stations) {
            if (station.isMouseOver(p)) {
                return station;
            }
        }
        return undefined; // No station is under the mouse
    }

}

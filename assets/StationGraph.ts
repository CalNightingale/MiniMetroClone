import p5 from 'p5';
import { Station } from './objects/Station';
import { Constants } from './constants';
import { Edge } from './objects/Edge';
import { Train } from './objects/Train';
import { Line } from './objects/Line';

type Drag = {startStation: Station | null, line: Line | null};

export class StationGraph {
    private stations: Station[];
    private lines: Line[];
    private trains: Train[];
    private activeLine: number;
    private activeDrag: Drag;

    constructor() {
        this.stations = [];
        this.trains = [];
        this.lines = [new Line('red'), new Line('green'), new Line('blue'), 
                      new Line('purple'), new Line('yellow')];
        for (let i = 0; i < Constants.NUM_STARTING_LINES; i++) {
            this.lines[i].unlock();
        }
        this.activeLine = 0;
        this.activeDrag = {startStation: null, line: null};
    }

    /**
     * Returns a list of all edges accessible from a given station.
     * @param station Station to check
     * @returns Array of Edge objects
     */
    getEdgesAccessibleFromStation(station: Station): Edge[] {
        let edges = [];
        for (let line of this.lines) {
            for (let edge of line.edges) {
                if (edge.touchesStation(station)) {
                    edges.push(edge);
                }
            }
        }
        return edges;
    }

    getActiveLine(): Line | null {
        let totalNumEdges = 0;
        this.lines.forEach(line => {
            if (line.isInService()) {
                totalNumEdges += line.edges.length;
            } });
        if (totalNumEdges == 0) return null;
        return this.lines[this.activeLine];
    }

    addStation(station: Station): void {
        if (this.stations.indexOf(station) > -1) {
            throw new Error(`Station with id ${station.id} already exists.`);
        }
        this.stations.push(station);
    }

    recalculatePassengerRoutes(): void {
        console.log(`RECALCULATING PASSENGER ROUTES`);
        for (let station of this.stations) {
            station.recalculatePassengerRoutes(this);
        }
    }

    addEdge(fromStation: Station, toStation: Station, line: Line): void {
        if (fromStation == toStation) {
            console.log(`Ignoring self-edge at station ${fromStation.toString()}`)
            return;
        }

        // Check if the edge already exists in either direction
        const edgeExists = this.lines[this.activeLine].edges.some(edge =>
            (edge.from === fromStation && edge.to === toStation) ||
            (edge.from === toStation && edge.to === fromStation)
        );

        if (!edgeExists) {
            // if an edge exists that ends at toStation, we should flip the direction
            // of the new edge
            const flipDirection = this.lines[this.activeLine].hasEdgeEndingAtStation(toStation);
            const correctedTo = flipDirection ? fromStation : toStation;
            const correctedFrom = flipDirection ? toStation : fromStation;
            console.log(`Adding edge from ${correctedFrom.toString()} to ${correctedTo.toString()}`);
            // update station ports
            let newEdge = new Edge(correctedFrom, correctedTo, line);
            line.addEdge(newEdge);
            this.recalculatePassengerRoutes();
        } else {
            console.log(`Edge from ${fromStation.toString()} to ${toStation.toString()} already exists.`);
        }
    }

    draw(p: p5): void {
        // draw line if dragging
        this.drawDragLine(p);

        // then draw lines
        this.lines.forEach(line => line.draw(p));

        // then draw stations
        this.stations.forEach(station => station.draw(p));

        // finally menu
        this.drawMenu(p);
    }

    drawDragLine(p: p5) {
        p.strokeWeight(Constants.EDGE_WIDTH);
        if (this.isDragging && this.activeDrag.line && this.activeDrag.startStation && this.dragEndPoint) {
            p.stroke(this.activeDrag.line.getColor());
            p.line(this.activeDrag.startStation.getCenterX(), this.activeDrag.startStation.getCenterY(), 
                    this.dragEndPoint.x, this.dragEndPoint.y);
        }
    }

    drawMenu(p: p5) {
        const lineMenuStartX = (1 - Constants.LINE_MENU_PCT_X) * Constants.CANVAS_WIDTH + Constants.LINE_MENU_SIZE/2;
        const buffer = Constants.LINE_MENU_PCT_BUFFER * Constants.CANVAS_HEIGHT;
        const menuHeight = this.lines.length * (Constants.LINE_MENU_SIZE + buffer); 
        const lineMenuStartY = (Constants.CANVAS_HEIGHT - menuHeight) / 2;
        p.push();
        for (let i = 0; i < this.lines.length; i++) {
            const curLine = this.lines[i];
            let menuY = lineMenuStartY + i * (Constants.LINE_MENU_SIZE + buffer) + Constants.LINE_MENU_SIZE/2;
            p.strokeWeight(0);
            let icon = curLine.getMenuIcon();
            p.fill(icon.color);
            p.circle(lineMenuStartX, menuY, icon.size);
        }
        p.pop();
    }

    getNextUnusedLine(): Line | null {
        for(let line of this.lines) {
            if (line.isUnlocked() && !line.isInService()) return line;
        }
        return null;
    }

    // Add these properties to the StationGraph class
    public isDragging: boolean = false;
    private dragEndPoint: { x: number, y: number } | null = null;

    getLineForEdge(station: Station): Line | null {
        // if station has no edges, return the current active line
        const openStationLine = station.getLineForNewEdge();
        if (openStationLine) return openStationLine;
        // if we get here, return the next available line (or null)
        return this.getNextUnusedLine();
    }

    // Call this method when a drag starts
    startDrag(station: Station): void {
        this.activeDrag = {startStation: station, line: this.getLineForEdge(station)};
        if (!this.activeDrag.line) {
            return;
        }
        this.isDragging = true;
        this.activeDrag.line.hovered = true;
        
        station.setOutlineColor(this.activeDrag.line.getColor());
        console.log(`STARTING A DRAG WITH LINE ${this.activeDrag.line}`);
    }

    // Call this method when the drag ends
    endDrag(endStation: Station | undefined): void {
        this.isDragging = false;
        // edge case where drag call is from click not on a start station
        if (!this.activeDrag.line || !this.activeDrag.startStation) {
            return;
        } 
        this.activeDrag.line.hovered = false;
        this.activeDrag.startStation.setOutlineColor('black');
        if (endStation) {
            // reset end station color
            endStation.setOutlineColor('black');
            // create new edge
            this.addEdge(this.activeDrag.startStation, endStation, this.activeDrag.line);
        }
        // reset drag variables
        this.activeDrag = {startStation: null, line: null};
        this.dragEndPoint = null;
    }

    // Call this method during a drag to update the end point
    updateDragPoint(x: number, y: number): void {
        if (this.isDragging) {
            let hoveredStation = this.getStationAtMouse(x, y);
            if (hoveredStation && this.activeDrag.line) {
                hoveredStation.setOutlineColor(this.activeDrag.line.getColor());
            } else {
                // either we've never hovered, or we used to be and no longer are
                let oldHoveredStation = null;
                if (this.dragEndPoint) {
                    oldHoveredStation = this.getStationAtMouse(this.dragEndPoint.x, this.dragEndPoint.y);
                    if (oldHoveredStation && oldHoveredStation != this.activeDrag.startStation) {
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

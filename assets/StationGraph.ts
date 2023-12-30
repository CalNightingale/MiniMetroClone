import p5 from 'p5';
import { Station } from './objects/Station';
import { Constants } from './constants';
import { Edge } from './objects/Edge';
import { Train } from './objects/Train';
import { Line } from './objects/Line';
import { StationType, getRandomStationType } from './objects/StationType';
import { Person } from './objects/Person';

type Drag = {startStation: Station | null, line: Line | null};

export class StationGraph {
    private stations: Station[];
    private lines: Line[];
    private trains: Train[];
    private activeLine: number;
    private activeDrag: Drag;
    private timeSinceSpawn: number;

    constructor(p: p5) {
        this.stations = [];
        this.trains = [];
        this.lines = [new Line('red'), new Line('green'), new Line('blue'), 
                      new Line('purple'), new Line('yellow')];
        for (let i = 0; i < Constants.NUM_STARTING_LINES; i++) {
            this.lines[i].unlock();
        }
        this.activeLine = 0;
        this.activeDrag = {startStation: null, line: null};
        this.timeSinceSpawn = Constants.SPAWN_RATE;
        this.populateStations(Constants.NUM_STATIONS, p);
        // FOR DEBUGGING
        /*
        this.stations = [new Station(200,200,StationType.Circle,p), 
                        new Station(400,200,StationType.Square,p),
                        new Station(200,400,StationType.Triangle,p),
                        new Station(400,400,StationType.Circle,p)];
        this.handleSpawning(); */
    }

    populateStations(numStations: number, p: p5): void {
        const canvasWidth = (1 - Constants.LINE_MENU_PCT_BUFFER) * Constants.CANVAS_WIDTH - Constants.CANVAS_EDGE_BUFFER - Constants.LINE_MENU_SIZE;
        const canvasHeight = Constants.CANVAS_HEIGHT - Constants.CANVAS_EDGE_BUFFER;
        const stationSize = Constants.STATION_SIZE;
        const proxyThreshold = Constants.STATION_PROXY_THRESHOLD;
    
        // Map to keep track of station type counts
        const stationTypeCounts = new Map<StationType, number>();
    
        const gridSize = Math.ceil(Math.sqrt(numStations));
        const cellWidth = canvasWidth / gridSize;
        const cellHeight = canvasHeight / gridSize;
    
        for (let i = 0; i < numStations; i++) {
            let validPosition = false;
            let x = 0, y = 0;
    
            while (!validPosition) {
                const gridX = i % gridSize;
                const gridY = Math.floor(i / gridSize);
    
                x = gridX * cellWidth + Math.random() * (cellWidth - stationSize) + stationSize / 2;
                y = gridY * cellHeight + Math.random() * (cellHeight - stationSize) + stationSize / 2;
    
                // Check for horizontal or vertical proximity to existing stations
                for (const station of this.stations) {
                    if (Math.abs(station.x - x) < proxyThreshold) {
                        x = station.x; // Align horizontally
                    }
                    if (Math.abs(station.y - y) < proxyThreshold) {
                        y = station.y; // Align vertically
                    }
                }
    
                validPosition = true;
    
                // Check for overlap with existing stations
                for (const station of this.stations) {
                    const dx = station.x - x;
                    const dy = station.y - y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < stationSize) {
                        validPosition = false;
                        break;
                    }
                }
            }
    
            // Get a station type biased towards underrepresented types
            const stationType = getRandomStationType(stationTypeCounts);
    
            const newStation = new Station(x, y, stationType, p); // Assuming p5 instance is available
            this.addStation(newStation);
    
            // Update station type count
            stationTypeCounts.set(stationType, (stationTypeCounts.get(stationType) || 0) + 1);
        }
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
        for (let station of this.stations) {
            station.recalculatePassengerRoutes(this);
        }
    }

    addEdge(fromStation: Station, toStation: Station, line: Line): void {
        if (fromStation == toStation) {
            console.warn(`Ignoring self-edge at station ${fromStation.toString()}`)
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
            const flipDirection = line.hasEdgeEndingAtStation(toStation);
            const correctedTo = flipDirection ? fromStation : toStation;
            const correctedFrom = flipDirection ? toStation : fromStation;
            console.log(`Adding edge from ${correctedFrom.toString()} to ${correctedTo.toString()}`);
            // update station ports
            let newEdge = new Edge(correctedFrom, correctedTo, line);
            line.addEdge(newEdge);
            this.recalculatePassengerRoutes();
        } else {
            console.warn(`Edge from ${fromStation.toString()} to ${toStation.toString()} already exists.`);
        }
    }

    getValidSpawnStations(): Station[] {
        let validStations: Station[] = [];
        this.stations.forEach(station => {
            if (!station.isAtCapacity()) validStations.push(station);
        });
        return validStations;
    }

    handleSpawning(): void {
        this.timeSinceSpawn++;
        if (this.timeSinceSpawn >= Constants.SPAWN_RATE) {
            this.timeSinceSpawn = 0;

            const validStations = this.getValidSpawnStations();
            if (validStations.length == 0) return;
            // Select a random station for the person to spawn at
            const spawnStationIndex = Math.floor(Math.random() * validStations.length);
            const spawnStation = validStations[spawnStationIndex];
    
            // Select a random destination station type different from the spawn station
            let destinationType: StationType;
            do {
                destinationType = getRandomStationType(new Map());
            } while (destinationType === spawnStation.stationType);
    
            // Create a new person with the destination type
            const newPerson = new Person(destinationType);
                
            // Add new person to station
            spawnStation.addPerson(newPerson, this);
        }
    }

    draw(p: p5): void {
        // first handle spawning
        this.handleSpawning(); // TODO UNCOMMENT TO RE-ENABLE SPAWNING
        

        // draw line if dragging
        this.drawDragLine(p);

        // then draw lines
        this.lines.forEach(line => line.draw(p, this));

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

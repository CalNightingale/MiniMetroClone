import p5 from 'p5';
import { StationType } from './StationType';
import { Constants } from '../constants';
import { Shape } from '../shapes/Shape';
import { Circle } from '../shapes/Circle';
import { Triangle } from '../shapes/Triangle';
import { Square } from '../shapes/Square';
import { Person } from './Person';
import { StationPort } from './StationPort';
import { Line } from './Line';
import { StationGraph } from '../StationGraph';
import { Edge } from './Edge';
import { LineEnd } from './LineEnd';

export class Station {
    static lastID = 0;

    x: number;
    y: number;
    id: number;
    size: number;
    private visual: Shape;
    people: Person[];
    stationType: StationType;
    outlineColor: string;
    ports: Map<StationPort, (Edge|LineEnd)[]>;

    constructor(x: number, y: number, stationType: StationType, p: p5) {
        this.x = x;
        this.y = y;
        this.size = Constants.STATION_SIZE;
        this.stationType = stationType;
        this.outlineColor = 'black';
        this.people = [];
        // populate ports with empty arrays
        this.ports = new Map<StationPort, (Edge|LineEnd)[]>();

        this.id = Station.lastID++; // Assign a unique ID to the station.
        //console.log(`creating station of type ${this.stationType}`);
        switch (this.stationType) {
            case StationType.Circle:
                this.visual = new Circle(x, y, this.size/2, 'white');
                break;
            case StationType.Square:
                this.visual = new Square(x, y, this.size, 'white');
                break;
            case StationType.Triangle:
                this.visual = new Triangle(x, y, this.size, 'white');
                break;
            default:
                throw new Error(`INVALID STATION TYPE: ${this.stationType}`);
        }
    }

    getLines(): Line[] {
        let lines: Line[] = [];
        this.ports.forEach((edgeList) => {
            edgeList.forEach(edge => {
                // ignore line ends
                if (edge instanceof Edge && !lines.includes(edge.line)) {
                    lines.push(edge.line);
                }
            })})
        return lines;
    }

    getEdges(): Edge[] {
        let edges: Edge[] = [];
        this.ports.forEach(edgeList => {
            edgeList.forEach(edge => {
                // ignore line ends
                if (edge instanceof Edge) edges.push(edge);
            })
        })
        return edges;
    }

    getLineForNewEdge(): Line | null {
        const lineUsageCount = new Map<Line, number>();
    
        // Count the number of ports used by each line
        this.ports.forEach((edgeList) => {
            edgeList.forEach(edgeOrEnd => {
                if (edgeOrEnd instanceof Edge  && edgeOrEnd.line != null) {
                    lineUsageCount.set(edgeOrEnd.line, (lineUsageCount.get(edgeOrEnd.line) || 0) + 1);
                }
            })
        });
    
        // Find and return the first line that uses only one port
        for (let [line, count] of lineUsageCount) {
            if (count === 1) {
                return line;
            }
        }
    
        // If no line uses only one port, return null
        return null;
    }
    
    resolveEdgeOverlaps(): void {
        //
    }

    addEdgeToPort(edge: Edge, port: StationPort) {
        let portEdges = this.ports.get(port);
        if (portEdges) {
            // if the port has been initialized already, append
            portEdges.push(edge);
        } else {
            // otherwise make a new list
            portEdges = [edge];
        }
        this.ports.set(port, portEdges);
        this.resolveEdgeOverlaps();
        // TODO iterate over all edges at this station and determine whether the curLine ends
        // at this station (only one edge for curLine here)
        // if there is, create a new LineEnd (rotation should be opposite direction from new edge's port)
        // and push the LineEnd to the proper port in this.ports
        // Check if the current line ends at this station
        const curLine = edge.line;
        const edgesOfCurLine = this.getEdges().filter(e => e.line === curLine);

        if (edgesOfCurLine.length === 1) {
            // If this is the only edge for curLine at this station, the line ends here
            const oppositeDir = Edge.getDirectionVector(port);
            const newDir = {x: -oppositeDir.x, y: -oppositeDir.y};
            const rotation = Edge.getAngleFromDirectionVector(newDir);

            // Create a new LineEnd
            const lineEnd = new LineEnd(curLine, this, rotation);
            // Assuming you need to add the LineEnd to the port
            // You might need to adjust this part based on how you're planning to use LineEnd objects
            if (!this.ports.has(port)) {
                this.ports.set(port, []);
            }
            this.ports.get(port)?.push(lineEnd); // Check if port exists and then push LineEnd
        } else if (edgesOfCurLine.length === 2) {
            // If there are two edges for curLine, remove the existing LineEnd for curLine
            this.ports.forEach((portList, portKey) => {
                this.ports.set(portKey, portList.filter(edgeOrEnd => {
                    if (edgeOrEnd instanceof LineEnd && edgeOrEnd.line === curLine) {
                        // Remove the LineEnd
                        return false;
                    }
                    return true; // Keep other edges and LineEnds not related to curLine
                }));
            });
        }
    }

    setOutlineColor(newColor: string): void {
        this.outlineColor = newColor;
    }

    draw(p: p5): void {
        // first draw line ends
        this.drawLineEnds(p);
        p.stroke(this.outlineColor);
        p.strokeWeight(Constants.STATION_OUTLINE);
        // first draw visual
        this.visual.draw(p);
        // now draw people
        this.drawPeople(p);
    }

    drawLineEnds(p: p5): void {
        this.ports.forEach(edgeAndEndList => {
            edgeAndEndList.forEach(edgeOrEnd =>{
                if (edgeOrEnd instanceof LineEnd) {
                    edgeOrEnd.draw(p);
                }
            });
        });
    }

    drawPeople(p: p5): void {
        p.strokeWeight(0);
        p.fill('black');
        const startX = this.x + this.size + Constants.PERSON_XOFFSET;
        const startY = this.y - this.size/2;
        for (let i = 0; i < this.people.length; i++) {
            const personToDraw = this.people[i];
            const yOffset = i < Constants.STATION_ROW_CAP ? 0 : 1;
            const personY = startY + (Constants.PERSON_SIZE+Constants.PERSON_YOFFSET) * yOffset;
            const xOffset = i < Constants.STATION_ROW_CAP ? i : i - Constants.STATION_ROW_CAP;
            const personX = startX + (Constants.PERSON_SIZE+Constants.PERSON_XOFFSET) * xOffset;
            personToDraw.drawWaiting(p, personX, personY);
        }
    }

    getCenterX(): number {
        return this.x + this.size/2;
    }

    getCenterY(): number {
        return this.y + this.size/2;
    }

    isMouseOver(x: number, y: number): boolean {
        return this.visual.isMouseOver(x, y);
    }

    addPerson(person: Person, graph: StationGraph): void {
        this.people.push(person);
        this.recalculatePassengerRoutes(graph);
    }

    isAtCapacity(): boolean {
        return this.people.length >= Constants.STATION_CAPACITY;
    }

    recalculatePassengerRoutes(graph: StationGraph): void {
        for (let person of this.people) {
            person.updatePath(this);
            //console.log(`PERSON ${person} taking ${person.targetLine} (reversed: ${person.isReversed}) to ${person.targetStation}`);
        }
    }

    removePerson(): Person | undefined {
        return this.people.pop();
    }

    toString(showCoords: boolean=false): string {
        // Assuming the station has an 'id' property that is unique
        if (showCoords) return `Station(${this.id}) at coordinates (${this.x}, ${this.y})`;
        return `Station(${this.id})`;
    }
}
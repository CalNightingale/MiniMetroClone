import p5 from 'p5';
import { StationType } from './StationType';
import { Constants } from '../constants';
import { Circle } from '../shapes/Circle';
import { Square } from '../shapes/Square';
import { Triangle } from '../shapes/Triangle';
import { Shape } from '../shapes/Shape';
import { Station } from './Station';
import { StationGraph } from '../StationGraph';
import { Line } from './Line';
import { Edge } from './Edge';

type Route = {edge: Edge, reversed: boolean};
type Path = {line: Line, reversed: boolean, targetStation: Station};

export class Person {
    destination: StationType;
    visual: Shape;
    path: Path | null;

    constructor(destination: StationType) {
        this.destination = destination;
        // start drawing off screen
        const startPos = {x: -1000, y: -1000};
        this.path = null;
        switch (this.destination) {
            case StationType.Circle:
                this.visual = new Circle(startPos.x, startPos.y, Constants.PERSON_SIZE, 'black');
                break;
            case StationType.Square:
                this.visual = new Square(startPos.x, startPos.y, Constants.PERSON_SIZE, 'black');
                break;
            case StationType.Triangle:
                this.visual = new Triangle(startPos.x, startPos.y, Constants.PERSON_SIZE, 'black');
                break;
        }
    }

    getAvailableRoutes(station: Station, visited: Route[]): Route[] {
        const allEdges = station.getEdges();
        const availableRoutes: Route[] = [];
        allEdges.forEach(edge => {
            const isEdgeReversed = edge.to == station;
            const potentialRoute = {edge: edge, reversed: isEdgeReversed};
            let newRoute = true;
            // iterate over all visited edges and ignore this one if there's a match
            visited.forEach(routeStep => {
                if (routeStep.edge == potentialRoute.edge) {
                    newRoute = false;
                }
            });
            if (newRoute) availableRoutes.push(potentialRoute);
        });
        return availableRoutes;
    }

    updatePath(startStation: Station): void {
        const fullRoute = this.getFullRoute(startStation);
        // if no route can be found, set pointers to null
        if (!fullRoute) {
            this.path = null;
        } else {
            const initialLine = fullRoute[0].edge.line;
            const initiallyReversed = fullRoute[0].reversed;
            const lastStep = fullRoute[fullRoute.length - 1];
            // begin by assuming there are no transfers
            let lastStationOnInitialLine = lastStep.reversed ? lastStep.edge.from : lastStep.edge.to;
            // iterate through full route, updating target station until the line no longer matches
            let transferred = false;
            fullRoute.forEach(routeStep => {
                const curLine = routeStep.edge.line;
                // if we have found a transfer, update target station accordingly
                if (curLine != initialLine && !transferred) {
                    transferred = true;
                    lastStationOnInitialLine = routeStep.reversed ? routeStep.edge.to : routeStep.edge.from;
                }
            });
            this.path = {line: initialLine, reversed: initiallyReversed, targetStation: lastStationOnInitialLine};
        }
    }

    /**
     * Get the shortest possible route from a given station to this person's destination 
     * @param startStation station to start at
     * @returns a list of Route steps (edges and directions of travel), or null if no route can be found
     */
    getFullRoute(startStation: Station): Route[] | null {
        // begin by getting a list of all unvisited edges from this station
        const initialRoutes = this.getAvailableRoutes(startStation, []);
        const availableRoutes: Route[][] = [];
        initialRoutes.forEach(initialRoute => {
            availableRoutes.push([initialRoute]);
        });
        // BFS
        while (availableRoutes.length > 0) {
            // get a route to check
            const curRouteTracker = availableRoutes.shift();
            if (!curRouteTracker) throw new Error(`BFS critical failure`);
            const lastRouteStep = curRouteTracker[curRouteTracker.length - 1];
            const hypotheticalStation = lastRouteStep.reversed ? lastRouteStep.edge.from : lastRouteStep.edge.to;
            // check end condition and return if true
            if (hypotheticalStation.stationType == this.destination) {
                return curRouteTracker;
            }
            // if we get here we know that our hypothetical station is the wrong type
            // get new potential ways we can go
            const newPotentialRouteSteps = this.getAvailableRoutes(hypotheticalStation, curRouteTracker);
            // iterate over possible next steps, create a new hypothetical route, and add it to check
            for (let potentialRouteStep of newPotentialRouteSteps) {
                const hypotheticalRoute = curRouteTracker;
                hypotheticalRoute.push(potentialRouteStep);
                availableRoutes.push(hypotheticalRoute);
            }
        }
        // if we get here it is impossible to route person so return null
        return null;
    }

    draw(p: p5, x: number, y: number, size: number) {
        this.visual.draw(p);
    }

    drawWaiting(p: p5, x: number, y: number): void {
        this.visual.x = x;
        this.visual.y = y;
        this.visual.size = Constants.PERSON_SIZE;
        this.visual.color = 'black';
        this.visual.draw(p);
    }

    drawPassenger(p: p5, x: number, y: number, line: string) {
        const trainColor = p.color(line);
        // create lighter passenger color
        const passengerColor = p.lerpColor(trainColor, p.color('white'), Constants.PASSENGER_LIGHTNESS_FACTOR);
        this.visual.size = Constants.PERSON_SIZE * Constants.PASSENGER_SIZE_MULTIPLIER;
        this.visual.x = x;
        this.visual.y = y;
        this.visual.color = passengerColor.toString();
        this.visual.draw(p);
    }

    toString(): string {
        if (this.path) {
            return `Person taking ${this.path.line} (reversed: ${this.path.reversed}) to ${this.path.targetStation}`;
        }
        return `Stranded person who wants to get to ${this.destination}`;
    }
}

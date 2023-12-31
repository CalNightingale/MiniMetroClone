import p5 from "p5";
import { Edge } from "./Edge";
import { Constants } from "../constants";
import { Train } from "./Train";
import { Person } from "./Person";
import { StationType } from "./StationType";
import { Station } from "./Station";
import { StationGraph } from "../StationGraph";

export class Line {
    private color: string;
    edges: Edge[];
    private trains: Train[];
    private unlocked: boolean;
    hovered: boolean;
    isCycle: boolean;

    constructor(color: string) {
        this.color = color;
        this.edges = [];
        this.trains = [];
        this.unlocked = false;
        this.hovered = false;
        this.isCycle = false;
    }

    getColor(): string {
        return this.color;
    }

    unlock(): void {
        this.unlocked = true;
    }

    isUnlocked(): boolean {
        return this.unlocked;
    }

    isInService(): boolean {
        return this.getNumEdges() > 0;
    }

    getNumEdges(): number {
        const onlyEdges = this.edges.filter(edgeOrEnd => edgeOrEnd instanceof Edge);
        return onlyEdges.length;
    }
 
    getMenuIcon(): {size: number, color: string} {
        if (!this.unlocked) 
            return {size: Constants.LINE_MENU_SIZE * Constants.LINE_MENU_INACTIVE_MULTIPLIER, color: Constants.LOCKED_COLOR};
        if (this.edges.length == 0 && !this.hovered) 
            return {size: Constants.LINE_MENU_SIZE * Constants.LINE_MENU_INACTIVE_MULTIPLIER, color: this.getColor()};
        return {size: Constants.LINE_MENU_SIZE, color: this.getColor()};
    }

    addEdge(edge: Edge) {
        if (this.edges.indexOf(edge) >= 0) {
            throw new Error(`Tried to add existing edge to line`);
        }
        // iterate through edges to check for a cycle
        this.edges.forEach(existingEdge => {
            if (existingEdge.from == edge.to) {
                console.log(`MADE A CYCLE`);
                this.isCycle = true;
            }
        });
        // actually add new edge
        this.edges.push(edge);
        // Update stations with the line
        edge.from.addEdgeToPort(edge, edge.fromPort);
        edge.to.addEdgeToPort(edge, edge.toPort);
        // If this is the first edge on this line (line was just created), add a train!
        if (this.edges.length == 1) {
            let newTrain = new Train(edge);
            this.trains.push(newTrain);
        }
        
    }

    hasEdgeEndingAtStation(station: Station): boolean {
        return this.edges.some(edge => edge.to == station);
    }

    servesStation(station: Station): boolean {
        return this.edges.some(edge => edge.to == station || edge.from == station);
    }

    getNextEdge(train: Train): Edge {
        let curEdge = train.edge;
        let nextEdge = train.edge;
        this.edges.forEach(edge => {
            if (edge != curEdge && 
                edge.touchesStation(train.getDestination())) {
                nextEdge = edge;
            }
        });
        // if we get here we have failed to find a new edge, so we should go back the way we came
        return nextEdge;
    }

    routeTrains(graph: StationGraph) {
        this.trains.forEach(train => {
            if (train.reachedDest) {
                const stationTrainIsAt = train.getDestination();
                train.disembarkPassengers(stationTrainIsAt, graph);
                let nextEdge = this.getNextEdge(train);
                train.reroute(nextEdge);
                // must load after rerouting to ensure that passengers board
                // trains going the proper direction
                train.loadPassengers(stationTrainIsAt);
            }
        });
    }

    draw(p: p5, graph: StationGraph): void {
        p.push();
        // first draw edges
        p.strokeWeight(Constants.EDGE_WIDTH)
        p.stroke(this.getColor());
        p.fill(this.getColor());
        this.edges.forEach(edge => edge.draw(p));
        // now draw trains
        this.trains.forEach(train => train.draw(p, this.getColor()));
        p.pop();
        this.routeTrains(graph);
    }

    toString(): string {
        return `${this.color}`;
    }

}
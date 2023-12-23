import p5 from "p5";
import { Edge } from "./Edge";
import { Constants } from "../constants";
import { Train } from "./Train";
import { Person } from "./Person";
import { StationType } from "./StationType";

export class Line {
    private color: string;
    private edges: Edge[];
    private trains: Train[];

    constructor(color: string) {
        this.color = color;
        this.edges = [];
        this.trains = [];
    }

    getColor(): string {
        return this.color;
    }

    addEdge(edge: Edge) {
        if (this.edges.indexOf(edge) >= 0) {
            throw new Error(`Tried to add existing edge to line`);
        }
        this.edges.push(edge);
        // Update stations with the line
        edge.from.addLineToPort(this, edge.fromPort);
        edge.to.addLineToPort(this, edge.toPort);
        // If this is the first edge on this line (line was just created), add a train!
        if (this.edges.length == 1) {
            let newTrain = new Train(edge);
            newTrain.addPassenger(new Person(StationType.Triangle));
            this.trains.push(newTrain);
        }
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

    routeTrains() {
        this.trains.forEach(train => {
            if (train.reachedDest) {
                // remove passengers want to get off here
                train.disembarkPassengers();
                // TODO set train to new edge
                let nextEdge = this.getNextEdge(train);
                train.reroute(nextEdge);
                
                // load new passengers
                //train.loadPassengers();
            }
        });
        //console.log(`Routing complete`);
    }

    draw(p: p5): void {
        p.push();
        // first draw edges
        p.strokeWeight(Constants.EDGE_WIDTH)
        p.stroke(this.getColor());
        p.fill(this.getColor());
        this.edges.forEach(edge => edge.draw(p));
        // now draw trains
        this.trains.forEach(train => train.draw(p, this.getColor()));
        p.pop();
        this.routeTrains();
    }

}
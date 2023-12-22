import p5 from "p5";
import { Edge } from "./Edge";
import { Constants } from "../constants";
import { Train } from "./Train";

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
            let newTrain = new Train(edge.from, edge.fromPort);
            this.trains.push(newTrain);
        }
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
    }

}
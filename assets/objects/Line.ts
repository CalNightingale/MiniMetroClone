import p5 from "p5";
import { Edge } from "./Edge";
import { Constants } from "../constants";

export class Line {
    private color: string;
    private edges: Edge[];

    constructor(color: string) {
        this.color = color;
        this.edges = [];
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

    }

    draw(p: p5): void {
        p.push();
        p.strokeWeight(Constants.EDGE_WIDTH)
        p.stroke(this.getColor());
        this.edges.forEach(edge => edge.draw(p));
        p.pop();
    }

}
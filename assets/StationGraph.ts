import p5 from 'p5';
import { Station } from './objects/Station';

type Edge = { from: Station, to: Station, weight: number };

export class StationGraph {
    private stations: Map<string, Station>;
    private edges: Edge[];

    constructor() {
        this.stations = new Map<string, Station>();
        this.edges = [];
    }

    addStation(id: string, station: Station): void {
        if (this.stations.has(id)) {
            throw new Error(`Station with id ${id} already exists.`);
        }
        this.stations.set(id, station);
    }

    addEdge(fromId: string, toId: string, weight: number = 1): void {
        const fromStation = this.stations.get(fromId);
        const toStation = this.stations.get(toId);

        if (!fromStation || !toStation) {
            throw new Error('Station(s) not found');
        }

        this.edges.push({ from: fromStation, to: toStation, weight });
    }

    draw(p: p5): void {
        this.stations.forEach(station => station.draw(p));

        this.edges.forEach(edge => {
            p.stroke('white');
            p.line(edge.from.x, edge.from.y, edge.to.x, edge.to.y);
        });
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

    // Additional methods like removing stations, finding paths, etc. can be added here.
}

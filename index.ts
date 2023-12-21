import p5 from "p5";
import { Station } from "./assets/objects/Station.js";
import { StationType } from "./assets/objects/StationType.js";
import { Constants } from "./assets/constants.js";
import { StationGraph } from "./assets/StationGraph.js";

  
  let mySketch = (p: p5) => {
    let graph: StationGraph;
  
    p.setup = () => {
        p.createCanvas(Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
        graph = new StationGraph;
        graph.addStation('1', new Station(200, 200, StationType.Circle, p));
        graph.addStation('2', new Station(400, 200, StationType.Square, p));
        graph.addStation('3', new Station(600, 200, StationType.Triangle, p));

    };
  
    p.draw = () => {
        p.background('#fafafa');
        graph.draw(p);
    };

    p.keyPressed = () => {
      graph.keyPressed(p);
    }

    p.mousePressed = () => {
      let clickedStation = graph.getStationAtMouse(p);
      if (clickedStation) {
          graph.startDrag(clickedStation);
      }
    };

    p.mouseReleased = () => {
      let endStation = graph.getStationAtMouse(p);
      graph.endDrag(endStation);
    };

    p.mouseDragged = () => {
      if (graph.isDragging) {
          graph.updateDragPoint(p.mouseX, p.mouseY);
      }
    };
  };
  
  new p5(mySketch);
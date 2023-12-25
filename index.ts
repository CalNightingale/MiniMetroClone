import p5 from "p5";
import { Station } from "./assets/objects/Station";
import { StationType } from "./assets/objects/StationType";
import { Constants } from "./assets/constants";
import { StationGraph } from "./assets/StationGraph";
import { Person } from "./assets/objects/Person";
import { Train } from "./assets/objects/Train";

  
  let mySketch = (p: p5) => {
    let graph: StationGraph;
  
    p.setup = () => {
        let canvas = p.createCanvas(Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
        canvas.parent('gameCanvas');
        //console.log(canvas.parent());
        graph = new StationGraph;
        let stationA = new Station(100, 100, StationType.Circle, p);
        stationA.addPerson(new Person(StationType.Triangle), graph);
        graph.addStation(stationA);
        graph.addStation(new Station(400, 400, StationType.Square, p));
        graph.addStation(new Station(600, 400, StationType.Triangle, p));
        graph.addStation(new Station(600,200, StationType.Circle, p));
    };
  
    p.draw = () => {
        //p.background('#fafafa'); // <- uncomment to draw gray background for bounding purposes
        p.clear();
        graph.draw(p);
    };

    p.mousePressed = () => {
      let clickedStation = graph.getStationAtMouse(p.mouseX, p.mouseY);
      if (clickedStation) {
          graph.startDrag(clickedStation);
      }
    };

    p.mouseReleased = () => {
      let endStation = graph.getStationAtMouse(p.mouseX, p.mouseY);
      graph.endDrag(endStation);
    };

    p.mouseDragged = () => {
      if (graph.isDragging) {
          graph.updateDragPoint(p.mouseX, p.mouseY);
      }
    };
  };
  
  new p5(mySketch);
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
      graph = new StationGraph(p);
  };

  p.draw = () => {
      //p.background('#fafafa'); // <- uncomment to draw gray background for bounding purposes
      p.clear();
      graph.draw(p);
  };

  p.mousePressed = () => graph.mousePressed(p);

  p.mouseReleased = () => graph.mouseReleased(p);

  p.mouseDragged = () => {
    if (graph.isDragging) {
        graph.updateDragPoint(p.mouseX, p.mouseY);
    }
  };

  /**
   * SOME HELPER FUNCTIONS FOR DEBUGGING
   */
  function passengerInfo(stationID: number) {
    const station = graph.getStation(stationID);
    station.people.forEach(person => {
      console.log(person);
    });
  }

  function debugReroute(stationID: number, personIndex: number) {
    const station = graph.getStation(stationID);
    const personToDebug = station.people[personIndex];
    personToDebug.updatePath(station, true);
  }
  // assign debug functions to window object
  (window as any).passengerInfo = passengerInfo;
  (window as any).debugReroute = debugReroute;
};

new p5(mySketch);
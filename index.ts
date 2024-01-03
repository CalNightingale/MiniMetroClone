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
  };
  
  new p5(mySketch);
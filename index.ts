//import p5 from "p5";
import { Station } from "./assets/objects/Station.js";
import { StationType } from "./assets/objects/StationType.js";
import { Constants } from "./assets/constants.js";


declare global {
    interface Window {
      p5: typeof p5;
    }
  }

  declare var p5: any;
  
  let mySketch = (p: typeof p5) => {
    let stations: Station[] = [];
  
    p.setup = () => {
        p.createCanvas(Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
        stations.push(new Station(200, 200, StationType.Circle));
        stations.push(new Station(400, 200, StationType.Square));
        stations.push(new Station(600, 200, StationType.Triangle));
    };
  
    p.draw = () => {
        p.background('#fafafa');
        stations.forEach( (station) => {station.draw(p)})
    };

    p.keyPressed = () => {
        stations.forEach( (station) => {
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
  };
  
  new window.p5(mySketch);
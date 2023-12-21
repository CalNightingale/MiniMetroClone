import p5 from "p5";
import { Station } from "./assets/objects/Station.js";
import { StationType } from "./assets/objects/StationType.js";
import { Constants } from "./assets/constants.js";

  
  let mySketch = (p: p5) => {
    let stations: Station[] = [];
  
    p.setup = () => {
        p.createCanvas(Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
        stations.push(new Station(200, 200, StationType.Circle, p));
        stations.push(new Station(400, 200, StationType.Square, p));
        stations.push(new Station(600, 200, StationType.Triangle, p));
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
  
  new p5(mySketch);
//import p5 from "p5";
import { Circle } from "./Circle.js";

declare global {
    interface Window {
      p5: typeof p5;
    }
  }

  declare var p5: any;
  
  let mySketch = (p: typeof p5) => {
    let myCircle: Circle;
  
    p.setup = () => {
        p.createCanvas(400, 400);
        myCircle = new Circle(200, 200, 50);
    };
  
    p.draw = () => {
        p.background(220);
        myCircle.draw(p);
    };

    p.keyPressed = () => {
        switch (p.keyCode) {
          case p.LEFT_ARROW:
            myCircle.move(-5, 0);
            break;
          case p.RIGHT_ARROW:
            myCircle.move(5, 0);
            break;
          case p.UP_ARROW:
            myCircle.move(0, -5);
            break;
          case p.DOWN_ARROW:
            myCircle.move(0, 5);
            break;
        }
    }
  };
  
  new window.p5(mySketch);
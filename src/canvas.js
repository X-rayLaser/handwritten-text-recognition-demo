import React from 'react';
import Button from 'react-bootstrap/Button';


export default class Canvas extends React.Component {
    constructor(props) {
      super(props);
      this.canvasRef = React.createRef();
      this.painter = null;
      this.points = [];
  
      this.eventListeners = [];
  
      this.resizeCanvas = this.resizeCanvas.bind(this);
    }
  
    resizeCanvas() {
      const canvas = this.canvasRef.current;
  
      if (canvas) {
        const parentWidth = canvas.parentNode.offsetWidth;
        canvas.width = parentWidth;
      }
    }
  
    getPoint(e, canvas) {
        let rect = canvas.getBoundingClientRect();
        let t = Date.now() / 1000; // measured in seconds
        return [e.clientX - rect.x, e.clientY - rect.y, t, 0];
    }
  
    addEventListener(element, event, handler) {
      element.addEventListener(event, handler);
      this.eventListeners.push({
        element: element,
        event: event,
        handler: handler
      });
    }
  
    removeListeners() {
      this.eventListeners.forEach(obj => {
        obj.element.removeEventListener(obj.event, obj.handler);
      });
  
      this.eventListeners = [];
    }
  
    addListeners(painter) {
      let drawing = false;
      let first = true;
  
      const canvas = this.canvasRef.current;
  
      let self = this;

      let lastPoint = {};

      function onTick() {

      }
  
      function handleMouseDown(e) {
        drawing = true;
        let p = self.getPoint(e, canvas);
    
        if (first) {
            painter.addFirstPoint(p, false);
        } else {
            let newStroke = true;
            painter.addPoint(p, newStroke);
        }
    
        first = false;
      }
  
      function handleMouseMove(e) {
        if (drawing) {
          let p = self.getPoint(e, canvas);
          painter.addPoint(p);
        }
      }
  
      function handleMouseUp(e) {
        drawing = false;
        this.points = self.painter.getPoints();
        self.props.onUpdated(this.points);
      }
  
      this.addEventListener(canvas, 'mousedown', handleMouseDown);
      this.addEventListener(canvas, 'mousemove', handleMouseMove);
      this.addEventListener(canvas, 'mouseup', handleMouseUp);
  
      this.addEventListener(window, 'resize', this.resizeCanvas);
    }
    
    handleClear() {
      this.painter.clear();
    }
  
    componentDidMount() {
      const canvas = this.canvasRef.current;
      this.resizeCanvas();
      this.painter = new Painter(canvas);
      this.addListeners(this.painter);
    }
  
    componentWillUnmount() {
      this.removeListeners();
    }
  
    render() {
      return (
        <div>
          <canvas ref={this.canvasRef}></canvas>
          <Button variant="primary" sz="lg" onClick={e => this.handleClear()}>Clear</Button>
          <Button variant="primary" sz="lg" onClick={e => this.props.onUpdated(this.points)}>Recognize</Button>
        </div>
      );
    }
  }

class Painter {
    constructor(canvas) {
        this.canvas = canvas;
        this.points = [];
    }

    clear() {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.beginPath();
        this.points = [];
    }

    addFirstPoint(p) {
        let [x0, y0, t0, eos0] = p;
        const ctx = this.canvas.getContext('2d');
        ctx.moveTo(x0, y0);
        this.points.push(p)
    }

    addPoint(p, newStroke) {
        let [x, y, t, eos] = p;
        const ctx = this.canvas.getContext('2d');

        if (newStroke) {
            if (this.points.length > 0) {
                this.points[this.points.length - 1][3] = 1;
            }
            ctx.moveTo(x, y);
        }

        ctx.lineTo(x, y);
        ctx.stroke();

        this.points.push(p);
    }

    getPoints() {
        return this.points.slice(0);
    }
}

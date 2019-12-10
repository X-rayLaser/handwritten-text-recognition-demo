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
  
      function handleMouseDown(e) {
        drawing = true;
        let p = self.getPoint(e, canvas);

        if (first) {
            painter.addFirstPoint(p);
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
      }
  
      this.addEventListener(canvas, 'mousedown', handleMouseDown);
      this.addEventListener(canvas, 'mousemove', handleMouseMove);
      this.addEventListener(canvas, 'mouseup', handleMouseUp);
  
      this.addEventListener(window, 'resize', this.resizeCanvas);
    }
    
    handleClear() {
      this.painter.clear();
    }
  
    drawTestExample() {
      let self = this;
      fetch('http://localhost:8080/blstm/test_example.json').then(response => {
        response.json().then(res => {
          let points = res.points;
          let first = true;
          points.forEach(stroke => {
            let newStroke = true;
            stroke.forEach(point => {
              let [x, y, t] = point;
              x = x / this.props.ratio * this.props.scale;
              y = y / this.props.ratio * this.props.scale;
              let p = [x, y, t, 0];
              if (first) {
                self.painter.addFirstPoint(p);
              } else {
                self.painter.addPoint(p, newStroke);
              }
              newStroke = false;
              first = false;
            });
          });
        });
      });
    }

    componentDidMount() {
      const canvas = this.canvasRef.current;
      this.resizeCanvas();

      let scale = this.props.scale;
      let R = this.props.ratio;
      let cellPixelSize = 300 / R * scale;
      this.painter = new Painter(canvas, cellPixelSize);
      this.addListeners(this.painter);

      //this.drawTestExample();
    }

    componentDidUpdate(prevProps) {
      if (this.props.scale !== prevProps.scale) {
        this.painter.cellPixelSize = 300 / this.props.ratio * this.props.scale;
        this.painter.clear();
      }
    }
  
    componentWillUnmount() {
      this.removeListeners();
    }
  
    render() {
      return (
        <div>
          <canvas ref={this.canvasRef}></canvas>
          <Button variant="primary" sz="lg" onClick={e => this.handleClear()}>Clear</Button>
          <Button variant="primary" sz="lg" onClick={e => this.props.onUpdated(this.painter.getPoints())}>Recognize</Button>
        </div>
      );
    }
  }

class Painter {
    constructor(canvas, cellPixelSize) {
        this.canvas = canvas;
        this.points = [];
        this.cellPixelSize = cellPixelSize;

        const ctx = this.canvas.getContext('2d');
        this.defaultLineWidth = ctx.lineWidth;
        this.defaultStrokeStyle = ctx.strokeStyle;

        this.makeGrid();
        ctx.beginPath();
    }

    setGrayLineStyle(ctx) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#aaa";
    }

    restoreOriginalLineStyle(ctx) {
      ctx.lineWidth = this.defaultLineWidth;
      ctx.strokeStyle = this.defaultStrokeStyle;
    }

    makeGrid() {
      let cellPixelSize = this.cellPixelSize;
      let numVertCells = Math.round(this.canvas.height / cellPixelSize);
      let numHorCells = Math.round(this.canvas.width / cellPixelSize);

      const ctx = this.canvas.getContext('2d');
      this.setGrayLineStyle(ctx);
      ctx.beginPath();

      for (let i = 0; i < numVertCells; i++) {
        let y = i * cellPixelSize;
        ctx.moveTo(0, y);
        ctx.lineTo(this.canvas.width - 1, y);
        ctx.stroke();
        for (let j = 0; j < numHorCells; j++) {
          let x = j * cellPixelSize;
          ctx.moveTo(x, 0);
          ctx.lineTo(x, this.canvas.height - 1);
          ctx.stroke();
        }
      }

      ctx.closePath();

      this.restoreOriginalLineStyle(ctx);
    }

    clear() {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.points = [];
        this.makeGrid();
        ctx.beginPath();
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
        return this.points.slice(0, this.points.length);
    }
}

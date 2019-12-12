import React from 'react';
import Button from 'react-bootstrap/Button';
import TargetSurfaceGeometry from '../geometry';


class WhiteBoardPainter {
  constructor(canvas, cellPixelSize) {
    this.canvas = canvas;
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

  addPoint(x, y, newStroke) {
    const ctx = this.canvas.getContext('2d');

    if (newStroke) {
        ctx.moveTo(x, y);
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  }

  clear() {
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.makeGrid();
    ctx.beginPath();
  }
}


class ListenersStore {
  constructor() {
    this.eventListeners = [];
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
}


class WhiteBoard extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();

    this.listenerStore = new ListenersStore();
  
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    this.painter = null;
    this.drawing = false;
  }

  getPoint(e) {
    const canvas = this.canvasRef.current;
    let rect = canvas.getBoundingClientRect();
    return [e.clientX - rect.x, e.clientY - rect.y];
  }

  handleMouseDown(e) {
    if (this.props.disabled) {
      return;
    }
    
    this.drawing = true;
    let [x, y] = this.getPoint(e);

    this.painter.addPoint(x, y, true);
    this.props.onMouseDown(x, y);
  }

  handleMouseMove(e) {
    if (this.drawing) {
      let [x, y] = this.getPoint(e);
      this.painter.addPoint(x, y, false);
      this.props.onMouseMove(x, y);
    }
  }

  handleMouseUp(e) {
    this.drawing = false;
    this.props.onMouseUp();
  }

  addListeners() {
    const canvas = this.canvasRef.current;

    this.listenerStore.addEventListener(canvas, 'mousedown', this.handleMouseDown);
    this.listenerStore.addEventListener(canvas, 'mousemove', this.handleMouseMove);
    this.listenerStore.addEventListener(canvas, 'mouseup', this.handleMouseUp);
  }

  rerenderCanvas() {
    const canvas = this.canvasRef.current;
    canvas.width = this.props.width;
    canvas.height = this.props.height;
    this.painter = new WhiteBoardPainter(canvas, this.props.cellSize);
  }

  componentDidMount() {
    this.rerenderCanvas();
    this.addListeners();
  }

  relevantPropsChanged(currentProps, previousProps) {
    return !(currentProps.width === previousProps.width &&
             currentProps.height === previousProps.height &&
             currentProps.cellSize === previousProps.cellSize);
  }

  componentDidUpdate(prevProps) {
    if (this.relevantPropsChanged(this.props, prevProps)) {
      this.painter.clear();
      this.rerenderCanvas();
    }
  }

  componentWillUnmount() {
    console.log('componentWillUnmount');
    this.listenerStore.removeListeners();
  }

  render() {
    let styleProps = {};

    if (this.props.disabled) {
      styleProps.background = "#999";
    }

    return (
      <canvas style={styleProps} ref={this.canvasRef}></canvas>
    );
  }
}


export default class Canvas extends React.Component {
    constructor(props) {
      super(props);
      this.rootRef = React.createRef();
      this.sequence = null;

      this.targetGeometry = null;

      this.points = [];
      this.first = true;
  
      this.listeners = new ListenersStore();

      this.state = {
        canvasWidth: 500,
        canvasHeight: 200,
        cellSize: 40
      };

      this.handleMouseDown = this.handleMouseDown.bind(this);
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
      this.handleWindowResize = this.handleWindowResize.bind(this);
    }
 
    handleMouseDown(x, y) {      
      let t = Date.now() / 1000; // measured in seconds
      let p = [x, y, t, 0];

      if (this.first) {
          this.sequence.addFirstPoint(p);
      } else {
          let newStroke = true;
          this.sequence.addPoint(p, newStroke);
      }
  
      this.first = false;
    }

    handleMouseMove(x, y) {
        let t = Date.now() / 1000; // measured in seconds
        let p = [x, y, t, 0];
        this.sequence.addPoint(p);
    }

    handleMouseUp() {
      this.points = this.sequence.getPoints();
    }

    handleClear() {
      this.sequence.points = [];
      this.points = [];
      this.forceUpdate();
    }

    updateCanvas() {
      const width = this.rootRef.current.offsetWidth;

      let scale = this.props.scale;

      let targetWidth = 6907;
      this.targetGeometry = new TargetSurfaceGeometry(width, targetWidth, scale);
      let cellPixelSize = this.targetGeometry.cellPixelSize(this.props.pixelsPerLetter);

      this.setState({
        canvasWidth: width,
        cellSize: cellPixelSize
      });
    }

    handleWindowResize() {
      this.updateCanvas();
    }

    componentDidMount() {
      this.listeners.addEventListener(window, 'resize', this.handleWindowResize);
      this.sequence = new Sequence();
      this.updateCanvas();
    }

    componentWillUnmount() {
      this.listeners.removeListeners();
    }

    componentDidUpdate(prevProps) {
      if (this.props.scale !== prevProps.scale) {
        this.updateCanvas();
        this.handleClear();
      }
    }
 
    render() {
      return (
        <div ref={this.rootRef}>
          <WhiteBoard width={this.state.canvasWidth} 
                      height={this.state.canvasHeight} 
                      cellSize={this.state.cellSize}
                      onMouseDown={this.handleMouseDown} 
                      onMouseMove={this.handleMouseMove} 
                      onMouseUp={this.handleMouseUp} 
                      disabled={this.props.disabled} />
          <Button disabled={this.props.disabled} variant="primary" sz="lg" onClick={e => this.handleClear()}>Clear</Button>
          <Button disabled={this.props.disabled} variant="primary" sz="lg" onClick={e => this.props.onUpdated(this.points)}>Recognize</Button>
        </div>
      );
    }
  }


class Sequence {
    constructor() {
        this.points = [];
    }

    addFirstPoint(p) {
        this.points.push(p)
    }

    addPoint(p, newStroke) {
        if (newStroke) {
            if (this.points.length > 0) {
                this.points[this.points.length - 1][3] = 1;
            }
        }

        this.points.push(p);
    }

    getPoints() {
        return this.points.slice(0, this.points.length);
    }
}


function drawTestExample(ratio, scale, painter) {
  let self = this;
  fetch('http://localhost:8080/blstm/test_example.json').then(response => {
    response.json().then(res => {
      let points = res.points;
      let first = true;
      points.forEach(stroke => {
        let newStroke = true;
        stroke.forEach(point => {
          let [x, y, t] = point;
          x = x / ratio * scale;
          y = y / ratio * scale;
          let p = [x, y, t, 0];
          if (first) {
            painter.addFirstPoint(p);
          } else {
            painter.addPoint(p, newStroke);
          }
          newStroke = false;
          first = false;
        });
      });
    });
  });
}

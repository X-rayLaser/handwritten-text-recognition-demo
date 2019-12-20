import React from 'react';
import { EventListenersStore } from '../util';


export class DrawingBoard extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.listenerStore = new EventListenersStore();
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
    this.painter = new Painter(canvas, this.props.cellSize);
  }
  componentDidMount() {
    this.rerenderCanvas();
    this.addListeners();
  }
  relevantPropsChanged(currentProps, previousProps) {
    return !(currentProps.width === previousProps.width &&
      currentProps.height === previousProps.height &&
      currentProps.cellSize === previousProps.cellSize &&
      currentProps.clearCounter === previousProps.clearCounter);
  }
  componentDidUpdate(prevProps) {
    if (this.relevantPropsChanged(this.props, prevProps)) {
      this.painter.clear();
      this.rerenderCanvas();
    }
  }
  componentWillUnmount() {
    this.listenerStore.removeListeners();
  }
  render() {
    let styleProps = {};
    if (this.props.disabled) {
      styleProps.background = "#999";
    }
    return (<canvas className='app-section' style={styleProps} ref={this.canvasRef}></canvas>);
  }
}


class Painter {
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
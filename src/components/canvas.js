import React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import TargetSurfaceGeometry from '../geometry';
import { EventListenersStore } from '../util';
import { DrawingBoard } from './DrawingBoard';


export default class Canvas extends React.Component {
    constructor(props) {
      super(props);
      this.rootRef = React.createRef();
      this.sequence = null;

      this.targetGeometry = null;
  
      this.listeners = new EventListenersStore();

      this.state = {
        canvasWidth: 500,
        canvasHeight: 200,
        cellSize: 40,
        clearCounter: 0
      };

      this.handleMouseDown = this.handleMouseDown.bind(this);
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
      this.handleWindowResize = this.handleWindowResize.bind(this);

      this.handleClear = this.handleClear.bind(this);
      this.handleRecognize = this.handleRecognize.bind(this);
    }
 
    handleMouseDown(x, y) {
      this.sequence.startNewStroke();
      this.sequence.addPoint(x, y);
    }

    handleMouseMove(x, y) {
        this.sequence.addPoint(x, y);
    }

    handleMouseUp() {
      this.sequence.markEndOfStroke();
    }

    handleClear() {
      this.sequence.clear();
      
      this.setState((state, props) => ({
        clearCounter: state.clearCounter + 1
      }));
    }

    handleRecognize() {
      this.props.onUpdated(this.sequence.getPoints());
    }

    updateCanvas() {
      const width = this.rootRef.current.offsetWidth;

      let scale = this.props.scale;

      let targetWidth = this.props.targetWidth;
      this.targetGeometry = new TargetSurfaceGeometry(width, targetWidth, scale);
      let cellPixelSize = this.targetGeometry.cellPixelSize(this.props.pixelsPerLetter);
      this.sequence.changeGeometry(this.targetGeometry);

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
      if (this.props.scale !== prevProps.scale ||
          this.props.pixelsPerLetter !== prevProps.pixelsPerLetter ||
          this.props.targetWidth !== prevProps.targetWidth) {
        this.updateCanvas();
        this.handleClear();
      }
    }
 
    render() {
      return (
        <div ref={this.rootRef}>
          <DrawingBoard width={this.state.canvasWidth} 
                      height={this.state.canvasHeight} 
                      cellSize={this.state.cellSize}
                      onMouseDown={this.handleMouseDown} 
                      onMouseMove={this.handleMouseMove} 
                      onMouseUp={this.handleMouseUp} 
                      disabled={this.props.disabled}
                      clearCounter={this.state.clearCounter} />
          <ButtonGroup aria-label="Zoom buttons">
            <Button disabled={this.props.disabled} variant="primary" 
                    sz="lg" onClick={this.handleClear}>
              Clear
            </Button>
            <Button disabled={this.props.disabled} variant="primary" 
                    sz="lg" onClick={this.handleRecognize}>
              Recognize
            </Button>
          </ButtonGroup>
        </div>
      );
    }
}


class Point4d {
  constructor(x, y, t) {
    this.x = x;
    this.y = y;
    this.t = t;
    this.endOfStroke = 0;
  }

  markEndOfStroke() {
    this.endOfStroke = 1;
  }

  toArray() {
    return [this.x, this.y, this.t, this.endOfStroke]
  }
}


class Sequence {
    constructor(targetGeometry) {
        this.points = [];
        this.geometry = targetGeometry;
    }

    changeGeometry(targetGeometry) {
      this.geometry = targetGeometry;
    }

    clear() {
      this.points = [];
    }

    startNewStroke() {
      this.markEndOfStroke();
    }

    addPoint(x, y) {
      let t = Date.now() / 1000; // measured in seconds
      let [xTarget, yTarget] = this.geometry.transformPoint(x, y);
      let p = new Point4d(xTarget, yTarget, t, 0);
      this.points.push(p);
    }

    markEndOfStroke() {
      if (this.points.length > 0) {
        let lastPoint = this.points[this.points.length - 1];
        lastPoint.markEndOfStroke();
      }
    }

    getPoints() {
        return this.points.map(p => p.toArray());
    }
}

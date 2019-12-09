import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Canvas from './canvas';
import TranscriptionPanel from './transcription_panel';
import SettingsPanel from './settings_panel';
import MyProgressBar from './progress_bar';
import Worker from '../workers/worker';


function MySwitch(props) {
    return (
      <Form>
        <Form.Check 
          type="switch"
          id="custom-switch"
          label={props.label}
          checked={props.checked}
          onChange={(e) => {props.onChange(e)}}
        />
      </Form>
    );
  }

let worker = new Worker();


export default class RecognitionWidget extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        ready: false,
        on_line: true,
        complete: true,
        best_match: "",
        top_results: [],
        scale: 0.5
      };

      worker.onmessage = e => {
        let {message, data} = e.data;
        if (message === 'init') {
          this.setState({ready: true});
        } else if (message === 'resultReady') {
          let bestMatch = data;
          this.setState({
              complete: true,
              best_match: bestMatch,
              top_results: [bestMatch]
          });
        }
      };

      worker.onerror = e => {
        //handle errors here
      };
  
      this.ratio = 7;
      this.decodingAlgorithm = 'Token passing';
  
      this.handleUpdated = this.handleUpdated.bind(this);
    }
  
    handleChange() {
      this.setState((state, props) => ({
        on_line: !state.on_line
      }));
    }
  
    handleUpdated(points) {
      this.setState({complete: false});
      worker.postMessage({
          message: 'recognize',
          data: {
            ratio: this.ratio,
            scale: this.state.scale,
            points: points,
            decodingAlgorithm: this.decodingAlgorithm
          }
      }); 
    }
  
    handleZoomIn() {
      this.setState((state, props) => ({
        scale: state.scale * 1.25
      }));
    }
  
    handleZoomOut() {
      this.setState((state, props) => {
        return {
          scale: state.scale / 1.25
        }
      });
    }
  
    render() {
      let dataInput;
      let switchLabel;
      let visibleWidget;

      if (!this.state.ready) {
          return <div>Wait...</div>
      }
  
      if (this.state.on_line === true) {
        dataInput = <Canvas onUpdated={this.handleUpdated} scale={this.state.scale} ratio={this.ratio} />;
        switchLabel = "On-line recognition";
      } else {
        dataInput = <h2 className="text-center">Under development</h2>;
        switchLabel = "Off-line recognition";
      }
  
      if (this.state.complete) {
        visibleWidget = <TranscriptionPanel
                            best_match={this.state.best_match}
                            top_results={this.state.top_results} />;
      } else {
        visibleWidget = <MyProgressBar />;
      }
  
      return (
        <div>
          <MySwitch label={switchLabel} checked={this.state.on_line}
                    onChange={(e) => {this.handleChange()}} />
  
          {dataInput}
  
          <SettingsPanel onDecoderChange={algoName => {this.decodingAlgorithm = algoName;}} />
          {visibleWidget}
          <Button onClick={e => this.handleZoomIn()}>Zoom in</Button>
          <Button onClick={e => this.handleZoomOut()}>Zoom out</Button>
        </div>
      );
    }
}
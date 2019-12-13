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
        scale: 1
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
  
      this.ratio = 6907 / 1110;
      this.decodingAlgorithm = 'Token passing';
      this.dictSize = 1000;
  
      this.handleUpdated = this.handleUpdated.bind(this);
      this.handleDictSizeChange = this.handleDictSizeChange.bind(this);
      this.handleDecoderChange = this.handleDecoderChange.bind(this);
    }
  
    handleChange() {
      this.setState((state, props) => ({
        on_line: !state.on_line
      }));
    }

    handleDictSizeChange(dictSize) {
      this.dictSize = dictSize;
      worker.postMessage({
          message: 'changeDecoder',
          data: {
            decodingAlgorithm: 'Token passing',
            algorithmParams: { dictSize: this.dictSize }
          }
      });
    }

    handleDecoderChange(decodingAlgorithm) {
      let params;
      if (decodingAlgorithm === 'Token passing') {
        params = { dictSize: this.dictSize };
      } else {
        params = {};
      }
      worker.postMessage({
          message: 'changeDecoder',
          data: {
            decodingAlgorithm: decodingAlgorithm,
            algorithmParams: params
          }
      });
    }
  
    handleUpdated(points) {
      this.setState({complete: false});
      worker.postMessage({
          message: 'recognize',
          data: {
            ratio: this.ratio,
            scale: this.state.scale,
            points: points
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
      let visibleWidget;

      if (!this.state.ready) {
          return <div>Wait...</div>
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
          <Button disabled={!this.state.complete} onClick={e => this.handleZoomIn()}>Zoom in</Button>
          <Button disabled={!this.state.complete} onClick={e => this.handleZoomOut()}>Zoom out</Button>
          <Canvas disabled={!this.state.complete} 
              onUpdated={this.handleUpdated}
              scale={this.state.scale} ratio={this.ratio}
              pixelsPerLetter={195}
               />
          <SettingsPanel onDecoderChange={this.handleDecoderChange}
                         onDictSizeChange={this.handleDictSizeChange} />
          {visibleWidget}
        </div>
      );
    }
}
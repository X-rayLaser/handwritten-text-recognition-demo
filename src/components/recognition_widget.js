import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import * as tf from '@tensorflow/tfjs';
import Canvas from './canvas';
import { Recognizer, Preprocessor, TokenPassingDecoder, BestPathDecoder } from '../recognition';
import TranscriptionPanel from './transcription_panel';
import SettingsPanel from './settings_panel';
import MyProgressBar from './progress_bar';


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


export default class RecognitionWidget extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        on_line: true,
        complete: true,
        best_match: "",
        top_results: [],
        scale: 0.5
      };
  
      this.ratio = 7;
  
      this.handleUpdated = this.handleUpdated.bind(this);
  
      this.dataInfo = {
        char_table: {}
      };
  
      this.wordsIndex = [];
  
      this.decoder = {};
  
      // code to get json file with char table, mu and std parameters
      // use them to preprocess points and decode prediction
      fetch('http://localhost:8080/blstm/data_info.json').then(response => {
        console.log("fetch");
        response.json().then(res => {
          this.dataInfo = res;
        });
      });
  
      //fetch words index file
      fetch('http://localhost:8080/words.txt').then(response => {
        response.text().then(text => {
          this.wordsIndex = text.split('\n');
  
          const dictPath = "dictionary/dictionary.txt";
          const bigramsPath = "dictionary/bigrams.txt";
  
          this.decoder = new TokenPassingDecoder(dictPath, bigramsPath, this.wordsIndex);
          //this.decoder = new BestPathDecoder(this.dataInfo);
        });
      });
    }
  
    handleChange() {
      this.setState((state, props) => ({
        on_line: !state.on_line
      }));
    }
  
    handleUpdated(points) {
      const model = tf.loadLayersModel('http://localhost:8080/blstm/model.json');
  
      this.setState({complete: false});
  
      const preprossor = new Preprocessor(this.dataInfo);
  
      let preprocessed = preprossor.preprocess(points, this.ratio, this.state.scale);
  
      model.then(m => {
        const recognizer = new Recognizer(m, this.decoder);
        let bestMatch = recognizer.predict(preprocessed);
        
        this.setState({
          complete: true,
          best_match: bestMatch,
          top_results: [bestMatch]
        });
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
  
          <SettingsPanel />
          {visibleWidget}
          <Button onClick={e => this.handleZoomIn()}>Zoom in</Button>
          <Button onClick={e => this.handleZoomOut()}>Zoom out</Button>
        </div>
      );
    }
}
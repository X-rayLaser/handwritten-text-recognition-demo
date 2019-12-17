import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Canvas from './canvas';
import TranscriptionPanel from './transcription_panel';
import SettingsPanel from './settings_panel';
import MyProgressBar from './progress_bar';
import Worker from '../workers/worker';
import { fetchDataInfo, makeBestPathMetaObject, makeTokenPassingMetaObject,
  defaultDictionarySize, allowedDictionarySizes, TOKEN_PASSING_ALGORITHM
} from '../util';


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
      
      this.dataInfo = null;

      this.state = {
        errorMsg: "",
        workerReady: false,
        dataInfoFetched: false,
        targetWidth: 100,
        pixelsPerLetter: 100,
        complete: true,
        best_match: "",
        top_results: [],
        scale: 1,
        decodingAlgorithm: TOKEN_PASSING_ALGORITHM,
        dictSize: defaultDictionarySize
      };

      this.subscribeToWorker();
      this.bindEventHandlers();
    }

    subscribeToWorker() {
      worker.onmessage = e => {
        let {message, data} = e.data;
        if (message === 'init') {
          this.setState({workerReady: true});
        } else if (message === 'resultReady') {
          let bestMatch = data;
          this.setState({
              complete: true,
              best_match: bestMatch,
              top_results: [bestMatch],
              errorMsg: ""
          });
        }
      };

      worker.onerror = e => {
        console.error('Error happend in a worker:');
        console.error(e);
        this.setState({
            complete: true,
            best_match: "",
            top_results: [],
            errorMsg: e.message
        });
      };

      worker.postMessage({
          message: 'signalWhenInitialized',
          data: {}
      });
    }

    bindEventHandlers() {
      this.handleUpdated = this.handleUpdated.bind(this);
      this.handleDictSizeChange = this.handleDictSizeChange.bind(this);
      this.handleDecoderChange = this.handleDecoderChange.bind(this);
      this.handleZoomIn = this.handleZoomIn.bind(this);
      this.handleZoomOut = this.handleZoomOut.bind(this);
    }
 
    handleDictSizeChange(dictSize) {
      this.setState({
        dictSize,
        decodingAlgorithm: TOKEN_PASSING_ALGORITHM
      });
    }

    handleDecoderChange(decodingAlgorithm) {
      this.setState({
        decodingAlgorithm
      });
    }
  
    postJobToWorker(points) {
      let decoderMetaObject;
      if (this.state.decodingAlgorithm === TOKEN_PASSING_ALGORITHM) {
        decoderMetaObject = makeTokenPassingMetaObject(this.state.dictSize);
      } else {
        decoderMetaObject = makeBestPathMetaObject();
      }

      worker.postMessage({
        message: 'recognize',
        data: {
          points: points,
          decoderMetaObject
        }
      });
    }

    handleUpdated(points) {
      this.setState({complete: false, errorMsg: ""});
      this.postJobToWorker(points);
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

    componentDidMount() {
      fetchDataInfo().then(dataInfo => {
        this.dataInfo = dataInfo;
        this.setState({
          dataInfoFetched: true,
          targetWidth: dataInfo.horizontal_resolution,
          pixelsPerLetter: dataInfo.pixels_per_letter
        });
      });
    }
  
    render() {
      let visibleWidget;

      if (!(this.state.workerReady && this.state.dataInfoFetched)) {
          return <div>Wait...</div>
      }
  
      if (this.state.complete && this.state.errorMsg) {
        visibleWidget = (
          <Alert variant="danger">
            <Alert.Heading>Recognition failed for the following reason</Alert.Heading>
            <p>{this.state.errorMsg}</p>
          </Alert>
        );
      } else if (this.state.complete && !this.state.showError) {
        visibleWidget = <TranscriptionPanel
                            best_match={this.state.best_match}
                            top_results={this.state.top_results} />;
      } else {
        visibleWidget = <MyProgressBar />;
      }
  
      return (
        <div>
          <Button disabled={!this.state.complete} onClick={this.handleZoomIn}>Zoom in</Button>
          <Button disabled={!this.state.complete} onClick={this.handleZoomOut}>Zoom out</Button>
          <Canvas disabled={!this.state.complete} 
                  onUpdated={this.handleUpdated}
                  scale={this.state.scale} ratio={this.ratio}
                  targetWidth={this.state.targetWidth}
                  pixelsPerLetter={this.state.pixelsPerLetter} />
          <SettingsPanel onDecoderChange={this.handleDecoderChange}
                         onDictSizeChange={this.handleDictSizeChange}
                         decodingAlgorithm={this.state.decodingAlgorithm}
                         dictSize={this.state.dictSize} />
          {visibleWidget}
          <Info />
        </div>
      );
    }
}

function Info(props) {
  return (
    <section>
      <p>
        To get a higher accuracy, try to draw a text just like you would with a pencil.
      </p>
      <p>By default, Token Passing algorithm is used for decoding, with 
          dictionary containing 1000 words. You can change the size of the 
          dictionary or switch to Best Path decoding algorithm.
      </p>
      <p>Note that with Token Passing algorithm only words that are in the 
        dictionary will be recognized.
        Also, the running time of Token Passing decoding algorithm is proportional
        to the square of dictionary size.
      </p>
    </section>
  );
}
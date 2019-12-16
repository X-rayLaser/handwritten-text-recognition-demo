import * as tf from '@tensorflow/tfjs';
import { dataInfoUrl, wordIndexUrl, tsjsModelUrl } from './config';
import { BestPathDecoder, TokenPassingDecoder } from './recognition';

export const allowedDictionarySizes = [1000, 2000, 3000, 4000, 5000];
export const defaultDictionarySize = allowedDictionarySizes[0];


export function fetchDataInfo() {
    return fetch(dataInfoUrl).then(response => {
      return response.json();
    });
}


export class FileLoader {
    constructor() {
        this.dataInfo = null;
        this.model = null;
        this.wordsIndices = {};
    }
    
    getResult() {
      return {
        dataInfo: this.dataInfo,
        model: this.model,
        indices: this.wordsIndices
      };
    }

    fetchDataInfo() {
        let promise = fetchDataInfo().then(res => {
          this.dataInfo = res;
          return res;
        });

        return promise;
    }

    fetchWordIndex(location, fileName) {
        let uri = wordIndexUrl(location, fileName);

        let promise = fetch(uri).then(response => {
          return response.text();
        }).then(text => {
          let wordIndex = text.split('\n');
          this.wordsIndices[location] = wordIndex;

          return {
            location,
            wordIndex
          };
        });

        return promise;
    }

    fetchModel() {
        let promise = tf.loadLayersModel(tsjsModelUrl).then(m => {
            this.model = m;
            return m;
        });

        return promise;
    }

    fetch() {
        let dataInfoPromise = this.fetchDataInfo();
        let modelPromise = this.fetchModel();

        let indexPromises = allowedDictionarySizes.map(size => 
          this.fetchWordIndex(String(size), 'words.txt')
        );
        
        let promiseArray = [dataInfoPromise, modelPromise, ...indexPromises];

        return Promise.all(promiseArray).then(result => {
          return {
            dataInfo: this.dataInfo,
            model: this.model,
            indices: this.wordsIndices
          };
        });
    }
}

export class EventListenersStore {
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


function drawTestExample(ratio, scale, painter) {
    let self = this;
    fetch(testExampleUrl).then(response => {
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


export const BEST_PATH_ALGORITHM = 'Best Path';
export const TOKEN_PASSING_ALGORITHM = 'Token Passing';


export function makeBestPathMetaObject() {
  return new DecoderMetaData(BEST_PATH_ALGORITHM, {});
}


export function makeTokenPassingMetaObject(dictionarySize) {
  return new DecoderMetaData(TOKEN_PASSING_ALGORITHM, { 
    dictSize: dictionarySize
  });
}


export class DecoderMetaData {
  constructor(algorithmName, params) {
    this.algorithmName = algorithmName;
    this.params = params;
  }
}

export function isValidDecoderName(name) {
  return (name === BEST_PATH_ALGORITHM || name === TOKEN_PASSING_ALGORITHM);
}

export function isValidDictionarySize(dictionarySize) {
  return allowedDictionarySizes.includes(dictionarySize); 
}

import * as tf from '@tensorflow/tfjs';
import { dataInfoUrl, wordIndexUrl, tsjsModelUrl } from './config';
import { BestPathDecoder, TokenPassingDecoder } from './recognition';


export function fetchDataInfo(onFetched) {
    fetch(dataInfoUrl).then(response => {
        response.json().then(res => {
            onFetched(res);
        });
    });
}


export class FileLoader {
    constructor(onLoad) {
        this.onLoad = onLoad;
        this.dataInfo = null;
        this.model = null;
        this.wordsIndices = {};
        this.numIndexFiles = 4;
        this.loadedIndices = 0;
    }

    fetchedAll() {
        return this.dataInfo !== null && this.model !== null && 
                    this.loadedIndices >= this.numIndexFiles;
    }

    notifyWhenComplete() {
        if (this.fetchedAll() === true) {
            this.onLoad({
                dataInfo: this.dataInfo,
                model: this.model,
                indices: this.wordsIndices
            });
        }
    }

    fetchDataInfo() {
        fetchDataInfo(res => {
            this.dataInfo = res;
            this.notifyWhenComplete();
        });
    }

    fetchWordIndex(location, fileName) {
        let uri = wordIndexUrl(location, fileName);
        
        fetch(uri).then(response => {
            response.text().then(text => {
                let wordIndex = text.split('\n');
                this.wordsIndices[location] = wordIndex;
                this.loadedIndices += 1;
                this.notifyWhenComplete();
            });
        });
    }

    fetchModel() {
        tf.loadLayersModel(tsjsModelUrl).then(m => {
            this.model = m;
            this.notifyWhenComplete();
        });
    }

    fetch() {
        this.fetchDataInfo();
        this.fetchModel();
        this.fetchWordIndex('1000', 'words.txt');
        this.fetchWordIndex('2000', 'words.txt');
        this.fetchWordIndex('3000', 'words.txt');
        this.fetchWordIndex('4000', 'words.txt');
        this.fetchWordIndex('5000', 'words.txt');
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


export const allowedDictionarySizes = [1000, 2000, 3000, 4000, 5000];


export function isValidDictionarySize(dictionarySize) {
  return allowedDictionarySizes.includes(dictionarySize); 
}

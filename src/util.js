import { dataInfoUrl, wordIndexUrl } from './config';

export const allowedDictionarySizes = [1000, 2000, 3000, 4000, 5000];
export const defaultDictionarySize = allowedDictionarySizes[0];


function fetchFile(url) {
  return new Promise((resolve, reject) => {
    fetch(url).then(response => {
      if (response.ok) {
        resolve(response);
      } else {
        reject({
          code: response.status,
          statusText: response.statusText
        })
      }
    });
  });
}


export function fetchDataInfo() {
  let jsonPromise = fetchFile(dataInfoUrl).then(resp => resp.json());
  return jsonPromise;
}


class TypeWrapper {
  constructor(obj, isDataInfo) {
    this.obj = obj;
    this.isDataInfo = isDataInfo;
  }
}


export class FileLoader {
    fetch() {
      let filesPromise = this.fetchFiles();
      let promise = this.buildObjects(filesPromise);
      return promise;
    }

    fetchFiles() {
      let dataInfoPromise = this.fetchDataInfo();

      let indexPromises = allowedDictionarySizes.map(size => 
        this.fetchWordIndex(size)
      );
      
      let promiseArray = [dataInfoPromise, ...indexPromises];

      return Promise.all(promiseArray)
    }

    fetchDataInfo() {
        let jsonPromise = fetchDataInfo();
        let isDataInfo = true;
        let promise = jsonPromise.then(result => new TypeWrapper(result, isDataInfo));
        return promise;
    }

    fetchWordIndex(dictionarySize) {
        let uri = wordIndexUrl(dictionarySize);

        let promise = fetchFile(uri).then(response => {
          return response.text();
        }).then(text => {
          let wordIndex = text.split('\n');
          let isDataInfo = false;
          let obj =  {
            location: dictionarySize,
            wordIndex
          };
          return new TypeWrapper(obj, isDataInfo);
        });

        return promise;
    }

    buildObjects(filesPromise) {
      return filesPromise.then(fetchedObjects => {
        let dataInfo = this.buildDataInfo(fetchedObjects);
        let indices = this.buildIndices(fetchedObjects);

        return {
          dataInfo,
          indices
        };
      });
    }

    buildDataInfo(fetchedObjects) {
      return fetchedObjects.filter(obj => obj.isDataInfo)[0].obj;
    }

    buildIndices(fetchedObjects) {
      let indices = {};

      fetchedObjects.filter(obj => !obj.isDataInfo).forEach(wrapper => {
        let {location, wordIndex} = wrapper.obj;
        indices[location] = wordIndex;
      });

      return indices;
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

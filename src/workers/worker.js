
importScripts('token_passing.js');
import * as tf from '@tensorflow/tfjs';
import { Recognizer, Preprocessor, TokenPassingDecoder } from '../recognition';
import { FileLoader } from '../util';

const dictPath = "dictionary/dictionary.txt";
const bigramsPath = "dictionary/bigrams.txt";

let preprocessor = null;

let decoder = null;


function sendPostMessage(message, dataObject) {
    postMessage({
        'message': message,
        'data': dataObject
    });
}


const loader = new FileLoader(obj => {
    console.log(obj);
    let {dataInfo, tfjsModel, wordsIndex} = obj;

    preprocessor = new Preprocessor(dataInfo);
    decoder = new TokenPassingDecoder(dictPath, bigramsPath, wordsIndex);

    sendPostMessage('init', {});
});

function recognize(ratio, scale, model, points) {
    let preprocessed = preprocessor.preprocess(points, ratio, scale);
    const recognizer = new Recognizer(model, decoder);
    return recognizer.predict(preprocessed);
}


onmessage = function(e) {
    let {message, data} = e.data;

    if (message === 'recognize') {
        let {ratio, scale, points} = data;
        
        tf.loadLayersModel('http://localhost:8080/blstm/model.json').then(model => {
            let res = recognize(ratio, scale, model, points);
            sendPostMessage('resultReady', res);
        });
    }
}

loader.fetch();

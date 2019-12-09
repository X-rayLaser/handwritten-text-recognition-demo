
importScripts('token_passing.js');
import * as tf from '@tensorflow/tfjs';
import { Recognizer, Preprocessor, TokenPassingDecoder, BestPathDecoder } from '../recognition';
import { FileLoader } from '../util';

const dictPath = "dictionary/dictionary.txt";
const bigramsPath = "dictionary/bigrams.txt";

let preprocessor = null;

let tokenPassing = null;

let bestPath = null;

function sendPostMessage(message, dataObject) {
    postMessage({
        'message': message,
        'data': dataObject
    });
}


const loader = new FileLoader(obj => {
    let {dataInfo, tfjsModel, wordsIndex} = obj;

    preprocessor = new Preprocessor(dataInfo);
    tokenPassing = new TokenPassingDecoder(dictPath, bigramsPath, wordsIndex);

    bestPath = new BestPathDecoder(dataInfo);

    sendPostMessage('init', {});
});


onmessage = function(e) {
    let {message, data} = e.data;

    if (message === 'recognize') {
        let {ratio, scale, points, decodingAlgorithm} = data;
        
        tf.loadLayersModel('http://localhost:8080/blstm/model.json').then(model => {
            let preprocessed = preprocessor.preprocess(points, ratio, scale);
            let alg;
            if (decodingAlgorithm === 'Token passing') {
                alg = tokenPassing;
            } else {
                alg = bestPath;
            }

            let recognizer = new Recognizer(model, alg);
            let res = recognizer.predict(preprocessed);
            sendPostMessage('resultReady', res);
        });
    }
}

loader.fetch();

importScripts('token_passing.js');
import * as tf from '@tensorflow/tfjs';
import { Recognizer, Preprocessor, TokenPassingDecoder, BestPathDecoder } from '../recognition';
import { FileLoader } from '../util';

let preprocessor = null;

let tokenPassing = null;

let bestPath = null;

let currentDecoder = null;

let wordsIndices = {};

function sendPostMessage(message, dataObject) {
    postMessage({
        'message': message,
        'data': dataObject
    });
}


function buildDictParams(dictSize) {
    dictSize = String(dictSize);
    let dictPath = `dictionary/${dictSize}/dictionary.txt`;
    let bigramPath = `dictionary/${dictSize}/bigrams.txt`;

    let wordsIndex = wordsIndices[String(dictSize)];

    return {
        dictPath,
        bigramPath,
        wordsIndex
    };
}


const loader = new FileLoader(obj => {
    let {dataInfo, tfjsModel, indices} = obj;
    
    wordsIndices = indices;
    let dictParams = buildDictParams(1000);

    preprocessor = new Preprocessor(dataInfo);
    tokenPassing = new TokenPassingDecoder(dictParams);

    bestPath = new BestPathDecoder(dataInfo);

    currentDecoder = tokenPassing;

    sendPostMessage('init', {});
});


onmessage = function(e) {
    let {message, data} = e.data;

    if (message === 'recognize') {
        let {points} = data;
        
        tf.loadLayersModel('http://localhost:8080/blstm/model.json').then(model => {
            let preprocessed = preprocessor.preprocess(points);

            let recognizer = new Recognizer(model, currentDecoder);
            let res = recognizer.predict(preprocessed);
            //sometimes predict returns undefined in the resulting string
            sendPostMessage('resultReady', res);
        });
    } else if (message === 'changeDecoder') {
        let {decodingAlgorithm, algorithmParams} = data;
        
        if (decodingAlgorithm === 'Token passing') {
            let size = algorithmParams.dictSize;
            let dictParams = buildDictParams(size);
            tokenPassing.setDictionary(dictParams);
            currentDecoder = tokenPassing;
        } else {
            currentDecoder = bestPath;
        }
    }
}

loader.fetch();

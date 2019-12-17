importScripts('token_passing.js');
import * as tf from '@tensorflow/tfjs';
import { Recognizer, Preprocessor, TokenPassingDecoder, BestPathDecoder 
} from '../recognition';

import { FileLoader, defaultDictionarySize, TOKEN_PASSING_ALGORITHM 
} from '../util';

import { tsjsModelUrl } from '../config';

let preprocessor = null;

let tokenPassing = null;

let bestPath = null;

let wordsIndices = {};

let ready = false;

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


const loader = new FileLoader();


const chooseDecoder = decoderMetaObject => {
    let {algorithmName, params} = decoderMetaObject;

    if (algorithmName === TOKEN_PASSING_ALGORITHM) {
        let size = params.dictSize;
        let dictParams = buildDictParams(size);
        tokenPassing.setDictionary(dictParams);
        return tokenPassing;
    } else {
        return bestPath;
    }
};


const asyncPredictResult = (points, decoder) => {
    tf.loadLayersModel(tsjsModelUrl).then(model => {
        let preprocessed = preprocessor.preprocess(points);

        let recognizer = new Recognizer(model, decoder);
        let res = recognizer.predict(preprocessed);
        //sometimes predict returns undefined in the resulting string
        sendPostMessage('resultReady', res);
    }).catch(reason => {
        sendErrorMessage(reason);
    });
};


const handleRecognize = data => {
    let {points, decoderMetaObject} = data;
    let decoder = chooseDecoder(decoderMetaObject);
    asyncPredictResult(points, decoder);
};


const handleSignalWhenInitialized = () => {
    if (ready) {
        sendPostMessage('init', {});
    }
};


onmessage = function(e) {
    let {message, data} = e.data;

    if (message === 'recognize') {
        handleRecognize(data);
    } else if (message === 'signalWhenInitialized') {
        handleSignalWhenInitialized();
    }
}

loader.fetch().then(obj => {
    let {dataInfo, indices} = obj;

    wordsIndices = indices;
    let dictParams = buildDictParams(defaultDictionarySize);

    preprocessor = new Preprocessor(dataInfo);
    tokenPassing = new TokenPassingDecoder(dictParams);

    bestPath = new BestPathDecoder(dataInfo);

    ready = true;

    sendPostMessage('init', {});
}).catch(reason => {
    sendErrorMessage(reason);
});


function sendErrorMessage(msg) {
    setTimeout(() => {
        throw new Error(msg);
    }, 10);
}
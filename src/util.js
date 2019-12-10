import * as tf from '@tensorflow/tfjs';


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
        fetch('http://localhost:8080/blstm/data_info.json').then(response => {
            response.json().then(res => {
                this.dataInfo = res;
                this.notifyWhenComplete();
            });
        });
    }

    fetchWordIndex(location, fileName) {
        let uri = `http://localhost:8080/word_indices/${location}/${fileName}`;
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
        tf.loadLayersModel('http://localhost:8080/blstm/model.json').then(m => {
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

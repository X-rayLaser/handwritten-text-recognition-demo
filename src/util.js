import * as tf from '@tensorflow/tfjs';


export class FileLoader {
    constructor(onLoad) {
        this.onLoad = onLoad;
        this.dataInfo = null;
        this.model = null;
        this.wordsIndex = null;
    }

    fetchedAll() {
        return this.dataInfo !== null && this.model !== null && 
                    this.wordsIndex !== null;
    }

    notifyWhenComplete() {
        if (this.fetchedAll() === true) {
            this.onLoad({
                dataInfo: this.dataInfo,
                model: this.model,
                wordsIndex: this.wordsIndex
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

    fetchWordIndex() {
        fetch('http://localhost:8080/words.txt').then(response => {
            response.text().then(text => {
                this.wordsIndex = text.split('\n');
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
        this.fetchWordIndex();
    }
}

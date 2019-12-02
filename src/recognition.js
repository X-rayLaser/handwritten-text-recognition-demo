import * as tf from '@tensorflow/tfjs';


class Preprocessor {
    constructor(dataInfo) {
        this.dataInfo = dataInfo;
    }

    interpolate(points, duration, sampleRate) {
        let n = sampleRate * duration;
        let res = [];
          
        let xs = new Signal(points.map(p => [0]));
        let ys = new Signal(points.map(p => p[1]));
        let ts = new Signal(points.map(p => p[2]));
        let eos = new Signal(points.map(p => p[3]));
        
        let numSteps = n - 1;
    
        let stepSize = numSteps / duration;
    
        let pos = 0;
        let supportIndices = eos.support();
        let nextIndex = 0;
    
        for (let i = 0; i < numSteps; i += 1) {
          let x = xs.evaluateAt(pos);
          let y = ys.evaluateAt(pos);
          let t = ts.evaluateAt(pos);
          
          let eos = 0;
          let spikePos = supportIndices[nextIndex];
          if (nextIndex < supportIndices.length && pos > spikePos) {
            eos = 1;
            nextIndex += 1;
          }
          res.push([x, y, t, eos]);
          pos += stepSize;
        }

        console.log('after interpolation ');
        console.log(res);
        
        return res;
      }
    
      subSample(points) {
        let [x0, y0, t0, eos0] = points[0];
        let numSamples = points.length;
    
        let lastSample = points[numSamples - 1];
        let tLast = lastSample[2];
        
        let duration = (tLast - t0);
        console.log(t0 + " tlast " + tLast)
        
        //samples in seconds
        let sampleRate = numSamples / (duration);
        let datasetRate = 65;
    
        let ratio = Math.round(sampleRate / datasetRate);
    
        console.log("samples " + numSamples + " duration " + duration + " sampleRate " + sampleRate + " " + ratio);
        if (ratio === 1) {
          return points;
        } else if (ratio > 1) {
          let res = [];
          for (let i = 0; i < numSamples; i++) {
            let p = points[i];
            if (i % ratio === 0) {
              res.push(p);
            }
          }
          return res;
        } else {
          let n = sampleRate * duration;

          //return this.interpolate(points, n);
          return points;
        }
      }
    
      offset(points) {
        if (points.length <= 0) {
            return points;
        }

        let [x0, y0, t0, eos0] = points[0];
    
        return points.map(p => {
          let [x, y, t, eos] = p;
          return [x - x0, y - y0, t - t0, eos];
        });
      }
    
      normalizePoint(p) {
        let mu = this.dataInfo.normalization.mu;
        let sd = this.dataInfo.normalization.sd;
    
    
        let [x, y, t, eos] = p;
        x = (x - mu[0]) / sd[0];
        y = (y - mu[1]) / sd[1];
        t = (t - mu[2]) / sd[2];
    
        return [x, y, t, eos];
      }
    
      normalize(points) {
        return points.map(p => this.normalizePoint(p));
      }
    
    preprocess(points, ratio, scale) {
        let recalculated = points.map(p => {
            let [X, Y, t, eos] = p;
            let x = X * ratio / scale;
            let y = Y * ratio / scale;
            return [x, y, t, eos];
        });
        console.log(recalculated);
        return this.normalize(this.offset(recalculated));
    }
}


class Recognizer {
    constructor(model, dataInfo) {
        this.model = model;
        this.dataInfo = dataInfo;
    }

    predict(preprocessedPoints) {
        console.log(preprocessedPoints);
        if (preprocessedPoints.length > 0) {
            let example = tf.tensor3d([preprocessedPoints], [1, preprocessedPoints.length, 4]);
            let logits = this.model.predict(example);
            let codes = tf.argMax(logits, 2).dataSync();
            return this.decode(codes);
        } else {
            return "";
        }
    }

    removeRepeatitions(codes) {
        var prev = -1;
        var res = [];
        for (var i = 0; i < codes.length; i++) {
            if (codes[i] !== prev) {
                res.push(codes[i]);
                prev = codes[i];
            }
        }

        return res;
    }

    classesToString(codes) {
        var s = '';
        let charTable = this.dataInfo["char_table"];

        let classToChar = {};
        for (let char in charTable) {
            if(charTable.hasOwnProperty(char)) {
                let cls = charTable[char];
                classToChar[cls] = char;
            }
        }

        codes.forEach(value => {
            s += classToChar[value];
        });
        return s;
    }

    removeBlanks(seq) {
        let count = 0;
        
        let charTable = this.dataInfo.char_table;
        for(var prop in charTable) {
            if(charTable.hasOwnProperty(prop))
                ++count;
        }

        count = count + 2 + 1;

        if (count !== 99) {
            throw "Holy crap! " + count;
        }
        return seq.filter((value) => value !== count);
    }

    decode(logits) {
        return this.classesToString(this.removeBlanks(this.removeRepeatitions(logits)));
    }
}

class Signal {
    constructor(values) {
        this.values = values;
    }

    evaluateAt(x) {
        let index = Math.floor(x);
        return this.values[index];
    }

    slope(x) {
        if (Math.floor(x) <= 0) {
            return this.slope(0.5);
        } else if (Math.floor(x) >= this.values.length - 1) {
            return this.slope(this.values.length - 1.5)
        }
        
        let y = this.evaluateAt(x + 1);
        let y0 = this.evalueAt(x);

        return Math.tan(y - y0);
    }

    interpolate(x) {
        let slope = this.slope(x);

        let dx = x - Math.floor(x);
        return this.evaluateAt(x) + slope * dx;
    }

    support() {
        let indices = [];
        this.values.forEach((v, index) => {
            if (v > 0) {
                indices.push(index);
            }
        });

        return indices;
    }
}

export {
    Recognizer,
    Preprocessor
}
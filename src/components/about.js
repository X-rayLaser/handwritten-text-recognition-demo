import React from 'react';

export default function About(props) {
    return (
        <article>
            <section>
                <p>This is a demo for the On-line Handwritten Text 
                    Recognition (HTR) system.
                </p>
                <p>All recognition related computations are performed in the 
                    browser, thanks to 
                    <a href="https://www.tensorflow.org/js"> TensorFlow.js.</a>
                </p>
            </section>
            <section>
                <header>
                    <h4>How does it work</h4>
                </header>
                <p>The app contains a canvas element where a user can draw/write 
                    some text. When they write something, their handwriting gets 
                    represented as an array of data points containing among 
                    other things x and y coordinates of each point. These 
                    coordinates are then transformed, normalized and fed into a 
                    neural net producing a list of probability distributions 
                    over character classes. The latter then is interpreted using 
                    some decoding algorithm to get the actual 
                    transcription text.
                </p>
            </section>
            <section>
                <header>
                    <h4>Supported languages</h4>
                </header>
                <p>The system can recognize only English handwritings</p>
            </section>
            <section>
                <header>
                    <h4>Neural net architecture</h4>
                </header>
                <p>The app uses a bidirectional LSTM with 1 hidden layer 
                    comprising 100 units and a soft-max layer containing 
                    100 output units (one for each label in the alphabet 
                    plus additional blank).
                </p>
            </section>
            <section>
                <header>
                    <h4>Dataset</h4>
                </header>
                <p>The IAM On-Line Handwriting Database (IAM-OnDB) dataset 
                    was used to train the model.
                </p>
                <p>
                    <a href="http://www.fki.inf.unibe.ch/databases/iam-on-line-handwriting-database/iam-on-line-handwriting-database">
                        A link to the dataset
                    </a>
                </p>
            </section>
            <section>
                <header>
                    <h4>Training</h4>
                </header>
                <p>The neural net was trained using Connectionist Temporal 
                    Classification (CTC) objective function with the Adam 
                    optimizer with a learning rate of 0.001 and a mini-batch 
                    size of 1 example. Early stopping was used to achieve a 
                    little regularization effect. The training was performed 
                    on raw data without any preprocessing except for data 
                    normalization.
                </p>
            </section>
            <section>
                <header>
                    <h4>CTC decoding</h4>
                </header>
                <p>2 algorithms are presented in the demo: best path decoding 
                    and token passing. For the token passing algorithm, 
                    there are 5 different (English) language models to choose 
                    from. Each model consists of a dictionary and a table of 
                    transition probabilities.
                </p>
                <p>The models were built with the help of Brown University 
                    Standard Corpus of Present-Day American English 
                    (Brown Corpus).
                </p>
            </section>
            <section>
                <p>
                    <a href="https://github.com/X-rayLaser/keras-auto-hwr">
                        A link to the Github repository used to help build the app
                    </a>
                </p>
            </section>
        </article>
    );
}
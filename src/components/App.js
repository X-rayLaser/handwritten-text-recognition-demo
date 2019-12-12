import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import Container from 'react-bootstrap/Container';
import PageHeader from './header';
import RecognitionWidget from './recognition_widget';


function PageFooter(props) {
  return <footer></footer>
}


function App() {
  return (
    <Container>
      <PageHeader />
      <RecognitionWidget />
      <p>
        To get a higher accuracy, try to draw a text just like you would with a pencil.
      </p>
      <p>By default, Token Passing algorithm is used for decoding, with 
          dictionary containing 1000 words. You can change the size of the 
          dictionary or switch to Best Path decoding algorithm.
        </p>
        <p>Note that with Token Passing algorithm only words that are in the 
          dictionary will be recognized.
          Also, the running time of Token Passing decoding algorithm is proportional
          to the square of dictionary size.
        </p>
      <PageFooter />
    </Container>
  );
}

export default App;

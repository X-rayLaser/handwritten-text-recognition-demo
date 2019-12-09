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
      <PageFooter />
    </Container>
  );
}

export default App;

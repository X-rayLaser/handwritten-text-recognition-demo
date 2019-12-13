import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import Container from 'react-bootstrap/Container';
import PageHeader from './header';
import RecognitionWidget from './recognition_widget';
import About from './about';
import { Route, Switch } from 'react-router-dom';

function PageFooter(props) {
  return <footer></footer>
}


function App() {
  return (
    <Container>
      <PageHeader />
      <Switch>
        <Route exact path='/' component={RecognitionWidget}/>
        <Route exact path='/app' component={RecognitionWidget}/>
        <Route exact path='/about' component={About}/>
      </Switch>
      <PageFooter />
    </Container>
  );
}

export default App;

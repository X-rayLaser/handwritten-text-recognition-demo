import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import Container from 'react-bootstrap/Container';
import PageHeader from './header';
import Jumbotron from 'react-bootstrap/Jumbotron';
import RecognitionWidget from './recognition_widget';
import About from './about';
import { Route, Switch } from 'react-router-dom';


function PageFooter(props) {
  return <footer></footer>
}


function HeroUnit(props) {
  return (
    <Jumbotron>
      <h1>This is a prototype for a hand-writing text recognition app</h1>
      <p>
        Give it try by drawing a text on a canvas below!
        To get a higher accuracy, try to draw a text just like 
        you would with a pencil.
      </p>
    </Jumbotron>
  );
}


function HomePage(props) {
  return (
    <div>
      <HeroUnit />
      <RecognitionWidget />
    </div>
    );
}


function App() {
  return (
    <Container>
      <PageHeader />
      <Switch>
        <Route exact path='/' component={HomePage}/>
        <Route exact path='/app' component={HomePage}/>
        <Route exact path='/about' component={About}/>
      </Switch>
      <PageFooter />
    </Container>
  );
}

export default App;

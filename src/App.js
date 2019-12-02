import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ProgressBar from 'react-bootstrap/ProgressBar';
import ListGroup from 'react-bootstrap/ListGroup';
import Container from 'react-bootstrap/Container';
import * as tf from '@tensorflow/tfjs';
import Canvas from './canvas';
import { Recognizer, Preprocessor } from './recognition';

function HeroUnit(props) {
  return (
    <Jumbotron>
      <h1>Hello, world!</h1>
      <p>
        This is a simple hero unit, a simple jumbotron-style component for calling
        extra attention to featured content or information.
      </p>
    </Jumbotron>
  );
}


function PageHeader(props) {
  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand href="#home">Navbar</Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link href="#home">Home</Nav.Link>
          <Nav.Link href="#features">Features</Nav.Link>
          <Nav.Link href="#pricing">Pricing</Nav.Link>
        </Nav>
      </Navbar>
      <br />
      <HeroUnit />
    </div>
  );
}


function PageFooter(props) {
  return <footer></footer>
}


function MySwitch(props) {
  return (
    <Form>
      <Form.Check 
        type="switch"
        id="custom-switch"
        label={props.label}
        checked={props.checked}
        onChange={(e) => {props.onChange(e)}}
      />
    </Form>
  );
}


class RecognitionWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      on_line: true,
      complete: true,
      best_match: "",
      top_results: [],
      scale: 100
    };

    this.ratio = 10;

    this.handleUpdated = this.handleUpdated.bind(this);

    this.dataInfo = {
      char_table: {}
    };

    // code to get json file with char table, mu and std parameters
    // use them to preprocess points and decode prediction
    fetch('http://localhost:3000/blstm/data_info.json').then(response => {
      console.log("fetch");
      response.json().then(res => {
        console.log("almost");
        console.log(res);
        this.dataInfo = res;
      });
    });
  }

  handleChange() {
    this.setState((state, props) => ({
      on_line: !state.on_line
    }));
  }

  handleUpdated(points) {
    const model = tf.loadLayersModel('http://localhost:3000/blstm/model.json');
    console.log(model);

    const preprossor = new Preprocessor(this.dataInfo);

    let preprocessed = preprossor.preprocess(points, this.ratio, this.state.scale);

    model.then(m => {
      const recognizer = new Recognizer(m, this.dataInfo);
      let res = recognizer.predict(preprocessed);
      console.log(res);
    });

    return;
    this.setState({complete: false});
  
    let bestMatch = "Space - the final frontier";
    setTimeout(() => {
      this.setState({
        complete: true,
        best_match: bestMatch,
        top_results: [bestMatch, bestMatch, bestMatch]
      });
    }, 1000);
    return;
  }

  handleZoomIn() {
    this.setState((state, props) => ({
      scale: state.scale * 1.25
    }));
  }

  handleZoomOut() {
    this.setState((state, props) => ({
      scale: state.scale / 1.25
    }));
  }

  render() {
    let dataInput;
    let switchLabel;
    let visibleWidget;

    if (this.state.on_line === true) {
      dataInput = <Canvas onUpdated={this.handleUpdated} scale={this.state.scale} ratio={this.ratio} />;
      switchLabel = "On-line recognition";
    } else {
      dataInput = <h2 className="text-center">Under development</h2>;
      switchLabel = "Off-line recognition";
    }

    if (this.state.complete) {
      visibleWidget = <RecognitionComponent
                          best_match={this.state.best_match}
                          top_results={this.state.top_results} />;
    } else {
      visibleWidget = <MyProgressBar />;
    }

    return (
      <div>
        <MySwitch label={switchLabel} checked={this.state.on_line}
                  onChange={(e) => {this.handleChange()}} />

        {dataInput}

        <SettingsPanel />
        {visibleWidget}
        <Button onClick={e => this.handleZoomIn()}>Zoom in</Button>
        <Button onClick={e => this.handleZoomOut()}>Zoom out</Button>
      </div>
    );
  }
}


function TranscriptionText(props) {
  return (
    <section>
      <p style={{fontSize: 48}}>{props.transcription}</p>
    </section>
  );
}

function TopKList(props) {
  const listItems = props.transcriptions.map(t => <ListGroup.Item>{t}</ListGroup.Item>);
  return (
    <section className="text-center">
      <h2 className="text-center">Top transcriptions</h2>
      <ListGroup variant="flush">
        {listItems}
      </ListGroup>
    </section>
  );
}


function MyProgressBar(props) {
  return (
    <ProgressBar animated now={100} />
  );
}


class SettingsPanel extends React.Component {
  render() {
    return (
      <Accordion>
        <Card>
          <Card.Header>
            <Accordion.Toggle as={Button} variant="link" eventKey="0">
              Settings
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="0">
            <Card.Body>
              <Form>
                <Form.Group as={Row} controlId="decoding_select">
                  <Form.Label column sm={4}>Decoding algorithm</Form.Label>
                  <Col sm={8}>
                    <Form.Control as="select">
                      <option>Best path</option>
                      <option>Token passing</option>
                    </Form.Control>
                  </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="dictionary_select">
                  <Form.Label column sm={4}>Dictionary</Form.Label>
                  <Col sm={8}>
                    <Form.Control as="select">
                      <option>General</option>
                      <option>Science</option>
                    </Form.Control>
                  </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="formBasicEmail">
                  <Form.Label column sm={4}>Dictionary size</Form.Label>
                  <Col sm={8}>
                    <Form.Control type="range" min="100" max="10000" value="1000" step="100" />
                  </Col>
                </Form.Group>
              </Form>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    );
  }
}


function RecognitionComponent(props) {
  if (props.best_match) {
    return (
      <div>
        <TranscriptionText transcription={props.best_match}/>
        <TopKList transcriptions={props.top_results} />
      </div>
    );
  } else {
    return <div>Nothing to show yet</div>;
  }
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

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


class Painter {
  constructor(canvas) {
      this.canvas = canvas;
      this.points = [];
  }

  clear() {
      const ctx = this.canvas.getContext('2d');
      ctx.clearRect(0, 0, 1600, 300);
      ctx.beginPath();
      this.points = [];
  }

  addFirstPoint(p) {
      let [x0, y0, t0, eos0] = p;
      const ctx = this.canvas.getContext('2d');
      ctx.moveTo(x0, y0);
      this.points.push(p)
  }

  addPoint(p, newStroke) {
      let [x, y, t, eos] = p;
      const ctx = this.canvas.getContext('2d');

      if (newStroke) {
          if (this.points.length > 0) {
              this.points[this.points.length - 1][3] = 1;
          }
          ctx.moveTo(x, y);
      }

      ctx.lineTo(x, y);
      ctx.stroke();

      this.points.push(p);
  }

  getPoints() {
      return this.points.slice(0);
  }
}


class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.painter = null;
  }

  resizeCanvas() {
    const canvas = this.canvasRef.current;
    canvas.width = window.innerWidth;
  }

  getPoint(e, canvas) {
      let rect = canvas.getBoundingClientRect();
      let t = Date.now() / 1000;
      return [e.clientX - rect.x, e.clientY - rect.y, t, 0];
  }

  addListeners(painter) {
    let drawing = false;
    let first = true;

    const canvas = this.canvasRef.current;

    let self = this;

    function handleMouseDown(e) {
      drawing = true;
      let p = self.getPoint(e, canvas);
  
      if (first) {
          let newStroke = false;
          painter.addFirstPoint(p, false);
      } else {
          let newStroke = true;
          painter.addPoint(p, newStroke);
      }
  
      first = false;
    }

    function handleMouseMove(e) {
      if (drawing) {
        let p = self.getPoint(e, canvas);
        painter.addPoint(p);
      }
    }

    function handleMouseUp(e) {
      drawing = false;
      let points = self.painter.getPoints();
      self.props.onUpdated(points);
    }

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
  }
  
  handleClear() {
    this.painter.clear();
  }

  componentDidMount() {
    this.resizeCanvas();
    window.addEventListener('resize', (e) => this.resizeCanvas(), false);
    const canvas = this.canvasRef.current;
    this.painter = new Painter(canvas);
    this.addListeners(this.painter);
  }

  render() {
    return (
      <div>
        <canvas ref={this.canvasRef}></canvas>
        <Button onClick={e => this.handleClear()}>Clear</Button>
      </div>
    );
  }
}


function TranscriptionText(props) {
  return (
    <section>
      <p style={{fontSize: 36}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere
          erat a ante.
      </p>
    </section>
  );
}

function TopKList(props) {
  const listItems = props.transcriptions.map(t => <li>{t}</li>);
  return (
    <section className="text-center">
      <h2 className="text-center">Top transcriptions</h2>
      <ListGroup variant="flush">
        <ListGroup.Item>Cras justo odio</ListGroup.Item>
        <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
        <ListGroup.Item >Morbi leo risus</ListGroup.Item>
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
  return (
    <div>
      <TranscriptionText transcription=""/>
      <TopKList transcriptions={["fef"]} />
    </div>
  );
}


class RecognitionInterface extends React.Component {
  constructor(props) {
    super(props);
    this.state = {complete: true};
  }

  handleUpdated(points) {
    this.setState({complete: false});
  
    setTimeout(() => {
      this.setState({complete: true});
    }, 1000);
    return;
  }

  render() {  
    if (this.state.complete) {
      return (<div>
        <SettingsPanel />
        <Canvas onUpdated={points => this.handleUpdated(points)} />
        <Button>Recognize</Button>
        <RecognitionComponent />
      </div>);
    }
  
    return (
      <div>
        <SettingsPanel />
        <Canvas onUpdated={points => this.handleUpdated(points)} />
        <Button>Recognize</Button>
        <MyProgressBar />
      </div>
    );
  }
}


function App() {
  return (
    <Container>
      <PageHeader />
      <RecognitionInterface />
      <PageFooter />
    </Container>
  );
}

export default App;

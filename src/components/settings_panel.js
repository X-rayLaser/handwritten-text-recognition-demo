import React from 'react';
import Form from 'react-bootstrap/Form';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';


export default class SettingsPanel extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        decoder: 'Token passing'
      };

      this.handleAlgorithmChange = this.handleAlgorithmChange.bind(this);
    }

    handleAlgorithmChange(e) {
      let decoderName = e.target.value;
      this.setState({decoder: decoderName});
      this.props.onDecoderChange(decoderName);
    }
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
                      <Form.Control as="select" value={this.state.decoder} onChange={this.handleAlgorithmChange}>
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
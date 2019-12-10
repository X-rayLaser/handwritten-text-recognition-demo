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
        decoder: 'Token passing',
        dictSize: 1000
      };

      this.handleAlgorithmChange = this.handleAlgorithmChange.bind(this);
      this.handleDictSizeChange = this.handleDictSizeChange.bind(this);
    }

    handleAlgorithmChange(e) {
      let decoderName = e.target.value;
      this.setState({decoder: decoderName});
      this.props.onDecoderChange(decoderName);
    }

    handleDictSizeChange(e) {
      let size = parseInt(e.target.value);
      this.setState({dictSize: size});
      this.props.onDictSizeChange(size);
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
                    <Form.Label column sm={4}>Dictionary size</Form.Label>
                    <Col sm={8}>
                      <Form.Control as="select" value={this.state.dictSize} onChange={this.handleDictSizeChange}>
                        <option>1000</option>
                        <option>2000</option>
                        <option>3000</option>
                        <option>4000</option>
                      </Form.Control>
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
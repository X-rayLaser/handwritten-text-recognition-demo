import React from 'react';
import Form from 'react-bootstrap/Form';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { BEST_PATH_ALGORITHM, TOKEN_PASSING_ALGORITHM, 
  allowedDictionarySizes, isValidDecoderName,
  isValidDictionarySize } from '../util';


export default class SettingsPanel extends React.Component {
    constructor(props) {
      super(props);
      this.handleAlgorithmChange = this.handleAlgorithmChange.bind(this);
      this.handleDictSizeChange = this.handleDictSizeChange.bind(this);
    }

    handleAlgorithmChange(e) {
      let decoderName = e.target.value;
      if (isValidDecoderName(decoderName)) {
        this.props.onDecoderChange(decoderName);
      } else {
        console.error(`Invalid decoder name ${decoderName}`);
      }
    }

    handleDictSizeChange(e) {
      let size = parseInt(e.target.value);

      if (isValidDictionarySize(size)) {
        this.props.onDictSizeChange(size);
      } else {
        console.error(`Invalid dictionary size ${size}`);
      }
    }
    render() {
      let sizeOptions = allowedDictionarySizes.map(size => (<option>{size}</option>));

      return (
        <Accordion className='app-section'>
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
                      <Form.Control as="select" value={this.props.decodingAlgorithm} onChange={this.handleAlgorithmChange}>
                        <option>{BEST_PATH_ALGORITHM}</option>
                        <option>{TOKEN_PASSING_ALGORITHM}</option>
                      </Form.Control>
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row} controlId="dictionary_select">
                    <Form.Label column sm={4}>Dictionary size</Form.Label>
                    <Col sm={8}>
                      <Form.Control as="select" value={this.props.dictSize} onChange={this.handleDictSizeChange}>
                        {sizeOptions}
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
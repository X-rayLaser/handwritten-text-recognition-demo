import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
function TranscriptionText(props) {
    return (
      <Jumbotron>
        <Container>
          <p style={{fontSize: 76}} className="text-center">{props.transcription}</p>
        </Container>
      </Jumbotron> 
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
  
  
export default function TranscriptionPanel(props) {
    if (props.best_match) {
      return (
        <div>
          <TranscriptionText transcription={props.best_match}/>
        </div>
      );
    } else {
      return <div></div>;
    }
}

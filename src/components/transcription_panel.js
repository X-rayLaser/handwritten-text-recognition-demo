import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';


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
  
  
export default function TranscriptionPanel(props) {
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

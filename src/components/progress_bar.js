import React from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';


export default function MyProgressBar(props) {
    return (
      <ProgressBar animated now={100} />
    );
  }
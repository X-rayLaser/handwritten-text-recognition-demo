import React from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';


function HeroUnit(props) {
    return (
      <Jumbotron>
        <h1>This is a prototype for a hand-writing text recognition app</h1>
        <p>
          Give it try by drawing a text on a canvas below!
        </p>
      </Jumbotron>
    );
}
  
  
export default function PageHeader(props) {
    return (
      <div>
        <Navbar bg="dark" variant="dark">
          <Nav className="mr-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#about">About</Nav.Link>
          </Nav>
        </Navbar>
        <br />
        <HeroUnit />
      </div>
    );
}
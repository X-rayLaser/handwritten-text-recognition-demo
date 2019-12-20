import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';


export default function PageHeader(props) {
    return (
      <div>
        <Navbar bg="dark" variant="dark">
          <Nav className="mr-auto">
            <Nav.Link href="#/app/">Home</Nav.Link>
            <Nav.Link href="#/about/">About</Nav.Link>
          </Nav>
        </Navbar>
        <br />
      </div>
    );
}
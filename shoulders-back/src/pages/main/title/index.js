/** @format */

import React, { Component } from "react";
import Topic from "./topic";
import { Container, Row, Col } from "reactstrap";
import styled from "styled-components";
import { Link } from "react-router-dom";

const TitleDiv = styled.div`
  text-align: center;
  padding-bottom: 3em;
  &:hover {
    text-decoration: none;
  }
`;

const Header = styled.h1`
  font-size: 3em;
  color: #131313;
  margin-top: 1em;
  margin-bottom: 1em;
  font-weight: 700;
`;

const Description = styled.p`
  padding: 2em;
`;

const linkStyle = {
  color: "black",
  textDecoration: "none"
};

class Title extends Component {
  render() {
    return (
      <TitleDiv>
        <Header>
          Explore Side Projects{" "}
          <span role="img" aria-label="call me hand">
            🤙🏽
          </span>
        </Header>
        <Container>
          <Row>
            <Col lg="4" md="4" sm="12">
              <Link to="/software" style={linkStyle}>
                <Topic
                  heading="Software"
                  body="web development, mobile app development, desktop app development, and more!"
                />
              </Link>
            </Col>
            <Col lg="4" md="4" sm="12">
              <Link to="/infrastructure" style={linkStyle}>
                <Topic
                  heading="Infrastructure"
                  body="cloud computing, internet, telecommunications, and more!"
                />
              </Link>
            </Col>
            <Col lg="4" md="4" sm="12">
              <Link to="/hardware" style={linkStyle}>
                <Topic
                  heading="Hardware"
                  body="servers, mobile devices, network systems, computers, and more!"
                />
              </Link>
            </Col>
          </Row>
          <Description>
            This project is made to support other developers throughout the
            world come up with new and unique ways to change the world.
          </Description>
        </Container>
      </TitleDiv>
    );
  }
}
export default Title;

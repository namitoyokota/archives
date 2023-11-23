/** @format */

import React, { Component } from "react";
import Copyright from "./copyright";
import Social from "./social";
import styled from "styled-components";

const FooterDiv = styled.div`
  padding-top: 2em;
  padding-bottom: 1em;
  text-align: center;
  background-color: #343a40;
`;

class Footer extends Component {
  render() {
    return (
      <FooterDiv>
        <Social />
        <Copyright />
      </FooterDiv>
    );
  }
}
export default Footer;

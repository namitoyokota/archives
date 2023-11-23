import React, {Component} from 'react';
import styled from 'styled-components'

const CopyrightDiv = styled.div`
  margin-top: 1em;
  color: grey;
`;

class Copyright extends Component {
  render() {
    return (
      <CopyrightDiv>
        <p>&copy;  2019 Namito Yokota. All rights reserved. </p>
      </CopyrightDiv>
    );
  }
}
export default Copyright;
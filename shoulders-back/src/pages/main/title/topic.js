import React, {Component} from 'react';
import styled from 'styled-components'

const Topic = styled.div`
  background-color: white;
  box-shadow: 0 0 2px #595959;
  border-radius: 5px;
  padding: 1em;
  margin: 1em;
  transition: transform 0.3s;
  &:hover {
    transform: scale(1.05);
  }
`

const Heading = styled.h5`
  font-size: 1.2em;
  background-color: #feffc6;
  font-weight: bold;
`

const Body = styled.p`
  font-size: 1em;
  text-align: center;
`

class Title extends Component {
  render() {
    return (
      <Topic>
        <Heading>{this.props.heading}</Heading>
        <Body>{this.props.body}</Body>
      </Topic>
    );
  }
}
export default Title;
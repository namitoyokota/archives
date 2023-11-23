import React, {Component} from 'react';
import styled from 'styled-components'

const headerStyle = {
  textAlign: 'center',
  paddingBottom: '3em',
}

const Header = styled.h1 `
  font-size: 3em;
  color: #131313;
  margin-top: 1em;
  margin-bottom: 1em;
  font-weight: 700;
`

class Software extends Component {
  render() {
    return (
      <div style={headerStyle}>
        <Header>404 <span role="img" aria-label="call me hand">🤙🏽</span></Header>
        <p>Hola</p>
      </div>
    );
  }
}
export default Software;
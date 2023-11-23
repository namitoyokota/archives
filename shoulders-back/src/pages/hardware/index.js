import React, {Component} from 'react';
import styled from 'styled-components'
import FilterBar from '../../components/filterbar/index'
import Feed from '../../components/feed/index'

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

class Hardware extends Component {
  render() {
    return (
      <div style={headerStyle}>
        <Header>Hardware Projects <span role="img" aria-label="call me hand">🤙🏽</span></Header>
        <FilterBar />
        <Feed topic="hardware"/>
      </div>
    );
  }
}
export default Hardware;
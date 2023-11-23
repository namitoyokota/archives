import React, {Component} from 'react';
import { Container } from 'reactstrap'
import styled from 'styled-components'

const Card = styled.div`
  color: black;
  max-width: 500px;
  padding: 20px;
  background: white;
  box-shadow: 0 0 2px #595959;
  border-radius: 5px;
  margin: auto;
  margin-top: 2em;
  transition: transform 0.3s;
  &:hover {
    transform: scale(1.05);
  }
`

const CardHeader = styled.div`
  padding: 0.5em;
  
`

const Logo = styled.span`
  display: inline-block;
  width: 50%;
  padding: 5px;
  text-align: left;
`

const Ribbon = styled.span`
  display: inline-block;
  width: 50%;
  padding: 5px;
  text-align: right;
`

const CardContent = styled.div`
  text-align: left;
`

const Title = styled.h5`
  background-color: #feffc6;;
  font-size: 1.2em;
  text-align: center;
`

const Description = styled.div`
  font-size: 0.9em;
`

const Name = styled.div`
  padding: 10px;
  font-size: 0.8em;
  color: grey;
`

class Feed extends Component {
  render() {
    const Stars = []
    for (let i=0; i<this.props.difficulty; i++) {
      Stars.push(<img src="https://img.icons8.com/material-rounded/24/000000/star.png" />)
    }
    return (
      <Container>
        <Card>
          <CardHeader>
            {
              // change theses icons
            }
            { this.props.topic === 'Software' ? 
              <Logo>
                <img src="https://img.icons8.com/metro/24/000000/linux-client.png" />
              </Logo> : null
            }
            { this.props.topic === 'Infrastructure' ? 
              <Logo>
                <img src="https://img.icons8.com/material-rounded/24/000000/internet.png" />
              </Logo> : null
            }
            { this.props.topic === 'Hardware' ? 
              <Logo>
                <img src="https://img.icons8.com/ios-filled/24/000000/multiple-devices.png" />
              </Logo> : null
            }
            <Ribbon>{Stars}</Ribbon>
          </CardHeader>
          <CardContent>
            <Title> {this.props.subject} </Title>
            <Description> {this.props.description } </Description>
            <Name> by {this.props.name} </Name>
          </CardContent>
        </Card>
      </Container>
    );
  }
}
export default Feed;
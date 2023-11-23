import React, {Component} from 'react';
import styled from 'styled-components'
import { Container, Row, Col } from 'reactstrap'

const SocialDiv = styled.div`
  color: white;
`;

const SocialLink = styled.a`
  color: #c9c9c9;
  text-decoration: none;
  &:hover {
    color: white;
    text-decoration: none;
  }
`

class Social extends Component {
  render() {
    return (
      <SocialDiv>
        <Container>
          <Row>
            <Col lg={{ size: 2, offset: 1 }} md={{ size: 2, offset: 1 }}>
              <SocialLink href="https://github.com/namitoyokota/nameless-wonders" target="_blank">
                <img src="https://img.icons8.com/officexs/16/000000/angry-face-meme.png" />
                <p>GitHub</p>
              </SocialLink>
            </Col>
            <Col lg="2" md="2">
              <SocialLink href="https://twitter.com/namito_yokota" target="_blank">
                <img src="https://img.icons8.com/officexs/16/000000/twitter.png" />
                <p>Twitter</p>
              </SocialLink>
            </Col>
            <Col lg="2" md="2">
              <SocialLink href="https://github.com/namitoyokota/nameless-wonders/issues" target="_blank">
                <img src="https://img.icons8.com/officexs/16/000000/share.png" />
                <p>Suggest</p>
              </SocialLink>
            </Col>
            <Col lg="2" md="2">
              <SocialLink href="https://github.com/namitoyokota/nameless-wonders" target="_blank">
                <img src="https://img.icons8.com/officexs/16/000000/filled-like.png" />
                <p>Sponsor</p>
              </SocialLink>
            </Col>
            <Col lg="2" md="2">
              <SocialLink href="mailto:nyokota@crimson.ua.edu">
                <img src="https://img.icons8.com/officexs/16/000000/comments.png" />
                <p>Contact</p>
              </SocialLink>
            </Col>
          </Row>
        </Container>
      </SocialDiv>
    );
  }
}
export default Social;
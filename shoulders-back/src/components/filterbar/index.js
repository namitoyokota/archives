import React, {Component} from 'react';
import styled from 'styled-components'
import { Container, Row, Col } from 'reactstrap'
import { Button, Input } from 'reactstrap';

const ContainerDiv = styled.div`
  max-width: 500px;
  padding-right: 1em;
  margin: auto;
`

class FilterBar extends Component {
  render() {
    return (
      <Container>
        <ContainerDiv>
          <Row>
            <Col>
              <Input type="select" name="select" id="exampleSelect">
                <option>Sort By</option>
                <option>Difficulty Increasing</option>
                <option>Difficulty Decreasing</option>
              </Input>
            </Col>
            <Col>
              <Input type="search" name="search" placeholder="Search" />
            </Col>
            <Button color="info">Filter</Button>
          </Row>
        </ContainerDiv>
      </Container>
    );
  }
}
export default FilterBar;
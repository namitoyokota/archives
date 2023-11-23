import React, { Component } from 'react';
import styled from 'styled-components'
import { Navbar, NavbarBrand, Nav, NavItem } from 'reactstrap';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Link } from 'react-router-dom'

const HeaderDiv = styled.div `
  padding: 3% 10% 3% 10%;
`
const LinkA = styled.a`
  &:hover {
    text-decoration: none
  }
`

const Logo = styled.div `
  background: #101010;
  color: white;
  padding: 2px 10px;
  font-weight: 500;
  transition: transform 0.3s;
  &:hover {
    transform: scale(1.05);
  }
`

class Header extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false
    };
  }

  toggle() {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  }

  render() {
    return (
      <HeaderDiv>
        <Navbar color="faded" light expand="sm">
          <NavbarBrand>
            <LinkA href="/">
              <Logo>projects-finder</Logo>
            </LinkA>
          </NavbarBrand>
          <Nav className="ml-auto" navbar>
            <NavItem>
              <Dropdown direction="left" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                <DropdownToggle color="link">
                  <img src="https://img.icons8.com/ios-glyphs/30/000000/user--v1.png" />
                </DropdownToggle>
                <DropdownMenu>
                  <Link to="/account"  style={{ textDecoration: 'none' }}>
                    <DropdownItem>Account</DropdownItem>
                  </Link>
                  <DropdownItem divider />
                  <a href="https://github.com/namitoyokota/nameless-wonders" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <DropdownItem>GitHub</DropdownItem>
                  </a>
                  <a href="https://twitter.com/namitoyokota" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <DropdownItem>Twitter</DropdownItem>
                  </a>
                </DropdownMenu>
              </Dropdown>
            </NavItem>
          </Nav>
        </Navbar>
      </HeaderDiv>
    );
  }
}

export default Header;
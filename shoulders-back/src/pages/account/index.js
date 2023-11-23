import React, { Component } from 'react';
import firebase, {auth, provider} from '../../firebase.js';
import Card from '../../components/feed/card'
import Submit from './submit'
import { Container, Button, ButtonGroup } from 'reactstrap'
import styled from 'styled-components'

const AccountDiv = styled.div`
  padding: 2em;
`

const NavDiv = styled.div`
  text-align: center;
  margin: auto;
  padding-top: 2em;
  padding-bottom: 2em;
`

const ProfileDiv = styled.div`
  text-align: center;
`

const ProfileName = styled.h3`
`

const ProfileImg = styled.img`
width: 20%;
height: auto;
border-radius: 50%;
  margin: auto;
`

const MainDiv = styled.div`
`

const RemoveDiv = styled.div`
  padding: 1em;
  margin: 1em;
  text-align: center;
`

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      ideas: [],
      user: null
    }
    this.toggle = this.toggle.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }
  toggle() {
    this.setState({	
      modal: !this.state.modal	
    });
  }
  login() {
    auth.signInWithPopup(provider) 
      .then((result) => {
        const user = result.user;
        this.setState({
          user
        });
      });
  }
  logout() {
    auth.signOut()
      .then(() => {
        this.setState({
          user: null
        });
      });
  }
  removeIdea(ideaId) {
    const itemRef = firebase.database().ref(`/ideas/${ideaId}`);
    itemRef.remove();
  }
  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
        console.log(user)
      }
    });
    const ideasRef = firebase.database().ref('ideas');
    ideasRef.on('value', (snapshot) => {
      let ideas = snapshot.val();
      let newState = [];
      for (let idea in ideas) {
        newState.push({
          id: idea,
          name: ideas[idea].name,
          email: ideas[idea].email,
          subject: ideas[idea].subject,
          difficulty: ideas[idea].difficulty,
          topic: ideas[idea].topic,
          description: ideas[idea].description,
        });
      }
      this.setState({
        ideas: newState
      });
    });
  }
  render() {
    return (
      <AccountDiv>
      {this.state.user ? 
        <ProfileDiv>
          <ProfileName>{this.state.user.displayName}</ProfileName>
          <ProfileImg src={this.state.user.photoURL}/>
        </ProfileDiv>
        :
        null
      }
        <NavDiv>
          <Container>
            <ButtonGroup>
              {this.state.user ?
                <Button onClick={this.logout}>Log Out</Button>
                :
                <Button onClick={this.login}>Log In</Button>
              }
              {this.state.user ?
                <Submit />
                :
                null
              }
            </ButtonGroup>
          </Container>
        </NavDiv>
        <MainDiv>
          {this.state.user ?
            <div>
              {this.state.ideas.map((idea) => {
                return (
                  <div key={idea.id}>
                    {idea.email === this.state.user.email ?
                      <div className="float-center">
                        <Card id={idea.id} name={idea.name} email={this.email} topic={idea.topic} subject={idea.subject} difficulty={idea.difficulty} field={idea.field} language={idea.language} description={idea.description} />
                        <RemoveDiv>
                          <Button size="sm" outline="color" onClick={() => this.removeIdea(idea.id)}>Remove Idea</Button>
                        </RemoveDiv>
                      </div>
                      :
                      null
                    }
                  </div>
                )
              })}
            </div>
            :
            null
          }
        </MainDiv>
      </AccountDiv>
    );
  }
}

export default Account;
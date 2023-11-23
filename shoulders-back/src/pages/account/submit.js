import React, { Component } from 'react';
import firebase, {auth} from '../../firebase.js';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { Form, FormGroup, Input } from 'reactstrap'

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      name: '',
      email: '',
      subject: '',
      difficulty: '',
      topic: '',
      description: '',
      ideas: [],
      user: null
    }
    this.toggle = this.toggle.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  toggle() {
    this.setState({	
      modal: !this.state.modal	
    });
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }
  handleSubmit(e) {
    e.preventDefault();
    const ideasRef = firebase.database().ref('ideas');
    const idea = {
      name: this.state.name,
      email: this.state.email,
      subject: this.state.subject,
      difficulty: this.state.difficulty,
      topic: this.state.topic,
      description: this.state.description,
    }
    ideasRef.push(idea);
    this.setState({
      name: '',
      email: '',
      subject: '',
      difficulty: '',
      topic: '',
      description: '',
    });
    this.toggle()
  }
  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
        this.state.name = user.displayName;
        this.state.email = user.email;
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
      <div>
        <Button color="primary" onClick={this.toggle}>Submit</Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>Submit Side Project Idea</ModalHeader>
          <ModalBody>
            <Form onSubmit={this.handleSubmit}>
              <FormGroup>
                <Input type="select" name="difficulty" placeholder="Difficulty" onChange={this.handleChange} value={this.state.difficulty}>
                  <option>Difficulty</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Input type="select" name="topic" placeholder="Topic" onChange={this.handleChange} value={this.state.topic}>
                  <option>Topic</option>
                  <option>Hardware</option>
                  <option>Infrastructure</option>
                  <option>Software</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Input type="text" name="subject" placeholder="Subject" onChange={this.handleChange} value={this.state.subject} />
              </FormGroup>
              <FormGroup>
                <Input type="textarea" name="description" placeholder="Description" onChange={this.handleChange} value={this.state.description} />
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.handleSubmit}>Submit</Button>
            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default Account;
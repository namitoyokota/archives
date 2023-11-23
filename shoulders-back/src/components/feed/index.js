import React, {Component} from 'react';
import firebase from '../../firebase';
import Card from './card'
import { Container, Spinner } from 'reactstrap'

class Feed extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      name: '',
      email: '',
      subject: '',
      difficulty: '',
      topic: '',
      field: '',
      language: '',
      description: '',
      ideas: [],
    }
  }
  componentWillMount() {
    this.setState({
      loading: true
    })
  }
  componentDidMount() {
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
          field: ideas[idea].field,
          language: ideas[idea].language,
          description: ideas[idea].description,
        });
      }
      this.setState({
        ideas: newState,
        loading: false
      });
    });
  }
  render() {
    return (
      <Container>
        {this.state.loading ? 
          <Spinner style={{ width: '3rem', height: '3rem' , margin: '3em'}} />
          :
          null
        }
        {this.state.ideas.filter(idea => idea.topic.toLowerCase() === this.props.topic.toLowerCase()).map(idea =>{
          return (
            <Card id={idea.id} name={idea.name} email={idea.email} subject={idea.subject} difficulty={idea.difficulty} topic={idea.topic} field={idea.field} language={idea.language} description={idea.description} />
          )
        })}
      </Container>
    );
  }
}
export default Feed;
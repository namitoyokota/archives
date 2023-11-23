/** @format */

import React, { Component } from "react";
import InstaGrid from "./Instagrid";

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      username: ""
    };
  }
  componentDidMount() {
    const {
      match: { params }
    } = this.props;
    this.setState({
      username: params.username,
      isLoaded: true
    });
  }
  render() {
    return (
      <div>
        {this.state.isLoaded ? (
          <InstaGrid
            account={this.state.username}
            numberOfMediaElements={10}
            discardVideos={true}
          />
        ) : (
          <div></div>
        )}
      </div>
    );
  }
}

export default Main;

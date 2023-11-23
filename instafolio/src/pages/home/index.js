/** @format */

import React, { Component } from "react";
import { Button, Form, FormGroup } from "reactstrap";
import { InputGroupAddon } from "reactstrap";

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = { value: "" };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.history.push(this.state.value);
  }
  render() {
    return (
      <container className="page-wrap">
        <div className="page-wrap">
          <Form onSubmit={this.handleSubmit}>
            <h1 className="title">Instafolio</h1>
            <div className="content">
              <h4 className="heading">Purpose</h4>
              <p>
                The purpose of this project is to provide photographers an
                auto-generated web portoflio that can be used to showcase your
                work on Instagram in a more professional way.
              </p>
              <h4 className="heading">Usage</h4>
              <FormGroup>
                <div class="input-group mb-3">
                  <div class="input-group-prepend">
                    <span class="input-group-text" id="basic-addon1">
                      @
                    </span>
                  </div>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Username"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    value={this.state.value}
                    onChange={this.handleChange}
                  />
                  <InputGroupAddon addonType="append">
                    <Button color="info">Submit</Button>
                  </InputGroupAddon>
                </div>
              </FormGroup>
              <h4 className="heading">Contributing</h4>
              <p>
                Instafolio is an open-source project made with React licensed
                under{" "}
                <a
                  href="https://github.com/namitoyokota/instafolio/blob/master/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  MIT
                </a>
                ! To contribute, open pull request with improvements or discuss
                ideas in issues on the GitHub repository{" "}
                <a
                  href="https://github.com/namitoyokota/instafolio"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  here
                </a>
                .
              </p>
              <h4 className="heading">Upcoming</h4>
              <p>
                <ul>
                  <li>Improve portfolio page</li>
                  <li>Provide optional layouts and designs</li>
                </ul>
              </p>
            </div>
            <hr />
            <p className="footer">&copy; Namito Yokota</p>
          </Form>
        </div>
      </container>
    );
  }
}

export default Main;

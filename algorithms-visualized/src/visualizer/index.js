/** @format */

import React from "react";
import { getMergeSortAnimations } from "../merge";
import { getBubbleSortAnimations } from "../bubble";
import "./index.scss";

const PRIMARY_COLOR = "#313131";
const SECONDARY_COLOR = "#bfbfbf";
const MINIMUM = 5;

export default class Visualizer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      array: [],
      width: 0,
      height: 0,
      speed: 15,
    };
    this.handleChange = this.handleChange.bind(this);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  handleChange(event) {
    this.setState({ speed: event.target.value });
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
    this.resetArray(window.innerWidth / 25, window.innerHeight / 2);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  resetArray(NUMBER_OF_BARS, MAXIMUM) {
    const array = [];
    for (let i = 0; i < NUMBER_OF_BARS; i++)
      array.push(Math.floor(Math.random() * (MAXIMUM - MINIMUM + 1) + MINIMUM));
    this.setState({ array });
  }

  mergeSort() {
    const animations = getMergeSortAnimations(this.state.array);
    for (let i = 0; i < animations.length; i++) {
      const arrayBars = document.getElementsByClassName("bar");
      const isColorChange = i % 3 !== 2;
      if (isColorChange) {
        const [barOneIdx, barTwoIdx] = animations[i];
        const barOneStyle = arrayBars[barOneIdx].style;
        const barTwoStyle = arrayBars[barTwoIdx].style;
        const color = i % 3 === 0 ? SECONDARY_COLOR : PRIMARY_COLOR;
        setTimeout(() => {
          barOneStyle.backgroundColor = color;
          barTwoStyle.backgroundColor = color;
        }, i * (50 / this.state.speed));
      } else {
        setTimeout(() => {
          const [barOneIdx, newHeight] = animations[i];
          const barOneStyle = arrayBars[barOneIdx].style;
          barOneStyle.height = `${newHeight}px`;
        }, i * (50 / this.state.speed));
      }
    }
  }

  bubbleSort() {
    const animations = getBubbleSortAnimations(this.state.array);
    for (let i = 0; i < animations.length; i++) {
      const isColorChange = i % 4 === 0 || i % 4 === 1;
      const arrayBars = document.getElementsByClassName("bar");
      if (isColorChange === true) {
        const [barOneIdx, barTwoIdx] = animations[i];
        const barOneStyle = arrayBars[barOneIdx].style;
        const barTwoStyle = arrayBars[barTwoIdx].style;
        const color = i % 4 === 0 ? SECONDARY_COLOR : PRIMARY_COLOR;
        setTimeout(() => {
          barOneStyle.backgroundColor = color;
          barTwoStyle.backgroundColor = color;
        }, i * (50 / this.state.speed));
      } else {
        const [barIndex, newHeight] = animations[i];
        if (barIndex === -1) continue;
        const barStyle = arrayBars[barIndex].style;
        setTimeout(() => {
          barStyle.height = `${newHeight}px`;
        }, i * (50 / this.state.speed));
      }
    }
  }

  render() {
    const { array } = this.state;
    const width = this.state.width;
    const height = this.state.height;

    return (
      <div className="main">
        <div className="visualizer">
          {array.map((value, idx) => (
            <div
              className="bar"
              key={idx}
              style={{
                backgroundColor: "#313131",
                height: `${value}px`,
              }}
            ></div>
          ))}
        </div>
        <div class="values">
          <div class="row col-lg-12">
            <div class="input-group input-group-sm">
              <input
                type="text"
                class="form-control"
                value={this.state.value}
                onChange={this.handleChange}
                placeholder="Speed (default: 15)"
              />
            </div>
          </div>
        </div>
        <div className="controls">
          <div
            class="btn-group btn-group-sm"
            role="group"
            aria-label="Basic example"
          >
            <button className="btn btn-info" onClick={() => this.mergeSort()}>
              Merge Sort
            </button>
            <button className="btn btn-info" onClick={() => this.bubbleSort()}>
              Bubble Sort
            </button>
          </div>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => this.resetArray(width / 25, height / 2)}
          >
            Reset
          </button>
        </div>
      </div>
    );
  }
}

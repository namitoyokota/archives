/** @format */

import React from "react";
import Visualizer from "./visualizer";
import "./App.scss";

function App() {
  return (
    <div className="app">
      <div className="heading">
        <h1 className="title">Algorithms Visualized</h1>
        <p>
          visualization and comparison of sorting algorithms:{" "}
          <a
            href="https://github.com/namitoyokota/algorithms-visualized"
            target="_blank"
            rel="noopener noreferrer"
          >
            view source
          </a>
        </p>
      </div>
      <Visualizer />
    </div>
  );
}

export default App;

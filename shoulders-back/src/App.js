/** @format */

import React from "react";
import Header from "./components/header/index";
import Main from "./pages/main/index";
import Software from "./pages/software/index";
import Infrastructure from "./pages/infrastructure/index";
import Hardware from "./pages/hardware/index";
import Account from "./pages/account/index";
import NoMatch from "./pages/404/index";
import Footer from "./components/footer/index";
import styled from "styled-components";
import { HashRouter, Route, Switch } from "react-router-dom";

const AppDiv = styled.div`
  font-family: BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
    "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
`;

function App() {
  return (
    <AppDiv>
      <HashRouter>
        <Header />
        <Switch>
          <Route exact path="/" component={Main} />
          <Route path="/software" component={Software} />
          <Route path="/infrastructure" component={Infrastructure} />
          <Route path="/hardware" component={Hardware} />
          <Route path="/account" component={Account} />
          <Route component={NoMatch} />
        </Switch>
        <Footer />
      </HashRouter>
    </AppDiv>
  );
}

export default App;

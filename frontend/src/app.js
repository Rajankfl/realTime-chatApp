import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import Login from "./login";
import Register from "./signup";
import Error from "./error";
import Chat from "./chatPage";
import MoboChat from "./MoboMessage";
import Logout from "./components/logout";
function App() {
  return (
    <>
      <BrowserRouter>
        <Switch>
          <Route exact path="/signup" component={Register} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/chat" component={Chat} />
          <Route exact path="/" component={Login} />
          <Route exact path="/mobochat/:name/:myId/:id" component={MoboChat} />
          <Route exact path="/logout" component={Logout} />
          <Route component={Error} />
        </Switch>
      </BrowserRouter>
    </>
  );
}
export default App;

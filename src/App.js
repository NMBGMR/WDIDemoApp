import React from 'react';
import logo from './logo.svg';
import './App.css';
import About from './About.js'
import {BrowserRouter, Link, Switch, Route} from "react-router-dom";
import WDI from './WDI.js'
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import AppBar from "@material-ui/core/AppBar";

function App() {
  return (<div>
            <div>
              <h1 align='center'>New Mexico Water Data Demo App</h1>
            </div>

            <BrowserRouter>
            <div>
              <AppBar position="static" color="default">
                <Tabs
                    // value={this.state.value}
                    // onChange={this.handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    fullWidth
                >
                  <Tab label="Map" component={Link} to="/" />
                  <Tab label="About" component={Link} to="/about" />
                  <Tab label="NM Water Data" component={Link} to="/nmwaterdata" />
                </Tabs>
              </AppBar>

              <Switch>
                <Route path="/about">
                  <About />
                </Route>
                <Route path="/nmwaterdata">
                  <div>
                    <a href={'https://newmexicowaterdata.org'}>fooasd</a>
                  </div>
                </Route>
                <Route path="/">
                  <WDI />
                </Route>
              </Switch>
            </div>
          </BrowserRouter>
      </div>
  );
}

export default App;

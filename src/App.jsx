import React, { Component } from 'react';
import {HashRouter, Route } from 'react-router-dom'
import Private from './components/private/private'
import Login from './components/login/login'

class App extends Component {
  render() {
    return (
      <HashRouter>
      <div className="App">
      <Route exact path = '/' component={Login}/>
      <Route path='/private' component={Private}/>
        
      </div>
      </HashRouter>
    );
  }
}

export default App;

import React, { useContext, useEffect, useState } from 'react';
import { AuthProvider, AuthContext } from './context/AuthProvider.jsx';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import Feeds from './Components/Feeds.jsx';
import Login from './Components/Login.jsx';
import Signup from './Components/Signup.jsx';
import Profile from './Components/Profile.jsx';

function App() {
  
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <PrivateRoute path="/profile" component={Profile} />
            <PrivateRoute path="/" component={Feeds} />
          </Switch>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

const PrivateRoute = ({ component: Component, ...props }) => {
  const { currentUser } = useContext(AuthContext);
  
  return <Route props={props} render={(props) => {
    return currentUser == null ?
      <Redirect to="/login" /> :
      <Component props={props} />
  }} />;

}

export default App;
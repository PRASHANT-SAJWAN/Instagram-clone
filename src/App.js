import { AuthProvider, AuthContext } from './context/AuthProvider.jsx';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import Feeds from './Components/Feeds.jsx';
import Header from './Components/Header.jsx';
import Login from './Components/Login.jsx';
import Signup from './Components/Signup.jsx';
import Profile from './Components/Profile.jsx';
import { useContext } from 'react';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <PrivateRoute path="/" component={Feeds} />
            <PrivateRoute path="/profile" component={Profile} />
          </Switch>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

const PrivateRoute = ({ component: Component, ...props }) => {
  /// todo :: put it back for private Routing
  const { currentUser } = useContext(AuthContext);
  // const currentUser = true;
  return <Route props={props} render={(props) => {
    return currentUser == null ?
      <Redirect to="/login" /> :
      <Component props={props} />
  }} />;

}

export default App;
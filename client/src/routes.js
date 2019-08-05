import React from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './sessionRouting';
import Layout from './components/Layout';

export const routePaths = {
  home: '/',
  login: '/login',
  app: '/app'
};

export default (
  <Router>
    <Switch>
      <Redirect exact from={routePaths.home} to={routePaths.app} />
      {/*<PublicRoute path={routesPaths.login} component={Login} />*/}
      <ProtectedRoute component={Layout} />
    </Switch>
  </Router>
);

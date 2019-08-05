import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { routePaths } from '../../routes';
import Header from './Header';
import Dummy from '../scenes/Dummy';

class Layout extends Component {
  render() {
    return (
      <div>
        <Header />
        <Route path={routePaths.app} component={Dummy} />
      </div>
    );
  }
}

Layout.propTypes = {
};

Layout.defaultProps = {
};

export default Layout;

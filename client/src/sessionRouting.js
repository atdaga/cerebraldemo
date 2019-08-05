import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { isAuthenticated } from './session';

export function ProtectedRoute({ component: Component, authed, ...rest }) { // eslint-disable-line react/prop-types
  const isAuthed = authed || isAuthenticated();

  return (
    <Route
      {...rest}
      render={props => (isAuthed === true) // eslint-disable-line no-confusing-arrow
        ? <Component {...props} />
        : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />} // eslint-disable-line react/prop-types
    />
  );
}

export function PublicRoute({ component: Component, authed, ...rest }) { // eslint-disable-line react/prop-types
  const isAuthed = authed || isAuthenticated();

  return (
    <Route
      {...rest}
      render={props => (isAuthed === false) // eslint-disable-line no-confusing-arrow
        ? <Component {...props} />
        : <Redirect to={{ pathname: '/', state: { from: props.location } }} />} // eslint-disable-line react/prop-types
    />
  );
}

import React, { Component } from 'react';
import logo from '../../../logo.png';
import './styles.css';
import {Button} from 'react-bootstrap';
import messaging from '../../../messaging';
import * as log from 'loglevel';

class Header extends Component {
  constructor(props) {
    super(props);

    this.handleSummonDoctor = this.handleSummonDoctor.bind(this);
  }

  handleSummonDoctor(evt) {
      evt.preventDefault();

      const ws = '​wss://echo.websocket.org'; // Hard-coded for now.
      try {
          // const messagingSvc = messaging(ws);
          const messagingSvc = new WebSocket(ws);
          log.info(`messagingSvc=${messagingSvc}`);
      } catch(err) {
          log.error(`Failed to connect to ${ws}`);
      }
  }

  render() {
    return (
      <div>
          Cerebral
          <Button onClick={(evt) => this.handleSummonDoctor(evt)}>
              Summon Doctor
          </Button>
      </div>
    );
  }
}

Header.propTypes = {
};

Header.defaultProps = {
};

export default Header;


import IO from 'socket.io-client';
import SocketIOWildcard from 'socketio-wildcard';
import * as log from 'loglevel';

class Messaging {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.eventListeners = new Set();
    this.onlineOfflineListeners = new Set();
    this.unauthorizedListeners = new Set();
    this.connectionListenersInitialized = false;
  }

  addEventListener(listener) {
    this.eventListeners.add(listener);
  }

  removeEventListener(listener) {
    this.eventListeners.delete(listener);
  }

  addOnlineOfflineListener(listener) {
    this.onlineOfflineListeners.add(listener);
  }

  removeOnlineOfflineListener(listener) {
    this.onlineOfflineListeners.delete(listener);
  }

  /**
   * Redirect user to login page perhaps?
   *
   * @param listener
   */
  addUnauthorizedListener(listener) {
    this.unauthorizedListeners.add(listener);
  }

  removeUnauthorizedListener(listener) {
    this.unauthorizedListeners.delete(listener);
  }


  _initializeConnectionListeners() {
    if (!this.connectionListenersInitialized) {
      this.socket.on('unauthorized', (error) => {
        log.warn(`Messaging unauthorized.  ${JSON.stringify(error)}`);

        if ((error.data.type === 'UnauthorizedError') || (error.data.code === 'invalid_token')) {
          log.warn("User's token has expired");
          this._notifyUnauthorizedListeners();
        }
      });

      this.socket.on('reconnect_failed', (a) => {
        log.trace(`\n\t\t\tMessaging reconnect_failed: a=${a}  [${new Date()}]`);
      });
      this.socket.on('reconnect', (attemptNumber) => {
        log.trace(`\n\t\t\tMessaging reconnect: attemptNumber=${attemptNumber}  [${new Date()}]`);
      });
      this.socket.on('connect_error', (err) => {
        log.trace(`\n\t\t\tMessaging connect_error: ${JSON.stringify(err)}  [${new Date()}]`);
        this._notifyOnlineOfflineListener(false);
      });
      this.socket.on('reconnect_error', (err) => {
        log.trace(`\n\t\t\tMessaging reconnect_error: ${JSON.stringify(err)}  [${new Date()}]`);
      });
      this.socket.on('connect_timeout', () => {
        log.trace(`\n\t\t\tMessaging connect_timeout: [${new Date()}]`);
      });
      this.socket.on('error', (err) => {
        log.trace(`\n\t\t\tMessaging error: ${JSON.stringify(err)}  [${new Date()}]`);
      });
      this.socket.on('ping', () => {
        log.trace(`\n\t\t\tMessaging ping  [${new Date()}]`);
      });
      this.socket.on('pong', (ms) => {
        log.trace(`\n\t\t\tMessaging pong (${ms}ms)  [${new Date()}]`);
      });

      this.socket.on('*', (payload) => {
        const eventType = payload.data[0];
        const event = payload.data[1];

        if (eventType !== 'authenticated') {
          log.trace(`\n\t\t\tMessaging received eventType=${eventType}  event=${JSON.stringify(event)}  [${new Date()}]`);
          this._notifyEventListeners(eventType, event);
        }
      });

      this.connectionListenersInitialized = true;
    }
  }

  _notifyEventListeners(eventType, event) {
    let accepted = false;
    this.eventListeners.forEach((listener) => {
      accepted = listener(eventType, event) || accepted;
    });
    if (!accepted) {
      log.warn(`Unprocessed messaging eventType=${eventType}`);
    }
  }

  _notifyOnlineOfflineListener(online) {
    this.onlineOfflineListeners.forEach(listener => listener(online));
  }

  _notifyUnauthorizedListeners() {
    this.unauthorizedListeners.forEach(listener => listener());
  }

  connect(jwt) {
    this.close(); // If connection exists, close it.

    return new Promise((resolve) => {
      this.socket = new IO(this.url);
      const wildcardPatch = new SocketIOWildcard(IO.Manager);
      wildcardPatch(this.socket);

      this.socket.on('connect', () => {
        log.trace(`\n\t\t\tMessaging connected.  [${new Date()}]`);
        this.socket.emit('authenticate', { token: jwt });

        if (!this.connectionListenersInitialized) {
          this.socket.on('authenticated', () => {
            log.trace(`\n\t\t\tMessaging authenticated.  [${new Date()}]`);
            this._notifyOnlineOfflineListener(true);
            resolve();
          });
        }

        this._initializeConnectionListeners();
      });
    });
  }


  close() {
    if (this.socket) {
      this._notifyOnlineOfflineListener(false);
      this.socket.close();
      this.socket = undefined;
      this.connectionListenersInitialized = false;
    }
  }
}


let messagingInstance;

export default function messaging(websocketUrl = undefined) {
  if ((messagingInstance === undefined) && (websocketUrl)) {
    let url = websocketUrl;
    const urlToks = websocketUrl.split(':');
    if (urlToks.length <= 2) {
      if (websocketUrl.toLowerCase().startsWith('https:')) {
        url += ':443';
      } else {
        url += ':80';
      }
    }
    messagingInstance = new Messaging(url);
  }
  return messagingInstance;
}


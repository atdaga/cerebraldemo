import { applyMiddleware, compose, createStore } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import thunk from 'redux-thunk';
import history from './history';
import rootReducer from './reducers';

const composeMiddleware = () => {
    const middleware = [
        applyMiddleware(thunk),
        applyMiddleware(routerMiddleware(history))
    ];

    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    return composeEnhancers(...middleware);
};

const initialState = {}; // TODO: Locally persisted.

const store = createStore(rootReducer, initialState, composeMiddleware());
export default store;

import axios from 'axios';

export const URLREQUEST_ERROR = 'urlrequest/error';

export const doRequest = ({ requestUrl, method, headers, data }, reduxState = {}) => {
    return (dispatch, getState) => {
        // Do the request.
        return axios({ method, url: requestUrl, headers, data })
            .catch((err) => {
                dispatch({
                    type: URLREQUEST_ERROR,
                    payload: err,
                    error: true,
                    errorMeta: { requestUrl, method, ...reduxState }
                });
                throw err;
            });
    };
};

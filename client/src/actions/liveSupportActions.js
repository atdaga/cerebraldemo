import _ from 'lodash';
import config from '../config';
import { doRequest } from './urlRequest';

export const LIVESUPPORT_SHOW = 'livesupport/show';
export const LIVESUPPORT_QUESTIONS_FETCH_SUCCESS = 'livesupport/questions/fetch/success';
export const LIVESUPPORT_CURRENTQUESTIONID_SET = 'livesupport/currentquestionid/set';
export const LIVESUPPORT_CONVERSATIONHISTORY_ADD = 'livesupport/conversationhistory/add';
export const LIVESUPPORT_ANSWERS_SUBMITTED = 'livesupport/answers/submitted';

export const setShowLiveSupport = (show) => {
  return {
    type: LIVESUPPORT_SHOW,
    payload: { show }
  };
};

export const fetchLiveSupportQuestions = () => {
  const requestUrl = `${config.apiBaseUri}/questionaire/questions`;
  return (dispatch) => {
    const thunk = dispatch(doRequest({ requestUrl, method: 'get', }));
    thunk.then((response) => {
      const { questions } = response.data;
      dispatch({
        type: LIVESUPPORT_QUESTIONS_FETCH_SUCCESS,
        payload: { questions }
      });
    });
  };
};

export const setCurrentQuestionId = (id) => {
  return {
    type: LIVESUPPORT_CURRENTQUESTIONID_SET,
    payload: { id }
  };
};

export const addConversationHistory = (from, text, questionId, question) => {
  return {
    type: LIVESUPPORT_CONVERSATIONHISTORY_ADD,
    payload: { from, text, questionId, question }
  };
};

export const submitAnswers = (conversationHistory) => {
    const answers = conversationHistory.reduce((prevVal, elem) => {
        if (elem.questionId) {
            const appended = _.cloneDeep(prevVal);
            appended.push({
                questionId: elem.questionId,
                question: elem.question,
                answer: elem.text
            });
            return appended;
        }
        return prevVal;
    }, []);

    console.log('\nAD: 1');
    console.log({ answers });
    const requestUrl = `${config.apiBaseUri}/questionaire/answers`;
    return (dispatch) => {
        const thunk = dispatch(doRequest({ requestUrl, method: 'post', data: { answers } }));
        thunk.then((response) => {
            return {
                type: LIVESUPPORT_ANSWERS_SUBMITTED,
                payload: { }
            };
        });
    };
};

import _ from 'lodash';
import {
    LIVESUPPORT_SHOW,
    LIVESUPPORT_QUESTIONS_FETCH_SUCCESS,
    LIVESUPPORT_CURRENTQUESTIONID_SET,
    LIVESUPPORT_CONVERSATIONHISTORY_ADD
} from '../actions';

const INITIAL_STATE = {
    show: false,
    questions: undefined,
    currentQuestionId: 0, // 0 means no questions have been asked.
    conversationHistory: []
};

const liveSupportReducer = (state = INITIAL_STATE, action) => {
  switch(action.type) {
    case LIVESUPPORT_SHOW: {
      return {
        ...state,
        show: action.payload.show
      };
    }

    case LIVESUPPORT_QUESTIONS_FETCH_SUCCESS: {
      // Flatten array for faster query.
      const questions = {};
      action.payload.questions.forEach((question) => {
        questions[question.id] = question;
      });
      return {
        ...state,
        questions
      };
    }

    case LIVESUPPORT_CURRENTQUESTIONID_SET: {
      return {
        ...state,
        currentQuestionId: action.payload.id
      };
    }

    case LIVESUPPORT_CONVERSATIONHISTORY_ADD: {
      const conversationHistory = _.cloneDeep(state.conversationHistory);
      const { from, text, questionId, question } = action.payload;
      conversationHistory.push({ from, text, questionId, question });
      return {
        ...state,
        conversationHistory
      };
    }

    default:
      return state;
  }
};
export default liveSupportReducer;

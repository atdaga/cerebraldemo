import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import LiveSupport from './LiveSupport';
import {
    showLiveSupport,
    liveSupportQuestions,
    liveSupportCurrentQuestionId,
    liveSupportConversationHistory
} from '../../../selectors';
import {
    setShowLiveSupport,
    fetchLiveSupportQuestions,
    setCurrentQuestionId,
    addConversationHistory,
    submitAnswers
} from '../../../actions';

const mapStateToProps = (state) => {
  return {
      show: () => showLiveSupport(state),
      questions: () => liveSupportQuestions(state),
      currentQuestionId: () => liveSupportCurrentQuestionId(state),
      conversationHistory: () => liveSupportConversationHistory(state)
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
      setShow: (show) => dispatch(setShowLiveSupport(show)),
      fetchLiveSupportQuestions: () => dispatch(fetchLiveSupportQuestions()),
      setCurrentQuestionId: (id) => dispatch(setCurrentQuestionId(id)),
      addConversationHistory: (from, text, questionId, question) => (dispatch(addConversationHistory(from, text, questionId, question))),
      submitAnswers: (conversationHistory) => (dispatch(submitAnswers(conversationHistory)))
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LiveSupport));


import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Overlay, Form } from 'react-bootstrap';
import { Grid, Col, Row } from 'react-flexbox-grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons/faPaperPlane';
import respondToInput from '../../../util/questionaire';
import './styles.css';

class LiveSupport extends Component {
  constructor(props) {
    super(props);

    // TODO: cheating for now.  Should be in redux.
    this.state = {
        supportPerson: {
            fullName: 'Anthony Daga',
            firstName: 'Anthony'
        },
        patient: {
            firstName: 'You'
        },
        inputDisabled: false,
        submitToServer: false
    };

    this.textInput = createRef();

    this.handleInput = this.handleInput.bind(this);
    this.renderConversation = this.renderConversation.bind(this);
  }

  componentDidMount() {
    this.props.fetchLiveSupportQuestions();
  }

  componentDidUpdate() {
    if (this.state.submitToServer) {
        this.setState({ submitToServer: false });
        this.props.submitAnswers(this.props.conversationHistory());
    }
  }

  handleInput(evt) {
    evt.preventDefault();
    const text = this.textInput.current.value;
    this.textInput.current.value = '';

    const { questionId, answerText } = respondToInput(this.props.currentQuestionId(), text, this.props.questions());
    if (questionId !== this.props.currentQuestionId()) {
        this.props.setCurrentQuestionId(questionId);
    }

    let answeredQuestionId;
    let answeredQuestion;
    if (questionId !== this.props.currentQuestionId()) {
      answeredQuestionId = this.props.currentQuestionId();
      answeredQuestion = this.props.questions()[this.props.currentQuestionId()].question;
    }

    this.props.addConversationHistory('You', text, answeredQuestionId, answeredQuestion);
    this.props.addConversationHistory(this.state.supportPerson.firstName, answerText);

    // Check for ending.
    if (questionId === -1) {
      this.setState({ inputDisabled: true });
    } else if (!questionId) {
      this.setState({ inputDisabled: true, submitToServer: true });
    }
  }

  renderConversation() {
      const conversationHistory = this.props.conversationHistory();
      let keyCnt = -1;
      return conversationHistory.map(({ from, text}) => {
          ++keyCnt;
          return (
              <p key={keyCnt}>
                  <span className="support-name">{from}:</span><br/>
                  {text}
              </p>
          );
      });
  }

  render() {
      if (this.props.currentQuestionId() === 0) {
          const questions = this.props.questions();
          if (questions) {
              this.props.setCurrentQuestionId(1); // Assume starting with 1 for now.
              const currentQuestion = questions[1];
              this.props.addConversationHistory(this.state.supportPerson.firstName, currentQuestion.question);
          }
      }

      return (
          <>
              <Button variant="danger" onClick={() => this.props.setShow(!this.props.show())}>
                  Get Support
              </Button>
              <Overlay show={this.props.show()} placement="bottom">
                  {({
                        placement,
                        scheduleUpdate,
                        arrowProps,
                        outOfBoundaries,
                        show: _show,
                        ...props
                    }) => (
                      <Grid fluid className="live-support-container">
                          <Row className="supporter">
                              <Col xs={12}>
                                  {this.state.supportPerson.fullName}
                              </Col>
                          </Row>
                          <Row className="conversation-text">
                              <Col xs={12}>
                                  {this.renderConversation()}
                              </Col>
                          </Row>
                          <Row>
                              <Col xs={12}>
                                  <Form onSubmit={this.handleInput}>
                                      <Row className="input-container">
                                          <Col xs={10}>
                                              <Form.Group>
                                                  <Form.Control disabled={this.state.inputDisabled} ref={this.textInput} placeholder="Type here..."></Form.Control>
                                              </Form.Group>
                                          </Col>
                                          <Col xs={2}>
                                              <Button disabled={this.state.inputDisabled} variant="primary" type="submit">
                                                  <FontAwesomeIcon icon={faPaperPlane}/>
                                              </Button>
                                          </Col>
                                      </Row>
                                  </Form>
                              </Col>
                          </Row>
                      </Grid>
                  )}
              </Overlay>
          </>
      );
  }
};

LiveSupport.propTypes = {
    // TODO:
};

export default LiveSupport;

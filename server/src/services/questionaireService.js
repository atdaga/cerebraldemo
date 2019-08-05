import axios from 'axios';
import config from '../config';
import answerTbl from '../repositories/db/answerTable';

export const questions = (req) => { // eslint-disable-line no-unused-vars
  const { questionsUrl } = config;
  return axios.get(questionsUrl)
    .then(data => data.data);
};

export const submitAnswers = (req, answers) => { // eslint-disable-line no-unused-vars
  // Using email for uniqueness, for this test.  Not checking if already exist, again just for this.
  const email = answers.reduce((prevVal, answer) => {
    if (prevVal) {
      return prevVal;
    }
    return (answer.questionId === 3) ? answer.answer : undefined;
  }, undefined);

  if (email) {
    return Promise.all(answers.map((answer) => {
      const { questionId, question } = answer;
      const model = {
        email,
        questionId,
        question,
        answer: answer.answer
      };
      return answerTbl.save(req, model);
    }));
  }

  throw new Error('No email specified.'); // Should be a defined error, but don't have time...
};

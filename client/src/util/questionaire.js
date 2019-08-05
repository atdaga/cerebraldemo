import _ from 'lodash';

const respondToInput = (currentQuestionId, text, questionaire) => {
    const currentQuestion = questionaire[currentQuestionId];
    const { validation } = currentQuestion;

    let nextQuestionId;
    let invalidResponse = 'I don\'t understand.';
    if (Array.isArray(validation)) {
        const checkInput = text.toLowerCase();
        if (_.indexOf(validation, checkInput) >= 0) {
            if (isNaN(currentQuestion.paths)) {
                nextQuestionId = currentQuestion.paths[checkInput];
            } else {
                nextQuestionId = currentQuestion.paths;
            }
        } else {
            invalidResponse += ' Please answer with: ';
            let comma = '';
            validation.forEach((input) => {
                invalidResponse += comma + input;
                comma = ', ';
            });
        }
    } else if (_.isString(validation)) {
        const regex = new RegExp(validation);
        if (regex.test(text)) {
            nextQuestionId = currentQuestion.paths;
        } else {
            invalidResponse += ' Please try again.';
        }
    } else if (validation === true) {
        nextQuestionId = currentQuestion.paths;
    }

    if (nextQuestionId) {
        const nextQuestion = questionaire[nextQuestionId];
        return { questionId: (nextQuestion.validation === false) ? undefined : nextQuestionId, answerText: nextQuestion.question };
    }
    return { questionId: currentQuestionId, answerText: invalidResponse };

};
export default respondToInput;

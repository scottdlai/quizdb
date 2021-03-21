'use strict';

const getQuestionsDiv = (questions) => {
  return questions.flatMap(({ id, question, options = [] }, index) => {
    const heading = createElement('h3', { text: `Question ${index + 1}` });
    const questionElement = createElement('div', {
      id: `question-${id}`,
      text: question,
      classes: ['question'],
    });

    const br = createElement('br');

    const optionsElements = options.flatMap(({ id: optionID, answer }) => {
      const br = createElement('br');
      const optionElement = createElement('input', {
        id: `option-${optionID}`,
        value: optionID,
        name: `question-${id}`,
        type: 'radio',
        readOnly: true,
        required: true,
      });

      const label = createElement('label', {
        htmlFor: `option-${optionID}`,
        text: answer,
      });

      return [optionElement, label, br];
    });

    return [heading, questionElement, br, ...optionsElements];
  });
};

const evaluate = (submittedAnswers, questions) => {
  const corrects = questions.flatMap(({ options }) => {
    return options.filter(({ isCorrect }) => isCorrect).map(({ id }) => id);
  });

  return submittedAnswers.reduce((acc, submittedAnswer, index) => {
    return acc + (submittedAnswer == corrects[index] ? 1 : 0);
  }, 0);
};

const getCheckedInputs = (questions) => {
  const userAnswers = questions.map(({ id }) => {
    return getElement(`input[name="question-${id}"]:checked`);
  });
  // .filter((userAnswers) => userAnswers != null);
  return userAnswers;
};

window.addEventListener('load', async () => {
  const root = getElement('#root');

  const questions = await getQuestions();

  console.log(questions);

  const questionsElements = getQuestionsDiv(questions);

  const submitBtn = createElement('button', {
    text: 'Submit',
    id: 'submit-btn',
    classes: ['btn', 'btn-success', 'btn-block'],
  });

  const backBtn = createElement('a', {
    text: 'Back',
    classes: ['btn', 'btn-secondary'],
    href: './index.html',
  });

  addElement(
    root,
    backBtn,
    createElement('h1', { text: 'Questions' }),
    ...questionsElements,
    submitBtn
  );

  submitBtn.addEventListener('click', () => {
    const checkedInput = getCheckedInputs(questions);
    const userAnswers = checkedInput.map((checked) => checked && checked.value);

    const score = evaluate(userAnswers, questions);
    checkedInput.forEach((checked) => {
      if (checked) {
        checked.checked = false;
      }
    });
    window.alert(`Your score is ${score} / ${questions.length}`);
  });
});

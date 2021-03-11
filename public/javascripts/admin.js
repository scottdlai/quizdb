'use strict';

const getQuestionsFields = (questions) => {
  return questions.flatMap(({ id, question, options = [] }, index) => {
    const heading = createElement('h3', { text: `Question ${index + 1}` });

    const questionElement = createElement('textarea', {
      id: `question-${id}`,
      value: question,
      classes: ['question'],
    });

    const br = createElement('br');

    const optionsElements = options.flatMap(
      ({ id: optionID, answer, isCorrect }) => {
        const br = createElement('br');

        const optionElement = createElement('input', {
          id: `option-${optionID}`,
          value: answer,
          name: `question-${id}`,
          type: 'radio',
          required: true,
          checked: isCorrect,
        });

        const answerEditField = createElement('textarea', {
          value: answer,
          required: true,
          onchange: (e) => {
            optionElement.value = e.target.value;
          },
          classes: ['option'],
        });

        return [optionElement, answerEditField, br];
      }
    );

    const saveBtn = createElement('button', {
      text: 'save',
      classes: ['btn', 'btn-info', 'btn-block'],
      onclick: async () => {
        const newOptions = options.map(({ id: optionID }) => {
          const element = getElement(`#option-${optionID}`);
          const newIsCorrect = element.checked;
          const newAnswer = element.value;
          return { id: optionID, answer: newAnswer, isCorrect: newIsCorrect };
        });
        console.log(id, questionElement.value, newOptions);
        try {
          await updateQuestions(id, questionElement.value, newOptions);
          window.alert('done');
        } catch ({ message }) {
          window.alert(message);
        }
      },
    });

    return [heading, questionElement, br, ...optionsElements, saveBtn];
  });
};

const getNewQuestionForm = () => {
  const heading = createElement('h3', { text: 'New Question' });
  const hr = createElement('hr');

  const questionTextArea = createElement('textarea', { classes: ['question'] });

  const optionsElements = Array.from({ length: 4 }, () => {
    const checkbox = createElement('input', {
      name: 'new-option',
      type: 'radio',
      required: true,
      value: '',
    });

    const textarea = createElement('textarea', {
      classes: ['option'],
      onchange: (e) => {
        checkbox.value = e.target.value;
      },
    });

    const br = createElement('br');

    return [checkbox, textarea, br];
  }).flat();

  const addBtn = createElement('button', {
    text: 'Add',
    classes: ['btn', 'btn-success', 'btn-block'],
    onclick: async () => {
      const newOptionTextarea = optionsElements.filter(
        (e) => e.name === 'new-option'
      );
      const options = newOptionTextarea.map((e) => {
        return { answer: e.value, isCorrect: e.checked };
      });

      const question = questionTextArea.value;
      console.log(question, options);

      try {
        await createQuestions(question, options);
        location.reload();
      } catch (err) {
        window.alert(err.message);
      }
    },
  });

  return [heading, questionTextArea, ...optionsElements, addBtn, hr];
};

window.addEventListener('load', async () => {
  const root = getElement('#root');

  const questions = await getQuestions();

  const questionsElements = getQuestionsFields(questions);

  const newQuestionForm = getNewQuestionForm();

  const backBtn = createElement('a', {
    text: 'Back',
    classes: ['btn', 'btn-secondary'],
    href: './index.html',
  });

  addElement(root, backBtn, ...newQuestionForm, ...questionsElements);
});

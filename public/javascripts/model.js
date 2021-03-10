const url = 'http://localhost:3000/questions';

const isValidQuestion = (question) => {
  return typeof question === 'string' && question;
};

const areValidOptions = (options) => {
  return (
    options.length >= 2 &&
    options.length <= 4 &&
    options.filter(({ isCorrect }) => isCorrect).length === 1
  );
};

const sanitizeOptions = (options) =>
  options.filter(({ answer, isCorrect }) => {
    if (answer == null && isCorrect) {
      return false;
    }

    return answer !== '';
  });

const createQuestions = async (question, options) => {
  if (!isValidQuestion(question)) {
    return Promise.reject({ message: 'Invalid question' });
  }

  const sanitized = sanitizeOptions(options);

  if (!areValidOptions(sanitized)) {
    return Promise.reject({ message: 'invalid options' });
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question, options: sanitized }),
  });

  const data = res.json();

  return data;
};

const getQuestions = async () => {
  const res = await fetch(url, {
    method: 'GET',
    mode: 'cors',
  });

  const questions = await res.json();
  return questions;
};

const updateQuestions = async (questionID, question, options) => {
  if (!isValidQuestion(question)) {
    return Promise.reject({ message: 'Invalid question' });
  }

  if (!areValidOptions(options)) {
    return Promise.reject({ message: 'invalid options' });
  }

  if (!options.every(({ id }) => id != null)) {
    return Promise.reject({ message: 'option must have an id' });
  }

  if (!options.every(({ answer }) => answer)) {
    return Promise.reject({ message: 'Answer cannot be blank' });
  }

  const res = await fetch(url, {
    method: 'PUT',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: questionID,
      question,
      options,
    }),
  });

  const data = res.json();

  console.log(data);
  return data;
};

const getElement = (selector) => document.querySelector(selector);

const createElement = (tag, { text = '', classes = [], ...rest } = {}) => {
  const element = document.createElement(tag);

  if (text) {
    element.innerText = text;
  }

  if (classes.length !== 0) {
    element.classList.add(...classes);
  }

  for (key in rest) {
    element[key] = rest[key];
  }

  return element;
};

const addElement = (root, ...elements) =>
  elements.forEach((element) => root.appendChild(element));

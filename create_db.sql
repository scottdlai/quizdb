CREATE TABLE questions (
    question_id serial PRIMARY KEY,
    question VARCHAR NOT NULL
);

CREATE TABLE options (
    option_id serial PRIMARY KEY,
    question_id INT NOT NULL,
    answer VARCHAR NOT NULL,
    is_correct BOOLEAN NOT NULL,
    FOREIGN KEY(question_id) REFERENCES questions(question_id)
);

const express = require('express');
const router = express.Router();
const client = require('../db');

router.get('/', (req, res) => {
  client
    .query(
      `SELECT questions.question_id,
              questions.question,
              options.option_id,
              options.is_correct,
              options.answer
       FROM questions
       INNER JOIN options
       ON questions.question_id = options.question_id
       ORDER BY questions.question_id, options.option_id
       LIMIT 100`
    )
    .then(({ rows }) => {
      res.status(200);
      const questions = rows
        .reduce((acc, row, index) => {
          const {
            question,
            answer,
            question_id: id,
            is_correct: isCorrect,
          } = row;

          const option = {
            id: row['option_id'],
            isCorrect,
            answer,
          };

          if (index === 0) {
            return [{ question, id, options: [option] }];
          } else {
            const [head, ...tail] = acc;

            const { options, id: previousID } = head;

            if (previousID === id) {
              return [{ ...head, options: [...options, option] }, ...tail];
            } else {
              return [{ question, id, options: [option] }, ...acc];
            }
          }
        }, [])
        .reverse();
      // console.log(questions);
      res.json(questions);
    })
    .catch((err) => {
      console.error(err.stack);
      res.status(500);
      res.json(err);
    });
});

router.post('/', (req, res) => {
  const { question, options } = req.body;

  if (!question) {
    res.status(400);
    res.json({ error: "Question can't be empty" });
    return;
  }

  if (!options) {
    res.status(400);
    res.json({ error: 'There must be at least 1 option' });
    return;
  }

  if (!options.some(({ isCorrect }) => isCorrect)) {
    res.status(400);
    res.json({ error: 'There must be 1 correct option' });
    return;
  }

  if (options.length < 2) {
    res.status(400);
    res.json({ error: 'There must be at least 2 options' });
  }

  client
    .query({
      text: `INSERT INTO questions(question)
       VALUES ($1::text)
       RETURNING question_id`,
      values: [question],
    })
    .then(({ rows }) => {
      const [{ question_id: questionID }] = rows;
      // console.log(questionID);

      const optionsValues = options
        .map(
          ({ answer, isCorrect }) =>
            `(${questionID}, '${answer}', ${isCorrect})`
        )
        .join(', ');

      // console.log(optionsValues);

      client
        .query(
          `INSERT INTO options(question_id, answer, is_correct)
           VALUES ${optionsValues}
           RETURNING option_id`
        )
        .then(({ rows }) => {
          res.status(200);
          res.json({
            id: questionID,
            options: rows.map(({ option_id: optionID }) => optionID),
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(500);
        });
    })
    .catch((err) => {
      console.error(err);
    });
});

router.put('/', (req, res) => {
  const { id, question, options } = req.body;

  if (id == null) {
    res.status(400);
    res.json({ error: 'Missing question id' });
    return;
  }

  if (!question) {
    res.status(400);
    res.json({ error: "Question can't be empty" });
    return;
  }

  if (!options) {
    res.status(400);
    res.json({ error: 'There must be at least 1 option' });
    return;
  }

  if (!options.some(({ isCorrect }) => isCorrect)) {
    res.status(400);
    res.json({ error: 'There must be 1 correct option' });
    return;
  }

  if (!options.every(({ answer }) => answer !== '')) {
    res.status(400);
    res.json({ error: 'Answers cannot be empty' });
    return;
  }

  if (options.length < 2) {
    res.status(400);
    res.json({ error: 'There must be at least 2 options' });
    return;
  }

  client
    .query(
      `UPDATE questions
       SET question = $1
       WHERE question_id = $2`,
      [question, id]
    )
    .then(() => {
      const questionID = id;
      const optionsValues = options
        .map(({ id, answer, isCorrect }) => {
          return `(${id}, ${questionID}, '${answer}', ${isCorrect})`;
        })
        .join(', ');

      // console.log(optionsValues);

      client
        .query(
          `INSERT INTO options (option_id, question_id, answer, is_correct)
         VALUES $1
         ON CONFLICT (option_id) DO UPDATE
         SET question_id = excluded.question_id,
             answer = excluded.answer,
             is_correct = excluded.is_correct`,
          [optionsValues]
        )
        .then((result) => {
          res.status(200);
          res.json(result);
        })
        .catch((err) => {
          console.error(err);
          res.status(500);
          res.json(err);
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500);
      res.json(err);
    });
});

router.delete('/', (req, res) => {
  const { id } = req.body;

  client
    .query(
      `DELETE
       FROM options
       WHERE options.question_id = $1`,
      [id]
    )
    .then(() => {
      client
        .query(`DELETE FROM questions WHERE question_id = ${id}`)
        .then((result) => {
          res.status(200);
          res.json(result);
        })
        .catch((err) => {
          console.error(err);
          res.status(500);
          res.json(err);
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500);
      res.json(err);
    });
});

module.exports = router;

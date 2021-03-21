const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');

const indexRouter = require('./routes/index');
const questionsRouter = require('./routes/questions');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(cors());
app.use(express.static(path.join(__dirname, '../front-end')));

app.use('/', indexRouter);
app.use('/questions', questionsRouter);

app.listen(PORT, () => console.log(`App listenning on port ${PORT}`));

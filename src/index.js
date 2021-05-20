const express = require("express");
const cors = require("cors");
const { json } = require("express");

const { v4: uuidv4, v4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json([{ error: "user not found!" }]);
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { username, name } = request.body;

  const exists = users.some((user) => user.username === username);

  if (exists) {
    return response.status(400).json({ error: "user already exists!" });
  }

  const user = {
    id: v4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  return response.status(201).json(request.user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: v4(),
    title,
    done: false,
    deadline,
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { deadline, title } = request.body;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "todo not found!" });
  }

  todo.deadline = deadline;
  todo.title = title;

  return response.status(201).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "todo not found!" });
  }

  todo.done = true;

  // const todos = [...user.todos.filter((todo) => todo.id !== id)];
  //todos.push(todo);

  return response.status(200).send(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  console.log(id);

  const search = user.todos.findIndex((t) => t.id === id);

  if (search === -1) {
    return response.status(404).json({ error: "todo not found!" });
  }

  user.todos.splice(search, 1);

  return response.status(204).json();
});

//app.listen(3333);

module.exports = app;

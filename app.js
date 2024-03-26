const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
var format = require('date-fns/format')

const databasePath = path.join(__dirname, 'todoApplication.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () =>
      console.log(`Server Running at http://localhost:3000/`),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}
initializeDbAndServer()


const convertStateObject = dbObject => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    category: dbObject.category,
    priority: dbObject.priority,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  }
}

app.get('/todos/', async (request, response) => {
  const {status} = request.params
  try {
    const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
     status=${status};
  `
    const todos = await database.all(getTodoQuery)
    response.send(convertStateObject(todos))
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
  }
})

app.get('/todos/', async (request, response) => {
  const {priority} = request.params
  try {
    const getTodoQuery = `
    SELECT
      *
    FROM
      todo
  `
    const todo = await database.all(getTodoQuery)
    response.send(convertStateObject(todo))
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
  }
})

app.get('/todos/', async (request, response) => {
  const {priority} = request.params
    const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
     priority=${priority};
  `
  })

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`
  const todo = await database.get(getTodoQuery)
  response.send(convertStateObject(todo))
})

app.get('/agenda/', async (request, response) => {
  const date = format(new Date(2022, 09, 22), 'yyyy-MM-dd')
  const getQuery = `select * from todo where due_date=${date};`
  const result = await database.all(getQuery)
  response.send(result)
})

/*app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status,category,dueDate} = request.body

          // If dueDate matches, format it to "yyyy-MM-dd"
          const postNewDueDate = format(new Date(dueDate), "yyyy-MM-dd");
  
  const postTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status,category,due_date)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}', ${category}, ${postNewDueDate});`;
  await database.run(postTodoQuery)
   response.send('Todo Successfully Added')
  
})*/

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let updateColumn = ''
  const requestBody = request.body
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = 'Status'
      break
    case requestBody.priority !== undefined:
      updateColumn = 'Priority'
      break
    case requestBody.todo !== undefined:
      updateColumn = 'Todo'
      break
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`
  const previousTodo = await database.get(previousTodoQuery)

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}'
    WHERE
      id = ${todoId};`

  await database.run(updateTodoQuery)
  response.send(`${updateColumn} Updated`)
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`

  await database.run(deleteTodoQuery)
  response.send('Todo Deleted')
})

app.post("/todos/", async (request, response) => {
  // Destructure request body to extract required fields
  const { id, todo, priority, status, category, dueDate } = request.body;


  // Check if priority is valid
  if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
    // Check if status is valid
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      // Check if category is valid
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        // Check if dueDate matches the format "yyyy-MM-dd"
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          // If dueDate matches, format it to "yyyy-MM-dd"
          const postNewDueDate = format(new Date(dueDate), "yyyy-MM-dd");


          // Construct the SQL query to insert a new todo
          const postTodoQuery = `
            INSERT INTO
              todo (id, todo, category, priority, status, due_date)
            VALUES
              (${id}, '${todo}', '${category}', '${priority}', '${status}', '${postNewDueDate}');`;


          // Execute the SQL query to insert a new todo
          await database.run(postTodoQuery);


          // Send success response
          response.send("Todo Successfully Added");
        } else {
          // Send error response for invalid dueDate format
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        // Send error response for invalid category
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      // Send error response for invalid status
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    // Send error response for invalid priority
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});



module.exports = app

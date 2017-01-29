# Todos-API
Todos API is a simple and easy to use API with the following features:
1. Create a new todo and add to list
2. Get all todos or get them by id
3. Update todos based on id
4. Delete todos based on id 
5. Only todo associated with user can be manipulated

# To run the API locally:
1. Set up config.json in /server/config/ to contain PORT, MONGODB_URI and JWT_SECRET
2. npm install to install all dependencies
3. Run node server/server.js

# Documentation:
## A. POST /users: Registers user. No duplicates allowed. 
1. Request: `email`, `password`.
2. Response: `header: x-auth` token and `user` that was created. 

## B. GET /users/me: Gets current user
1. Request: `header: x-auth` token.
2. Response: `user`.

## C. POST /users/login: Logs in registered user
1. Request: `email`, `password`.
2. Response: `header: x-auth` token and `user` that was created. 

## D. DELETE /users/me/token: logs out registered user
1. Request: `header: x-auth` token.
2. Response: Success response that user was logged off.

## E. POST /todos: Creates a new todo for registered user and saves. 
1. Request: `header: x-auth` token and `text` of the todo.
2. Response: todo that was saved. 

## F. GET /todos: Gets all todos of a particular user
1. Request: `header: x-auth` token.
2. Response: `todos` array.

## G. GET /todos/:id: Gets todo associated with an id for a particular user
1. Request: `header: x-auth` token and `id` of todo.
2. Response: `todo` associated with `id`

## E. DELETE /todos/:id: Delete todo associated with an id for a particular user
1. Request: `header: x-auth` token and `id` of todo.
2. Response: `todo` associated with `id`

## F. PATCH /todos/:id: Update todo associated with an id for a particular user
1. Request: `header: x-auth` token , `id` of todo and `text` and `completed` parameters to be changed. 
2. Response: Updated `todo` associated with `id`


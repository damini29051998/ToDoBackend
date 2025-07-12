# Node.js template

This is a Node.js project with an HTTP server.

Add your [configuration](https://codesandbox.io/docs/projects/learn/setting-up/tasks) to optimize it for [CodeSandbox](https://codesandbox.io).

## How does this work?

We run `yarn start` to start an HTTP server that runs on http://localhost:8080. You can open new or existing devtools with the + button next to the devtool tabs.

## Resources

- [CodeSandbox — Docs](https://codesandbox.io/docs)
- [CodeSandbox — Discord](https://discord.gg/Ggarp3pX5H)


BACKEND (Node.js + Express) SETUP
------------------------------------------------------------

1. Prerequisites:
- Node.js and MongoDB installed

2. Folder Structure:

  /server
    models/
      User.js
      Order.js
    middleware/
      authMiddleware.js
    server.js
    .env
    package.json

3. Install backend dependencies:
  npm install express mongoose cors dotenv jsonwebtoken bcryptjs

4. Create a `.env` file in the root folder:
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret

5. Start the backend server:
  node server.js

------------------------------------------------------------
API ENDPOINTS
------------------------------------------------------------

Authentication:
- POST /signup         - Create new user
- POST /login          - Log in and receive token

Orders (Require Bearer token in Authorization header):
- GET /orders                 - Get all orders for logged-in user
- POST /orders                - Create a new order
- DELETE /orders/:id         - Delete an order
- PATCH /orders/:id/priority - Update priority of an order
- PATCH /orders/:id/message  - Update message of an order

------------------------------------------------------------
ORDER OBJECT STRUCTURE
------------------------------------------------------------

{
  _id: "order_id",
  productName: "Product Name",
  quantity: 2,
  priority: "low" | "medium" | "high",
  message: "Optional message",
  userId: "user_id"
}

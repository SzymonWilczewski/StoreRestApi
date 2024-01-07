# Store REST API

A comprehensive e-commerce backend application built with Node.js, Express, and MongoDB. It provides RESTful API endpoints for user authentication, managing shopping carts, handling orders, and managing products.

## Built With

<div align="center">
  <a href="https://expressjs.com/">
    <img src="https://skillicons.dev/icons?i=express" style="width: 100px" />
  </a>  
  <a href="https://nodejs.org/">
    <img src="https://skillicons.dev/icons?i=nodejs" style="width: 100px" />
  </a>  
  <a href="https://www.mongodb.com/">
    <img src="https://skillicons.dev/icons?i=mongo" style="width: 100px" />
  </a>  
  <a href="https://www.docker.com/">
    <img src="https://skillicons.dev/icons?i=docker" style="width: 100px" />
  </a>
</div>

## Requirements

- [Docker](https://docs.docker.com/) (tested on 24.0.6)
- [Docker Compose](https://docs.docker.com/compose/)

## Installation

**All commands must be executed in the project's root directory**

Clone the repository:

```
  git clone https://github.com/SzymonWilczewski/StoreRestApi.git
  cd StoreRestApi
```

Verify that you have Docker CLI installed on your system:

```
  docker version
```

Depending on the environment version that you want to start type:

```
  docker compose --profile dev up
```

or

```
  docker compose --profile prod up
```

or

```
  docker compose --profile test up
```

The application should now be running on [http://localhost:5000](http://localhost:5000).

## Endpoints

- **Authentication:**

  - `POST /register`: Create a new user.
  - `POST /login`: Initiate a login session.
  - `POST /logout`: Terminate an existing login session.
  - `PUT /change-password`: Change the user's password.

- **Shopping Cart:**

  - `GET /cart`: Retrieve the user's shopping cart.
  - `POST /cart/product/:id`: Add a product to the shopping cart.
  - `DELETE /cart/product/:id`: Remove a product from the shopping cart.

- **Orders:**

  - `GET /orders/:id`: Retrieve an order by ID.
  - `POST /orders`: Create a new order.
  - `PUT /orders/:id`: Update an existing order.
  - `PATCH /orders/:id`: Modify an existing order.
  - `DELETE /orders/:id`: Delete an order.

- **Products:**

  - `GET /products`: Retrieve all products.
  - `GET /products/:id`: Retrieve a product by ID.
  - `POST /products`: Create a new product.
  - `PUT /products/:id`: Update an existing product.
  - `PATCH /products/:id`: Modify an existing product.
  - `DELETE /products/:id`: Delete a product.

- **Users:**
  - `GET /users`: Retrieve all users (admin only).
  - `GET /users/:id`: Retrieve a user by ID.
  - `PATCH /users/:id`: Modify a user's information.
  - `DELETE /users/:id`: Delete a user (admin only).

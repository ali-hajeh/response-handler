# @ali-hajeh/response-handler

A lightweight and flexible package to help organize and standardize responses from your Express.js API.

## Installation

Install the package using npm:

```bash
npm install @ali-hajeh/response-handler
```

## Usage

Import the `ResponseHandler` class in your Express.js application:

```typescript
import ResponseHandler from "@ali-hajeh/response-handler";
```

### Middleware Setup

To use the ResponseHandler, you need to set it up as middleware in your Express application:

```typescript
import express from "express";
import ResponseHandler from "@ali-hajeh/response-handler";

const app = express();

// Apply the middleware
app.use(ResponseHandler.middleware());
```

### Available Methods

Once the middleware is set up, the following methods will be available on the `res` object in your route handlers:

1. `success`: Send a success response
2. `badRequest`: Send a bad request response
3. `joiValidationError`: Send a response for Joi validation errors
4. `notFound`: Send a not found response
5. `serverError`: Send a server error response

### Example

```typescript
import express from "express";
import ResponseHandler from "@ali-hajeh/response-handler";

const app = express();

// Apply the middleware
app.use(ResponseHandler.middleware());

app.get("/api/users", (req, res) => {
  // Your logic here
  const users = [{ id: 1, name: "John Doe" }];
  res.success({
    data: users,
    message: "Users retrieved successfully",
  });
});

app.use((req, res) => {
  res.notFound({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  res.serverError({ message: err.message });
});
```

## API Reference

### res.success(options)

Send a success response.

- `options`:
  - `message` (optional): Success message (default: "Success")
  - `data` (optional): Data to be sent in the response
  - `statusCode` (optional): HTTP status code (default: 200)

### res.badRequest(options)

Send a bad request response.

- `options`:
  - `message` (optional): Error message (default: "Bad Request")
  - `errors` (optional): Error details
  - `statusCode` (optional): HTTP status code (default: 400)

### res.joiValidationError(error, options)

Send a response for Joi validation errors.

- `error`: Joi ValidationError object
- `options`:
  - `statusCode` (optional): HTTP status code (default: 400)

### res.notFound(options)

Send a not found response.

- `options`:
  - `message` (optional): Error message (default: "Not Found")
  - `errors` (optional): Error details
  - `statusCode` (optional): HTTP status code (default: 404)

### res.serverError(options)

Send a server error response.

- `options`:
  - `message` (optional): Error message (default: "Internal Server Error")
  - `errors` (optional): Error details
  - `statusCode` (optional): HTTP status code (default: 500)

## Custom Methods

You can add custom response methods using the `ResponseHandler.addCustomMethod` function:

```typescript
ResponseHandler.addCustomMethod<[data: any, options?: { flag?: boolean }]>(
  "customResponse",
  function (data, options = {}) {
    return this.status(200).json({ custom: true, data, ...options });
  }
);

// Usage in a route
app.get("/custom", (req, res) => {
  res.customResponse({ foo: "bar" }, { flag: true });
});
```

## TypeScript Support

This package is written in TypeScript and includes type definitions. It exports a `ResponseType` interface that you can use to type your responses:

```typescript
import { ResponseType } from "@ali-hajeh/response-handler";

const response: ResponseType = {
  success: true,
  message: "Success",
  data: { id: 1 },
  statusCode: 200,
};
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or an Issue.

## License

This project is licensed under the ISC License.

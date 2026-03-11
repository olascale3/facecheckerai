# FaceCheckerAI

## Project Overview

FaceCheckerAI is a project that provides face search capabilities. It allows users to upload an image and search for faces within it using an API.

## Architecture Overview

The project consists of a backend API built with Node.js and a frontend client built with React. The API handles image processing and face search logic. The client provides a user interface for interacting with the API.

## Installation and Setup Instructions

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    ```

2.  Install the backend dependencies:

    ```bash
    cd api
    npm install
    ```

3.  Install the frontend dependencies:

    ```bash
    cd client
    npm install
    ```

## Environment Variables Configuration

The project requires the following environment variables:

*   `PORT`: The port the server listens on (default: 3000).

Create a `.env` file in the `api` directory with the following content:

```
PORT=3000
```

## Development Workflow

1.  Start the backend development server:

    ```bash
    cd api
    npm run dev
    ```

2.  Start the frontend development server:

    ```bash
    cd client
    npm run dev
    ```

## Deployment Instructions

To deploy the project, you can use a platform like Heroku or AWS. The deployment process involves building the frontend and backend, configuring environment variables, and starting the server.

## Contributing Guidelines

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes.
4.  Submit a pull request.

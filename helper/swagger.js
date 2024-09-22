const swaggerJSDoc = require("swagger-jsdoc");

const option = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node JS API Project Book",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:4500",
      },
    ],
  },
  apis: [
    "./server.js",
    "./api/controller/*.controller.js",
    "./helper/schemaSwagger.yaml",
    "./api/controller/*.swagger.yaml",
  ],
};

module.exports = {
  swaggerSpec: swaggerJSDoc(option),
  swaggerUI: require("swagger-ui-express"),
};

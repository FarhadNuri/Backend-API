const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const apisPath = path.join(__dirname, "../modules/**/*.docs.js").replace(/\\/g, "/");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Daktar Kothay API",
      version: "1.0.0",
      description: "Backend API for finding specialist doctors and chambers in Bangladesh",
    },
    servers: [
      {
        url: "/api",
        description: "API Base Path",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            statusCode: { type: "integer", example: 200 },
            message: { type: "string", example: "Operation completed successfully" },
            data: { type: "object" },
            meta: {
              type: "object",
              properties: {
                page: { type: "integer", example: 1 },
                limit: { type: "integer", example: 10 },
                total: { type: "integer", example: 25 },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            statusCode: { type: "integer", example: 400 },
            message: { type: "string", example: "Validation failed" },
            errorDetails: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "email" },
                  message: { type: "string", example: "Invalid email" },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [apisPath],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Use CDN for Swagger UI static assets to guarantee compatibility on Vercel Serverless
const SWAGGER_CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css";
const SWAGGER_JS_URLS = [
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.min.js",
];

const setupSwagger = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCssUrl: SWAGGER_CSS_URL,
      customJs: SWAGGER_JS_URLS,
      customSiteTitle: "Daktar Kothay API Documentation",
    })
  );

  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};

module.exports = { setupSwagger, swaggerSpec };

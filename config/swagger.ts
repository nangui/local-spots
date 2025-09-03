// for AdonisJS v6
import path from "node:path";

export default {
  // Use absolute path to the app directory specifically
  path: path.resolve(process.cwd(), 'app'),
  title: "LocalSpots",
  version: "1.0.0",
  description: "LocalSpots is a location discovery platform that allows users to discover interesting places around them",
  tagIndex: 2,
  productionEnv: "production",
  info: {
    title: "LocalSpots",
    version: "1.0.0",
    description: "LocalSpots is a location discovery platform that allows users to discover interesting places around them",
  },
  snakeCase: true,

  // Disable debug to reduce console noise
  debug: false,
  
  // Ignore ALL problematic paths and files
  ignore: [
    "/swagger", 
    "/docs", 
    "/health", 
    "/api/v1",
    "/uploads",
    "/favicon.ico",
    "/**/*Controller*",
    "**/*.ts",
    "**/*.js",
    "**/controllers/**",
    "**/models/**",
    "**/services/**"
  ],
  
  preferredPutPatch: "PUT",
  
  common: {
    parameters: {},
    headers: {},
  },
  
  securitySchemes: {
    BearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT"
    }
  },
  
  authMiddlewares: ["auth", "auth:api"],
  defaultSecurityScheme: "BearerAuth",
  persistAuthorization: true,
  showFullPath: false,
  
  // Completely disable ALL auto-loading features
  autoTag: false,
  autoGroup: false,
  autoResponse: false,
  autoRequest: false,
  
  // Disable controller scanning completely
  scan: false,
  
  // Disable file system operations
  readFiles: false,
  writeFiles: false,
  
  // Custom tags for better organization
  tags: [
    { name: "Authentication", description: "User authentication endpoints" },
    { name: "Users", description: "User management endpoints" },
    { name: "Spots", description: "Location spots management" },
    { name: "Reviews", description: "Spot reviews management" },
    { name: "Categories", description: "Spot categories" },
    { name: "Photos", description: "Spot photos management" },
    { name: "Public", description: "Public endpoints (no auth required)" }
  ]
};

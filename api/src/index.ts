import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from 'apollo-server-core';
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { schema } from './schema';
import { createContext } from './context';

const IS_DEV = process.env.NODE_ENV === 'development';
const localOrigins = 'http://localhost:3000';
// const localOrigins = [/^http:\/\/localhost:\d{3}$/];
const prodOrigins = [/^https:\/\/.*\.yourdomain\.com$/];

async function startApolloServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    schema,
    context: createContext,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  });
  await server.start();

  app.use(cookieParser());
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );
  server.applyMiddleware({
    app,
    cors: false,
  });
  await new Promise<void>((resolve) => {
    httpServer.listen({ port: 4000 });
    resolve();
  });
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

startApolloServer();

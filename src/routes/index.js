import { config } from '../config/index.js';
import { health } from './health.route.js';
import { auth } from "../modules/auth/auth.routes.js";

export const routes = (server) => {
  server.use(`/api/${config.app.apiVersion}/health`, health);
  server.use(`/api/${config.app.apiVersion}/auth`, auth);

};
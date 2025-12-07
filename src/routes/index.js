import { Router } from "express";
import health from "./health.route.js";
import auth from "../modules/auth/auth.routes.js";
import { config } from "../config/index.js";

const routes = (app) => {
  const router = Router();

  router.use("/health", health);
  router.use("/auth", auth);

  app.use(`/api/${config.app.apiVersion}`, router);
};

export default routes; 
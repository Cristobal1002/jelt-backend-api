import { Router } from "express";
import health from "./health.route.js";
import auth from "../modules/auth/auth.routes.js";
import articleRoutes from "../modules/article/article.routes.js";
import supplierRoutes from "../modules/supplier/supplier.routes.js";
import categoryRoutes from "../modules/category/category.routes.js";
import stockroomRoutes from "../modules/stockroom/stockroom.routes.js";
import assistantRoutes from "../modules/assistant/assistant.routes.js"; 
import replenishmentRoutes from "../modules/replenishment/replenishment.routes.js";

import { config } from "../config/index.js";

const routes = (app) => {
  const router = Router();

  router.use("/health", health);
  router.use("/auth", auth);
  router.use("/articles", articleRoutes);
  router.use("/suppliers", supplierRoutes);
  router.use("/categories", categoryRoutes);
  router.use("/stockroom", stockroomRoutes);
  router.use("/assistant", assistantRoutes);
  router.use("/replenishment", replenishmentRoutes);

  app.use(`/api/${config.app.apiVersion}`, router);
};

export default routes; 
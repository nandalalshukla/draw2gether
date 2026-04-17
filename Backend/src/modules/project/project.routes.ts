import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../lib/asyncHandler";
import { validate } from "../../middlewares/validate.middleware";
import {
  createProjectController,
  deleteProjectController,
  getProjectController,
  listProjectsController,
  syncProjectsController,
  updateProjectController,
} from "./project.controller";
import {
  createProjectSchema,
  syncProjectsSchema,
  updateProjectSchema,
} from "./project.validation";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(listProjectsController));
router.get("/:id", asyncHandler(getProjectController));
router.post("/", validate(createProjectSchema), asyncHandler(createProjectController));
router.post(
  "/sync-local",
  validate(syncProjectsSchema),
  asyncHandler(syncProjectsController),
);
router.put("/:id", validate(updateProjectSchema), asyncHandler(updateProjectController));
router.delete("/:id", asyncHandler(deleteProjectController));

export default router;

import type { Request, Response } from "express";
import { BAD_REQUEST, CREATED, OK } from "../../config/http";
import { requireAuth } from "../../utils/requireAuth";
import { AppError } from "../../lib/AppError";
import {
  createProject,
  deleteProject,
  getProjectById,
  listProjects,
  syncProjects,
  updateProject,
} from "./project.service";

function getProjectId(req: Request): string {
  const projectId = req.params.id;

  if (typeof projectId !== "string" || projectId.trim().length === 0) {
    throw new AppError(BAD_REQUEST, "Project id is required");
  }

  return projectId;
}

export const listProjectsController = async (req: Request, res: Response) => {
  requireAuth(req);

  const projects = await listProjects(req.user.userId);

  return res.status(OK).json({
    success: true,
    data: projects,
  });
};

export const getProjectController = async (req: Request, res: Response) => {
  requireAuth(req);

  const project = await getProjectById(req.user.userId, getProjectId(req));

  return res.status(OK).json({
    success: true,
    data: project,
  });
};

export const createProjectController = async (req: Request, res: Response) => {
  requireAuth(req);

  const project = await createProject(req.user.userId, req.body);

  return res.status(CREATED).json({
    success: true,
    message: "Project created successfully",
    data: project,
  });
};

export const updateProjectController = async (req: Request, res: Response) => {
  requireAuth(req);

  const project = await updateProject(req.user.userId, getProjectId(req), req.body);

  return res.status(OK).json({
    success: true,
    message: "Project updated successfully",
    data: project,
  });
};

export const deleteProjectController = async (req: Request, res: Response) => {
  requireAuth(req);

  await deleteProject(req.user.userId, getProjectId(req));

  return res.status(OK).json({
    success: true,
    message: "Project deleted successfully",
  });
};

export const syncProjectsController = async (req: Request, res: Response) => {
  requireAuth(req);

  const createdProjects = await syncProjects(req.user.userId, req.body.projects);

  return res.status(CREATED).json({
    success: true,
    message: "Projects synced successfully",
    data: createdProjects,
  });
};

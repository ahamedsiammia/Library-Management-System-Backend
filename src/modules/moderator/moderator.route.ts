import { Router } from "express";
import { ModeratorControllers } from "./moderator.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get(
  "/dashboard-stats",
  auth(Role.MODARATOR, Role.LIBRARYAN),
  ModeratorControllers.getDashboardStats
);

router.get(
  "/users",
  auth(Role.MODARATOR, Role.LIBRARYAN),
  ModeratorControllers.getAllUsers
);

router.patch(
  "/users/:id/status",
  auth(Role.MODARATOR),
  ModeratorControllers.updateUserStatus
);

router.post(
  "/librarians",
  auth(Role.MODARATOR),
  ModeratorControllers.createLibrarian
);

router.get(
  "/settings",
  auth(Role.MODARATOR, Role.LIBRARYAN),
  ModeratorControllers.getSystemSettings
);

router.patch(
  "/settings",
  auth(Role.MODARATOR),
  ModeratorControllers.updateSystemSettings
);

router.get(
  "/logs",
  auth(Role.MODARATOR),
  ModeratorControllers.getActivityLogs
);

export const ModeratorRoutes = router;

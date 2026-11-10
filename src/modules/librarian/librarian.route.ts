import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { LibrarianControllers } from "./librarian.controller";

const router = Router();

router.get(
  "/dashboard-stats",
  auth(Role.LIBRARIAN, Role.ADMIN),
  LibrarianControllers.getDashboardStats
);

router.post(
  "/librarians",
  auth(Role.LIBRARIAN, Role.ADMIN),
  LibrarianControllers.createLibrarian
);

router.get(
  "/settings",
  auth(Role.LIBRARIAN, Role.ADMIN),
  LibrarianControllers.getSystemSettings
);

router.patch(
  "/settings",
  auth(Role.LIBRARIAN, Role.ADMIN),
  LibrarianControllers.updateSystemSettings
);

router.get(
  "/logs",
  auth(Role.LIBRARIAN, Role.ADMIN),
  LibrarianControllers.getActivityLogs
);

export const LibrarianRoutes = router;

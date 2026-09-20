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

router.get(
  "/users",
  auth(Role.LIBRARIAN, Role.ADMIN),
  LibrarianControllers.getAllUsers
);

router.patch(
  "/users/:id/status",
  auth(Role.LIBRARIAN),
  LibrarianControllers.updateUserStatus
);

router.post(
  "/librarians",
  auth(Role.LIBRARIAN),
  LibrarianControllers.createLibrarian
);

router.get(
  "/settings",
  auth(Role.LIBRARIAN, Role.ADMIN),
  LibrarianControllers.getSystemSettings
);

router.patch(
  "/settings",
  auth(Role.LIBRARIAN),
  LibrarianControllers.updateSystemSettings
);

router.get(
  "/logs",
  auth(Role.LIBRARIAN),
  LibrarianControllers.getActivityLogs
);

//// This is My code of librarian 








export const LibrarianRoutes = router;

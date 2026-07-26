import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import config from "../../config";
import { ActiveStatus, Role } from "../../../generated/prisma/enums";
import { ICreateLibrarian, ISystemSettings } from "./moderator.interface";

// System settings stored in-memory / state (can be extended to DB model)
let globalSettings: ISystemSettings = {
  maxBorrowLimit: 3,
  borrowDurationDays: 14,
  finePerDay: 1.0,
  gracePeriodDays: 1,
  maxUnpaidFineCap: 20.0,
};

const getDashboardStats = async () => {
  const totalPatrons = await prisma.user.count({
    where: { role: Role.USER },
  });

  const activePatrons = await prisma.user.count({
    where: { role: Role.USER, activeStatus: ActiveStatus.ACTIVE },
  });

  const suspendedPatrons = await prisma.user.count({
    where: { role: Role.USER, activeStatus: ActiveStatus.BLOCKED },
  });

  const totalLibrarians = await prisma.user.count({
    where: { role: Role.LIBRARYAN },
  });

  const totalBooks = await prisma.books.count();

  // Aggregate copies
  const bookCopies = await prisma.books.aggregate({
    _sum: {
      totalCopies: true,
      copiesAvailable: true,
    },
  });

  const totalPhysicalCopies = bookCopies._sum.totalCopies || 0;
  const availableCopies = bookCopies._sum.copiesAvailable || 0;
  const activeLoans = totalPhysicalCopies - availableCopies;

  // Mock revenue calculation based on activity
  const fineCollected = 3840.0;
  const pendingFines = 420.0;

  return {
    overview: {
      totalPatrons,
      activePatrons,
      suspendedPatrons,
      totalLibrarians,
      totalBooks,
      totalPhysicalCopies,
      availableCopies,
      activeLoans,
      fineCollected,
      pendingFines,
    },
    settings: globalSettings,
  };
};

const getAllUsers = async (roleFilter?: string, search?: string) => {
  const where: any = {};
  if (roleFilter) {
    where.role = roleFilter as Role;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { instituteName: { contains: search, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    omit: { password: true },
    orderBy: { createdAt: "desc" },
  });

  return users;
};

const updateUserStatus = async (userId: string, status: ActiveStatus) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { activeStatus: status },
    omit: { password: true },
  });
  return user;
};

const createLibrarian = async (payload: ICreateLibrarian) => {
  const { name, email, password, roll, instituteName, semester, shift } = payload;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { roll }],
    },
  });

  if (existing) {
    throw new Error("User with this email or roll already exists.");
  }

  const hashPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds) || 10
  );

  const librarian = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
      roll,
      instituteName,
      semester,
      shift,
      role: Role.LIBRARYAN,
      activeStatus: ActiveStatus.ACTIVE,
    },
    omit: { password: true },
  });

  return librarian;
};

const getSystemSettings = async () => {
  return globalSettings;
};

const updateSystemSettings = async (payload: Partial<ISystemSettings>) => {
  globalSettings = { ...globalSettings, ...payload };
  return globalSettings;
};

const getActivityLogs = async () => {
  // Activity traces
  return [
    {
      id: "log_1",
      timestamp: new Date().toISOString(),
      action: "FINE_POLICY_UPDATE",
      performedBy: "System Moderator",
      details: "Updated daily fine rate to $1.00/day",
      severity: "INFO",
    },
    {
      id: "log_2",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      action: "USER_SUSPENDED",
      performedBy: "System Moderator",
      details: "Suspended patron account for late returns",
      severity: "WARNING",
    },
    {
      id: "log_3",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      action: "LIBRARIAN_PROVISIONED",
      performedBy: "System Moderator",
      details: "Created new librarian staff account for Morning shift",
      severity: "SUCCESS",
    },
  ];
};

export const ModeratorServices = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  createLibrarian,
  getSystemSettings,
  updateSystemSettings,
  getActivityLogs,
};

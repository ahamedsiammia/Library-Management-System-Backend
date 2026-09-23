import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../users/user.interface";
import { ICreateNotice, IUpdateNotice } from "./notice.interface";

const createNotice = async (user: IRequestUser, payload: ICreateNotice) => {
  const isAdminOrLibrarian = user.role === "ADMIN" || user.role === "LIBRARIAN";

  if (!isAdminOrLibrarian) {
    throw new Error("Only Admin or Librarian can create notices");
  }

  const result = await prisma.notice.create({
    data: {
      ...payload,
      createdBy: user.id,
    },
  });

  return result;
};

const getAllNotices = async (user: IRequestUser) => {
  const isAdminOrLibrarian = user.role === "ADMIN" || user.role === "LIBRARIAN";

  const notices = await prisma.notice.findMany({
    where: isAdminOrLibrarian ? {} : { visibility: "PUBLIC" },
    orderBy: { createdAt: "desc" },
  });

  return notices;
};

const updateNotice = async (user: IRequestUser,noticeId: string,payload: IUpdateNotice,) => {
  const isAdminOrLibrarian = user.role === "ADMIN" || user.role === "LIBRARIAN";

  if (!isAdminOrLibrarian) {
    throw new Error("Only Admin or Librarian can update notices");
  }

  const notice = await prisma.notice.findUnique({
    where: { id: noticeId },
  });

  if (!notice) {
    throw new Error("Notice Not Found");
  }

  const result = await prisma.notice.update({
    where: { id: noticeId },
    data: payload,
  });

  return result;
};

const deleteNotice = async (user: IRequestUser, noticeId: string) => {
  const isAdminOrLibrarian = user.role === "ADMIN" || user.role === "LIBRARIAN";

  if (!isAdminOrLibrarian) {
    throw new Error("Only Admin or Librarian can delete notices");
  }

  const notice = await prisma.notice.findUnique({
    where: { id: noticeId },
  });

  if (!notice) {
    throw new Error("Notice Not Found");
  }

  await prisma.notice.delete({
    where: { id: noticeId },
  });

  return { message: "Notice deleted successfully" };
};

export const noticeService = {
  createNotice,
  getAllNotices,
  updateNotice,
  deleteNotice,
};

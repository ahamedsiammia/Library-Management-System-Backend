import { prisma } from "../../lib/prisma";

const AllLibrarian = async () => {
  const librarian = await prisma.user.findMany({
    where: {
      role: "LIBRARIAN",
    },
    omit: {
      password: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return librarian;
};

export const adminService = {
  AllLibrarian,
};

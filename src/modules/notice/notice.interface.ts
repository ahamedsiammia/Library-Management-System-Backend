import { NoticeVisibility } from "../../../generated/prisma/enums";

export interface ICreateNotice {
  title: string;
  description: string;
  visibility?: NoticeVisibility;
}

export interface IUpdateNotice {
  title?: string;
  description?: string;
  visibility?: NoticeVisibility;
}
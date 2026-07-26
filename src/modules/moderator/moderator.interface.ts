import { ActiveStatus, Role, Shift } from "../../../generated/prisma/enums";

export interface IUpdateUserStatus {
  status: ActiveStatus;
}

export interface ICreateLibrarian {
  name: string;
  email: string;
  password: string;
  roll: number;
  instituteName: string;
  semester: string;
  shift: string;
}

export interface ISystemSettings {
  maxBorrowLimit: number;
  borrowDurationDays: number;
  finePerDay: number;
  gracePeriodDays: number;
  maxUnpaidFineCap: number;
}

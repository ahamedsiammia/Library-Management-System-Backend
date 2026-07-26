import { Role, Shift } from "../../../generated/prisma/enums"

 export interface Iuser {
    name : string
    email : string
    password : string
    roll : number
    instituteName : string
    semester : string
    shift : string
}


export interface ILoin {
    email : string
    password : string
}


export interface jwtPayload {
      name : string
      id : string
      instituteName : string
      shift : Shift
      role : Role
      roll : number
  };
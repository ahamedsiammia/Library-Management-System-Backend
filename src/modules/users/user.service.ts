import jwt, { SignOptions } from "jsonwebtoken";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { IGoogleLoinPayload, ILoin, Iuser, jwtPayload } from "./user.interface";
import bcrypt from "bcrypt";
import { createToken } from "../../utils/token";
import { TokenPayload } from "google-auth-library";
import { googleClient } from "../../lib/googleAuth";
import { ActiveStatus, authProvider, Role } from "../../../generated/prisma/enums";

const createUserIntoDB = async (payload: Iuser) => {
  const { name, email, password, instituteName, roll, semester, shift } =
    payload;

  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    throw new Error("An account with this email already exists.");
  }

  const existingRoll = await prisma.user.findUnique({
    where: { roll },
  });

  if (existingRoll) {
    throw new Error("This roll number is already registered.");
  }

  const hashPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createuser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
      instituteName,
      roll,
      semester,
      shift,
    },
    omit: {
      password: true,
    },
  });

  return createuser;
};


const loginUserIntoDB = async(payload:ILoin)=>{
  const {email,password} = payload;

  const isExistUser = await prisma.user.findUnique({
    where : {
      email
    }
  });

  if(!isExistUser){
    throw new Error("An account with this email not exists.")
  }

  const hashPassword = isExistUser.password as string

  const isCheckPassword = await bcrypt.compare(password,hashPassword);

  if(!isCheckPassword){
    throw new Error("Incorrect password.")
  }

  const {id,instituteName,role,shift,name,activeStatus,createdAt,roll,semester,updatedAt} = isExistUser

  const user ={
    id,
    instituteName,
    role,
    shift,
    name,
    activeStatus,
    createdAt,
    roll,
    semester,
    updatedAt 
  }

  const jwtPayload = {
      name ,
      id,
      instituteName,
      shift,
      role,
      roll
  };

  const accessToken = await createToken(jwtPayload as  jwtPayload,config.jwt_access_secret as string,config.jwt_access_expires_in as SignOptions)

  const refreshToken = await createToken(jwtPayload as  jwtPayload,config.jwt_refresh_secret as string,config.jwt_refresh_expires_in as SignOptions)

  return {...user,accessToken,refreshToken}
}

const getAllUser = async () => {
  const user = await prisma.user.findMany();
  return { user };
};

const googleLoin = async (payload: IGoogleLoinPayload) => {
	let googleIdTokenPayload: TokenPayload | null | undefined = null;

	try {
		const ticket = await googleClient.verifyIdToken({
			idToken: payload.idToken,
			audience: config.google_client_id,
		});

		googleIdTokenPayload = ticket.getPayload();
	} catch (error) {
		console.log("Google Id Toke  Verification Filed", error);
		throw new Error("Invalid or Expired Google Id or Token");
	}

	if (!googleIdTokenPayload) {
		throw new Error("Invalid or Expired Google Id or Token");
	}

	const isUserExitsWithGoogleAuth = await prisma.user.findUnique({
		where: {
			email: googleIdTokenPayload.email,
			role: Role.USER,
			googleId: googleIdTokenPayload.sub,
		},
	});

	if (!googleIdTokenPayload.email) {
		throw new Error("Google Email Not Found");
	}
	if (!googleIdTokenPayload.name) {
		throw new Error("Google User Name Not Found");
	}

	let user = isUserExitsWithGoogleAuth;

	if (!isUserExitsWithGoogleAuth) {
		const isUserExitsWithCredential = await prisma.user.findUnique({
			where: {
				email: googleIdTokenPayload.email,
				role: Role.USER,
				authProvider: authProvider.CREDENTIAL,
			},
		});

		if (isUserExitsWithCredential) {
			if (!isUserExitsWithCredential.emailVerified) {
				throw new Error("Email Not Verified");
			}

			if (isUserExitsWithCredential.activeStatus === ActiveStatus.BLOCKED) {
				throw new Error("User is BLOCKED");
			}

			user = await prisma.user.update({
				where: {
					id: isUserExitsWithCredential.id,
				},
				data: {
					googleId: googleIdTokenPayload.sub,
				},
			});
		} else {
			// google register
			user = await prisma.user.create({
				data: {
					name: googleIdTokenPayload.name,
					email: googleIdTokenPayload.email,
					role: Role.USER,
					googleId: googleIdTokenPayload.sub,
					authProvider: authProvider.GOOGLE,
					emailVerified: true,
				}
			});
		}
	}

	if (!user) {
		throw new Error("User Not Found");
	}

	if (user.activeStatus === ActiveStatus.BLOCKED) {
		throw new Error("User is BLOCKED");
	}

    const jwtPayload = {
      name : user.name ,
      id :user.id,
      instituteName : user.instituteName,
      shift : user.shift,
      role : user.role,
      roll : user.roll
  };

  const accessToken = await createToken(jwtPayload as  jwtPayload,config.jwt_access_secret as string,config.jwt_access_expires_in as SignOptions)

  const refreshToken = await createToken(jwtPayload as  jwtPayload,config.jwt_refresh_secret as string,config.jwt_refresh_expires_in as SignOptions)


	return {
		accessToken,
		refreshToken,
	};
};


export const userService = {
  createUserIntoDB,
  loginUserIntoDB,
  getAllUser,
  googleLoin
};

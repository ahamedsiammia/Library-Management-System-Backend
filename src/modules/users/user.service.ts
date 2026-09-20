import jwt, { SignOptions } from "jsonwebtoken";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { IGoogleLoinPayload, ILoin, Iuser, jwtPayload } from "./user.interface";
import bcrypt from "bcrypt";
import { createToken } from "../../utils/token";
import { TokenPayload } from "google-auth-library";
import { googleClient } from "../../lib/googleAuth";
import { ActiveStatus, authProvider, Role } from "../../../generated/prisma/enums";
import { redisClient } from "../../lib/redis";
import crypto from "crypto"
import { transporter } from "../../lib/nodemailer";

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


  const otpKey = `Register-otp-key:${email}`;
	const otpValue = crypto.randomInt(111111,1000000)

	
	await redisClient.set(otpKey,otpValue,{
		expiration : {
			type : "EX",
			value : 5 * 60
		}
	});

  	const registerDataKey =`Register-Data-key:${email}`;

	const registerDataPayload ={
      name,
      email,
      password: hashPassword,
      instituteName,
      roll,
      semester,
      shift,
    }

	await redisClient.set(registerDataKey,JSON.stringify(registerDataPayload),{
		expiration : {
			type : "EX",
			value : 5 * 60
		}
	});

await transporter.sendMail({
  from: config.email_sender,
  to: email,
  subject: "Verify Your Email | Library Management System",
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email Verification</title>
    </head>

    <body style="
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: Arial, Helvetica, sans-serif;
      color: #334155;
    ">

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background-color: #f1f5f9; padding: 40px 15px;"
      >
        <tr>
          <td align="center">

            <!-- Main Container -->
            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                max-width: 600px;
                background-color: #ffffff;
                border-radius: 18px;
                overflow: hidden;
                box-shadow: 0 10px 35px rgba(15, 23, 42, 0.08);
              "
            >

              <!-- Header -->
              <tr>
                <td
                  align="center"
                  style="
                    background: linear-gradient(
                      135deg,
                      #00bba6,
                      #0d9488
                    );
                    padding: 32px 25px;
                  "
                >

                  <div style="
                    width: 58px;
                    height: 58px;
                    line-height: 58px;
                    background-color: rgba(255,255,255,0.18);
                    border-radius: 16px;
                    margin: 0 auto 14px;
                    font-size: 28px;
                  ">
                    📚
                  </div>

                  <h1 style="
                    margin: 0;
                    color: #ffffff;
                    font-size: 25px;
                    font-weight: 700;
                  ">
                   Library Management System
                  </h1>

                  <p style="
                    margin: 8px 0 0;
                    color: rgba(255,255,255,0.9);
                    font-size: 14px;
                  ">
                    Your gateway to knowledge
                  </p>

                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 35px 30px;">

                  <h2 style="
                    margin: 0 0 12px;
                    color: #0f172a;
                    font-size: 22px;
                  ">
                    Verify Your Email Address
                  </h2>

                  <p style="
                    margin: 0 0 18px;
                    font-size: 15px;
                    line-height: 1.7;
                    color: #64748b;
                  ">
                    Thank you for creating an account with
                    <strong style="color:#0f766e;">
                      Library Management System
                    </strong>.
                    Please use the verification code below to verify your
                    email address and activate your account.
                  </p>

                  <!-- Bengali Message -->
                  <p style="
                    margin: 0 0 25px;
                    font-size: 14px;
                    line-height: 1.7;
                    color: #64748b;
                  ">
                    আপনার ইমেইল ঠিকানা যাচাই করতে নিচের
                    verification code টি ব্যবহার করুন।
                  </p>

                  <!-- Verification Code -->
                  <div style="
                    background-color: #f0fdfa;
                    border: 1px dashed #2dd4bf;
                    border-radius: 14px;
                    padding: 22px;
                    text-align: center;
                    margin: 25px 0;
                  ">

                    <p style="
                      margin: 0 0 8px;
                      font-size: 12px;
                      font-weight: 600;
                      text-transform: uppercase;
                      letter-spacing: 1.5px;
                      color: #0f766e;
                    ">
                      Verification Code
                    </p>

                    <div style="
                      font-size: 32px;
                      font-weight: 700;
                      letter-spacing: 8px;
                      color: #0f766e;
                    ">
                      ${otpValue}
                    </div>

                  </div>

                  <!-- Expiration -->
                  <div style="
                    background-color: #fff7ed;
                    border-radius: 10px;
                    padding: 12px 15px;
                    margin-bottom: 25px;
                  ">

                    <p style="
                      margin: 0;
                      font-size: 13px;
                      color: #9a3412;
                      text-align: center;
                    ">
                      This verification code will expire in
                      <strong>5 minutes</strong>.
                    </p>

                  </div>

                  <p style="
                    margin: 0;
                    font-size: 14px;
                    line-height: 1.7;
                    color: #64748b;
                  ">
                    If you did not create this account, you can safely
                    ignore this email.
                  </p>

                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding: 0 35px;">
                  <div style="
                    height: 1px;
                    background-color: #e2e8f0;
                  "></div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td
                  align="center"
                  style="
                    padding: 25px 30px 30px;
                    background-color: #f8fafc;
                  "
                >

                  <p style="
                    margin: 0 0 8px;
                    font-size: 13px;
                    color: #64748b;
                  ">
                    Thank you for joining our library community.
                  </p>

                  <p style="
                    margin: 0;
                    font-size: 12px;
                    color: #94a3b8;
                  ">
                    © ${new Date().getFullYear()} Library Management System.
                    All rights reserved.
                  </p>

                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
  `,
});

  // const createuser = await prisma.user.create({
  //   data: {
  //     name,
  //     email,
  //     password: hashPassword,
  //     instituteName,
  //     roll,
  //     semester,
  //     shift,
  //   },
  //   omit: {
  //     password: true,
  //   },
  // });

  return null;
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

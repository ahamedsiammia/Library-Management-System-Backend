import jwt, { SignOptions } from "jsonwebtoken";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { IEmailVerification, IForgotPassword, IGoogleLoinPayload, ILoin, IRequestUser, IResetPassword, IUpdateUserProfile, Iuser, jwtPayload } from "./user.interface";
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
    password as string,
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


  return null;
};

const emailVerification = async (payload:IEmailVerification)=>{
	const {email,otp}=payload;

	const isUserExists = await prisma.user.findUnique({
		where : {
			email
		}
	});

	if(isUserExists){
		throw new Error("User Dose Not Exist")
	};

	const key = `Register-otp-key:${email}`

	const redisOtp = await redisClient.get(key);


	if(!redisOtp){
		throw new Error("Invalid OTP")
	}

	if(redisOtp !== otp){
		throw new Error("Dose Not Match OTP")
	}

	await redisClient.del([key]);

	const registerDataKey =`Register-Data-key:${email}`;

	const registerDataPayload = await redisClient.get(registerDataKey);

	const registerUserData:Iuser = JSON.parse(registerDataPayload as string);
	

	if(!registerUserData){
		throw new Error("User Data Not Exist")
	}


  const createdUser = await prisma.user.create({
    data: {
      name : registerUserData.name,
      email : registerUserData.email,
      password: registerUserData.password,
      instituteName : registerUserData.instituteName,
      roll : registerUserData.roll,
      semester : registerUserData.semester,
      shift :registerUserData.shift,
      emailVerified : true
    },
    omit: {
      password: true,
    },
  });


	const { ...user } = createdUser;
  const jwtPayload = {
      name : registerUserData.name,
      email : registerUserData.email,
      instituteName : registerUserData.instituteName,
      roll : registerUserData.roll,
      semester : registerUserData.semester,
      shift :registerUserData.shift,
      role : Role.USER
  };

	await redisClient.del([registerDataKey])



  const accessToken = await createToken(jwtPayload as  jwtPayload,config.jwt_access_secret as string,config.jwt_access_expires_in as SignOptions)

  const refreshToken = await createToken(jwtPayload as  jwtPayload,config.jwt_refresh_secret as string,config.jwt_refresh_expires_in as SignOptions)



await transporter.sendMail({
  from: config.email_sender,
  to: email,
  subject: "Welcome to Library Management System",
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      />
      <title>Welcome to Library Management System</title>
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
        style="
          background-color: #f1f5f9;
          padding: 40px 15px;
        "
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
                border-radius: 20px;
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
                    padding: 38px 25px;
                  "
                >

                  <div style="
                    width: 64px;
                    height: 64px;
                    line-height: 64px;
                    background-color: rgba(255,255,255,0.18);
                    border-radius: 18px;
                    margin: 0 auto 15px;
                    font-size: 30px;
                  ">
                    📚
                  </div>

                  <h1 style="
                    margin: 0;
                    color: #ffffff;
                    font-size: 26px;
                    font-weight: 700;
                  ">
                    Library Management System
                  </h1>

                  <p style="
                    margin: 10px 0 0;
                    color: rgba(255,255,255,0.9);
                    font-size: 14px;
                  ">
                    Manage. Discover. Learn.
                  </p>

                </td>
              </tr>

              <!-- Welcome Content -->
              <tr>
                <td style="padding: 40px 35px 30px;">

                  <p style="
                    margin: 0 0 8px;
                    font-size: 15px;
                    color: #64748b;
                  ">
                    Hello,
                  </p>

                  <h2 style="
                    margin: 0 0 18px;
                    color: #0f172a;
                    font-size: 25px;
                    line-height: 1.3;
                  ">
                    Welcome to our Library!
                  </h2>

                  <p style="
                    margin: 0 0 18px;
                    font-size: 15px;
                    line-height: 1.8;
                    color: #64748b;
                  ">
                    We're happy to have you with us. Your account has
                    been successfully created, and you can now explore
                    everything our
                    <strong style="color: #0f766e;">
                      Library Management System
                    </strong>
                    has to offer.
                  </p>

                  <p style="
                    margin: 0 0 28px;
                    font-size: 14px;
                    line-height: 1.8;
                    color: #64748b;
                  ">
                    আমাদের লাইব্রেরিতে আপনাকে স্বাগতম।
                    এখন আপনি সহজেই বই খুঁজে দেখতে, বই সম্পর্কে
                    বিস্তারিত জানতে এবং আপনার library activities
                    পরিচালনা করতে পারবেন।
                  </p>

                  <!-- Features -->
                  <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                  >

                    <tr>
                      <td style="
                        padding: 15px;
                        background-color: #f0fdfa;
                        border-radius: 12px;
                      ">

                        <table
                          cellpadding="0"
                          cellspacing="0"
                          border="0"
                        >
                          <tr>

                            <td
                              valign="top"
                              style="
                                width: 40px;
                                font-size: 22px;
                              "
                            >
                              📖
                            </td>

                            <td>
                              <strong style="
                                color: #0f172a;
                                font-size: 14px;
                              ">
                                Explore Books
                              </strong>

                              <p style="
                                margin: 5px 0 0;
                                color: #64748b;
                                font-size: 13px;
                                line-height: 1.5;
                              ">
                                Discover books from different
                                categories and subjects.
                              </p>
                            </td>

                          </tr>
                        </table>

                      </td>
                    </tr>

                    <tr>
                      <td style="height: 10px;"></td>
                    </tr>

                    <tr>
                      <td style="
                        padding: 15px;
                        background-color: #f0fdfa;
                        border-radius: 12px;
                      ">

                        <table
                          cellpadding="0"
                          cellspacing="0"
                          border="0"
                        >
                          <tr>

                            <td
                              valign="top"
                              style="
                                width: 40px;
                                font-size: 22px;
                              "
                            >
                              🔎
                            </td>

                            <td>
                              <strong style="
                                color: #0f172a;
                                font-size: 14px;
                              ">
                                Find What You Need
                              </strong>

                              <p style="
                                margin: 5px 0 0;
                                color: #64748b;
                                font-size: 13px;
                                line-height: 1.5;
                              ">
                                Search and find your favorite books
                                quickly and easily.
                              </p>
                            </td>

                          </tr>
                        </table>

                      </td>
                    </tr>

                    <tr>
                      <td style="height: 10px;"></td>
                    </tr>

                    <tr>
                      <td style="
                        padding: 15px;
                        background-color: #f0fdfa;
                        border-radius: 12px;
                      ">

                        <table
                          cellpadding="0"
                          cellspacing="0"
                          border="0"
                        >
                          <tr>

                            <td
                              valign="top"
                              style="
                                width: 40px;
                                font-size: 22px;
                              "
                            >
                              🎓
                            </td>

                            <td>
                              <strong style="
                                color: #0f172a;
                                font-size: 14px;
                              ">
                                Keep Learning
                              </strong>

                              <p style="
                                margin: 5px 0 0;
                                color: #64748b;
                                font-size: 13px;
                                line-height: 1.5;
                              ">
                                Make reading and learning a regular
                                part of your journey.
                              </p>
                            </td>

                          </tr>
                        </table>

                      </td>
                    </tr>

                  </table>

                  <!-- CTA -->
                  <div style="
                    text-align: center;
                    margin: 30px 0 10px;
                  ">

                    <a
                      href="${"Making Loading...."}"
                      style="
                        display: inline-block;
                        padding: 13px 28px;
                        background-color: #00bba6;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 10px;
                        font-size: 14px;
                        font-weight: 600;
                      "
                    >
                      Explore Library →
                    </a>

                  </div>

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
                    color: #64748b;
                    font-size: 13px;
                  ">
                    Happy Reading & Keep Learning!
                  </p>

                  <p style="
                    margin: 0 0 10px;
                    color: #94a3b8;
                    font-size: 12px;
                  ">
                    You received this email because an account
                    was created using this email address.
                  </p>

                  <p style="
                    margin: 0;
                    color: #94a3b8;
                    font-size: 12px;
                  ">
                    © ${new Date().getFullYear()}
                    Library Management System.
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


	return {
		user,
	accessToken,
		refreshToken,
	};

}

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


const forgotPassword =async(payload : IForgotPassword)=>{
	const {email} = payload;

	const isUserExists = await prisma.user.findUnique({
		where : {
			email : email
		}
	});

	if(!isUserExists){
		throw new Error("User Dose not Exist!")
	};

	if(!isUserExists.emailVerified){
		throw new Error("User Not Verified")
	}

	if(isUserExists.activeStatus === "BLOCKED"){
		throw new Error("User is Blocked")
	};



	if(isUserExists.googleId &&isUserExists.authProvider === "GOOGLE"){
		throw new Error("User Has Account With Google")
	}


	const otp = crypto.randomInt(100000,1000000)

	const key = `forgot-password-key : ${isUserExists.email}`;

	await redisClient.set(key,otp,{
		expiration : {
			type : "EX",
			value : 5*60
		}
	})

	// send a otp with user mail

await transporter.sendMail({
  from: config.email_sender,
  to: email,
  subject: "Reset Your Password | Library Management System",
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      />
      <title>Password Reset</title>
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
        style="
          background-color: #f1f5f9;
          padding: 40px 15px;
        "
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
                border-radius: 20px;
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
                    padding: 35px 25px;
                  "
                >

                  <div style="
                    width: 62px;
                    height: 62px;
                    line-height: 62px;
                    background-color: rgba(255,255,255,0.18);
                    border-radius: 18px;
                    margin: 0 auto 14px;
                    font-size: 28px;
                  ">
                    🔐
                  </div>

                  <h1 style="
                    margin: 0;
                    color: #ffffff;
                    font-size: 24px;
                    font-weight: 700;
                  ">
                    Library Management System
                  </h1>

                  <p style="
                    margin: 8px 0 0;
                    color: rgba(255,255,255,0.9);
                    font-size: 14px;
                  ">
                    Account Security
                  </p>

                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 35px 30px;">

                  <h2 style="
                    margin: 0 0 14px;
                    color: #0f172a;
                    font-size: 23px;
                  ">
                    Reset Your Password
                  </h2>

                  <p style="
                    margin: 0 0 18px;
                    color: #64748b;
                    font-size: 15px;
                    line-height: 1.8;
                  ">
                    We received a request to reset the password
                    for your Library Management System account.
                  </p>

                  <p style="
                    margin: 0 0 25px;
                    color: #64748b;
                    font-size: 14px;
                    line-height: 1.8;
                  ">
                    আপনার password reset করার জন্য নিচের
                    verification code টি ব্যবহার করুন।
                  </p>

                  <!-- OTP Box -->
                  <div style="
                    background-color: #f0fdfa;
                    border: 1px dashed #2dd4bf;
                    border-radius: 14px;
                    padding: 23px 20px;
                    text-align: center;
                    margin: 25px 0;
                  ">

                    <p style="
                      margin: 0 0 9px;
                      color: #0f766e;
                      font-size: 12px;
                      font-weight: 700;
                      text-transform: uppercase;
                      letter-spacing: 1.5px;
                    ">
                      Password Reset Code
                    </p>

                    <div style="
                      color: #0f766e;
                      font-size: 32px;
                      font-weight: 700;
                      letter-spacing: 8px;
                    ">
                      ${otp}
                    </div>

                  </div>

                  <!-- Expiration -->
                  <div style="
                    background-color: #fff7ed;
                    border-radius: 10px;
                    padding: 13px 15px;
                    margin-bottom: 25px;
                    text-align: center;
                  ">

                    <p style="
                      margin: 0;
                      color: #9a3412;
                      font-size: 13px;
                      line-height: 1.5;
                    ">
                      This code will expire in
                      <strong>5 minutes</strong>.
                    </p>

                  </div>

                  <!-- Security Notice -->
                  <div style="
                    background-color: #f8fafc;
                    border-left: 4px solid #00bba6;
                    padding: 14px 16px;
                    margin-bottom: 25px;
                  ">

                    <p style="
                      margin: 0;
                      color: #64748b;
                      font-size: 13px;
                      line-height: 1.7;
                    ">
                      <strong style="color: #334155;">
                        Security Notice:
                      </strong>
                      Never share this verification code with anyone.
                      Our team will never ask you for this code.
                    </p>

                  </div>

                  <p style="
                    margin: 0;
                    color: #64748b;
                    font-size: 14px;
                    line-height: 1.7;
                  ">
                    If you didn't request a password reset, you can
                    safely ignore this email. Your account will remain
                    secure.
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
                    color: #64748b;
                    font-size: 13px;
                  ">
                    Need help? Contact our support team.
                  </p>

                  <p style="
                    margin: 0;
                    color: #94a3b8;
                    font-size: 12px;
                  ">
                    © ${new Date().getFullYear()}
                    Library Management System.
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
}


const resetPassword =async(payload:IResetPassword)=>{
		const {email,otp,newPassword} = payload;

	const isUserExists = await prisma.user.findUnique({
		where : {
			email : email
		}
	});

	if(!isUserExists){
		throw new Error("User Dose not Exist!")
	};

	if(!isUserExists.emailVerified){
		throw new Error("User Not Verified")
	}

	if(isUserExists.activeStatus === "BLOCKED"){
		throw new Error("User is Blocked")
	};


	if(isUserExists.googleId &&isUserExists.authProvider === "GOOGLE"){
		throw new Error("User Has Account With Google")
	}

	const key = `forgot-password-key : ${isUserExists.email}`;

	const redisOtp =await redisClient.get(key);

	if(!redisOtp){
		throw new Error("Invalid OTP")
	};

	if(redisOtp !== otp){
		throw new Error("OTP DOSE NOT MATCH")
	};

	const hashedPassword = await bcrypt.hash(newPassword,10);

	const updateUser = await prisma.user.update({
		where : {
			email : isUserExists.email
		},
		data : {
			password : hashedPassword
		}
	});

	await redisClient.del([key])

  await transporter.sendMail({
  from: config.email_sender,
  to: email,
  subject: "Password Reset Successful | Library Management System",
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      />
      <title>Password Reset Successful</title>
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
        style="
          background-color: #f1f5f9;
          padding: 40px 15px;
        "
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
                border-radius: 20px;
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
                    padding: 38px 25px;
                  "
                >

                  <!-- Success Icon -->
                  <div style="
                    width: 68px;
                    height: 68px;
                    line-height: 68px;
                    background-color: rgba(255,255,255,0.18);
                    border-radius: 50%;
                    margin: 0 auto 16px;
                    font-size: 30px;
                  ">
                    ✓
                  </div>

                  <h1 style="
                    margin: 0;
                    color: #ffffff;
                    font-size: 25px;
                    font-weight: 700;
                  ">
                    Password Reset Successful
                  </h1>

                  <p style="
                    margin: 9px 0 0;
                    color: rgba(255,255,255,0.9);
                    font-size: 14px;
                  ">
                    Library Management System
                  </p>

                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 35px 30px;">

                  <h2 style="
                    margin: 0 0 16px;
                    color: #0f172a;
                    font-size: 23px;
                  ">
                    Your password has been updated
                  </h2>

                  <p style="
                    margin: 0 0 18px;
                    color: #64748b;
                    font-size: 15px;
                    line-height: 1.8;
                  ">
                    Your password for the
                    <strong style="color: #0f766e;">
                      Library Management System
                    </strong>
                    account has been successfully changed.
                  </p>

                  <p style="
                    margin: 0 0 28px;
                    color: #64748b;
                    font-size: 14px;
                    line-height: 1.8;
                  ">
                    আপনার অ্যাকাউন্টের password সফলভাবে পরিবর্তন করা হয়েছে।
                    এখন থেকে আপনার নতুন password ব্যবহার করে account-এ
                    login করতে পারবেন।
                  </p>

                  <!-- Success Box -->
                  <div style="
                    background-color: #f0fdfa;
                    border: 1px solid #99f6e4;
                    border-radius: 14px;
                    padding: 20px;
                    margin-bottom: 25px;
                  ">

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                    >
                      <tr>

                        <td
                          valign="top"
                          style="
                            width: 42px;
                            font-size: 25px;
                          "
                        >
                          ✓
                        </td>

                        <td>

                          <p style="
                            margin: 0 0 5px;
                            color: #0f766e;
                            font-size: 15px;
                            font-weight: 700;
                          ">
                            Password Updated Successfully
                          </p>

                          <p style="
                            margin: 0;
                            color: #64748b;
                            font-size: 13px;
                            line-height: 1.6;
                          ">
                            Your account is ready to use with your
                            new password.
                          </p>

                        </td>

                      </tr>
                    </table>

                  </div>

                  <!-- Security Notice -->
                  <div style="
                    background-color: #fff7ed;
                    border-left: 4px solid #f97316;
                    padding: 15px 16px;
                    margin-bottom: 28px;
                  ">

                    <p style="
                      margin: 0;
                      color: #9a3412;
                      font-size: 13px;
                      line-height: 1.7;
                    ">
                      <strong>Security Notice:</strong>
                      If you did not make this change, please contact
                      our support team immediately and secure your
                      account.
                    </p>

                  </div>

                  <!-- CTA -->
                  <div style="
                    text-align: center;
                    margin: 10px 0 5px;
                  ">

                    <a
                      href="${"Making Loading..."}/login"
                      style="
                        display: inline-block;
                        padding: 13px 30px;
                        background-color: #00bba6;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 10px;
                        font-size: 14px;
                        font-weight: 600;
                      "
                    >
                      Login to Your Account →
                    </a>

                  </div>

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
                    color: #64748b;
                    font-size: 13px;
                  ">
                    Thank you for using our Library Management System.
                  </p>

                  <p style="
                    margin: 0;
                    color: #94a3b8;
                    font-size: 12px;
                  ">
                    © ${new Date().getFullYear()}
                    Library Management System.
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
}


const UpdateProfile =async(id:string,payload:IUpdateUserProfile)=>{
  
  const result = await prisma.user.update({
    where: {
      id
    },
    data: payload,
    omit :{
      password : true
    }
  });

  return result;
}

const setPassword = async (user: IRequestUser, newPassword: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!existingUser) {
    throw new Error("User Not Found");
  }

  if (existingUser.password) {
    throw new Error("Password already set. Use change password instead");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const result = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
    },
    omit : {
      password : true
    }
  });

  return result;
};

const getMe = async(user : IRequestUser)=>{
  const {id} = user;
  const findUser = await prisma.user.findUnique({
    where : {
      id : id
    }
  });

  if(!findUser){
    throw new Error("User not Found")
  };

  return findUser
}


export const userService = {
  createUserIntoDB,
  loginUserIntoDB,
  getAllUser,
  googleLoin,
  emailVerification,
  forgotPassword,
  resetPassword,
  UpdateProfile,
  setPassword,
  getMe
};

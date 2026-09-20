import dotenv from "dotenv"
import path from "path"

dotenv.config({path:path.join(process.cwd(),".env")});


export default {
    port : process.env.PORT,
    app_url : process.env.APP_URL,
    database_url : process.env.DATABASE_URL,
    bcrypt_salt_rounds : process.env.BCRYPT_SALT_ROUNDS,
    jwt_access_secret : process.env.JWT_ACCESS_SECRET,
    jwt_refresh_secret  : process.env.JWT_REFRESH_SECRET,
    jwt_access_expires_in :process.env.JWT_ACCESS_EXPIRES_IN ,
    jwt_refresh_expires_in   : process.env.JWT_REFRESH_EXPIRES_IN,
    gemini_api_key : process.env.GEMINI_API_KEY,

    google_client_id: process.env.GOOGLE_CLIENT_ID!,

    redis_userName :process.env.REDIS_USERNAME,
	redis_password : process.env.REDIS_PASSWORD,
	redis_host : process.env.REDIS_HOST,
	redis_port : process.env.REDIS_PORT,

    email_sender : process.env.EMAIL_SENDER,
	smtp_user : process.env.SMTP_USER,
	smtp_password : process.env.SMTP_PASSWORD
}
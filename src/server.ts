import app from "./app";
import config from "./config";
import { transporter } from "./lib/nodemailer";
import { prisma } from "./lib/prisma";
import { redisClient } from "./lib/redis";


// async function main() {
//     try {
//         await prisma.$connect();
//         console.log("Connected to The Database Successfully");
//         await redisClient.connect();
// 		console.log("Redis connect Successfully");

// 		await transporter.verify();
// 		console.log("NodeMailer Connected Successfully");

        
//     app.listen(config.port,()=>{
//         console.log(`server on running port ${config.port}`);
//     })
//     } catch (error) {
//         console.log("Error starting the server",error);
//         await prisma.$disconnect();
//         process.exit(1);
//     }
// };

// main();

export default app
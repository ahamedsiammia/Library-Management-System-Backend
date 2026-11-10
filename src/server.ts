import app from "./app";
import config from "./config";
import { transporter } from "./lib/nodemailer";
import { prisma } from "./lib/prisma";
import { redisClient } from "./lib/redis";


async function main() {
    try {
        await prisma.$connect();
        console.log("Connected to The Database Successfully");

        try {
            await redisClient.connect();
            console.log("Redis connected Successfully");
        } catch (redisError: any) {
            console.warn("⚠️ Warning: Redis connection failed:", redisError?.message || redisError);
        }

        try {
            await transporter.verify();
            console.log("NodeMailer Connected Successfully");
        } catch (mailError: any) {
            console.warn("⚠️ Warning: NodeMailer connection failed:", mailError?.message || mailError);
        }

        const port = Number(config.port) || 5000;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.log("Error starting the server", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();

export default app
import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";


async function main() {
    try {
        await prisma.$connect();
        console.log("Connected to The Database Successfully");
        
    app.listen(config.port,()=>{
        console.log(`server on running port ${config.port}`);
    })
    } catch (error) {
        console.log("Error starting the server",error);
        await prisma.$disconnect();
        process.exit(1);
    }
};

main();
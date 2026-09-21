import { prisma } from "../../lib/prisma"

const AllLibrarian =async()=>{
    const librarian = await prisma.user.findMany({
        where : {
            role : "LIBRARIAN"
        }
    });

    if(!librarian){
        throw new Error("Librarian")
    };

    return librarian
};


export const adminService = {
    AllLibrarian
}


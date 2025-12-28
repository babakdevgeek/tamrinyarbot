import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client.js";
let prisma;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient({ adapter });
}
else {
    if (!global.prisma) {
        global.prisma = new PrismaClient({ adapter });
    }
    prisma = global.prisma;
}
export default prisma;

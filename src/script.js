//Prisma 臨時DB使用方法
//npx prisma generate 初始化臨時DB client

//Database 連接
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    const newLink = await prisma.link.create({
        data: {
            description: 'JamesYan Website',
            url: 'https://yan-familymywebsite.com/',
        }
    })
    const allLinks = await prisma.link.findMany();
    console.log(allLinks);
}

main().catch((e) => {
    throw e;
}).finally(async () => {
    //如果連接失敗的話關閉DB連接
    prisma.$disconnect;
})
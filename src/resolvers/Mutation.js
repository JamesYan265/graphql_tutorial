const bcrypt = require("bcryptjs"); //加密
const jwt = require("jsonwebtoken"); //JWT

const {APP_SECRET} = require('../utils');

//sign up
async function signup(parent, args, context) {
    //password
    const password = await bcrypt.hash(args.password, 10)

    //user
    const user = await context.prisma.user.create({
        data: {
            ...args,
            password,
        },
    });
    const token = jwt.sign({userId: user.id}, APP_SECRET);

    return {
        token,
        user,
    };
}

//login
async function login(parent, args, context) {
    const user = await context.prisma.user.findUnique({
        where: {
            email: args.email
        }
    });

    if(!user) {
        throw new Error("依個帳戶係唔存在的");
    }

    //password比較
    const valid = await bcrypt.compare(args.password, user.password);

    if(!valid) {
        throw new Error("密碼唔太啱");
    }

    //password正確時
    const token = jwt.sign({userId: user.id}, APP_SECRET);

    return {
        token,
        user,
    };
}

//post 生成
async function post(parent, args, context) {
    const { userId } = context;

    const newLink = await context.prisma.link.create({
        data: {
            url: args.url,
            description: args.description,
            postedBy: {connect : {id: userId}}
        },
    });
    //Graphql "Subscription" 實時發送
    context.pubsub.publish("NEW_LINK", newLink);
    return newLink;
}

//post 刪除
async function deleteP(parent, args, context) {
    return await context.prisma.link.delete({
        where: {
            id : args.id,
        },
    })
}

async function vote(parent, args, context) {
    const userId = context.userId;

    //投票檢查有否重覆
    // const vote = context.prisma.vote.findUnique({
    //     where: {
    //         linkId_userId: {
    //             linkId : Number(args.linkId),
    //             userId : userId,
    //         },
    //     },
    // });
    // console.log(vote);

    // if(vote) {
    //     throw new Error(`已經投咗票了${args.linkId}`);
    // }

    //成功時的執行,即沒有重覆
    const newVote = context.prisma.vote.create({
        data: {
            user: {connect : {id : userId}},
            link: {connect : {id : Number(args.linkId) }},
        }
    });
    //Graphql "Subscription" 實時發送
    context.pubsub.publish("NEW_VOTE", newVote);

    return newVote;
}

module.exports = {
    signup,
    login,
    post,
    deleteP,
    vote,
};
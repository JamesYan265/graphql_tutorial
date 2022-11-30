const { ApolloServer, gql } = require('apollo-server');

//檔案導入使用
const fs = require('fs');
const path = require('path');

//Web Server - ApolloServer 連接 Prisma DB
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const {getUserId} = require('./utils')

//Graphql Subscription 可以令到畫面實時更新 {本次目標是Post的自動更新}
//Pub : 發送 Sub : 接收
const {PubSub} = require("apollo-server");
const pubsub = new PubSub();

//Graphql Data Structure定義
//Query = Get
//Mutation = POST, UPDATE, DELETE
// const typeDefs = gql`
//轉移至src/schema.graphql
// `

//實際值比Graphql resolvers
//resolvers Import
const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
const Link = require('./resolvers/Link');
const User = require('./resolvers/User');
const Subscription = require("./resolvers/Subscription");
const Vote = require("./resolvers/Vote");

const resolvers = {
    Query,
    Mutation,
    Subscription,
    Link,
    User,
    Vote,
};


//建構Apollo Server
const server = new ApolloServer ({
    typeDefs: fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf-8"),
    resolvers,
    //context 設定 prsima DB連接
    //req是由resolvers中引發
    context: ({req}) => {
        return {
            ...req,
            prisma,
            pubsub,
            userId: req && req.headers.authorization ? getUserId(req) : null,
        }
    },
});

//Server Port設定
server
    .listen().
    then(({url}) => console.log(`${url}Server起動中...`));
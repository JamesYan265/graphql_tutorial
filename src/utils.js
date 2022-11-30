const jwt = require("jsonwebtoken");
APP_SECRET = "Graphql";

//比較Token使用
function getTokenPayload(token) {
    // 比較轉化咗Token的user.id
    return jwt.verify(token, APP_SECRET)

}

//取得 User Id 參數
function getUserId(req, authToken) {
    if(req) {
        //request header取得檢查身份
        const authHeader = req.headers.authorization;

        if(authHeader) {
            const token = authHeader.replace("Bearer","");
            if(!token) {
                throw new Error("睇唔到你有Token,唔知你邊個")
            }

            //比較Token
            const { userId } = getTokenPayload(token);
            return userId;
        }
    } else if (authToken) {
        const { userId } = getTokenPayload(authToken)
        return userId;
    }

    throw new Error("Who are You?");
}

module.exports = {
    APP_SECRET,
    getUserId,
}
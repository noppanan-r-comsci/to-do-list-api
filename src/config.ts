import 'dotenv/config';

export const config = {
    port: process.env.PORT || 3000,
    appSecret: process.env.APP_SECRET
}
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import express from 'express';
import { Express } from 'express';
import { config } from './config';
import cors from 'cors';

const jwtSecret = config.appSecret || '';

export const applyMiddleware = (app: Express) => {
    app.use(cors());
    app.use(helmet());
    app.use(express.json());
    
    app.use((req, res, next) => {
        if (req.path === '/api/v1/login') {
            return next();
        }
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).send({ message: 'Missing token' });
        }
        const token = authHeader.split(' ')[1];
        jwt.verify(token, jwtSecret, (err, user) => {
            if (err) {
                return res.status(403).send({ message: 'Invalid token' });
            }
            (req as any).user = user;
            next();
        });
    });
};
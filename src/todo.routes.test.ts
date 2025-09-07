import request from 'supertest';
import express from 'express';
import todoRoutes from './todo.routes';
import jwt from 'jsonwebtoken';
import { config } from './config';
import { applyMiddleware } from './middleware'; // นำเข้า middleware ที่สร้างไว้

const app = express();
applyMiddleware(app); // ลืมใส่ตรงนี้ เลย test ไม่ผ่าน

app.post('/api/v1/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '1234') {
        const payload = { userId: '1', username };
        const token = jwt.sign(payload, config.appSecret || '', { expiresIn: '1h' });
        return res.json({ token });
    }
    res.status(401).json({ message: 'Invalid credentials' });
});
app.use('/api/v1', todoRoutes);

let token: string;

beforeAll(async () => {
    const res = await request(app)
        .post('/api/v1/login')
        .send({ username: 'admin', password: '1234' });
    token = res.body.token;
});

describe('Auth Routes', () => {
    it('should return token for valid login', async () => {
        const res = await request(app)
            .post('/api/v1/login')
            .send({ username: 'admin', password: '1234' });
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it('should return 401 for invalid login', async () => {
        const res = await request(app)
            .post('/api/v1/login')
            .send({ username: 'admin', password: 'wrong' });
        expect(res.statusCode).toBe(401);
        expect(res.body.token).toBeUndefined();
    });
});

describe('Todo Routes', () => {
    it('should return 401 for missing token', async () => {
        const res = await request(app).get('/api/v1/todos');
        expect(res.statusCode).toBe(401);
    });

    it('should return 403 for invalid token', async () => {
        const res = await request(app)
            .get('/api/v1/todos')
            .set('Authorization', 'Bearer invalidtoken');
        expect(res.statusCode).toBe(403);
    });

    it('should get empty todo list', async () => {
        const res = await request(app)
            .get('/api/v1/todos')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should create a new todo', async () => {
        const res = await request(app)
            .post('/api/v1/todos')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Test Todo', description: 'Test desc' });
        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe('Test Todo');
    });

    it('should get todo list with one item', async () => {
        const res = await request(app)
            .get('/api/v1/todos')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
    });

    it('should get todo by ID', async () => {
        const todosRes = await request(app)
            .get('/api/v1/todos')
            .set('Authorization', `Bearer ${token}`);
        const todoId = todosRes.body[0].id;
        const res = await request(app)
            .get(`/api/v1/todos/${todoId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBe(todoId);
    });

    it('should return 404 for non-existing todo', async () => {
        const res = await request(app)
            .get('/api/v1/todos/non-existing-id')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(404);
    });

    it('should create another todo', async () => {
        const res = await request(app)
            .post('/api/v1/todos')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Second Todo', description: 'Second desc' });
        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe('Second Todo');
    });

    it('should get todo list with two items', async () => {
        const res = await request(app)
            .get('/api/v1/todos')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
    });

    it('should update a todo', async () => {
        const todosRes = await request(app)
            .get('/api/v1/todos')
            .set('Authorization', `Bearer ${token}`);
        const todoId = todosRes.body[0].id;
        const res = await request(app)
            .put(`/api/v1/todos/${todoId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Updated Todo', completed: true });
        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('Updated Todo');
        expect(res.body.completed).toBe(true);
    });

    it('should delete a todo', async () => {
        const todosRes = await request(app)
            .get('/api/v1/todos')
            .set('Authorization', `Bearer ${token}`);
        const todoId = todosRes.body[0].id;
        const res = await request(app)
            .delete(`/api/v1/todos/${todoId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(204);
    });

    it('should get todo list with one item after deletion', async () => {
        const res = await request(app)
            .get('/api/v1/todos')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
    });

    it('should return 404 when deleting non-existing todo', async () => {
        const res = await request(app)
            .delete('/api/v1/todos/non-existing-id')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(404);
    });
});
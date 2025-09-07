import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as swaggerUi from 'swagger-ui-express';
import * as swaggerJSDoc from 'swagger-jsdoc';

import { config } from './config';
import { applyMiddleware } from './middleware';
import todoRoutes from './todo.routes';

const PORT = config.port || 3000;
const app = express();

app.use(express.json());
/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: 1234
 *     responses:
 *       200:
 *         description: JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
app.post('/api/v1/login', (req, res) => {
    const { username, password } = req.body;
    // จำลองตรวจสอบ username/password ว่าเป็น admin/1234
    if (username === 'admin' && password === '1234') {
        const payload = { userId: '1', username };
        const token = jwt.sign(payload, config.appSecret || '', { expiresIn: '1h' });
        return res.json({ token });
    }
    res.status(401).json({ message: 'Invalid credentials' });
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'To-Do List API',
      version: '1.0.0',
      description: 'API documentation for To-Do List',
    },
    servers: [
      { url: `http://localhost:${PORT}` }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      { bearerAuth: [] }
    ]
  },
  apis: ['./src/*.ts'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

applyMiddleware(app);

app.use('/api/v1', todoRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
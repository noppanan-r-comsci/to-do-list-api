import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TodoDto } from './dto/todo.dto';

const router = Router();

let todos: TodoDto[] = [];
/**
 * @swagger
 * components:
 *   schemas:
 *     TodoDto:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         completed:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     TodoForUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         completed:
 *           type: boolean
 */

/**
 * @swagger
 * /api/v1/todos:
 *   get:
 *     summary: Get all todos
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TodoDto'
 */
router.get('/todos', (req: Request, res: Response) => {
  res.json(todos);
});

/**
 * @swagger
 * /api/v1/todos/{id}:
 *   get:
 *     summary: Get todo by ID
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Todo item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TodoDto'
 *       404:
 *         description: Todo not found
 */
router.get('/todos/:id', (req: Request, res: Response) => {
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) return res.status(404).json({ message: 'Todo not found' });
  res.json(todo);
});

/**
 * @swagger
 * /api/v1/todos:
 *   post:
 *     summary: Create a new todo
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TodoDto'
 *     responses:
 *       201:
 *         description: Created todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TodoDto'
 */
router.post('/todos', (req: Request, res: Response) => {
  const { title, description } = req.body;
  const newTodo: TodoDto = {
    id: uuidv4(),
    title,
    description,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

/**
 * @swagger
 * /api/v1/todos/{id}:
 *   put:
 *     summary: Update a todo
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TodoForUpdate'
 *     responses:
 *       200:
 *         description: Updated todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TodoDto'
 *       404:
 *         description: Todo not found
 */
router.put('/todos/:id', (req: Request, res: Response) => {
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) return res.status(404).json({ message: 'Todo not found' });

  const { title, description, completed } = req.body;
  todo.title = title ?? todo.title;
  todo.description = description ?? todo.description;
  todo.completed = completed ?? todo.completed;
  todo.updatedAt = new Date();

  res.json(todo);
});

/**
 * @swagger
 * /api/v1/todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Todo deleted
 *       404:
 *         description: Todo not found
 */
router.delete('/todos/:id', (req: Request, res: Response) => {
  const index = todos.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Todo not found' });

  todos.splice(index, 1);
  res.status(204).send();
});

export default router;
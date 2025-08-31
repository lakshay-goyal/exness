import { Router, type Request, type Response } from 'express';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema.js';

import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { type User } from '../interface.js';


const router = Router();
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

// Signup route
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: 'All fields are required: firstName, lastName, email, password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUser.length > 0) {
      return res.status(409).json({
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await db.insert(users).values({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      balance: '0.00', // Default balance for new users
    }).returning();

    if (!newUser[0]) {
      return res.status(500).json({
        error: 'Failed to create user'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: newUser[0].id,
      email: newUser[0].email,
      firstName: newUser[0].firstName,
      lastName: newUser[0].lastName,
    });

    res.status(200).json({
      user: {
        id: newUser[0].id,
        firstName: newUser[0].firstName,
        lastName: newUser[0].lastName,
        email: newUser[0].email,
      },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Signin route
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const user: User[] = await db.select().from(users).where(eq(users.email, email));
    if (user.length === 0) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const foundUser = user[0];
    if (!foundUser) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const isValidPassword = await comparePassword(password, foundUser.password);    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: foundUser.id,
      email: foundUser.email,
      firstName: foundUser.firstName,
      lastName: foundUser.lastName,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: foundUser.id,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
      },
      token,
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get current user (protected route)
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    res.json({
      user: authReq.user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;

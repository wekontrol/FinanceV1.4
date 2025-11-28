import request from 'supertest';
import usersRouter from './users';
import db from '../db/schema';
import bcrypt from 'bcryptjs';
import { setupTestApp, mockDatabase } from './test-helper';

const app = setupTestApp(usersRouter, '/users');
mockDatabase();

describe('PUT /users/:id', () => {
  let user: any;

  beforeEach(() => {
    // Clear the database before each test
    db.exec('PRAGMA foreign_keys = OFF');
    db.exec('DELETE FROM translations');
    db.exec('DELETE FROM budget_limits');
    db.exec('DELETE FROM transactions');
    db.exec('DELETE FROM users');
    db.exec('PRAGMA foreign_keys = ON');

    // Create a user for testing
    const userId = 'user1';
    const familyId = 'family1';
    const password = bcrypt.hashSync('password', 10);

    db.prepare(`
      INSERT INTO users (id, username, password, name, role, family_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, 'user', password, 'Test User', 'MEMBER', familyId);

    user = { id: userId, role: 'MEMBER', familyId };
  });

  it('should not update password if current password is incorrect', async () => {
    const agent = request.agent(app);

    // Manually set the session for the user
    await agent.post('/mock-login').send({ userId: user.id, user: user });

    const response = await agent.put(`/users/${user.id}`).send({
      password: 'newpassword',
      currentPassword: 'wrongpassword',
    });

    expect(response.status).toBe(401);
  });
});

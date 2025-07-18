const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bugRoutes = require('../routes/bugRoutes');
const errorHandler = require('../middleware/errorHandler');
const Bug = require('../models/Bug');

// Mock mongoose
jest.mock('mongoose');

const app = express();
app.use(express.json());
app.use('/api/bugs', bugRoutes);
app.use(errorHandler);

describe('Bug API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/bugs', () => {
    it('should return all bugs', async () => {
      const mockBugs = [
        { _id: '1', title: 'Bug 1', description: 'Description 1', status: 'open', createdAt: new Date() },
        { _id: '2', title: 'Bug 2', description: 'Description 2', status: 'resolved', createdAt: new Date() }
      ];
      
      Bug.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockBugs)
      });

      const response = await request(app).get('/api/bugs');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBugs);
      expect(Bug.find).toHaveBeenCalled();
    });

    it('should return empty array when no bugs exist', async () => {
      Bug.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      const response = await request(app).get('/api/bugs');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should handle database errors', async () => {
      Bug.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      const response = await request(app).get('/api/bugs');
      
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal Server Error');
    });
  });

  describe('GET /api/bugs/:id', () => {
    it('should return a single bug by ID', async () => {
      const mockBug = { _id: '1', title: 'Bug 1', description: 'Description 1', status: 'open' };
      
      Bug.findById = jest.fn().mockResolvedValue(mockBug);

      const response = await request(app).get('/api/bugs/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBug);
      expect(Bug.findById).toHaveBeenCalledWith('1');
    });

    it('should return 404 when bug not found', async () => {
      Bug.findById = jest.fn().mockResolvedValue(null);

      const response = await request(app).get('/api/bugs/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Bug not found');
    });

    it('should handle invalid ObjectId', async () => {
      const response = await request(app).get('/api/bugs/invalid-id');
      
      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/bugs', () => {
    it('should create a new bug', async () => {
      const newBug = { title: 'New Bug', description: 'New Description', status: 'open' };
      const createdBug = { _id: '1', ...newBug, createdAt: new Date(), updatedAt: new Date() };
      
      Bug.prototype.save = jest.fn().mockResolvedValue(createdBug);

      const response = await request(app)
        .post('/api/bugs')
        .send(newBug);
      
      expect(response.status).toBe(201);
      expect(response.body.title).toBe(newBug.title);
      expect(response.body.description).toBe(newBug.description);
    });

    it('should validate required fields', async () => {
      const invalidBug = { description: 'Only description' };

      const response = await request(app)
        .post('/api/bugs')
        .send(invalidBug);
      
      expect(response.status).toBe(500);
    });

    it('should handle validation errors', async () => {
      Bug.prototype.save = jest.fn().mockRejectedValue(new Error('Validation failed'));

      const response = await request(app)
        .post('/api/bugs')
        .send({ title: 'Test', description: 'Test' });
      
      expect(response.status).toBe(500);
    });
  });

  describe('PUT /api/bugs/:id', () => {
    it('should update an existing bug', async () => {
      const updateData = { title: 'Updated Bug', description: 'Updated Description', status: 'resolved' };
      const updatedBug = { _id: '1', ...updateData };
      
      Bug.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedBug);

      const response = await request(app)
        .put('/api/bugs/1')
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.status).toBe(updateData.status);
    });

    it('should return 404 when bug not found for update', async () => {
      Bug.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .put('/api/bugs/nonexistent')
        .send({ title: 'Test', description: 'Test' });
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Bug not found');
    });

    it('should validate status enum values', async () => {
      const invalidData = { title: 'Test', description: 'Test', status: 'invalid-status' };

      const response = await request(app)
        .put('/api/bugs/1')
        .send(invalidData);
      
      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /api/bugs/:id', () => {
    it('should delete an existing bug', async () => {
      const deletedBug = { _id: '1', title: 'Deleted Bug' };
      
      Bug.findByIdAndDelete = jest.fn().mockResolvedValue(deletedBug);

      const response = await request(app).delete('/api/bugs/1');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Bug deleted');
      expect(Bug.findByIdAndDelete).toHaveBeenCalledWith('1');
    });

    it('should return 404 when bug not found for deletion', async () => {
      Bug.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      const response = await request(app).delete('/api/bugs/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Bug not found');
    });
  });
});

// Unit tests for Bug model validation
describe('Bug Model Validation', () => {
  it('should require title field', async () => {
    const bug = new Bug({ description: 'Test description' });
    
    let error;
    try {
      await bug.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error.errors.title).toBeDefined();
  });

  it('should require description field', async () => {
    const bug = new Bug({ title: 'Test title' });
    
    let error;
    try {
      await bug.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error.errors.description).toBeDefined();
  });

  it('should accept valid status values', async () => {
    const validStatuses = ['open', 'in-progress', 'resolved'];
    
    for (const status of validStatuses) {
      const bug = new Bug({ title: 'Test', description: 'Test', status });
      let error;
      try {
        await bug.validate();
      } catch (e) {
        error = e;
      }
      expect(error).toBeUndefined();
    }
  });

  it('should reject invalid status values', async () => {
    const bug = new Bug({ title: 'Test', description: 'Test', status: 'invalid' });
    
    let error;
    try {
      await bug.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error.errors.status).toBeDefined();
  });

  it('should trim whitespace from title and description', async () => {
    const bug = new Bug({ 
      title: '  Test Title  ', 
      description: '  Test Description  ' 
    });
    
    expect(bug.title).toBe('Test Title');
    expect(bug.description).toBe('Test Description');
  });

  it('should enforce title max length', async () => {
    const longTitle = 'a'.repeat(101);
    const bug = new Bug({ title: longTitle, description: 'Test' });
    
    let error;
    try {
      await bug.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error.errors.title).toBeDefined();
  });

  it('should enforce description max length', async () => {
    const longDescription = 'a'.repeat(1001);
    const bug = new Bug({ title: 'Test', description: longDescription });
    
    let error;
    try {
      await bug.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error.errors.description).toBeDefined();
  });
});

// Error handling tests
describe('Error Handling', () => {
  it('should handle mongoose validation errors', async () => {
    const invalidBug = { title: '', description: '' };
    
    const response = await request(app)
      .post('/api/bugs')
      .send(invalidBug);
    
    expect(response.status).toBe(500);
  });

  it('should handle database connection errors', async () => {
    Bug.find = jest.fn().mockRejectedValue(new Error('Connection failed'));
    
    const response = await request(app).get('/api/bugs');
    
    expect(response.status).toBe(500);
  });
}); 
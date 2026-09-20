jest.mock('../src/models', () => ({
  User: {
    findById: jest.fn()
  },
  Task: {
    find: jest.fn(() => ({
      populate: jest.fn(() => ({
        populate: jest.fn(() => ({
          sort: jest.fn(() => ({
            skip: jest.fn(() => ({
              limit: jest.fn().mockResolvedValue([])
            }))
          }))
        }))
      }))
    })),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    create: jest.fn()
  },
  Document: {
    find: jest.fn(),
    countDocuments: jest.fn()
  }
}));

const { Task, User, Document } = require('../src/models');
const request = require('supertest');

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ userId: '123e4567-e89b-12d3-a456-426614174000' })
}));

const app = require('../src/app');

describe('Task Model', () => {
  it('should create task with required fields', () => {
    const Task = require('../src/models/Task');
    expect(Task).toBeDefined();
    expect(Task.schema.obj.title).toBeDefined();
    expect(Task.schema.paths.status.defaultValue).toBe('todo');
    expect(Task.schema.paths.priority.defaultValue).toBe('medium');
  });

  it('should have valid status enum', () => {
    const Task = require('../src/models/Task');
    const statusField = Task.schema.paths.status.enumValues;
    expect(statusField).toContain('todo');
    expect(statusField).toContain('in_progress');
    expect(statusField).toContain('review');
    expect(statusField).toContain('done');
  });

  it('should have valid priority enum', () => {
    const Task = require('../src/models/Task');
    const priorityField = Task.schema.paths.priority.enumValues;
    expect(priorityField).toContain('low');
    expect(priorityField).toContain('medium');
    expect(priorityField).toContain('high');
    expect(priorityField).toContain('urgent');
  });
});

describe('Task Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Task Filtering', () => {
    const setupMocks = (tasks = [], count = 0) => {
      Task.countDocuments.mockResolvedValue(count);
      const limitMock = jest.fn().mockResolvedValue(tasks);
      Task.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({ limit: limitMock })
            })
          })
        })
      });
      User.findById.mockResolvedValue({ _id: 'user1', role: 'user' });
    };

    it('should filter tasks by status', async () => {
      setupMocks([{ id: '123', title: 'Test Task', status: 'todo', priority: 'medium' }], 1);

      const response = await request(app)
        .get('/api/tasks?status=todo')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
    });

    it('should filter tasks by priority', async () => {
      setupMocks([], 0);

      const response = await request(app)
        .get('/api/tasks?priority=high')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
    });
  });

  describe('Task Sorting', () => {
    const setupMocks = () => {
      Task.countDocuments.mockResolvedValue(0);
      const limitMock = jest.fn().mockResolvedValue([]);
      Task.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({ limit: limitMock })
            })
          })
        })
      });
      User.findById.mockResolvedValue({ _id: 'user1', role: 'user' });
    };

    it('should sort by createdAt', async () => {
      setupMocks();

      const response = await request(app)
        .get('/api/tasks?sortBy=createdAt&sortOrder=DESC')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
    });

    it('should sort by dueDate', async () => {
      setupMocks();

      const response = await request(app)
        .get('/api/tasks?sortBy=dueDate&sortOrder=ASC')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
    });
  });

  describe('Task Pagination', () => {
    it('should support pagination parameters', async () => {
      Task.countDocuments.mockResolvedValue(50);
      const mockTasks = Array(10).fill({});
      
      const limitMock = jest.fn().mockResolvedValue(mockTasks);
      const skipMock = jest.fn(() => ({ limit: limitMock }));
      const sortMock = jest.fn(() => ({ skip: skipMock }));
      const pop2Mock = jest.fn(() => ({ sort: sortMock }));
      const pop1Mock = jest.fn(() => ({ populate: pop2Mock }));
      
      Task.find.mockReturnValue({ populate: pop1Mock });

      User.findById.mockResolvedValue({ _id: 'user1', role: 'user' });

      const response = await request(app)
        .get('/api/tasks?page=1&limit=10')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('totalPages', 5);
    });
  });
});

describe('Document Model', () => {
  it('should have required fields', () => {
    const Document = require('../src/models/Document');

    expect(Document.schema.obj.fileName).toBeDefined();
    expect(Document.schema.obj.filePath).toBeDefined();
    expect(Document.schema.obj.fileSize).toBeDefined();
    expect(Document.schema.obj.mimeType).toBeDefined();
  });
});
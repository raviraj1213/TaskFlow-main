import taskReducer, { setFilters, clearFilters, clearError } from '../src/store/taskSlice';

describe('taskSlice', () => {
  const initialState = {
    tasks: [],
    currentTask: null,
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    error: null,
    filters: {
      status: '',
      priority: '',
      assignedTo: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    }
  };

  it('should return initial state', () => {
    expect(taskReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setFilters', () => {
    const action = setFilters({ status: 'todo', priority: 'high' });
    const result = taskReducer(initialState, action);
    expect(result.filters.status).toBe('todo');
    expect(result.filters.priority).toBe('high');
    expect(result.filters.sortBy).toBe('createdAt');
  });

  it('should handle clearFilters', () => {
    const stateWithFilters = {
      ...initialState,
      filters: {
        status: 'todo',
        priority: 'high',
        sortBy: 'dueDate',
        sortOrder: 'ASC'
      }
    };

    const result = taskReducer(stateWithFilters, clearFilters());
    expect(result.filters).toEqual(initialState.filters);
  });

  it('should handle clearError', () => {
    const stateWithError = {
      ...initialState,
      error: 'Some error'
    };

    const result = taskReducer(stateWithError, clearError());
    expect(result.error).toBeNull();
  });

  it('should handle fetchTasks.pending', () => {
    const action = { type: 'tasks/fetchTasks/pending' };
    const result = taskReducer(initialState, action);
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('should handle fetchTasks.fulfilled', () => {
    const tasks = [
      { id: '1', title: 'Task 1', status: 'todo' },
      { id: '2', title: 'Task 2', status: 'done' }
    ];
    const action = {
      type: 'tasks/fetchTasks/fulfilled',
      payload: {
        tasks,
        total: 2,
        page: 1,
        totalPages: 1
      }
    };
    const result = taskReducer({ ...initialState, loading: true }, action);
    expect(result.loading).toBe(false);
    expect(result.tasks).toEqual(tasks);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('should handle fetchTasks.rejected', () => {
    const action = {
      type: 'tasks/fetchTasks/rejected',
      payload: 'Failed to fetch'
    };
    const result = taskReducer(initialState, action);
    expect(result.loading).toBe(false);
    expect(result.error).toBe('Failed to fetch');
  });

  it('should handle fetchTaskById.fulfilled', () => {
    const task = { id: '1', title: 'Task 1', status: 'todo' };
    const action = {
      type: 'tasks/fetchTaskById/fulfilled',
      payload: task
    };
    const result = taskReducer(initialState, action);
    expect(result.currentTask).toEqual(task);
  });

  it('should handle createTask.fulfilled', () => {
    const newTask = { id: '1', title: 'New Task', status: 'todo' };
    const action = {
      type: 'tasks/createTask/fulfilled',
      payload: newTask
    };
    const result = taskReducer(initialState, action);
    expect(result.tasks[0]).toEqual(newTask);
    expect(result.total).toBe(1);
  });

  it('should handle updateTask.fulfilled', () => {
    const stateWithTask = {
      ...initialState,
      tasks: [
        { id: '1', title: 'Old Title', status: 'todo' },
        { id: '2', title: 'Task 2', status: 'done' }
      ]
    };
    const updatedTask = { id: '1', title: 'New Title', status: 'in_progress' };
    const action = {
      type: 'tasks/updateTask/fulfilled',
      payload: updatedTask
    };
    const result = taskReducer(stateWithTask, action);
    expect(result.tasks[0].title).toBe('New Title');
    expect(result.tasks[0].status).toBe('in_progress');
  });

  it('should handle deleteTask.fulfilled', () => {
    const stateWithTasks = {
      ...initialState,
      tasks: [
        { id: '1', title: 'Task 1' },
        { id: '2', title: 'Task 2' }
      ],
      total: 2
    };
    const action = {
      type: 'tasks/deleteTask/fulfilled',
      payload: '1'
    };
    const result = taskReducer(stateWithTasks, action);
    expect(result.tasks.length).toBe(1);
    expect(result.tasks[0].id).toBe('2');
    expect(result.total).toBe(1);
  });

  it('should handle uploadDocuments.fulfilled', () => {
    const stateWithCurrentTask = {
      ...initialState,
      currentTask: {
        id: '1',
        title: 'Task 1',
        Documents: [{ id: '1', fileName: 'doc1.pdf' }]
      }
    };
    const newDocs = [
      { id: '2', fileName: 'doc2.pdf' },
      { id: '3', fileName: 'doc3.pdf' }
    ];
    const action = {
      type: 'tasks/uploadDocuments/fulfilled',
      payload: { taskId: '1', documents: newDocs }
    };
    const result = taskReducer(stateWithCurrentTask, action);
    expect(result.currentTask.Documents.length).toBe(3);
  });

  it('should handle deleteDocument.fulfilled', () => {
    const stateWithCurrentTask = {
      ...initialState,
      currentTask: {
        id: '1',
        title: 'Task 1',
        Documents: [
          { id: '1', fileName: 'doc1.pdf' },
          { id: '2', fileName: 'doc2.pdf' }
        ]
      }
    };
    const action = {
      type: 'tasks/deleteDocument/fulfilled',
      payload: { taskId: '1', documentId: '1' }
    };
    const result = taskReducer(stateWithCurrentTask, action);
    expect(result.currentTask.Documents.length).toBe(1);
    expect(result.currentTask.Documents[0].id).toBe('2');
  });
});
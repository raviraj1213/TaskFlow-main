import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/tasks', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      let response;
      if (id === 'new') {
        response = await api.post('/tasks', data);
        return response.data.task;
      } else {
        response = await api.put(`/tasks/${id}`, data);
        return response.data.task;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

export const uploadDocuments = createAsyncThunk(
  'tasks/uploadDocuments',
  async ({ taskId, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('documents', file));
      const response = await api.post(`/tasks/${taskId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { taskId, documents: response.data.documents };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload documents');
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'tasks/deleteDocument',
  async ({ taskId, documentId }, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/documents/${documentId}`);
      return { taskId, documentId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete document');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
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
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        priority: '',
        assignedTo: '',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.currentTask = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const payloadId = action.payload?._id || action.payload?.id;
        const index = state.tasks.findIndex(t => (t._id || t.id) === payloadId);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        const currentId = state.currentTask?._id || state.currentTask?.id;
        if (currentId && currentId === payloadId) {
          state.currentTask = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => (t._id || t.id) !== action.payload);
        state.total -= 1;
      })
      .addCase(uploadDocuments.fulfilled, (state, action) => {
        const currentId = state.currentTask?._id || state.currentTask?.id;
        if (currentId && currentId.toString() === action.payload.taskId.toString()) {
          state.currentTask.Documents = [
            ...(state.currentTask.Documents || []),
            ...action.payload.documents
          ];
        }
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        const currentId = state.currentTask?._id || state.currentTask?.id;
        if (currentId && currentId.toString() === action.payload.taskId.toString()) {
          state.currentTask.Documents = state.currentTask.Documents.filter(
            d => (d._id || d.id) !== action.payload.documentId
          );
        }
      });
  }
});

export const { setFilters, clearFilters, clearError } = taskSlice.actions;
export default taskSlice.reducer;
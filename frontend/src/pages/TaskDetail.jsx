import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { showToast } from '../store/toastSlice';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { ArrowBack, Save, PictureAsPdf, Delete as DeleteIcon, Download, Add as AddIcon } from '@mui/icons-material';
import { fetchTaskById, updateTask, uploadDocuments, deleteDocument } from '../store/taskSlice';
import api from '../api/api';

const statusColors = {
  todo: { bg: '#E0E0E0', color: '#757575' },
  in_progress: { bg: '#E3F2FD', color: '#1976D2' },
  review: { bg: '#FFF3E0', color: '#F57C00' },
  done: { bg: '#E8F5E9', color: '#388E3C' }
};

const priorityColors = {
  low: '#757575',
  medium: '#1976D2',
  high: '#F57C00',
  urgent: '#D32F2F'
};

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTask: task, loading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);

  const isNew = id === 'new' || id === undefined;
  const isEditMode = window.location.pathname.endsWith('/edit');
  const isAdmin = user?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleteDocDialog, setDeleteDocDialog] = useState({ open: false, docId: null });
  const [isDragging, setIsDragging] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      assignedToId: ''
    }
  });

  useEffect(() => {
    if (!isNew && id) {
      dispatch(fetchTaskById(id));
    }
    fetchUsers();
  }, [dispatch, id, isNew]);

  useEffect(() => {
    if (isNew) {
      reset({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        assignedToId: ''
      });
    } else if (task) {
      reset({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? dayjs(task.dueDate) : null,
        assignedToId: task.assignedTo?._id || task.assignedTo || ''
      });
    }
  }, [task, isNew, reset]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/list');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const onSubmit = async (data) => {
    if (!user || !user._id) {
      alert('Please login again');
      return;
    }

    const submitData = {
      ...data,
      dueDate: data.dueDate ? data.dueDate.format('YYYY-MM-DD') : null,
      assignedToId: data.assignedToId || null
    };

    if (isNew) {
      const result = await dispatch(updateTask({ id: 'new', data: { ...submitData, createdById: user._id } }));
      if (updateTask.fulfilled.match(result)) {
        dispatch(showToast({ message: 'Task created successfully!', severity: 'success' }));
        const newId = result.payload._id || result.payload.id;
        if (newId) {
          navigate(`/tasks/${newId}`);
        }
      } else {
        dispatch(showToast({ message: result.payload || 'Failed to create task', severity: 'error' }));
      }
    } else {
      const result = await dispatch(updateTask({ id, data: submitData }));
      if (updateTask.fulfilled.match(result)) {
        dispatch(showToast({ message: 'Task saved successfully!', severity: 'success' }));
      } else {
        dispatch(showToast({ message: result.payload || 'Failed to save task', severity: 'error' }));
      }
    }
  };

  const processFiles = (files) => {
    const pdfFiles = files.filter(f => f.type === 'application/pdf');
    if (files.length !== pdfFiles.length) {
      alert('Only PDF files are allowed');
    }
    const existingDocs = task?.Documents?.length || 0;

    if (pdfFiles.length + existingDocs > 3) {
      alert('Maximum 3 documents allowed');
      return;
    }

    setSelectedFiles(pdfFiles);
    if (pdfFiles.length > 0) {
      setUploadDialog(true);
    }
  };

  const handleFileSelect = (event) => {
    processFiles(Array.from(event.target.files));
  };

  const handleUpload = async () => {
    if (isNew || !task || !task._id) {
      dispatch(showToast({ message: 'Please create the task first before uploading documents.', severity: 'warning' }));
      setUploadDialog(false);
      return;
    }
    setUploading(true);
    await dispatch(uploadDocuments({ taskId: task._id, files: selectedFiles }));
    setUploading(false);
    setUploadDialog(false);
    setSelectedFiles([]);
    dispatch(fetchTaskById(id));
  };

  const handleDeleteDocument = async () => {
    if (!task || !task._id) return;
    await dispatch(deleteDocument({ taskId: task._id, documentId: deleteDocDialog.docId }));
    setDeleteDocDialog({ open: false, docId: null });
    dispatch(fetchTaskById(id));
  };

  const handleDownload = async (docId, fileName) => {
    try {
      const response = await api.get(`/tasks/documents/${docId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed', error);
    }
  };

  const canEdit = isNew || isEditMode || (user?.role === 'admin' || task?.createdBy?._id === user?._id);
  const isEditing = isNew || isEditMode;

  const handleDragOver = (e) => {
    e.preventDefault();
    if (canEdit && !isNew) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (canEdit && !isNew) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/tasks')} sx={{ mr: 2 }}>
          Back
        </Button>
        <Typography variant="h4">
          {isNew ? 'New Task' : isEditMode ? 'Edit Task' : 'Task Details'}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                {isEditing ? (
                  <>
                    <Controller
                      name="title"
                      control={control}
                      rules={{ required: 'Title is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Title"
                          margin="normal"
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Description"
                          multiline
                          rows={4}
                          margin="normal"
                        />
                      )}
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Controller
                          name="status"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth margin="normal">
                              <InputLabel>Status</InputLabel>
                              <Select {...field} label="Status" value={field.value || 'todo'}>
                                <MenuItem value="todo">Todo</MenuItem>
                                <MenuItem value="in_progress">In Progress</MenuItem>
                                <MenuItem value="review">Review</MenuItem>
                                <MenuItem value="done">Done</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Controller
                          name="priority"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth margin="normal">
                              <InputLabel>Priority</InputLabel>
                              <Select {...field} label="Priority" value={field.value || 'medium'}>
                                <MenuItem value="low">Low</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                                <MenuItem value="urgent">Urgent</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>
                    </Grid>
                    <Controller
                      name="dueDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          label="Due Date"
                          value={field.value || null}
                          onChange={(newValue) => field.onChange(newValue)}
                          slotProps={{
                            textField: { fullWidth: true, sx: { mt: 2, width: '100%' } }
                          }}
                        />
                      )}
                    />
                    {isAdmin && (
                      <Controller
                        name="assignedToId"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth margin="normal">
                            <InputLabel>Assign To</InputLabel>
                            <Select {...field} label="Assign To" value={field.value || ''}>
                              <MenuItem value="">Unassigned</MenuItem>
                              {users.map((u) => (
                                <MenuItem key={u._id} value={u._id}>
                                  {u.firstName} {u.lastName}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    )}
                    <Button type="submit" variant="contained" startIcon={<Save />} sx={{ mt: 3 }}>
                      {isNew ? 'Create Task' : 'Save Changes'}
                    </Button>
                  </>
                ) : task ? (
                  <>
                    <Typography variant="h5" gutterBottom>
                      {task.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                      <Chip
                        label={task.status?.replace('_', ' ')}
                        sx={{
                          bgcolor: statusColors[task.status]?.bg,
                          color: statusColors[task.status]?.color,
                          textTransform: 'capitalize'
                        }}
                      />
                      <Chip
                        label={task.priority}
                        sx={{
                          bgcolor: priorityColors[task.priority],
                          color: 'white',
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>
                    {task.description && (
                      <Typography variant="body1" paragraph>
                        {task.description}
                      </Typography>
                    )}
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Due Date</Typography>
                        <Typography variant="body2">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Assigned To</Typography>
                        <Typography variant="body2">
                          {task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Created By</Typography>
                        <Typography variant="body2">
                          {task.createdBy ? `${task.createdBy.firstName} ${task.createdBy.lastName}` : '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Created</Typography>
                        <Typography variant="body2">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </Grid>
                    {canEdit && (
                      <Button
                        variant="outlined"
                        sx={{ mt: 3 }}
                        onClick={() => navigate(`/tasks/${id}/edit`)}
                      >
                        Edit Task
                      </Button>
                    )}
                  </>
                ) : (
                  <Typography>Task not found</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{ 
                border: isDragging ? '2px dashed' : '1px solid',
                borderColor: isDragging ? 'primary.main' : 'transparent',
                transition: 'all 0.2s ease',
                bgcolor: isDragging ? 'action.hover' : 'background.paper'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Documents</Typography>
                  {canEdit && !isNew && (
                    <IconButton onClick={() => fileInputRef.current?.click()}>
                      <AddIcon />
                    </IconButton>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="application/pdf"
                    multiple
                    style={{ display: 'none' }}
                  />
                </Box>
                
                {isDragging ? (
                  <Box sx={{ p: 4, textAlign: 'center', color: 'primary.main' }}>
                    <Typography variant="body1" fontWeight="medium">Drop PDFs here to upload</Typography>
                  </Box>
                ) : (
                  <List>
                    {(task?.Documents || []).map((doc) => (
                      <ListItem key={doc._id || doc.id}>
                        <ListItemIcon>
                          <PictureAsPdf color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary={doc.fileName}
                          secondary={`${(doc.fileSize / 1024).toFixed(1)} KB`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton onClick={() => handleDownload(doc._id || doc.id, doc.fileName)}>
                            <Download />
                          </IconButton>
                          {canEdit && (
                            <IconButton onClick={() => setDeleteDocDialog({ open: true, docId: doc._id || doc.id })}>
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                    {(!task?.Documents || task.Documents.length === 0) && (
                      <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                        {isNew ? 'Please create the task first to upload documents' : canEdit ? 'Drag & drop PDFs here, or click +' : 'No documents'}
                      </Typography>
                    )}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>

      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)}>
        <DialogTitle>Upload Documents</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Selected files: {selectedFiles.length}
          </Typography>
          {selectedFiles.map((f, i) => (
            <Typography key={i} variant="body2">
              {f.name} ({(f.size / 1024).toFixed(1)} KB)
            </Typography>
          ))}
          {(task?.Documents?.length || 0) + selectedFiles.length > 3 && (
            <Typography color="error" sx={{ mt: 2 }}>
              Maximum 3 documents allowed
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || (task?.Documents?.length || 0) + selectedFiles.length > 3}
          >
            {uploading ? <CircularProgress size={20} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDocDialog.open} onClose={() => setDeleteDocDialog({ open: false, docId: null })}>
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this document?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDocDialog({ open: false, docId: null })}>Cancel</Button>
          <Button onClick={handleDeleteDocument} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskDetail;
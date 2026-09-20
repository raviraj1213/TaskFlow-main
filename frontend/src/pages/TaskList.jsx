import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  InputAdornment,
  AvatarGroup,
  Badge
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, CalendarToday as CalendarIcon, KeyboardArrowDown as ArrowDownIcon, Upload as ImportIcon } from '@mui/icons-material';
import { fetchTasks, deleteTask, setFilters, updateTask } from '../store/taskSlice';
import api from '../api/api';
import BoardView from '../components/BoardView';

const statusColors = {
  todo: { bg: '#E0E0E0', color: '#757575', label: 'ToDo' },
  in_progress: { bg: '#E1F5FE', color: '#0288D1', label: 'In Progress' },
  review: { bg: '#FFF3E0', color: '#F57C00', label: 'Review' },
  done: { bg: '#E8F5E9', color: '#388E3C', label: 'Done' }
};

const priorityColors = {
  low: { bg: '#E8F5E9', color: '#388E3C', label: 'Low' },
  medium: { bg: '#FFF3E0', color: '#F57C00', label: 'Medium' },
  high: { bg: '#FFF3E0', color: '#F57C00', label: 'High' },
  urgent: { bg: '#FFEBEE', color: '#D32F2F', label: 'Urgent' }
};

const StyledBadge = ({ children, online=true }) => (
  <Badge
    overlap="circular"
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    variant="dot"
    sx={{
      '& .MuiBadge-badge': {
        backgroundColor: online ? '#44b700' : '#bdbdbd',
        color: online ? '#44b700' : '#bdbdbd',
        boxShadow: `0 0 0 2px white`,
        '&::after': {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          animation: online ? 'ripple 1.2s infinite ease-in-out' : 'none',
          border: '1px solid currentColor',
          content: '""',
        },
      },
      '@keyframes ripple': {
        '0%': { transform: 'scale(.8)', opacity: 1 },
        '100%': { transform: 'scale(2.4)', opacity: 0 },
      },
    }}
  >
    {children}
  </Badge>
);


const TaskList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tasks, total, page, loading, filters } = useSelector((state) => state.tasks);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, taskId: null });
  const [users, setUsers] = useState([]);
  const [viewMode] = useState('list'); // Preserved from old state but currently only showing list in redesign
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Multi-select local state for filters to map to complex UI
  const [statusFilter, setStatusFilter] = useState(['done', 'todo', 'review', 'in_progress']);
  const [priorityFilter, setPriorityFilter] = useState(['urgent', 'high', 'medium', 'low']);
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [dueDateFilter, setDueDateFilter] = useState('');

  // Sync Global Search (from Redux) with local searchInput so debouncing works if triggered externally
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  // Debounced search logic preserved
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.search && searchInput !== undefined) {
        dispatch(setFilters({ search: searchInput }));
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput, dispatch, filters.search]);

  const handleStatusChange = async (taskId, newStatus) => {
    await dispatch(updateTask({ id: taskId, data: { status: newStatus } }));
    dispatch(fetchTasks({ page, ...filters }));
  };

  useEffect(() => {
    dispatch(fetchTasks({ page, ...filters }));
  }, [dispatch, page, filters]);

  useEffect(() => {
    api.get('/users/list').then(r => setUsers(r.data.users || [])).catch(() => {});
  }, []);

  const handleChangePage = (dir) => {
    let newPage = page;
    if (dir === 'prev' && page > 1) newPage = page - 1;
    if (dir === 'next' && tasks.length === 10) newPage = page + 1; // Assuming 10 per page
    if (newPage !== page) {
      dispatch(fetchTasks({ page: newPage, ...filters }));
    }
  };

  const handleDelete = async () => {
    await dispatch(deleteTask(deleteDialog.taskId));
    setDeleteDialog({ open: false, taskId: null });
  };

  const toggleSelectAll = () => {
    if (selectedTasks.length === tasks.length) setSelectedTasks([]);
    else setSelectedTasks(tasks.map((t) => t._id || t.id));
  };

  const toggleTask = (id) => {
    setSelectedTasks(prev => 
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    try {
      const csvRows = ['Title,Description,Status,Priority,AssignedTo,DueDate'];
      tasks.forEach(t => {
        const assignee = t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : 'Unassigned';
        const date = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'None';
        csvRows.push(`"${t.title}","${t.description}","${t.status}","${t.priority}","${assignee}","${date}"`);
      });
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'taskflow_tasks.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // alert('Export successful');
    } catch (error) {
      console.error(error);
    }
  };

  const filteredTasks = tasks.filter(t => {
     const statusMatch = statusFilter.includes(t.status) || statusFilter.length === 0;
     const priorityMatch = priorityFilter.includes(t.priority) || priorityFilter.length === 0;
     const assigneeMatch = assigneeFilter === 'All' || (t.assignedTo && t.assignedTo._id === assigneeFilter) || (t.assignedTo && t.assignedTo.id === assigneeFilter);
     const dateMatch = !dueDateFilter || (t.dueDate && new Date(t.dueDate).toLocaleDateString().includes(dueDateFilter));
     const searchMatch = !filters.search || 
        t.title?.toLowerCase().includes(filters.search.toLowerCase()) || 
        t.description?.toLowerCase().includes(filters.search.toLowerCase());
     return statusMatch && priorityMatch && assigneeMatch && dateMatch && searchMatch;
  });

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header Row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 1 }}>
        <Typography variant="h5" fontWeight="500">
          Task Management
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/tasks/new')}
            sx={{ bgcolor: '#1565c0', borderRadius: 1.5, textTransform: 'none', px: 2 }}
          >
            New Task
          </Button>
          <Button
            variant="outlined"
            startIcon={<ImportIcon sx={{ transform: 'rotate(180deg)' }} />}
            endIcon={<ArrowDownIcon />}
            sx={{ color: '#424242', borderColor: '#e0e0e0', bgcolor: '#f5f5f5', borderRadius: 1.5, textTransform: 'none' }}
            onClick={handleExport}
          >
            Import/Export
          </Button>
        </Box>
      </Box>

      {/* Filter Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Typography variant="body2" color="text.primary" sx={{ mb: 1, fontWeight: 500 }}>
            Status
          </Typography>
          <Select
            multiple
            fullWidth
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip 
                    key={value} 
                    label={statusColors[value]?.label} 
                    size="small" 
                    sx={{ bgcolor: statusColors[value]?.bg, color: statusColors[value]?.color, height: 24, fontWeight: 500 }} 
                  />
                ))}
              </Box>
            )}
            sx={{ borderRadius: 1.5, bgcolor: 'white', '& .MuiSelect-select': { py: 1.5 } }}
          >
            {Object.keys(statusColors).map(statusKey => (
               <MenuItem key={statusKey} value={statusKey}>{statusColors[statusKey].label}</MenuItem>
            ))}
          </Select>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Typography variant="body2" color="text.primary" sx={{ mb: 1, fontWeight: 500 }}>
            Priority
          </Typography>
          <Select
            multiple
            fullWidth
            size="small"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip 
                    key={value} 
                    label={priorityColors[value]?.label} 
                    size="small" 
                    sx={{ bgcolor: priorityColors[value]?.bg, color: priorityColors[value]?.color, height: 24, fontWeight: 500 }} 
                  />
                ))}
              </Box>
            )}
            sx={{ borderRadius: 1.5, bgcolor: 'white', '& .MuiSelect-select': { py: 1.5 } }}
          >
             {Object.keys(priorityColors).map(priorityKey => (
               <MenuItem key={priorityKey} value={priorityKey}>{priorityColors[priorityKey].label}</MenuItem>
            ))}
          </Select>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Typography variant="body2" color="text.primary" sx={{ mb: 1, fontWeight: 500 }}>
            Assigned To
          </Typography>
          <Select
            fullWidth
            size="small"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            displayEmpty
            renderValue={(selected) => {
              if (selected === 'All') return <Typography variant="body2" color="text.secondary">Select...</Typography>;
              const u = users.find(user => (user._id || user.id) === selected);
              return u ? <Typography variant="body2" color="text.primary">{u.firstName} {u.lastName}</Typography> : 'Unknown';
            }}
            sx={{ borderRadius: 1.5, bgcolor: 'white', '& .MuiSelect-select': { py: 1.5 } }}
          >
            <MenuItem value="All">All Users</MenuItem>
            {users.map(u => (
              <MenuItem key={u._id || u.id} value={u._id || u.id}>{u.firstName} {u.lastName}</MenuItem>
            ))}
          </Select>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Typography variant="body2" color="text.primary" sx={{ mb: 1, fontWeight: 500 }}>
            Due Date
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Date range"
            value={dueDateFilter}
            onChange={(e) => setDueDateFilter(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <CalendarIcon fontSize="small" sx={{ color: 'action.active' }} />
                </InputAdornment>
              )
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: 'white', py: 0.25 },
              '& .MuiInputBase-input': { color: 'text.secondary' }
            }}
          />
        </Grid>
      </Grid>

      {viewMode === 'list' ? (
        <Card sx={{ borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#fafafa' }}>
                <TableRow sx={{ '& th': { borderBottom: '1px solid #eee', fontWeight: 600, py: 2 } }}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={filteredTasks.length > 0 && selectedTasks.length === filteredTasks.length} onChange={toggleSelectAll} />
                  </TableCell>
                  <TableCell>Task Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>Status</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>Priority</TableCell>
                  <TableCell sx={{ minWidth: 200 }}>Assigned To</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow
                    key={task._id || task.id}
                    hover
                    selected={selectedTasks.includes(task._id || task.id)}
                    sx={{ '& td': { borderBottom: '1px solid #f5f5f5', py: 2 }, cursor: 'pointer' }}
                    onClick={() => navigate(`/tasks/${task._id || task.id}`)}
                  >
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedTasks.includes(task._id || task.id)} 
                        onChange={() => toggleTask(task._id || task.id)} 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500} sx={{ color: '#333' }}>
                        {task.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                       <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                         {task.description || '-'}
                       </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusColors[task.status]?.label || task.status}
                        size="small"
                        sx={{
                          bgcolor: statusColors[task.status]?.bg || '#eee',
                          color: statusColors[task.status]?.color || '#333',
                          border: `1px solid ${statusColors[task.status]?.color || '#ccc'}40`,
                          fontWeight: 500,
                          height: 24,
                          borderRadius: 4
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={priorityColors[task.priority]?.label || task.priority}
                        size="small"
                        sx={{
                          bgcolor: priorityColors[task.priority]?.bg || '#eee',
                          color: priorityColors[task.priority]?.color || '#333',
                          border: `1px solid ${priorityColors[task.priority]?.color || '#ccc'}40`,
                          fontWeight: 500,
                          height: 24,
                          borderRadius: 4
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      {task.assignedTo ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <StyledBadge online>
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem', bgcolor: '#9e9e9e' }}>
                              {task.assignedTo.firstName?.[0]}{task.assignedTo.lastName?.[0]}
                            </Avatar>
                          </StyledBadge>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#424242' }}>
                            {task.assignedTo.firstName} {task.assignedTo.lastName}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.dueDate ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ color: '#333', fontWeight: 500 }}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      ) : '-'}
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton size="small" onClick={() => navigate(`/tasks/${task._id || task.id}/edit`)}>
                          <EditIcon fontSize="small" sx={{ color: '#555' }} />
                        </IconButton>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${task._id || task.id}`); }}>
                          <VisibilityIcon fontSize="small" sx={{ color: '#555' }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => setDeleteDialog({ open: true, taskId: task._id || task.id })}>
                          <DeleteIcon fontSize="small" sx={{ color: '#555' }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTasks.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No tasks match the active filters</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid #f5f5f5' }}>
            <Typography variant="body2" color="text.primary" sx={{ mr: 2, fontWeight: 500 }}>
              Showing {filteredTasks.length} visible Tasks
            </Typography>
            <Box>
               <Typography component="span" variant="body2" sx={{ cursor: 'pointer', mr: 2, color: page > 1 ? '#1976d2' : '#bdbdbd' }} onClick={() => handleChangePage('prev')}>
                  {'<'}
               </Typography>
               <Typography component="span" variant="body2" sx={{ cursor: 'pointer', color: tasks.length === 10 ? '#1976d2' : '#bdbdbd' }} onClick={() => handleChangePage('next')}>
                  {'>'}
               </Typography>
            </Box>
          </Box>
        </Card>
      ) : (
        <BoardView tasks={tasks} onStatusChange={handleStatusChange} />
      )}

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, taskId: null })}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this task? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, taskId: null })}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskList;
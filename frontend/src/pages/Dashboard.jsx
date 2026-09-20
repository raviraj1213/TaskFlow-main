import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Grid, Card, CardContent, Typography, Box, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Avatar, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, Add as AddIcon } from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchTasks, deleteTask } from '../store/taskSlice';
import api from '../api/api';

const statusColors = {
  todo: '#9E9E9E',
  in_progress: '#2196F3',
  review: '#FF9800',
  done: '#4CAF50'
};

const priorityColors = {
  low: '#9E9E9E',
  medium: '#2196F3',
  high: '#FF9800',
  urgent: '#F44336'
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tasks, total, loading } = useSelector((state) => state.tasks);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, taskId: null });

  const handleDelete = async () => {
    if (deleteDialog.taskId) {
      await dispatch(deleteTask(deleteDialog.taskId));
      setDeleteDialog({ open: false, taskId: null });
    }
  };

  useEffect(() => {
    dispatch(fetchTasks({ limit: 100 }));
    api.get('/users/list').then(r => setUsers(r.data.users || [])).catch(() => {});
  }, [dispatch]);

  const tasksByStatus = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const donutData = Object.keys(tasksByStatus).map(key => ({
    name: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: tasksByStatus[key],
    color: statusColors[key]
  }));

  const tasksByPriority = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {});

  // Bar chart expects array of objects
  const barData = Object.keys(tasksByPriority).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    count: tasksByPriority[key],
    fill: priorityColors[key]
  })).sort((a,b) => b.count - a.count);

  const myUserId = currentUser?._id || currentUser?.id;
  
  const myTasksList = tasks.filter(t => {
    const createdById = t.createdBy?._id || t.createdBy?.id || t.createdBy;
    const assignedToId = t.assignedTo?._id || t.assignedTo?.id || t.assignedTo;
    return String(createdById) === String(myUserId) || String(assignedToId) === String(myUserId);
  });
  
  const myTasks = myTasksList.length;

  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const due = t.dueDate.split('T')[0];
    return due < today && t.status !== 'done';
  }).length;

  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name, color }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.4;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <g>
        <rect x={x - 40} y={y - 12} width={80} height={24} rx={6} fill="#f5f5f5" stroke={color} strokeWidth={1} />
        <text x={x} y={y} fill={color} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="600">
          {`${name}: ${value}`}
        </text>
        <line x1={cx + (outerRadius + 5) * Math.cos(-midAngle * RADIAN)} y1={cy + (outerRadius + 5) * Math.sin(-midAngle * RADIAN)} x2={x - (x > cx ? 40 : -40)} y2={y} stroke={color} />
      </g>
    );
  };
   
  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="500">
          Team Performance Dashboard
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/tasks/new')} sx={{ bgcolor: '#1976d2', textTransform: 'none', borderRadius: 1.5 }}>
          New Task
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            <CardContent>
              <Typography color="text.primary" variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Total Tasks Overview
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4" fontWeight="600">{total}</Typography>
                <Chip size="small" label="↑ +0%" sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, borderRadius: 1 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            <CardContent>
              <Typography color="text.primary" variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                My Tasks Overview
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4" fontWeight="600">{myTasks}</Typography>
                <Chip size="small" label="↑ +0%" sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, borderRadius: 1 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 2, bgcolor: '#fef2f2', border: '1px solid #fecaca', boxShadow: 'none' }}>
            <CardContent>
              <Typography color="text.primary" variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Overdue Overview
              </Typography>
              <Typography variant="h4" fontWeight="600" sx={{ color: '#ef4444' }}>
                {overdueTasks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', boxShadow: 'none' }}>
            <CardContent>
              <Typography color="text.primary" variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Completed
              </Typography>
              <Typography variant="h4" fontWeight="600" sx={{ color: '#22c55e' }}>
                {tasksByStatus.done || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="500" gutterBottom sx={{ fontSize: '1.1rem' }}>
                Task Distribution by Status
              </Typography>
              <Box sx={{ height: 300, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {donutData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                        label={CustomPieLabel}
                        labelLine={false}
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="text.secondary">No tasks available</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="500" gutterBottom sx={{ fontSize: '1.1rem' }}>
                Priority Analysis
              </Typography>
              <Box sx={{ height: 300, width: '100%', mt: 2 }}>
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={barData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }} barCategoryGap={15}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fill: '#333', fontSize: 13 }} />
                      <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} />
                      <Bar dataKey="count" barSize={35} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#666', fontSize: 13, fontWeight: 500 }}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography color="text.secondary">No tasks available</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="500" gutterBottom sx={{ fontSize: '1.1rem' }}>
                My Recent Tasks
              </Typography>
              <TableContainer>
                <Table size="small" sx={{ mt: 1 }}>
                  <TableHead>
                    <TableRow sx={{ '& th': { borderBottom: '1px solid #eee', pb: 1, color: '#666' } }}>
                      <TableCell sx={{ fontWeight: '600' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Priority</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Due Date</TableCell>
                      <TableCell align="right" sx={{ fontWeight: '600' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myTasksList.slice(0, 4).map((row) => (
                      <TableRow key={row._id} sx={{ '& td': { borderBottom: '1px solid #f5f5f5', py: 1.5 } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{row.title}</TableCell>
                        <TableCell>
                          <Chip 
                            label={row.status.replace('_', ' ')} 
                            size="small" 
                            sx={{ 
                              bgcolor: statusColors[row.status] + '20', 
                              color: statusColors[row.status], 
                              textTransform: 'capitalize',
                              fontWeight: 600,
                              height: 24,
                              borderRadius: 1
                            }} 
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={row.priority} 
                            size="small" 
                            sx={{ 
                              bgcolor: priorityColors[row.priority] + '20', 
                              color: priorityColors[row.priority], 
                              textTransform: 'capitalize',
                              fontWeight: 600,
                              height: 24,
                              borderRadius: 1
                            }} 
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#666', fontSize: '0.85rem' }}>
                          {row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => navigate(`/tasks/${row._id || row.id}/edit`)}>
                            <EditIcon fontSize="small" sx={{ color: '#666' }} />
                          </IconButton>
                          <IconButton size="small" onClick={() => navigate(`/tasks/${row._id || row.id}`)}>
                            <VisibilityIcon fontSize="small" sx={{ color: '#666' }}/>
                          </IconButton>
                          <IconButton size="small" onClick={() => setDeleteDialog({ open: true, taskId: row._id || row.id })}>
                            <DeleteIcon fontSize="small" sx={{ color: '#666' }}/>
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {myTasksList.length === 0 && (
                      <TableRow>
                         <TableCell colSpan={5} align="center" sx={{py:3, color: 'text.secondary'}}>No recent tasks found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {myTasksList.length > 0 && (
                 <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                       1-{Math.min(4, myTasksList.length)} of {myTasksList.length}
                    </Typography>
                 </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="500" gutterBottom sx={{ fontSize: '1.1rem' }}>
                Recent Team Activity
              </Typography>
              <TableContainer>
                <Table size="small" sx={{ mt: 1 }}>
                  <TableHead>
                    <TableRow sx={{ '& th': { borderBottom: '1px solid #eee', pb: 1, color: '#666' } }}>
                      <TableCell sx={{ fontWeight: '600' }}>User</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Role</TableCell>
                      <TableCell align="right" sx={{ fontWeight: '600' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.slice(0, 3).map((u) => (
                      <TableRow key={u._id} sx={{ '& td': { borderBottom: '1px solid #f5f5f5', py: 1.5 } }}>
                        <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 500, borderBottom: 'none' }}>
                          <Avatar sx={{ width: 30, height: 30, fontSize: '0.85rem', bgcolor: '#9e9e9e' }}>
                            {u.firstName?.[0]}{u.lastName?.[0]}
                          </Avatar>
                          {u.firstName} {u.lastName}
                        </TableCell>
                        <TableCell sx={{ color: '#666', fontSize: '0.85rem' }}>{u.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={u.role || 'user'} 
                            size="small" 
                            sx={{ 
                              bgcolor: u.role === 'admin' ? '#e3f2fd' : '#f5f5f5', 
                              color: u.role === 'admin' ? '#1976d2' : '#616161', 
                              textTransform: 'capitalize',
                              fontWeight: 600,
                              height: 24,
                              borderRadius: 1
                            }} 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => navigate('/admin/users')}>
                            <EditIcon fontSize="small" sx={{ color: '#666' }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                         <TableCell colSpan={4} align="center" sx={{py:3, color: 'text.secondary'}}>No users found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
               {users.length > 0 && (
                 <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                       1-{Math.min(3, users.length)} of {users.length}
                    </Typography>
                 </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

export default Dashboard;
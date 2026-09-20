import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Avatar,
  Grid,
  Checkbox,
  Badge
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, Upload as ImportIcon, Add as AddIcon } from '@mui/icons-material';
import { fetchUsers, updateUser, deleteUser } from '../store/userSlice';
import { showToast } from '../store/toastSlice';
import api from '../api/api';

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

const UserManagement = () => {
  const dispatch = useDispatch();
  // We extract pagination states but use local filtering for visual match
  const { users, total, page, loading } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [editDialog, setEditDialog] = useState({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null });
  const [viewDialog, setViewDialog] = useState({ open: false, user: null });
  const [inviteDialog, setInviteDialog] = useState({ open: false });
  const [inviteData, setInviteData] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'user' });
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState(['admin', 'user']);
  const [statusFilter, setStatusFilter] = useState(['active']); // Mock status since db doesn't have it

  useEffect(() => {
    // We request large limit if available or just default page to ensure local filtering works well enough
    dispatch(fetchUsers({ page: 1, limit: 100 }));
  }, [dispatch]);

  const handleEdit = (user) => {
    setEditDialog({ open: true, user });
  };

  const handleEditSave = async () => {
    const { user } = editDialog;
    const userId = user._id || user.id;
    const result = await dispatch(updateUser({
      id: userId,
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    }));
    if (updateUser.fulfilled.match(result)) {
      dispatch(showToast({ message: 'User updated successfully!', severity: 'success' }));
    } else {
      dispatch(showToast({ message: result.payload || 'Failed to update user', severity: 'error' }));
    }
    setEditDialog({ open: false, user: null });
    dispatch(fetchUsers({ page: 1, limit: 100 }));
  };

  const handleDelete = async () => {
    await dispatch(deleteUser(deleteDialog.userId));
    setDeleteDialog({ open: false, userId: null });
    dispatch(fetchUsers({ page: 1, limit: 100 }));
    dispatch(showToast({ message: 'User deleted successfully', severity: 'success' }));
  };

  const handleBulkDelete = async () => {
    // Basic bulk delete sequentially
    setConfirmBulkDelete(false);
    for (let id of selectedUsers) {
       await dispatch(deleteUser(id));
    }
    setSelectedUsers([]);
    dispatch(fetchUsers({ page: 1, limit: 100 }));
    dispatch(showToast({ message: 'Users deleted successfully', severity: 'success' }));
  };

  const handleInviteSubmit = async () => {
     try {
        if (inviteData.role === 'admin') {
           await api.post('/auth/register-admin', { ...inviteData, adminSecret: 'admin-secret-2024' });
        } else {
           await api.post('/auth/register', inviteData);
        }
        dispatch(showToast({ message: 'User invited successfully!', severity: 'success' }));
        setInviteDialog({ open: false });
        dispatch(fetchUsers({ page: 1, limit: 100 }));
     } catch (err) {
        dispatch(showToast({ message: err.response?.data?.message || 'Failed to invite user', severity: 'error' }));
     }
  };

  const handleExport = () => {
    try {
      const csvRows = ['FirstName,LastName,Email,Role,Status,JoinedDate'];
      users.forEach(u => {
        csvRows.push(`${u.firstName},${u.lastName},${u.email},${u.role || 'user'},Active,${new Date(u.createdAt).toLocaleDateString()}`);
      });
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'taskflow_users.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      dispatch(showToast({ message: 'Users exported successfully!', severity: 'success' }));
    } catch (error) {
      dispatch(showToast({ message: 'Failed to export users', severity: 'error' }));
    }
  };

  const toggleSelectAll = () => {
    const displayedUsers = filteredUsers;
    if (selectedUsers.length === displayedUsers.length) setSelectedUsers([]);
    else setSelectedUsers(displayedUsers.map((u) => u._id || u.id));
  };

  const toggleUser = (id) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(uId => uId !== id) : [...prev, id]
    );
  };

  const filteredUsers = users.filter(u => {
    const roleMatch = roleFilter.includes(u.role) || (roleFilter.includes('user') && !u.role);
    // Everyone is "active" right now since there is no inactive property in backend
    const statusMatch = statusFilter.includes('active'); 
    return roleMatch && statusMatch;
  });

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header Row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 1 }}>
        <Typography variant="h5" fontWeight="500">
          User Management
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {selectedUsers.length > 0 && (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setConfirmBulkDelete(true)}
              sx={{ borderRadius: 1.5, textTransform: 'none' }}
            >
              Delete Selected ({selectedUsers.length})
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: '#1565c0', borderRadius: 1.5, textTransform: 'none', px: 2 }}
            onClick={() => setInviteDialog({ open: true })}
          >
            Invite User
          </Button>
          <Button
            variant="outlined"
            startIcon={<ImportIcon sx={{ transform: 'rotate(180deg)' }} />}
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
            Role
          </Typography>
          <Select
            multiple
            fullWidth
            size="small"
            value={roleFilter}
            onChange={(e) => setRoleFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((val) => (
                  <Chip 
                    key={val} 
                    label={val} 
                    size="small" 
                    sx={{ 
                      bgcolor: val === 'admin' ? '#e3f2fd' : '#f5f5f5', 
                      color: val === 'admin' ? '#1976d2' : '#616161', 
                      height: 24, 
                      fontWeight: 500,
                      textTransform: 'capitalize' 
                    }} 
                  />
                ))}
              </Box>
            )}
            sx={{ borderRadius: 1.5, bgcolor: 'white', '& .MuiSelect-select': { py: 1.5 } }}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </Select>
        </Grid>

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
                {selected.map((val) => (
                  <Chip 
                    key={val} 
                    label={val} 
                    size="small" 
                    sx={{ bgcolor: '#E8F5E9', color: '#388E3C', height: 24, fontWeight: 500, textTransform: 'capitalize' }} 
                  />
                ))}
              </Box>
            )}
            sx={{ borderRadius: 1.5, bgcolor: 'white', '& .MuiSelect-select': { py: 1.5 } }}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#fafafa' }}>
              <TableRow sx={{ '& th': { borderBottom: '1px solid #eee', fontWeight: 600, py: 2 } }}>
                <TableCell padding="checkbox">
                  <Checkbox 
                     checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length} 
                     onChange={toggleSelectAll} 
                  />
                </TableCell>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow 
                   key={user._id || user.id} 
                   hover
                   selected={selectedUsers.includes(user._id || user.id)}
                   sx={{ '& td': { borderBottom: '1px solid #f5f5f5', py: 2 }, cursor: 'pointer' }}
                >
                  <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedUsers.includes(user._id || user.id)} 
                      onChange={() => toggleUser(user._id || user.id)} 
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <StyledBadge online={Math.random() > 0.3}> {/* Mock online status simulation */}
                        <Avatar sx={{ width: 34, height: 34, bgcolor: '#9e9e9e', fontSize: '0.9rem' }}>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </Avatar>
                      </StyledBadge>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#757575' }}>
                          Active recently
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#555', fontStyle: 'italic' }}>
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role || 'user'}
                      size="small"
                      sx={{ 
                        bgcolor: user.role === 'admin' ? '#e3f2fd' : '#f5f5f5', 
                        color: user.role === 'admin' ? '#1976d2' : '#616161', 
                        textTransform: 'capitalize',
                        fontWeight: 600,
                        height: 24,
                        borderRadius: 1
                      }}
                    />
                  </TableCell>
                  <TableCell>
                     <Chip
                        label="Active"
                        size="small"
                        sx={{
                          bgcolor: '#E8F5E9',
                          color: '#388E3C',
                          fontWeight: 500,
                          height: 24,
                          borderRadius: 4,
                          border: '1px solid #C8E6C9'
                        }}
                      />
                  </TableCell>
                  <TableCell sx={{ color: '#666', fontSize: '0.85rem' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                     <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <IconButton size="small" onClick={() => handleEdit(user)}>
                        <EditIcon fontSize="small" sx={{ color: '#555' }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => setViewDialog({ open: true, user })}>
                        <VisibilityIcon fontSize="small" sx={{ color: '#555' }} />
                      </IconButton>
                      {user.id !== currentUser.id && user._id !== currentUser._id ? (
                        <IconButton size="small" onClick={() => setDeleteDialog({ open: true, userId: user._id || user.id })}>
                          <DeleteIcon fontSize="small" sx={{ color: '#555' }} />
                        </IconButton>
                      ) : (
                         <IconButton size="small" disabled><DeleteIcon fontSize="small" sx={{ color: '#eee' }} /></IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No users matched the filters</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid #f5f5f5' }}>
          <Typography variant="body2" color="text.primary" sx={{ mr: 2, fontWeight: 500 }}>
             Total {filteredUsers.length} Users
          </Typography>
        </Box>
      </Card>

      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null })}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editDialog.user && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                value={editDialog.user.firstName}
                onChange={(e) => setEditDialog({
                  open: true,
                  user: { ...editDialog.user, firstName: e.target.value }
                })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Last Name"
                value={editDialog.user.lastName}
                onChange={(e) => setEditDialog({
                  open: true,
                  user: { ...editDialog.user, lastName: e.target.value }
                })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  value={editDialog.user.role || 'user'}
                  label="Role"
                  onChange={(e) => setEditDialog({
                    open: true,
                    user: { ...editDialog.user, role: e.target.value }
                  })}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, user: null })}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" disableElevation>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, userId: null })}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this user? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, userId: null })}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disableElevation>Delete</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={confirmBulkDelete} onClose={() => setConfirmBulkDelete(false)}>
        <DialogTitle>Bulk Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedUsers.length} selected users?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmBulkDelete(false)}>Cancel</Button>
          <Button onClick={handleBulkDelete} color="error" variant="contained" disableElevation>Delete Users</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, user: null })}>
        <DialogTitle>View User</DialogTitle>
        <DialogContent>
          {viewDialog.user && (
            <Box sx={{ pt: 2, minWidth: 300 }}>
               <Typography><b>Name:</b> {viewDialog.user.firstName} {viewDialog.user.lastName}</Typography>
               <Typography sx={{ mt: 1 }}><b>Email:</b> {viewDialog.user.email}</Typography>
               <Typography sx={{ mt: 1, textTransform: 'capitalize' }}><b>Role:</b> {viewDialog.user.role || 'User'}</Typography>
               <Typography sx={{ mt: 1 }}><b>Status:</b> Active</Typography>
               <Typography sx={{ mt: 1 }}><b>Joined:</b> {new Date(viewDialog.user.createdAt).toLocaleString()}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, user: null })}>Close</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={inviteDialog.open} onClose={() => setInviteDialog({ open: false })}>
        <DialogTitle>Invite New User</DialogTitle>
        <DialogContent>
           <Box sx={{ pt: 2, minWidth: 400 }}>
             <TextField fullWidth label="First Name" value={inviteData.firstName} onChange={(e) => setInviteData({...inviteData, firstName: e.target.value})} margin="normal" size="small" />
             <TextField fullWidth label="Last Name" value={inviteData.lastName} onChange={(e) => setInviteData({...inviteData, lastName: e.target.value})} margin="normal" size="small" />
             <TextField fullWidth label="Email" type="email" value={inviteData.email} onChange={(e) => setInviteData({...inviteData, email: e.target.value})} margin="normal" size="small" />
             <TextField fullWidth label="Password" type="password" value={inviteData.password} onChange={(e) => setInviteData({...inviteData, password: e.target.value})} margin="normal" size="small" />
             <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Role</InputLabel>
                <Select value={inviteData.role} label="Role" onChange={(e) => setInviteData({...inviteData, role: e.target.value})}>
                   <MenuItem value="user">User</MenuItem>
                   <MenuItem value="admin">Admin</MenuItem>
                </Select>
             </FormControl>
           </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialog({ open: false })}>Cancel</Button>
          <Button onClick={handleInviteSubmit} variant="contained" disableElevation>Send Invite</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
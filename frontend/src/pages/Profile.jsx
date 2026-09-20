import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Card, CardContent, Avatar, Grid, TextField, Button, Divider } from '@mui/material';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Box sx={{ pb: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" fontWeight="500" mb={3}>
        My Profile
      </Typography>
      
      <Card sx={{ borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 3 }}>
            <Avatar 
              sx={{ width: 100, height: 100, fontSize: '2.5rem', bgcolor: '#1976d2', fontWeight: 600 }}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="600">{user?.firstName} {user?.lastName}</Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>{user?.role === 'admin' ? 'Administrator' : 'User'}</Typography>
              <Button variant="outlined" size="small" sx={{ textTransform: 'none', borderRadius: 1.5 }}>
                Change Photo
              </Button>
            </Box>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Typography variant="h6" fontWeight="500" mb={3}>
            Personal Information
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" mb={1}>First Name</Typography>
              <TextField 
                fullWidth 
                size="small" 
                value={user?.firstName || ''} 
                disabled
                sx={{ bgcolor: '#f5f5f5', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" mb={1}>Last Name</Typography>
              <TextField 
                fullWidth 
                size="small" 
                value={user?.lastName || ''} 
                disabled
                sx={{ bgcolor: '#f5f5f5', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" mb={1}>Email Address</Typography>
              <TextField 
                fullWidth 
                size="small" 
                value={user?.email || ''} 
                disabled
                sx={{ bgcolor: '#f5f5f5', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" sx={{ textTransform: 'none', borderRadius: 1.5, px: 3 }}>
              Save Changes
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;

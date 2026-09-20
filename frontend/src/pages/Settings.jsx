import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, TextField, Button, Divider, Switch, FormControlLabel } from '@mui/material';

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  return (
    <Box sx={{ pb: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" fontWeight="500" mb={3}>
        Account Settings
      </Typography>
      
      <Card sx={{ borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee', mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="500" mb={3}>
            Change Password
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" mb={1}>Current Password</Typography>
              <TextField 
                fullWidth 
                size="small" 
                type="password"
                placeholder="Enter current password"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" mb={1}>New Password</Typography>
              <TextField 
                fullWidth 
                size="small" 
                type="password"
                placeholder="Enter new password"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" mb={1}>Confirm New Password</Typography>
              <TextField 
                fullWidth 
                size="small" 
                type="password"
                placeholder="Confirm new password"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
            <Button variant="contained" sx={{ textTransform: 'none', borderRadius: 1.5, px: 3 }}>
              Update Password
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="500" mb={3}>
            Notification Preferences
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel 
              control={<Switch checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} color="primary" />} 
              label={<Typography variant="body1">Email Notifications</Typography>} 
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: -1.5, ml: 4, mb: 1 }}>
              Receive daily summaries and task updates via email.
            </Typography>

            <Divider sx={{ my: 1 }} />

            <FormControlLabel 
              control={<Switch checked={pushNotifications} onChange={(e) => setPushNotifications(e.target.checked)} color="primary" />} 
              label={<Typography variant="body1">Push Notifications</Typography>} 
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: -1.5, ml: 4 }}>
              Receive instant alerts for mentions and urgent tasks in browser.
            </Typography>
          </Box>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
            <Button variant="contained" sx={{ textTransform: 'none', borderRadius: 1.5, px: 3 }}>
              Save Preferences
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;

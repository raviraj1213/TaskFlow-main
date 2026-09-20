import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, TextField, Button, Divider, Select, MenuItem, FormControl } from '@mui/material';

const Workspace = () => {
  const [workspaceName, setWorkspaceName] = useState('My Workspace');
  const [timezone, setTimezone] = useState('UTC');

  return (
    <Box sx={{ pb: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" fontWeight="500" mb={3}>
        Workspace Preferences
      </Typography>
      
      <Card sx={{ borderRadius: 2, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="500" mb={3}>
            General Settings
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" mb={1}>Workspace Name</Typography>
              <TextField 
                fullWidth 
                size="small" 
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" mb={1}>Default Timezone</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value="UTC">UTC (Coordinated Universal Time)</MenuItem>
                  <MenuItem value="EST">EST (Eastern Standard Time)</MenuItem>
                  <MenuItem value="PST">PST (Pacific Standard Time)</MenuItem>
                  <MenuItem value="IST">IST (Indian Standard Time)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
            <Button variant="contained" sx={{ textTransform: 'none', borderRadius: 1.5, px: 3 }}>
              Save Workspace
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Workspace;

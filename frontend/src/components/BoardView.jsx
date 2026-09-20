import { Box, Typography, Card, CardContent, Chip, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const statuses = [
  { id: 'todo', label: 'Todo', bg: '#E0E0E0', color: '#757575' },
  { id: 'in_progress', label: 'In Progress', bg: '#E3F2FD', color: '#1976D2' },
  { id: 'review', label: 'Review', bg: '#FFF3E0', color: '#F57C00' },
  { id: 'done', label: 'Done', bg: '#E8F5E9', color: '#388E3C' }
];

const priorityColors = {
  low: '#757575',
  medium: '#1976D2',
  high: '#F57C00',
  urgent: '#D32F2F'
};

const BoardView = ({ tasks, onStatusChange }) => {
  const navigate = useNavigate();

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onStatusChange(taskId, status);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, minHeight: 400 }}>
      {statuses.map(statusCol => {
        const columnTasks = tasks.filter(t => t.status === statusCol.id);
        
        return (
          <Box
            key={statusCol.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, statusCol.id)}
            sx={{
              flex: '1 1 25%',
              minWidth: 250,
              bgcolor: 'background.default',
              borderRadius: 1,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                {statusCol.label}
              </Typography>
              <Chip size="small" label={columnTasks.length} />
            </Box>
            
            {columnTasks.map(task => (
              <Card
                key={task._id || task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task._id || task.id)}
                onClick={() => navigate(`/tasks/${task._id || task.id}`)}
                sx={{
                  cursor: 'grab',
                  '&:active': { cursor: 'grabbing' },
                  '&:hover': { boxShadow: 4 }
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                    {task.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Chip
                      label={task.priority}
                      size="small"
                      sx={{
                        bgcolor: priorityColors[task.priority],
                        color: 'white',
                        textTransform: 'capitalize',
                        height: 20,
                        fontSize: '0.7rem'
                      }}
                    />
                    
                    {task.assignedTo && (
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }} title={`${task.assignedTo.firstName} ${task.assignedTo.lastName}`}>
                        {task.assignedTo.firstName?.[0]}{task.assignedTo.lastName?.[0]}
                      </Avatar>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
            
            {columnTasks.length === 0 && (
              <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1, textAlign: 'center', color: 'text.secondary', mt: 1 }}>
                <Typography variant="body2">Drop items here</Typography>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default BoardView;

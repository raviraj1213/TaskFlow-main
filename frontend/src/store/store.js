import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import taskSlice from './taskSlice';
import userSlice from './userSlice';
import toastSlice from './toastSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    tasks: taskSlice,
    users: userSlice,
    toast: toastSlice
  }
});
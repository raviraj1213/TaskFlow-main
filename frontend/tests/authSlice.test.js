import authReducer, { clearError } from '../src/store/authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  };

  it('should return initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle clearError', () => {
    const stateWithError = {
      ...initialState,
      error: 'Some error'
    };

    const result = authReducer(stateWithError, clearError());
    expect(result.error).toBeNull();
  });

  it('should handle login.pending', () => {
    const action = { type: 'auth/login/pending' };
    const result = authReducer(initialState, action);
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('should handle login.fulfilled', () => {
    const user = { id: '1', email: 'test@test.com', role: 'user' };
    const action = {
      type: 'auth/login/fulfilled',
      payload: { user, token: 'token123' }
    };
    const result = authReducer({ ...initialState, loading: true }, action);
    expect(result.loading).toBe(false);
    expect(result.isAuthenticated).toBe(true);
    expect(result.user).toEqual(user);
    expect(result.token).toBe('token123');
  });

  it('should handle login.rejected', () => {
    const action = {
      type: 'auth/login/rejected',
      payload: 'Invalid credentials'
    };
    const result = authReducer({ ...initialState, loading: true }, action);
    expect(result.loading).toBe(false);
    expect(result.error).toBe('Invalid credentials');
  });

  it('should handle logout.fulfilled', () => {
    const authenticatedState = {
      user: { id: '1' },
      token: 'token',
      isAuthenticated: true,
      loading: false,
      error: null
    };

    const result = authReducer(authenticatedState, { type: 'auth/logout/fulfilled' });
    expect(result.user).toBeNull();
    expect(result.token).toBeNull();
    expect(result.isAuthenticated).toBe(false);
  });

  it('should handle register.pending', () => {
    const action = { type: 'auth/register/pending' };
    const result = authReducer(initialState, action);
    expect(result.loading).toBe(true);
  });

  it('should handle register.fulfilled', () => {
    const user = { id: '1', email: 'test@test.com' };
    const action = {
      type: 'auth/register/fulfilled',
      payload: { user, token: 'token123' }
    };
    const result = authReducer(initialState, action);
    expect(result.isAuthenticated).toBe(true);
    expect(result.user).toEqual(user);
  });

  it('should handle fetchCurrentUser.pending', () => {
    const action = { type: 'auth/fetchCurrentUser/pending' };
    const result = authReducer(initialState, action);
    expect(result.loading).toBe(true);
  });

  it('should handle fetchCurrentUser.fulfilled', () => {
    const user = { id: '1', email: 'test@test.com', role: 'admin' };
    const action = {
      type: 'auth/fetchCurrentUser/fulfilled',
      payload: { user }
    };
    const result = authReducer({ ...initialState, loading: true }, action);
    expect(result.loading).toBe(false);
    expect(result.isAuthenticated).toBe(true);
    expect(result.user).toEqual(user);
  });

  it('should handle fetchCurrentUser.rejected', () => {
    const action = { type: 'auth/fetchCurrentUser/rejected' };
    const result = authReducer(initialState, action);
    expect(result.loading).toBe(false);
    expect(result.isAuthenticated).toBe(false);
    expect(result.user).toBeNull();
    expect(result.token).toBeNull();
  });
});
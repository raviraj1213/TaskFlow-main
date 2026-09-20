import userReducer, { clearError } from '../src/store/userSlice';

describe('userSlice', () => {
  const initialState = {
    users: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    error: null
  };

  it('should return initial state', () => {
    expect(userReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle clearError', () => {
    const stateWithError = {
      ...initialState,
      error: 'Some error'
    };

    const result = userReducer(stateWithError, clearError());
    expect(result.error).toBeNull();
  });

  it('should handle fetchUsers.pending', () => {
    const action = { type: 'users/fetchUsers/pending' };
    const result = userReducer(initialState, action);
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('should handle fetchUsers.fulfilled', () => {
    const users = [
      { id: '1', email: 'user1@test.com', role: 'user' },
      { id: '2', email: 'admin@test.com', role: 'admin' }
    ];
    const action = {
      type: 'users/fetchUsers/fulfilled',
      payload: {
        users,
        total: 2,
        page: 1,
        totalPages: 1
      }
    };
    const result = userReducer({ ...initialState, loading: true }, action);
    expect(result.loading).toBe(false);
    expect(result.users).toEqual(users);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
  });

  it('should handle fetchUsers.rejected', () => {
    const action = {
      type: 'users/fetchUsers/rejected',
      payload: 'Failed to fetch users'
    };
    const result = userReducer(initialState, action);
    expect(result.loading).toBe(false);
    expect(result.error).toBe('Failed to fetch users');
  });

  it('should handle updateUser.fulfilled', () => {
    const stateWithUsers = {
      ...initialState,
      users: [
        { id: '1', email: 'user1@test.com', role: 'user' },
        { id: '2', email: 'admin@test.com', role: 'admin' }
      ]
    };
    const updatedUser = { id: '1', email: 'user1@test.com', role: 'admin' };
    const action = {
      type: 'users/updateUser/fulfilled',
      payload: updatedUser
    };
    const result = userReducer(stateWithUsers, action);
    expect(result.users[0].role).toBe('admin');
  });

  it('should handle deleteUser.fulfilled', () => {
    const stateWithUsers = {
      ...initialState,
      users: [
        { id: '1', email: 'user1@test.com' },
        { id: '2', email: 'admin@test.com' }
      ],
      total: 2
    };
    const action = {
      type: 'users/deleteUser/fulfilled',
      payload: '1'
    };
    const result = userReducer(stateWithUsers, action);
    expect(result.users.length).toBe(1);
    expect(result.users[0].id).toBe('2');
    expect(result.total).toBe(1);
  });
});
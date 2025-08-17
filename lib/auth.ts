// NOTE: This is a simulation for a 100% local application.
// In a real-world scenario, never store passwords in plaintext.
// This uses localStorage as a mock database.

type StoredUser = {
  email: string;
  passwordHash: string; // "Hash" is aspirational, it's plaintext for simulation
  credits: number;
  lastCreditReset: number;
};

const USERS_KEY = 'hibbi_users';
const SESSION_KEY = 'hibbi_session';

const getUsers = (): StoredUser[] => {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

const saveUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Helper to check if credits need to be reset
const checkAndResetCredits = (user: StoredUser): StoredUser => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    if (now - user.lastCreditReset > oneDay) {
        return { ...user, credits: 170, lastCreditReset: now };
    }
    return user;
};

export const signUp = async (email: string, password: string): Promise<{ user: StoredUser }> => {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));

  const users = getUsers();
  const normalizedEmail = email.toLowerCase();
  const existingUser = users.find(u => u.email === normalizedEmail);

  if (existingUser) {
    throw new Error('Email already in use.');
  }

  const newUser: StoredUser = { 
    email: normalizedEmail, 
    passwordHash: password, // Storing plaintext password for simulation
    credits: 170,
    lastCreditReset: Date.now()
  };
  users.push(newUser);
  saveUsers(users);

  // Automatically log in the new user
  localStorage.setItem(SESSION_KEY, normalizedEmail);

  return { user: newUser };
};

export const login = async (email: string, password: string): Promise<{ user: StoredUser }> => {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));
  
  const users = getUsers();
  const normalizedEmail = email.toLowerCase();
  const user = users.find(u => u.email === normalizedEmail);

  if (!user || user.passwordHash !== password) {
    throw new Error('Invalid email or password.');
  }

  const updatedUser = checkAndResetCredits(user);
  if (user.credits !== updatedUser.credits || user.lastCreditReset !== updatedUser.lastCreditReset) {
      const updatedUsers = users.map(u => u.email === normalizedEmail ? updatedUser : u);
      saveUsers(updatedUsers);
  }

  localStorage.setItem(SESSION_KEY, normalizedEmail);
  return { user: updatedUser };
};

export const updateUserCredits = (email: string, credits: number) => {
    const users = getUsers();
    const normalizedEmail = email.toLowerCase();
    const userIndex = users.findIndex(u => u.email === normalizedEmail);
    if (userIndex > -1) {
        users[userIndex].credits = credits;
        saveUsers(users);
    }
};

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): StoredUser | null => {
  const userEmail = localStorage.getItem(SESSION_KEY);
  if (!userEmail) {
    return null;
  }
  
  const users = getUsers();
  const user = users.find(u => u.email === userEmail);
  
  if (user) {
    const updatedUser = checkAndResetCredits(user);
    if (user.credits !== updatedUser.credits || user.lastCreditReset !== updatedUser.lastCreditReset) {
        const updatedUsers = users.map(u => u.email === userEmail ? updatedUser : u);
        saveUsers(updatedUsers);
    }
    return updatedUser;
  }

  // Clean up session if user was deleted somehow
  logout();
  return null;
};

export const getUserData = (email: string): StoredUser | null => {
    const users = getUsers();
    const normalizedEmail = email.toLowerCase();
    const user = users.find(u => u.email === normalizedEmail);
    return user || null;
};
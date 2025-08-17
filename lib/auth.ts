// NOTE: This is a simulation for a 100% local application.
// In a real-world scenario, never store passwords in plaintext.
// This uses IndexedDB as a mock database.
import { StoredUser } from '../types';
import * as db from './db';

const SESSION_KEY = 'hibbi_session';

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

  const normalizedEmail = email.toLowerCase();
  const existingUser = await db.getUser(normalizedEmail);

  if (existingUser) {
    throw new Error('Email already in use.');
  }

  const newUser: StoredUser = { 
    email: normalizedEmail, 
    passwordHash: password, // Storing plaintext password for simulation
    credits: 170,
    lastCreditReset: Date.now()
  };
  await db.saveUser(newUser);

  // Automatically log in the new user
  localStorage.setItem(SESSION_KEY, normalizedEmail);

  return { user: newUser };
};

export const login = async (email: string, password: string): Promise<{ user: StoredUser }> => {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));
  
  const normalizedEmail = email.toLowerCase();
  const user = await db.getUser(normalizedEmail);

  if (!user || user.passwordHash !== password) {
    throw new Error('Invalid email or password.');
  }

  const updatedUser = checkAndResetCredits(user);
  if (user.credits !== updatedUser.credits || user.lastCreditReset !== updatedUser.lastCreditReset) {
      await db.saveUser(updatedUser);
  }

  localStorage.setItem(SESSION_KEY, normalizedEmail);
  return { user: updatedUser };
};

export const updateUserCredits = async (email: string, credits: number) => {
    const normalizedEmail = email.toLowerCase();
    const user = await db.getUser(normalizedEmail);
    if (user) {
        user.credits = credits;
        await db.saveUser(user);
    }
};

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = async (): Promise<StoredUser | null> => {
  const userEmail = localStorage.getItem(SESSION_KEY);
  if (!userEmail) {
    return null;
  }
  
  const user = await db.getUser(userEmail);
  
  if (user) {
    const updatedUser = checkAndResetCredits(user);
    if (user.credits !== updatedUser.credits || user.lastCreditReset !== updatedUser.lastCreditReset) {
        await db.saveUser(updatedUser);
    }
    return updatedUser;
  }

  // Clean up session if user was deleted somehow
  logout();
  return null;
};

export const getUserData = async (email: string): Promise<StoredUser | null> => {
    const normalizedEmail = email.toLowerCase();
    const user = await db.getUser(normalizedEmail);
    return user || null;
};

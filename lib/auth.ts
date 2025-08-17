
// Local anonymous session management.
import { StoredUser } from '../types.ts';
import * as db from './db.ts';

// Helper to check if credits need to be reset
const checkAndResetCredits = (user: StoredUser): StoredUser => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    if (now - user.lastCreditReset > oneDay) {
        return { ...user, credits: 170, lastCreditReset: now };
    }
    return user;
};

export const getOrCreateUser = async (): Promise<StoredUser> => {
    const existingUser = await db.getUser();

    if (existingUser) {
        const updatedUser = checkAndResetCredits(existingUser);
        if (existingUser.credits !== updatedUser.credits || existingUser.lastCreditReset !== updatedUser.lastCreditReset) {
            await db.saveUser(updatedUser);
        }
        return updatedUser;
    } else {
        const newUser: StoredUser = {
            credits: 170,
            lastCreditReset: Date.now()
        };
        await db.saveUser(newUser);
        return newUser;
    }
};


export const updateUserCredits = async (credits: number) => {
    const user = await db.getUser();
    if (user) {
        user.credits = credits;
        await db.saveUser(user);
    }
};
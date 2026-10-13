/**
 * VoltWise AI - Database & Account Management Service
 * Provides multi-user account isolation with dual-tier database architecture:
 * 1. Connects to backend REST API (SQLite / TiDB) when server is reachable
 * 2. Seamless isolated multi-tenant client database partitioned by userId
 */

import { INITIAL_APPLIANCES, TARIFF_PRESETS } from '../data/defaultData';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Initial pre-seeded accounts for instant multi-user demonstration
const SEED_USERS = [
  {
    id: 'usr_rajesh_01',
    email: 'rajesh@voltwise.ai',
    username: 'rajesh',
    fullName: 'Rajesh Sharma',
    consumerId: 'CONS-IN-482910',
    tariffCategory: 'in_residential',
    role: 'Standard Residential Consumer',
    avatarColor: '#00F2FE',
    profile: {
      tariffId: 'in_residential',
      currency: 'INR',
      budget: 3500,
      mtdUnits: 214.5,
      solarActive: false,
      appliedActions: {}
    },
    appliances: INITIAL_APPLIANCES
  },
  {
    id: 'usr_priya_02',
    email: 'priya@voltwise.ai',
    username: 'priya',
    fullName: 'Priya Patel',
    consumerId: 'CONS-IN-902184',
    tariffCategory: 'in_residential',
    role: 'Solar Prosumer (Rooftop Net Metering)',
    avatarColor: '#10B981',
    profile: {
      tariffId: 'in_residential',
      currency: 'INR',
      budget: 2000,
      mtdUnits: 145.0,
      solarActive: true,
      appliedActions: { ENABLE_SOLAR: true, SET_AC_24: true }
    },
    appliances: [
      {
        id: 'app_p1',
        name: 'Solar Heat-Pump AC (1.5 Ton 5-Star)',
        category: 'Climate',
        ratedWatts: 1100,
        standbyWatts: 3,
        dailyHours: 6.0,
        starRating: 5,
        isOn: true,
        peakHours: 1.0,
        dutyCycle: 0.55,
        tempSetpoint: 24,
        ecoMode: true,
        smartSchedule: true,
        location: 'Solar Villa',
        vampirePowerAlert: false,
        icon: 'Wind'
      },
      {
        id: 'app_p2',
        name: 'Inverter Refrigerator (420L)',
        category: 'Kitchen',
        ratedWatts: 140,
        standbyWatts: 2,
        dailyHours: 24.0,
        starRating: 5,
        isOn: true,
        peakHours: 4.0,
        dutyCycle: 0.30,
        tempSetpoint: null,
        ecoMode: true,
        smartSchedule: true,
        location: 'Kitchen',
        vampirePowerAlert: false,
        icon: 'Refrigerator'
      },
      {
        id: 'app_p3',
        name: 'BLDC Smart Ceiling Fans (5x 28W)',
        category: 'Ventilation',
        ratedWatts: 140,
        standbyWatts: 1,
        dailyHours: 12.0,
        starRating: 5,
        isOn: true,
        peakHours: 2.0,
        dutyCycle: 1.0,
        tempSetpoint: null,
        ecoMode: true,
        smartSchedule: false,
        location: 'All Rooms',
        vampirePowerAlert: false,
        icon: 'Fan'
      },
      {
        id: 'app_p4',
        name: 'Electric Vehicle Home Charger (3.3 kW)',
        category: 'EV',
        ratedWatts: 3300,
        standbyWatts: 5,
        dailyHours: 2.5,
        starRating: 5,
        isOn: false,
        peakHours: 0.0,
        dutyCycle: 1.0,
        tempSetpoint: null,
        ecoMode: true,
        smartSchedule: true,
        location: 'Garage',
        vampirePowerAlert: false,
        icon: 'Zap'
      }
    ]
  }
];

class DatabaseService {
  constructor() {
    this._initLocalDatabase();
  }

  // --- Local Database Initialization ---
  _initLocalDatabase() {
    const existingUsers = localStorage.getItem('voltwise_users');
    if (!existingUsers) {
      // Seed initial sample accounts
      const userList = SEED_USERS.map(({ appliances, profile, ...user }) => user);
      localStorage.setItem('voltwise_users', JSON.stringify(userList));

      SEED_USERS.forEach(u => {
        localStorage.setItem(`voltwise_profile_${u.id}`, JSON.stringify(u.profile));
        localStorage.setItem(`voltwise_appliances_${u.id}`, JSON.stringify(u.appliances));
      });

      // Default active user is Rajesh
      localStorage.setItem('voltwise_current_user_id', SEED_USERS[0].id);
    }
  }

  // --- Check Backend Connectivity ---
  async isBackendAvailable() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${API_BASE_URL}/`, { signal: controller.signal });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }

  // --- List All Registered Accounts ---
  async getAccounts() {
    try {
      const isOnline = await this.isBackendAvailable();
      if (isOnline) {
        const res = await fetch(`${API_BASE_URL}/auth/accounts`);
        if (res.ok) {
          const data = await res.json();
          if (data.accounts && data.accounts.length > 0) {
            return data.accounts;
          }
        }
      }
    } catch (e) {
      // fallback to local DB
    }

    const localUsers = localStorage.getItem('voltwise_users');
    return localUsers ? JSON.parse(localUsers) : [];
  }

  // --- Get Current Active User ---
  getCurrentUserId() {
    return localStorage.getItem('voltwise_current_user_id') || 'usr_rajesh_01';
  }

  async getCurrentUser() {
    const currentId = this.getCurrentUserId();
    const accounts = await this.getAccounts();
    const user = accounts.find(a => a.id === currentId) || accounts[0] || SEED_USERS[0];
    return user;
  }

  // --- Switch User Account ---
  async switchAccount(userId) {
    localStorage.setItem('voltwise_current_user_id', userId);
    return await this.loadUserData(userId);
  }

  // --- User Authentication / Login ---
  async login(identifier, password) {
    try {
      const isOnline = await this.isBackendAvailable();
      if (isOnline) {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            localStorage.setItem('voltwise_current_user_id', data.user.id);
            return { success: true, user: data.user };
          }
        }
      }
    } catch (e) {
      // Proceed to local auth fallback
    }

    // Local DB authentication fallback
    const accounts = await this.getAccounts();
    const matched = accounts.find(a => 
      a.email.toLowerCase() === identifier.toLowerCase().trim() ||
      a.consumerId.toLowerCase() === identifier.toLowerCase().trim() ||
      (a.username && a.username.toLowerCase() === identifier.toLowerCase().trim())
    );

    if (matched) {
      localStorage.setItem('voltwise_current_user_id', matched.id);
      const userData = await this.loadUserData(matched.id);
      return { success: true, user: userData.user, data: userData };
    }

    return { success: false, message: 'Invalid credentials. Enter your registered email or consumer ID.' };
  }

  // --- Register New Account ---
  async register(registrationData) {
    const { email, fullName, password, consumerId, tariffCategory = 'in_residential' } = registrationData;
    const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const username = email.split('@')[0] || 'consumer';

    const defaultProfile = {
      tariffId: tariffCategory,
      currency: tariffCategory === 'us_residential' ? 'USD' : tariffCategory === 'eu_dynamic' ? 'EUR' : 'INR',
      budget: tariffCategory === 'us_residential' ? 160 : tariffCategory === 'eu_dynamic' ? 140 : 3200,
      mtdUnits: 175.0,
      solarActive: false,
      appliedActions: {}
    };

    // User gets a clean copy of default appliances
    const userAppliances = INITIAL_APPLIANCES.map(a => ({ ...a, id: `${a.id}_${newId.slice(-4)}` }));

    // Try backend registration first
    try {
      const isOnline = await this.isBackendAvailable();
      if (isOnline) {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            username,
            fullName,
            password,
            consumerId,
            tariffId: tariffCategory,
            currency: defaultProfile.currency,
            budget: defaultProfile.budget,
            defaultAppliances: userAppliances
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            localStorage.setItem('voltwise_current_user_id', data.user.id);
            return { success: true, user: data.user };
          }
        }
      }
    } catch (e) {
      // fallback to local database
    }

    // Save in Local Partitioned DB
    const accounts = await this.getAccounts();
    const newUser = {
      id: newId,
      email,
      username,
      fullName,
      consumerId,
      tariffCategory,
      role: 'Residential Energy Consumer',
      avatarColor: ['#00F2FE', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'][Math.floor(Math.random() * 5)]
    };

    accounts.push(newUser);
    localStorage.setItem('voltwise_users', JSON.stringify(accounts));
    localStorage.setItem(`voltwise_profile_${newId}`, JSON.stringify(defaultProfile));
    localStorage.setItem(`voltwise_appliances_${newId}`, JSON.stringify(userAppliances));
    localStorage.setItem('voltwise_current_user_id', newId);

    return {
      success: true,
      user: newUser,
      profile: defaultProfile,
      appliances: userAppliances
    };
  }

  // --- Load Full Isolated User Data (Profile + Appliances) ---
  async loadUserData(userId) {
    try {
      const isOnline = await this.isBackendAvailable();
      if (isOnline) {
        const res = await fetch(`${API_BASE_URL}/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            return {
              user: data.user,
              profile: data.user.profile || {},
              appliances: data.user.appliances || []
            };
          }
        }
      }
    } catch (e) {
      // fallback
    }

    // Local partitioned storage
    const accounts = await this.getAccounts();
    const user = accounts.find(a => a.id === userId) || accounts[0] || SEED_USERS[0];

    const rawProfile = localStorage.getItem(`voltwise_profile_${userId}`);
    const profile = rawProfile ? JSON.parse(rawProfile) : (SEED_USERS.find(s => s.id === userId)?.profile || {
      tariffId: 'in_residential',
      currency: 'INR',
      budget: 3200,
      mtdUnits: 198.4,
      solarActive: false,
      appliedActions: {}
    });

    const rawAppliances = localStorage.getItem(`voltwise_appliances_${userId}`);
    const appliances = rawAppliances ? JSON.parse(rawAppliances) : (SEED_USERS.find(s => s.id === userId)?.appliances || INITIAL_APPLIANCES);

    return { user, profile, appliances };
  }

  // --- Save Profile Changes for Specific User ---
  async saveUserProfile(userId, updates) {
    // Save to local isolated storage first for instant feedback
    const rawProfile = localStorage.getItem(`voltwise_profile_${userId}`);
    const current = rawProfile ? JSON.parse(rawProfile) : {};
    const merged = { ...current, ...updates };
    localStorage.setItem(`voltwise_profile_${userId}`, JSON.stringify(merged));

    // Async sync to backend database if available
    try {
      const isOnline = await this.isBackendAvailable();
      if (isOnline) {
        await fetch(`${API_BASE_URL}/user/${userId}/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
      }
    } catch {
      // Backend offline, safe in client database
    }

    return merged;
  }

  // --- Save Appliances Inventory for Specific User ---
  async saveUserAppliances(userId, appliances) {
    // Save in local partitioned storage
    localStorage.setItem(`voltwise_appliances_${userId}`, JSON.stringify(appliances));

    // Async sync to backend database if available
    try {
      const isOnline = await this.isBackendAvailable();
      if (isOnline) {
        await fetch(`${API_BASE_URL}/user/${userId}/appliances`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appliances })
        });
      }
    } catch {
      // Backend offline, safe in client database
    }

    return appliances;
  }

  // --- Reset User Data back to initial state ---
  async resetUserData(userId) {
    const seed = SEED_USERS.find(s => s.id === userId);
    const profile = seed ? seed.profile : {
      tariffId: 'in_residential',
      currency: 'INR',
      budget: 3200,
      mtdUnits: 198.4,
      solarActive: false,
      appliedActions: {}
    };
    const appliances = seed ? seed.appliances : INITIAL_APPLIANCES;

    await this.saveUserProfile(userId, profile);
    await this.saveUserAppliances(userId, appliances);

    return { profile, appliances };
  }
}

export const dbService = new DatabaseService();

import { Project, Question, AppSettings } from '../types';
import { GeminiClient } from './geminiClient';

const API_BASE = '/api';

export interface HealthStatus {
  status: string;
  database: string;
  dbConnected: boolean;
  projectCount?: number;
  geminiConfigured: boolean;
}

export class ApiClient {
  /**
   * Checks backend server & MongoDB connection status.
   */
  public static async checkHealth(): Promise<HealthStatus> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend not running or offline
    }
    return {
      status: 'offline',
      database: 'disconnected',
      dbConnected: false,
      geminiConfigured: true,
    };
  }

  /**
   * Re-triggers MongoDB connection attempt on backend.
   */
  public static async reconnect(): Promise<HealthStatus> {
    try {
      await fetch(`${API_BASE}/reconnect`, { method: 'POST' });
    } catch {
      // Ignore
    }
    return this.checkHealth();
  }


  /**
   * Fetches global application settings from MongoDB.
   */
  public static async getSettings(): Promise<AppSettings | null> {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Could not fetch settings from MongoDB:', e);
    }
    return null;
  }

  /**
   * Saves or updates global application settings in MongoDB.
   */
  public static async saveSettings(settings: AppSettings): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      return res.ok;
    } catch (e) {
      console.warn('Could not save settings to MongoDB:', e);
      return false;
    }
  }

  /**
   * Fetches all projects from MongoDB.
   */
  public static async getProjects(): Promise<Project[] | null> {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend unavailable for getProjects:', e);
    }
    return null;
  }

  /**
   * Fetches a single project by ID from MongoDB.
   */
  public static async getProject(projectId: string): Promise<Project | null> {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn(`Backend unavailable for getProject(${projectId}):`, e);
    }
    return null;
  }

  /**
   * Saves or updates a project in MongoDB.
   */
  public static async saveProject(project: Project): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      return res.ok;
    } catch (e) {
      console.warn('Could not save project to MongoDB:', e);
      return false;
    }
  }

  /**
   * Deletes a project from MongoDB.
   */
  public static async deleteProject(projectId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.warn('Could not delete project from MongoDB:', e);
      return false;
    }
  }

  /**
   * Performs bulk data migration from browser localStorage to MongoDB.
   */
  public static async migrateToMongoDB(
    projects: Project[],
    settings?: AppSettings
  ): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      const res = await fetch(`${API_BASE}/migrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects, settings }),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          message: data.message || 'Migration complete.',
          count: data.migratedProjectsCount,
        };
      }
    } catch (e: any) {
      console.warn('Migration request failed:', e);
    }
    return {
      success: false,
      message: 'Failed to communicate with MongoDB backend migration endpoint.',
    };
  }

  /**
   * Requests Gemini AI notes generation from the backend server or direct Gemini client.
   */
  public static async generateWithGemini(
    questions: Question[],
    projectTitle: string,
    tone: string
  ): Promise<any | null> {
    // 1. Try Backend Server
    try {
      const res = await fetch(`${API_BASE}/ai/analyze-and-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions, projectTitle, tone }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          return data.data;
        }
      }
    } catch {
      // Backend unavailable
    }

    // 2. Direct Browser Gemini Client Fallback
    try {
      const directData = await GeminiClient.generateDirect(questions, projectTitle, tone);
      if (directData) {
        return directData;
      }
    } catch (err) {
      console.warn('Direct Gemini API synthesis attempt failed:', err);
    }

    return null;
  }
}

import { Router } from 'express';
import { ProjectModel } from '../models/Project';
import { SettingsModel } from '../models/Settings';
import { GeminiService } from '../services/geminiService';
import { isDbConnected } from '../db';

export const apiRouter = Router();

// =========================================================================
// 1. HEALTH & DATABASE STATUS ENDPOINT
// =========================================================================
apiRouter.get('/health', async (_req, res) => {
  const dbConnected = isDbConnected();
  let projectCount = 0;

  if (dbConnected) {
    try {
      projectCount = await ProjectModel.countDocuments();
    } catch {
      projectCount = 0;
    }
  }

  res.json({
    status: 'ok',
    database: dbConnected ? 'connected (MongoDB Atlas)' : 'disconnected (using client/memory fallback)',
    dbConnected,
    projectCount,
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

apiRouter.post('/reconnect', async (_req, res) => {
  const connected = await connectToDatabase();
  res.json({
    success: connected,
    dbConnected: isDbConnected(),
    database: connected ? 'connected (MongoDB Atlas)' : 'disconnected',
  });
});

// =========================================================================
// 2. SETTINGS CRUD ENDPOINTS (MONGODB)
// =========================================================================
apiRouter.get('/settings', async (_req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    let settings = await SettingsModel.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = await SettingsModel.create({ key: 'global_settings' });
    }
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/settings', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const data = req.body;
    data.key = 'global_settings';

    const updated = await SettingsModel.findOneAndUpdate(
      { key: 'global_settings' },
      { $set: data },
      { returnDocument: 'after', upsert: true }
    );
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/settings', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const data = req.body;
    data.key = 'global_settings';

    const updated = await SettingsModel.findOneAndUpdate(
      { key: 'global_settings' },
      { $set: data },
      { returnDocument: 'after', upsert: true }
    );
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// 3. BULK MIGRATION ENDPOINT (LOCALSTORAGE -> MONGODB)
// =========================================================================
apiRouter.post('/migrate', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'MongoDB database is not connected.' });
    }

    const { projects = [], settings } = req.body;
    let migratedProjectsCount = 0;
    let migratedSettings = false;

    // 1. Bulk Upsert Projects
    if (Array.isArray(projects) && projects.length > 0) {
      for (const proj of projects) {
        if (proj && proj.id) {
          await ProjectModel.findOneAndUpdate(
            { id: proj.id },
            { $set: proj },
            { upsert: true, returnDocument: 'after' }
          );
          migratedProjectsCount++;
        }
      }
    }

    // 2. Upsert Settings
    if (settings && typeof settings === 'object') {
      settings.key = 'global_settings';
      await SettingsModel.findOneAndUpdate(
        { key: 'global_settings' },
        { $set: settings },
        { upsert: true, returnDocument: 'after' }
      );
      migratedSettings = true;
    }

    res.json({
      success: true,
      message: `Successfully migrated ${migratedProjectsCount} projects to MongoDB.`,
      migratedProjectsCount,
      migratedSettings,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: `Migration error: ${err.message}` });
  }
});

// =========================================================================
// 4. PROJECTS CRUD ENDPOINTS (MONGODB)
// =========================================================================
apiRouter.get('/projects', async (_req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json([]);
    }
    const projects = await ProjectModel.find().sort({ updatedAt: -1 });
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/projects/:id', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(404).json({ error: 'Database not connected' });
    }
    const project = await ProjectModel.findOne({ id: req.params.id });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/projects', async (req, res) => {
  try {
    const projectData = req.body;
    if (!projectData.id) {
      projectData.id = `proj-${Date.now()}`;
    }

    if (!isDbConnected()) {
      return res.json({ success: true, project: projectData, savedIn: 'client-fallback' });
    }

    const project = await ProjectModel.findOneAndUpdate(
      { id: projectData.id },
      { $set: projectData },
      { returnDocument: 'after', upsert: true }
    );
    res.json({ success: true, project, savedIn: 'mongodb' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/projects/:id', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, project: req.body, savedIn: 'client-fallback' });
    }
    const updated = await ProjectModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { returnDocument: 'after', upsert: true }
    );
    res.json({ success: true, project: updated, savedIn: 'mongodb' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/projects/:id', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, deleted: req.params.id });
    }
    await ProjectModel.deleteOne({ id: req.params.id });
    res.json({ success: true, deleted: req.params.id, savedIn: 'mongodb' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// 5. GEMINI AI ANALYSIS & NOTES SYNTHESIS
// =========================================================================
apiRouter.post('/ai/analyze-and-generate', async (req, res) => {
  try {
    const { questions, projectTitle, tone } = req.body;
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'Questions array is required.' });
    }

    const geminiResult = await GeminiService.analyzeAndGenerateNotes({
      questions,
      projectTitle,
      tone,
    });

    res.json({
      success: true,
      source: geminiResult ? 'gemini-api' : 'local-engine-fallback',
      data: geminiResult,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

import React, { useState, useEffect, useCallback } from 'react';
import { Project, Question, GeneratedNotes, AppSettings, TemplateId } from './types';
import { AINotesEngine } from './services/aiNotesEngine';
import { ApiClient, HealthStatus } from './services/apiClient';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { AddQuestionsView } from './components/questions/AddQuestionsView';
import { NotesEditor } from './components/editor/NotesEditor';
import { PDFPreviewModal } from './components/pdf/PDFPreviewModal';
import { TemplatesView } from './components/templates/TemplatesView';
import { AIProcessingModal } from './components/ai/AIProcessingModal';
import { SettingsModal } from './components/settings/SettingsModal';

const DEFAULT_SETTINGS: AppSettings = {
  watermarkOpacity: 0.12,
  watermarkPosition: 'diagonal',
  watermarkScale: 0.95,
  defaultFont: 'SF Pro Display',
  defaultTemplate: 'reference-style',
  instituteName: 'MAKAUT CSE / IT Department',
  authorName: 'Gen-Zineers Academic Studio',
  aiTone: 'simple-academic',
  aiProvider: 'gemini-flash',
};

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<
    'dashboard' | 'questions' | 'editor' | 'preview' | 'templates' | 'library'
  >('dashboard');

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('ai_notes_theme') === 'dark';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAIProcessing, setIsAIProcessing] = useState<boolean>(false);
  const [savedStatus, setSavedStatus] = useState<'saved' | 'saving' | 'idle'>('saved');

  // Database Connection Health
  const [dbHealth, setDbHealth] = useState<HealthStatus>({
    status: 'connecting',
    database: 'connecting',
    dbConnected: false,
    geminiConfigured: true,
  });

  // App Settings (MongoDB Source of Truth)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Projects State (MongoDB Source of Truth)
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isInitialLoaded, setIsInitialLoaded] = useState<boolean>(false);

  // 1. Initial Data Load & Migration Workflow from MongoDB
  const loadDatabaseData = useCallback(async () => {
    try {
      // 1.1 Check Health
      const health = await ApiClient.checkHealth();
      setDbHealth(health);

      // 1.2 Check & Migrate any Legacy LocalStorage Data
      const legacyProjectsRaw = localStorage.getItem('ai_notes_projects');
      const legacySettingsRaw = localStorage.getItem('ai_notes_settings');
      let localProjects: Project[] = [];
      let localSettings: AppSettings | undefined = undefined;

      if (legacyProjectsRaw) {
        try {
          localProjects = JSON.parse(legacyProjectsRaw);
        } catch {}
      }
      if (legacySettingsRaw) {
        try {
          localSettings = JSON.parse(legacySettingsRaw);
        } catch {}
      }

      // If legacy local data exists and MongoDB is reachable, migrate it
      if (health.dbConnected && (localProjects.length > 0 || localSettings)) {
        console.log('📦 Migrating legacy browser storage records to MongoDB Atlas...');
        await ApiClient.migrateToMongoDB(localProjects, localSettings);
        // Clean up legacy localStorage database store
        localStorage.removeItem('ai_notes_projects');
      }

      // 1.3 Fetch Settings from MongoDB
      const remoteSettings = await ApiClient.getSettings();
      if (remoteSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...remoteSettings });
      } else if (localSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...localSettings });
      }

      // 1.4 Fetch Projects from MongoDB
      const remoteProjects = await ApiClient.getProjects();
      if (remoteProjects && remoteProjects.length > 0) {
        setProjects(remoteProjects);
        setActiveProject(remoteProjects[0]);
      } else if (localProjects.length > 0) {
        setProjects(localProjects);
        setActiveProject(localProjects[0]);
      } else {
        // Initialize standard reference project if completely empty
        const initProject: Project = {
          id: 'proj-coa-initial',
          title: 'Computer Organization & Architecture (Modules 1 & 2)',
          subject: 'Computer Organization & Architecture',
          description:
            'Comprehensive exam notes covering Von Neumann architecture, instruction cycles, CLA adders, and IEEE-754 format.',
          questions: [
            { id: 'q1', number: 1, text: 'What is stored program concept?', type: 'Very Short Answer', marks: 1, module: 'Module-1', order: 1 },
            { id: 'q2', number: 2, text: 'What is instruction format?', type: 'Very Short Answer', marks: 1, module: 'Module-1', order: 2 },
            { id: 'q3', number: 3, text: 'Define opcode.', type: 'Definition', marks: 1, module: 'Module-1', order: 3 },
            { id: 'q4', number: 4, text: 'What is addressing mode?', type: 'Very Short Answer', marks: 1, module: 'Module-1', order: 4 },
            { id: 'q5', number: 5, text: 'What is program counter?', type: 'Very Short Answer', marks: 1, module: 'Module-1', order: 5 },
            { id: 'q6', number: 6, text: 'Explain stored program computer and instruction execution cycle with diagram.', type: 'Long Answer', marks: 15, module: 'Module-1', order: 6 },
            { id: 'q7', number: 7, text: 'What is ripple carry adder?', type: 'Very Short Answer', marks: 1, module: 'Module-2', order: 7 },
            { id: 'q8', number: 8, text: 'What is carry look-ahead adder?', type: 'Very Short Answer', marks: 1, module: 'Module-2', order: 8 },
            { id: 'q9', number: 9, text: 'Explain carry look-ahead adder and compare with ripple carry adder.', type: 'Long Answer', marks: 15, module: 'Module-2', order: 9 },
            { id: 'q10', number: 10, text: 'Explain IEEE-754 floating point representation with format.', type: 'Short Answer', marks: 5, module: 'Module-2', order: 10 },
          ],
          versions: [],
          status: 'generated',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const analysis = await AINotesEngine.analyzeQuestions(initProject.questions, settings);
        const notes = await AINotesEngine.generateCompleteNotes(
          initProject.id,
          initProject.title,
          initProject.questions,
          analysis,
          'reference-style',
          settings
        );

        const syncedQuestions = initProject.questions.map((q, idx) => ({
          ...q,
          answerStatus: 'completed' as const,
          generatedAnswer: notes.qaSection[idx] || undefined,
        }));
        initProject.questions = syncedQuestions;
        initProject.analysis = analysis;
        initProject.generatedNotes = notes;
        initProject.versions = [notes];

        // Save initial project to MongoDB
        await ApiClient.saveProject(initProject);
        setProjects([initProject]);
        setActiveProject(initProject);
      }
    } catch (err) {
      console.warn('Initial data load warning:', err);
    } finally {
      setIsInitialLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadDatabaseData();

    // Check DB health periodically every 8 seconds
    const interval = setInterval(async () => {
      try {
        const health = await ApiClient.checkHealth();
        setDbHealth(health);
      } catch {}
    }, 8000);

    return () => clearInterval(interval);
  }, [loadDatabaseData]);

  // 2. Persist Settings to MongoDB
  const handleUpdateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    setSavedStatus('saving');
    await ApiClient.saveSettings(newSettings);
    setSavedStatus('saved');
  };

  // 3. Dark Mode UI Toggle (Permitted Local UI State)
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ai_notes_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ai_notes_theme', 'light');
    }
  }, [isDarkMode]);

  // 4. Create New Project Handler (MongoDB Persisted)
  const handleCreateNewProject = async () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: 'New Examination Notes Project',
      subject: 'Engineering & Applied Sciences',
      description: 'Custom question bank and exam study notes.',
      questions: [],
      versions: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSavedStatus('saving');
    await ApiClient.saveProject(newProj);
    setProjects([newProj, ...projects]);
    setActiveProject(newProj);
    setCurrentTab('questions');
    setSavedStatus('saved');
  };

  // 5. Duplicate Project Handler (MongoDB Persisted)
  const handleDuplicateProject = async (project: Project) => {
    const copy: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      title: `${project.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSavedStatus('saving');
    await ApiClient.saveProject(copy);
    setProjects([copy, ...projects]);
    setSavedStatus('saved');
  };

  // 6. Delete Project Handler (MongoDB Persisted)
  const handleDeleteProject = async (projectId: string) => {
    setSavedStatus('saving');
    await ApiClient.deleteProject(projectId);
    const filtered = projects.filter((p) => p.id !== projectId);
    setProjects(filtered);
    if (activeProject?.id === projectId) {
      setActiveProject(filtered[0] || null);
    }
    setSavedStatus('saved');
  };

  // 7. Update Questions in Active Project (MongoDB Persisted)
  const handleUpdateQuestions = async (questions: Question[]) => {
    if (!activeProject) return;
    const updated: Project = {
      ...activeProject,
      questions,
      updatedAt: new Date().toISOString(),
    };
    setActiveProject(updated);
    setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    setSavedStatus('saving');
    await ApiClient.saveProject(updated);
    setSavedStatus('saved');
  };

  // 8. Update Project Title & Subject (MongoDB Persisted)
  const handleUpdateProjectTitle = async (title: string) => {
    if (!activeProject) return;
    const updated: Project = {
      ...activeProject,
      title,
      updatedAt: new Date().toISOString(),
    };
    setActiveProject(updated);
    setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    setSavedStatus('saving');
    await ApiClient.saveProject(updated);
    setSavedStatus('saved');
  };

  const handleUpdateProjectSubject = async (subject: string) => {
    if (!activeProject) return;
    const updated: Project = {
      ...activeProject,
      subject,
      updatedAt: new Date().toISOString(),
    };
    setActiveProject(updated);
    setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    setSavedStatus('saving');
    await ApiClient.saveProject(updated);
    setSavedStatus('saved');
  };

  // 9. Update Generated Notes (MongoDB Persisted)
  const handleUpdateNotes = async (notes: GeneratedNotes) => {
    if (!activeProject) return;
    const updated: Project = {
      ...activeProject,
      generatedNotes: notes,
      status: 'generated',
      updatedAt: new Date().toISOString(),
    };
    setActiveProject(updated);
    setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    setSavedStatus('saving');
    await ApiClient.saveProject(updated);
    setSavedStatus('saved');
  };

  // 10. Save Version History (MongoDB Persisted)
  const handleSaveVersion = async () => {
    if (!activeProject || !activeProject.generatedNotes) return;
    const currentNotes = activeProject.generatedNotes;
    const newVersion: GeneratedNotes = {
      ...currentNotes,
      version: (activeProject.versions?.length || 1) + 1,
      updatedAt: new Date().toISOString(),
    };
    const updatedVersions = [...(activeProject.versions || []), newVersion];
    const updatedProj: Project = {
      ...activeProject,
      generatedNotes: newVersion,
      versions: updatedVersions,
      updatedAt: new Date().toISOString(),
    };
    setActiveProject(updatedProj);
    setProjects(projects.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
    setSavedStatus('saving');
    await ApiClient.saveProject(updatedProj);
    setSavedStatus('saved');
  };

  // 11. Trigger AI Analysis Workflow
  const handleStartAnalysis = async () => {
    if (!activeProject || activeProject.questions.length === 0) return;
    setIsAIProcessing(true);
  };

  const handleAIProcessingComplete = async () => {
    if (!activeProject) return;
    try {
      const analysis = await AINotesEngine.analyzeQuestions(activeProject.questions, settings);
      const generated = await AINotesEngine.generateCompleteNotes(
        activeProject.id,
        activeProject.title,
        activeProject.questions,
        analysis,
        settings.defaultTemplate,
        settings
      );

      const syncedQuestions = activeProject.questions.map((q, idx) => ({
        ...q,
        answerStatus: 'completed' as const,
        generatedAnswer: generated.qaSection[idx] || undefined,
      }));

      const updatedProj: Project = {
        ...activeProject,
        questions: syncedQuestions,
        analysis,
        generatedNotes: generated,
        status: 'generated',
        versions: [...(activeProject.versions || []), generated],
        updatedAt: new Date().toISOString(),
      };

      setActiveProject(updatedProj);
      setProjects(projects.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
      setSavedStatus('saving');
      await ApiClient.saveProject(updatedProj);
      setSavedStatus('saved');
      setIsAIProcessing(false);
      setCurrentTab('editor');
    } catch (e) {
      console.error(e);
      setIsAIProcessing(false);
      alert('Error during AI synthesis. Please try again.');
    }
  };

  // 12. Select Template
  const handleSelectTemplate = (templateId: TemplateId) => {
    handleUpdateSettings({ ...settings, defaultTemplate: templateId });
    if (activeProject && activeProject.generatedNotes) {
      const updatedNotes = { ...activeProject.generatedNotes, template: templateId };
      handleUpdateNotes(updatedNotes);
    }
    setCurrentTab('editor');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FB] dark:bg-[#0A0D14] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navigation Bar with Database Live Status */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        savedStatus={savedStatus}
        dbConnected={dbHealth.dbConnected}
      />

      {/* Main Content Viewports */}
      <main className="flex-1">
        {currentTab === 'dashboard' && (
          <DashboardView
            projects={projects}
            onOpenProject={(proj) => {
              setActiveProject(proj);
              if (proj.generatedNotes) {
                setCurrentTab('editor');
              } else {
                setCurrentTab('questions');
              }
            }}
            onCreateNew={handleCreateNewProject}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            onSelectTemplate={handleSelectTemplate}
          />
        )}

        {currentTab === 'questions' && (
          <AddQuestionsView
            questions={activeProject?.questions || []}
            onUpdateQuestions={handleUpdateQuestions}
            projectTitle={activeProject?.title || 'New Examination Project'}
            onUpdateProjectTitle={handleUpdateProjectTitle}
            projectSubject={activeProject?.subject || 'General Engineering & Applied Sciences'}
            onUpdateProjectSubject={handleUpdateProjectSubject}
            generatedNotes={activeProject?.generatedNotes}
            onUpdateNotes={handleUpdateNotes}
            onStartAnalysis={handleStartAnalysis}
            onNavigateToEditor={() => setCurrentTab('editor')}
            onNavigateToPreview={() => setCurrentTab('preview')}
            settings={settings}
          />
        )}

        {currentTab === 'editor' && (
          activeProject?.generatedNotes ? (
            <NotesEditor
              notes={activeProject.generatedNotes}
              onUpdateNotes={handleUpdateNotes}
              settings={settings}
              onNavigateToPreview={() => setCurrentTab('preview')}
              onSaveVersion={handleSaveVersion}
            />
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
              <div className="clay-card p-10">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                  No Notes Generated for this Project Yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Add questions first in the Question Workspace, then click "Analyze with AI" to generate structured notes.
                </p>
                <button
                  onClick={() => setCurrentTab('questions')}
                  className="clay-btn-primary px-6 py-2.5 text-xs font-bold cursor-pointer"
                >
                  Go to Questions Workspace
                </button>
              </div>
            </div>
          )
        )}

        {currentTab === 'preview' && (
          activeProject?.generatedNotes ? (
            <PDFPreviewModal
              notes={activeProject.generatedNotes}
              settings={settings}
              onEditNotes={() => setCurrentTab('editor')}
              onUpdateSettings={handleUpdateSettings}
              onUpdateNotes={handleUpdateNotes}
            />
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
              <div className="clay-card p-10">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                  No PDF Available to Preview
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Please generate notes from your questions first.
                </p>
                <button
                  onClick={() => setCurrentTab('questions')}
                  className="clay-btn-primary px-6 py-2.5 text-xs font-bold cursor-pointer"
                >
                  Go to Questions Workspace
                </button>
              </div>
            </div>
          )
        )}

        {currentTab === 'templates' && (
          <TemplatesView
            currentTemplate={settings.defaultTemplate}
            onSelectTemplate={handleSelectTemplate}
            onNavigateToEditor={() => setCurrentTab('editor')}
          />
        )}
      </main>

      {/* AI Cinematic Processing Modal */}
      <AIProcessingModal
        isOpen={isAIProcessing}
        onComplete={handleAIProcessingComplete}
        questionCount={activeProject?.questions.length || 0}
      />

      {/* Settings & Database Admin Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        dbStatus={dbHealth}
        projects={projects}
        onRefreshProjects={loadDatabaseData}
      />
    </div>
  );
};

export default App;

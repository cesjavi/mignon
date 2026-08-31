import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SplashIntro } from './components/SplashIntro';
import { AppsListPage } from './pages/AppsListPage';
import { AppEditorPage } from './pages/AppEditorPage';
import { EmbedGeneratorPage } from './pages/EmbedGeneratorPage';
import { ApiInstructionsPage } from './pages/ApiInstructionsPage';
import { ApiKeysPage } from './pages/ApiKeysPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProjectLinksPage } from './pages/ProjectLinksPage';

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !sessionStorage.getItem('mignon_intro_seen');
  });

  function handleSplashComplete() {
    sessionStorage.setItem('mignon_intro_seen', 'true');
    setShowSplash(false);
  }

  function handleReplayIntro() {
    setShowSplash(true);
  }

  return (
    <BrowserRouter>
      {showSplash && <SplashIntro onComplete={handleSplashComplete} />}

      <div className="min-h-screen flex flex-col bg-background text-slate-100 selection:bg-sky-500/30 selection:text-sky-200">
        <Navbar onReplayIntro={handleReplayIntro} />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<AppsListPage />} />
              <Route path="/editor/:id" element={<AppEditorPage />} />
              <Route path="/embed" element={<EmbedGeneratorPage />} />
              <Route path="/api-docs" element={<ApiInstructionsPage />} />
              <Route path="/keys" element={<ApiKeysPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/links" element={<ProjectLinksPage />} />
              <Route path="/resources" element={<ProjectLinksPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};

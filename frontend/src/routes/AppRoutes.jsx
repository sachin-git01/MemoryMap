import { useState } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

// Pages
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { Dashboard } from '../pages/Dashboard';
import { CreateJourney } from '../pages/CreateJourney';
import { JourneyMapPage } from '../pages/JourneyMapPage';
import { AddCheckpoint } from '../pages/AddCheckpoint';
import { CheckpointDetails } from '../pages/CheckpointDetails';
import { GalleryPage } from '../pages/GalleryPage';
import { NotesPage } from '../pages/NotesPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AccountSettingsPage } from '../pages/AccountSettingsPage';

// Authenticated Layout enclosing Navbar + Sidebar
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 text-slate-800 transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-h-screen transition-all duration-300 md:pl-[18.75rem]">
        <Navbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />

        <main className="px-4 pb-6 sm:px-6 lg:px-7">
          <div className="mx-auto max-w-[1360px]">
            <div key={location.pathname} className="page-enter">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Landing page wrapper rendering simple layout with navbar
const LandingLayout = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-tr from-[#FFF1F2] via-[#FDF2F8] to-[#E0F2FE]">
      {/* Unified Soft Pastel Background Shapes covering navbar and whole page */}
      <div className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden" aria-hidden="true">
        <div className="absolute -left-[10%] -top-[8%] h-[50%] w-[50%] rounded-full bg-gradient-to-br from-pink-200/35 via-rose-300/20 to-transparent blur-[120px]"></div>
        <div className="absolute -right-[10%] top-[2%] h-[45%] w-[45%] rounded-full bg-gradient-to-bl from-sky-200/40 via-indigo-300/20 to-transparent blur-[120px]"></div>
        <div className="absolute left-[30%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-gradient-to-tr from-rose-200/25 via-sky-200/25 to-transparent blur-[140px]"></div>
      </div>

      <div className="relative z-10">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
};

export const AppRoutes = () => {
  return (
    <Routes>
        {/* Public Pages */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Private Dashboard & Journey Pages */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-journey" element={<CreateJourney />} />
          <Route path="/journey/:journeyId" element={<JourneyMapPage />} />
          <Route path="/journey/:journeyId/add-checkpoint" element={<AddCheckpoint />} />
          <Route path="/journey/:journeyId/checkpoint/:checkpointId" element={<CheckpointDetails />} />
          <Route path="/journey/:journeyId/gallery" element={<GalleryPage />} />
          <Route path="/journey/:journeyId/notes" element={<NotesPage />} />
          <Route path="/journey/:journeyId/settings" element={<SettingsPage />} />
          <Route path="/settings" element={<AccountSettingsPage />} />
        </Route>

        {/* Fallback Catch-all redirect */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
  );
};

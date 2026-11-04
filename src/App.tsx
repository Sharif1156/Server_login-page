import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/PublicLayout';
import { PortalLayout } from './components/PortalLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { NotFound } from './pages/NotFound';
import { Overview } from './portals/Overview';
import { Profile } from './portals/Profile';
import { Settings } from './portals/Settings';
import { Announcements } from './portals/Announcements';
import { PortalEvents } from './portals/PortalEvents';
import { MemberEvents } from './portals/member/MemberEvents';
import { MyRegistrations } from './portals/member/MyRegistrations';
import { Courses } from './portals/member/Courses';
import { Certificates } from './portals/member/Certificates';
import { Classmates } from './portals/cr/Classmates';
import { Applications } from './portals/executive/Applications';
import { Members } from './portals/executive/Members';
import { ExecutiveCRs } from './portals/executive/ExecutiveCRs';
import { ManageEvents } from './portals/executive/ManageEvents';

export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/:role/login" element={<Login />} />
        <Route path="/:role/register" element={<Register />} />
        <Route path="/:role/forgot-password" element={<ForgotPassword />} />
        {/* This build only includes the homepage + auth + portals. */}
        <Route path="/events" element={<Navigate to="/#events" replace />} />
        <Route path="/events/:id" element={<Navigate to="/#events" replace />} />
        <Route path="/executives" element={<Navigate to="/" replace />} />
        <Route path="/class-representatives" element={<Navigate to="/" replace />} />
        <Route path="/contact" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/member" element={<ProtectedRoute role="member"><PortalLayout /></ProtectedRoute>}>
        <Route index element={<Overview />} />
        <Route path="events" element={<MemberEvents />} />
        <Route path="registrations" element={<MyRegistrations />} />
        <Route path="courses" element={<Courses />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/cr" element={<ProtectedRoute role="cr"><PortalLayout /></ProtectedRoute>}>
        <Route index element={<Overview />} />
        <Route path="classmates" element={<Classmates />} />
        <Route path="events" element={<PortalEvents />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/executive" element={<ProtectedRoute role="executive"><PortalLayout /></ProtectedRoute>}>
        <Route index element={<Overview />} />
        <Route path="applications" element={<Applications />} />
        <Route path="members" element={<Members />} />
        <Route path="crs" element={<ExecutiveCRs />} />
        <Route path="events" element={<ManageEvents />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/dashboard" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

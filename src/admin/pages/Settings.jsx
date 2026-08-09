import { useEffect, useState } from "react";
import Layout from "../components/Layout";

import SettingsHeader from "../components/SettingsHeader";
import CompanySettings from "../components/CompanySettings";
import AdminProfile from "../components/AdminProfile";
import SecuritySettings from "../components/SecuritySettings";
import StripeSettings from "../components/StripeSettings";
import EmailSettings from "../components/EmailSettings";
import NotificationSettings from "../components/NotificationSettings";
import AppearanceSettings from "../components/AppearanceSettings";

import {
  getProfileRequest,
  updateProfileRequest,
  changePasswordRequest,
} from "../api/authApi";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await getProfileRequest();
      setUser(res.user);
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (form) => {
    setSavingProfile(true);
    setProfileSaved(false);
    try {
      const res = await updateProfileRequest(form);
      setUser(res.user);
      localStorage.setItem("user", JSON.stringify(res.user));
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (currentPassword, newPassword) => {
    setChangingPassword(true);
    try {
      await changePasswordRequest(currentPassword, newPassword);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <SettingsHeader />

        {/* Connected to the backend (GET/PUT /api/auth/profile) */}
        <AdminProfile
          user={user}
          onSave={handleSaveProfile}
          saving={savingProfile}
          saved={profileSaved}
        />

        {/* Connected to the backend (PUT /api/auth/change-password) */}
        <SecuritySettings onChangePassword={handleChangePassword} saving={changingPassword} />

        {/*
          NOTE: Company, Stripe, Email, Notification and Appearance settings
          have no backend model/routes yet (no Settings API exists in the
          backend at all). They're left as UI-only placeholders below —
          wiring them up needs backend work first (a Settings model +
          controller + routes), otherwise "saving" them wouldn't persist
          anywhere.
        */}
        <CompanySettings />
        <StripeSettings />
        <EmailSettings />
        <NotificationSettings />
        <AppearanceSettings />
      </div>
    </Layout>
  );
}

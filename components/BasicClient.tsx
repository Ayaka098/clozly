"use client";

import { useEffect, useState } from "react";
import { UserProfile } from "@/lib/types";
import { loadProfile, saveProfile } from "@/lib/profile";

export default function BasicClient() {
  const [profile, setProfile] = useState<UserProfile>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadProfile();
    if (stored) setProfile(stored);
  }, []);

  const handleChange = (key: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveProfile(profile);
    setToast("保存しました");
    window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <section className="fade-in" style={{ display: "grid", gap: 18 }}>
      <div className="card" style={{ display: "grid", gap: 14 }}>
        <div className="field">
          <div className="label">身長</div>
          <input
            className="input"
            placeholder="cm"
            value={profile.height ?? ""}
            onChange={(event) => handleChange("height", event.target.value)}
          />
        </div>
        <div className="field">
          <div className="label">体重</div>
          <input
            className="input"
            placeholder="kg"
            value={profile.weight ?? ""}
            onChange={(event) => handleChange("weight", event.target.value)}
          />
        </div>
        <div className="field">
          <div className="label">普段のサイズ</div>
          <input
            className="input"
            value={profile.usualSize ?? ""}
            onChange={(event) => handleChange("usualSize", event.target.value)}
          />
        </div>
        <div className="field">
          <div className="label">体型傾向</div>
          <input
            className="input"
            value={profile.bodyType ?? ""}
            onChange={(event) => handleChange("bodyType", event.target.value)}
          />
        </div>
      </div>
      <button className="btn" onClick={handleSave}>
        保存
      </button>
      {toast && <div className="toast">{toast}</div>}
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { imageStore } from "@/lib/localImage";
import { loadProfile, saveProfile } from "@/lib/profile";
import { UserProfile } from "@/lib/types";

export default function AccountClient() {
  const { data } = useSession();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({});
  const [toast, setToast] = useState<string | null>(null);
  const isLoggedIn = Boolean(data?.user);

  const fitOptions: UserProfile["fitPreference"][] = ["ゆるめ", "ジャスト", "タイト"];
  const moodOptions = ["カジュアル", "きれいめ", "モード", "個性派", "シンプル", "モノクロ"];

  useEffect(() => {
    const stored = loadProfile();
    if (stored) setProfile(stored);
    imageStore.load().then((file) => {
      if (!file) return;
      setImageUrl(URL.createObjectURL(file));
    });
  }, []);

  const handleProfileChange = (key: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFit = (value: UserProfile["fitPreference"]) => {
    setProfile((prev) => ({
      ...prev,
      fitPreference: prev.fitPreference === value ? undefined : value
    }));
  };

  const toggleMood = (value: string) => {
    setProfile((prev) => {
      const current = prev.stylePreferences ?? [];
      if (current.includes(value)) {
        return { ...prev, stylePreferences: current.filter((item) => item !== value) };
      }
      return { ...prev, stylePreferences: [...current, value] };
    });
  };

  const handleProfileSave = () => {
    saveProfile(profile);
    setToast("保存しました");
    window.setTimeout(() => setToast(null), 1800);
  };

  const handleLogout = () => {
    if (window.confirm("ログアウトしますか？")) {
      signOut({ callbackUrl: "/" });
    }
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    await imageStore.save(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const handleImageClear = async () => {
    await imageStore.clear();
    setImageUrl(null);
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <section className="fade-in" style={{ display: "grid", gap: 18 }}>
      <div className="grid-2">
        <div className="card" style={{ display: "grid", gap: 14 }}>
          <div className="label">基本情報</div>
          <div className="field">
            <div className="label">身長</div>
            <input
              className="input"
              placeholder="cm"
              value={profile.height ?? ""}
              onChange={(event) => handleProfileChange("height", event.target.value)}
            />
          </div>
          <div className="field">
            <div className="label">体重</div>
            <input
              className="input"
              placeholder="kg"
              value={profile.weight ?? ""}
              onChange={(event) => handleProfileChange("weight", event.target.value)}
            />
          </div>
          <div className="field">
            <div className="label">普段のサイズ</div>
            <input
              className="input"
              value={profile.usualSize ?? ""}
              onChange={(event) => handleProfileChange("usualSize", event.target.value)}
            />
          </div>
          <div className="field">
            <div className="label">好みのサイズ感</div>
            <div className="chip-group">
              {fitOptions.map((option) => (
                <button
                  key={option}
                  className="chip"
                  data-selected={profile.fitPreference === option}
                  onClick={() => toggleFit(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <div className="label">雰囲気</div>
            <div className="chip-group">
              {moodOptions.map((option) => (
                <button
                  key={option}
                  className="chip"
                  data-selected={profile.stylePreferences?.includes(option)}
                  onClick={() => toggleMood(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="profile-save-row">
            <button className="btn btn-inline" onClick={handleProfileSave}>
              保存
            </button>
            {toast && <span className="profile-save-toast">{toast}</span>}
          </div>
        </div>
        <div className="card" style={{ display: "grid", gap: 14 }}>
          <div className="label">人物画像</div>
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={(event) => handleImageUpload(event.target.files?.[0] ?? null)}
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="人物画像"
              style={{ width: "100%", borderRadius: 16, border: "1px solid var(--line)" }}
            />
          )}
          <button
            className="btn btn-secondary btn-inline btn-soft btn-horizontal btn-image-clear"
            onClick={handleImageClear}
          >
            画像を削除
          </button>
        </div>
      </div>
      <div>
        <button className="btn btn-danger" onClick={handleLogout}>
          ログアウト
        </button>
      </div>
    </section>
  );
}

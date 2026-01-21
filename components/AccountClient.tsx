"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { imageStore } from "@/lib/localImage";
import { loadProfile, saveProfile } from "@/lib/profile";
import { UserProfile } from "@/lib/types";

export default function AccountClient() {
  const { data } = useSession();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [profile, setProfile] = useState<UserProfile>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadProfile();
    if (stored) setProfile(stored);
    imageStore.load().then((file) => {
      if (!file) return;
      setImageUrl(URL.createObjectURL(file));
    });
  }, []);

  const prompt = useMemo(() => {
    const sizeText = profile.usualSize ? `サイズ感は${profile.usualSize}。` : "";
    return (
      `全身写真の人物が、以下の服を試着しているイメージを生成してください。\n` +
      `服の説明: ${description}\n` +
      `${sizeText}\n` +
      `背景はシンプルに。`
    );
  }, [description, profile.usualSize]);

  const handleProfileChange = (key: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleProfileSave = () => {
    saveProfile(profile);
    setToast("保存しました");
    window.setTimeout(() => setToast(null), 1800);
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

  return (
    <section className="fade-in" style={{ display: "grid", gap: 18 }}>
      <div className="card" style={{ display: "grid", gap: 14 }}>
        <div className="label">ログイン</div>
        {data?.user ? (
          <button className="btn btn-secondary" onClick={() => signOut()}>
            ログアウト
          </button>
        ) : (
          <button className="btn" onClick={() => signIn("google")}>
            Googleでログイン
          </button>
        )}
      </div>
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
          <div className="label">体型傾向</div>
          <input
            className="input"
            value={profile.bodyType ?? ""}
            onChange={(event) => handleProfileChange("bodyType", event.target.value)}
          />
        </div>
        <button className="btn" onClick={handleProfileSave}>
          保存
        </button>
        {toast && <div className="toast">{toast}</div>}
      </div>
      <div className="card" style={{ display: "grid", gap: 14 }}>
        <div className="label">全身画像</div>
        <input
          className="input"
          type="file"
          accept="image/*"
          onChange={(event) => handleImageUpload(event.target.files?.[0] ?? null)}
        />
        {imageUrl && (
          <img
            src={imageUrl}
            alt="全身画像"
            style={{ width: "100%", borderRadius: 16, border: "1px solid var(--line)" }}
          />
        )}
        <button className="btn btn-secondary" onClick={handleImageClear}>
          画像を削除
        </button>
      </div>
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <div className="label">プロンプト</div>
        <input
          className="input"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <textarea className="input" rows={6} value={prompt} readOnly />
        <button className="btn" onClick={() => navigator.clipboard.writeText(prompt)}>
          プロンプトをコピー
        </button>
        {imageUrl && (
          <a className="btn btn-secondary" href={imageUrl} download="clozly-fullbody">
            画像をダウンロード
          </a>
        )}
      </div>
    </section>
  );
}

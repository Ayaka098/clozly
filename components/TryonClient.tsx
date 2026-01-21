"use client";

import { useEffect, useMemo, useState } from "react";
import { imageStore } from "@/lib/localImage";
import { loadProfile } from "@/lib/profile";
import { UserProfile } from "@/lib/types";

export default function TryonClient() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [profile, setProfile] = useState<UserProfile>({});
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadProfile();
    if (stored) setProfile(stored);
    imageStore.load().then((file) => {
      if (!file) return;
      setImageFile(file);
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

  return (
    <section className="fade-in" style={{ display: "grid", gap: 18 }}>
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <div className="label">プロンプト</div>
        <input
          className="input"
          placeholder="例: 黒の細身コート、きれいめ"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <textarea className="input" rows={7} value={prompt} readOnly />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn" onClick={() => navigator.clipboard.writeText(prompt)}>
            プロンプトをコピー
          </button>
          <button
            className="btn btn-secondary"
            onClick={async () => {
              if (!imageFile) return;
              try {
                await navigator.clipboard.write([
                  new ClipboardItem({ [imageFile.type]: imageFile })
                ]);
                setCopyStatus("画像をコピーしました。");
              } catch (error) {
                setCopyStatus("画像のコピーに失敗しました。");
              } finally {
                window.setTimeout(() => setCopyStatus(null), 2000);
              }
            }}
            type="button"
            disabled={!imageFile}
          >
            画像をコピー
          </button>
        </div>
        {copyStatus && <p>{copyStatus}</p>}
      </div>
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <div className="label">全身画像</div>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="全身画像"
            style={{ width: "100%", borderRadius: 16, border: "1px solid var(--line)" }}
          />
        ) : (
          <p>アカウントで全身画像を保存してください。</p>
        )}
      </div>
    </section>
  );
}

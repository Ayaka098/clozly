"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { imageStore } from "@/lib/localImage";
import { loadProfile } from "@/lib/profile";

export default function AccountClient() {
  const { data } = useSession();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("白のきれいめトップス");
  const [size, setSize] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadProfile();
    if (stored?.usualSize) setSize(stored.usualSize);
    imageStore.load().then((file) => {
      if (!file) return;
      setImageUrl(URL.createObjectURL(file));
    });
  }, []);

  const prompt = useMemo(() => {
    const sizeText = size ? `サイズ感は${size}。` : "";
    return (
      `全身写真の人物が、以下の服を試着しているイメージを生成してください。\n` +
      `服の説明: ${description}\n` +
      `${sizeText}\n` +
      `背景はシンプルに。`
    );
  }, [description, size]);

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

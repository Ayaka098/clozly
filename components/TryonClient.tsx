"use client";

import { useEffect, useMemo, useState } from "react";
import { imageStore } from "@/lib/localImage";
import { loadProfile } from "@/lib/profile";
import { CandidateItem, UserProfile } from "@/lib/types";
import { loadTryonSelection } from "@/lib/tryonSession";

export default function TryonClient() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [profile, setProfile] = useState<UserProfile>({});
  const [promptCopyStatus, setPromptCopyStatus] = useState<string | null>(null);
  const [imageCopyStatus, setImageCopyStatus] = useState<string | null>(null);
  const [productImageCopyStatus, setProductImageCopyStatus] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<
    (Pick<CandidateItem, "name" | "brand" | "price" | "url" | "imageUrl" | "summary"> & {
      imageOriginalUrl?: string;
    }) | null
  >(null);

  useEffect(() => {
    const stored = loadProfile();
    if (stored) setProfile(stored);
    const tryon = loadTryonSelection();
    if (tryon?.description) setDescription(tryon.description);
    if (tryon?.selectedItem) setSelectedItem(tryon.selectedItem);
    imageStore.load().then((file) => {
      if (!file) return;
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    });
  }, []);

  const prompt = useMemo(() => {
    const sizeText = profile.usualSize ? `サイズ感は${profile.usualSize}。` : "";
    const itemLines = selectedItem
      ? [
          `商品名: ${selectedItem.name}`,
          selectedItem.brand ? `ブランド: ${selectedItem.brand}` : null,
          selectedItem.price ? `価格: ${selectedItem.price.toLocaleString()}円` : null,
          selectedItem.summary ? `説明: ${selectedItem.summary}` : null,
          selectedItem.imageOriginalUrl
            ? `商品画像URL: ${selectedItem.imageOriginalUrl}`
            : selectedItem.imageUrl
              ? `商品画像URL: ${selectedItem.imageUrl}`
              : null,
          selectedItem.url ? `商品ページURL: ${selectedItem.url}` : null
        ]
          .filter(Boolean)
          .join("\n")
      : "";
    return (
      `人物画像（全身写真）と商品画像（服の写真）をアップロードします。GeminiのNano Bananaを使って、人物が商品を試着している自然な合成画像を生成してください。\n` +
      `人物画像は人物の参照、商品画像は服の参照です。人物はそのまま、服だけを置き換えるイメージでお願いします。\n` +
      `出力は必ず頭から足先までの全身。足元が切れない構図で生成してください。\n` +
      `もし人物画像が全身でなくても、人物の雰囲気を保った全身を生成してください。\n` +
      `服の説明: ${description}\n` +
      (itemLines ? `\n[商品情報]\n${itemLines}\n` : "") +
      `${sizeText}\n` +
      `背景はシンプルに。商品画像がある場合はその服と同一デザインに合わせてください。`
    );
  }, [description, profile.usualSize, selectedItem]);

  const getProxyImageUrl = (url: string) =>
    `/api/image-proxy?url=${encodeURIComponent(url)}`;

  const resolveProductImageUrl = () => {
    if (!selectedItem?.imageUrl) return "";
    if (selectedItem.imageUrl.startsWith("/api/image-proxy")) {
      return selectedItem.imageUrl;
    }
    return getProxyImageUrl(selectedItem.imageUrl);
  };

  const ensurePngBlob = async (blob: Blob) => {
    if (blob.type === "image/png") return blob;
    try {
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return blob;
      ctx.drawImage(bitmap, 0, 0);
      const png = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((result) => resolve(result), "image/png")
      );
      return png ?? blob;
    } catch {
      return blob;
    }
  };

  return (
    <section className="fade-in tryon-layout">
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <div className="tryon-prompt-header">
          <div className="label">プロンプト</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {selectedItem?.imageUrl && (
              <button
                className="btn btn-secondary tryon-action tryon-product-action"
                onClick={async () => {
                  try {
                    const proxyUrl = resolveProductImageUrl();
                    const response = await fetch(proxyUrl);
                    if (!response.ok) throw new Error("fetch failed");
                    const blob = await response.blob();
                    const clipboardBlob = await ensurePngBlob(blob);
                    await navigator.clipboard.write([
                      new ClipboardItem({ [clipboardBlob.type]: clipboardBlob })
                    ]);
                    setProductImageCopyStatus("商品画像をコピーしました。");
                  } catch (error) {
                    setProductImageCopyStatus("商品画像のコピーに失敗しました。");
                  } finally {
                    window.setTimeout(() => setProductImageCopyStatus(null), 2000);
                  }
                }}
                type="button"
              >
                商品画像をコピー
              </button>
            )}
            {selectedItem?.url && (
              <a
                className="btn btn-secondary tryon-action tryon-product-action"
                href={selectedItem.url}
                target="_blank"
                rel="noreferrer"
              >
                商品ページを開く
              </a>
            )}
            <a
              className="btn btn-secondary tryon-action"
              href="https://gemini.google.com/app"
              target="_blank"
              rel="noreferrer"
            >
              Geminiを開く
            </a>
          </div>
        </div>
        <div className="tryon-steps">
          <p>
            人物画像→商品画像の順でアップロードし、プロンプトを添えてNano Bananaで生成してください。
          </p>
        </div>
        <textarea className="input" rows={7} value={prompt} readOnly />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="btn"
            onClick={() => {
              navigator.clipboard.writeText(prompt);
              setPromptCopyStatus("プロンプトをコピーしました。");
              window.setTimeout(() => setPromptCopyStatus(null), 2000);
            }}
          >
            プロンプトをコピー
          </button>
        </div>
        {promptCopyStatus && <p>{promptCopyStatus}</p>}
        {productImageCopyStatus && <p>{productImageCopyStatus}</p>}
      </div>
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <div className="tryon-image-header">
          <div className="label">人物画像</div>
        </div>
        {imageUrl ? (
          <div className="tryon-image-stack">
            <img src={imageUrl} alt="人物画像" className="tryon-image" />
            <button
              className="btn tryon-image-copy"
              onClick={async () => {
                if (!imageFile) return;
                try {
                  await navigator.clipboard.write([
                    new ClipboardItem({ [imageFile.type]: imageFile })
                  ]);
                  setImageCopyStatus("画像をコピーしました。");
                } catch (error) {
                  setImageCopyStatus("画像のコピーに失敗しました。");
                } finally {
                  window.setTimeout(() => setImageCopyStatus(null), 2000);
                }
              }}
              type="button"
              disabled={!imageFile}
            >
              画像をコピー
            </button>
          </div>
        ) : (
          <p>アカウントで人物画像を保存してください。</p>
        )}
        {imageCopyStatus && <p>{imageCopyStatus}</p>}
      </div>
    </section>
  );
}

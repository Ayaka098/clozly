"use client";

import { useEffect, useState } from "react";

type Answers = Record<string, string>;

const questions = [
  { id: "style", label: "雰囲気", options: ["きれいめ", "カジュアル", "モード", "ミニマル"] },
  { id: "color", label: "好きな色", options: ["白", "黒", "ベージュ", "ブラウン", "ブルー"] },
  { id: "fit", label: "シルエット", options: ["タイト", "ジャスト", "ゆるめ"] }
];

const STORAGE_KEY = "clozly-quiz";

export default function QuizClient() {
  const [answers, setAnswers] = useState<Answers>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setAnswers(JSON.parse(raw));
      } catch {
        setAnswers({});
      }
    }
  }, []);

  const updateAnswer = (id: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: prev[id] === value ? "" : value
    }));
  };

  const handleSave = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    setToast("保存しました");
    window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <section className="fade-in" style={{ display: "grid", gap: 20 }}>
      {questions.map((question) => (
        <div key={question.id} className="card" style={{ display: "grid", gap: 12 }}>
          <div className="label">{question.label}</div>
          <div className="chip-group">
            {question.options.map((option) => (
              <button
                key={option}
                className="chip"
                data-selected={answers[question.id] === option}
                onClick={() => updateAnswer(question.id, option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button className="btn" onClick={handleSave}>
        保存
      </button>
      {toast && <div className="toast">{toast}</div>}
    </section>
  );
}

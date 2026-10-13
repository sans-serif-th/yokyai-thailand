"use client";

import { useState } from "react";
import { LINE_ID_PATTERN } from "@/lib/profile-payload";

interface LineIdPromptProps {
  open: boolean;
  onCancel: () => void;
  onSave: (lineId: string) => Promise<void>;
}

// Bottom sheet shown when someone taps "ขอติดต่อ" without a LINE ID on file.
// Both sides exchange name + LINE ID on accept, so it has to be set first.
export function LineIdPrompt({ open, onCancel, onSave }: LineIdPromptProps) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSave() {
    const lineId = value.trim();
    if (!LINE_ID_PATTERN.test(lineId)) {
      setError("LINE ID ไม่ถูกต้อง (4-20 ตัว ใช้ตัวอักษร ตัวเลข . - _ ได้)");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave(lineId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-end bg-black/40"
      role="dialog"
      aria-modal="true"
    >
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 rounded-t-[32px] bg-background px-4 py-6">
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold leading-6">
            กรอก LINE ID ของคุณก่อนขอติดต่อ
          </p>
          <p className="text-xs leading-[18px] text-zinc-600">
            ใช้สำหรับให้อีกฝ่ายติดต่อกลับ
            และจะแสดงให้เห็นเฉพาะคู่ที่ยอมรับคำขอติดต่อของคุณเท่านั้น
          </p>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-[14px] font-semibold">LINE ID*</span>
          <input
            className="input-field"
            autoCapitalize="none"
            autoCorrect="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <span className="text-[12px] leading-[18px] text-zinc-500">
            ดูได้ที่ LINE → หน้าหลัก → รูปโปรไฟล์ → ID
          </span>
        </label>
        {error && <p className="text-terracotta text-sm">{error}</p>}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn-brand-secondary flex-1"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-brand-primary flex-1"
          >
            {saving ? "กำลังบันทึก..." : "บันทึกและส่งคำขอ"}
          </button>
        </div>
      </div>
    </div>
  );
}

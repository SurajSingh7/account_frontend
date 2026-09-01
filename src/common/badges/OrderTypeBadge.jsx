"use client";
import React from "react";

export const ORDER_TYPE_STYLES = {
  "NEW-ORDER": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    label: "New Order",
  },
  UPGRADE: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    label: "Upgrade",
  },
  DOWNGRADE: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    label: "Downgrade",
  },
  TERMINATION: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    label: "Termination",
  },
  SHIFT: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    label: "Shift",
  },
};

export default function OrderTypeBadge({ type, initiationType }) {
  if (!type) {
    return <span className="text-gray-400 text-[13px]">—</span>;
  }

  // If initiationType is SHIFT, use SHIFT styles and label
  const key = (initiationType === "SHIFT" && type==="NEW-ORDER" ? initiationType : type).toUpperCase();

  const style = ORDER_TYPE_STYLES[key];

  // fallback values
  const bg = style?.bg ?? "bg-gray-100";
  const text = style?.text ?? "text-gray-700";
  const border = style?.border ?? "border-gray-300";
  const label = style?.label ?? key;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${bg} ${border} py-[5px] px-[12px] leading-none`}
    >
      <span
        className={`text-[13px] font-semibold ${text} whitespace-nowrap`}
      >
        {label}
      </span>
    </span>
  );
}
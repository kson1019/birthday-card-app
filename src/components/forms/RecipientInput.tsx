"use client";

import { useState, useCallback } from "react";

interface RecipientInputProps {
  value: { email: string; name?: string }[];
  onChange: (recipients: { email: string; name?: string }[]) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RecipientInput({
  value,
  onChange,
}: RecipientInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const addEmail = useCallback(
    (raw: string) => {
      const email = raw.trim().toLowerCase();
      if (!email) return;

      if (!EMAIL_REGEX.test(email)) {
        setError("Please enter a valid email address");
        return;
      }

      if (value.some((r) => r.email === email)) {
        setError("This email is already added");
        return;
      }

      setError("");
      onChange([...value, { email }]);
      setInputValue("");
    },
    [value, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail(inputValue);
    }

    if (e.key === "Backspace" && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeRecipient = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Recipient Emails
      </label>

      <div className="border-2 border-gray-200 rounded-xl p-3 focus-within:border-purple-400 transition-colors">
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((recipient, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
            >
              {recipient.email}
              <button
                type="button"
                onClick={() => removeRecipient(index)}
                className="hover:text-purple-900 ml-1 text-lg leading-none"
              >
                &times;
              </button>
            </span>
          ))}
        </div>

        <input
          type="email"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) addEmail(inputValue);
          }}
          placeholder={
            value.length === 0 ? "Enter email addresses..." : "Add another..."
          }
          className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
        />
      </div>

      <p className="text-xs text-gray-400 mt-1">
        Press Enter or comma to add each email
      </p>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

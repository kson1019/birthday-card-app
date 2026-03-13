"use client";

import { useState } from "react";

interface RecipientInputProps {
  value: { email: string; name?: string }[];
  onChange: (recipients: { email: string; name?: string }[]) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RecipientInput({
  value,
  onChange,
}: RecipientInputProps) {
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const email = emailInput.trim().toLowerCase();
    const name = nameInput.trim();

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (value.some((r) => r.email === email)) {
      setError("This email is already added");
      return;
    }

    setError("");
    onChange([...value, { email, name: name || undefined }]);
    setNameInput("");
    setEmailInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const removeRecipient = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Recipients
      </label>

      {value.length > 0 && (
        <div className="mb-3 space-y-2">
          {value.map((recipient, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5"
            >
              <div className="flex-1">
                {recipient.name && (
                  <p className="text-sm font-semibold text-gray-800">
                    {recipient.name}
                  </p>
                )}
                <p className="text-sm text-gray-600">{recipient.email}</p>
              </div>
              <button
                type="button"
                onClick={() => removeRecipient(index)}
                className="text-purple-600 hover:text-purple-800 text-xl leading-none ml-3"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border-2 border-gray-200 rounded-xl p-4 space-y-3">
        <div>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="Recipient's name (optional)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-purple-400 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex gap-2">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="Recipient's email (required)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-purple-400 focus:outline-none transition-colors"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50"
            disabled={!emailInput.trim()}
          >
            Add
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-1">
        Add at least one recipient to send invitations
      </p>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

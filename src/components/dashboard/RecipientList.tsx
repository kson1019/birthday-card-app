import type { Recipient } from "@/types";

interface RecipientListProps {
  recipients: Recipient[];
}

const statusConfig = {
  accepted: { label: "Accepted", bg: "bg-green-100", text: "text-green-700" },
  declined: { label: "Declined", bg: "bg-red-100", text: "text-red-600" },
  pending: { label: "Pending", bg: "bg-yellow-100", text: "text-yellow-700" },
};

export default function RecipientList({ recipients }: RecipientListProps) {
  const sorted = [...recipients].sort((a, b) => {
    const order = { accepted: 0, declined: 1, pending: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="divide-y divide-gray-50">
      {sorted.map((r) => {
        const config = statusConfig[r.status];
        return (
          <div key={r.id} className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {r.name || r.email}
                </p>
                <p className="text-xs text-gray-400">{r.email}</p>
              </div>
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
              >
                {config.label}
              </span>
            </div>
            {r.responseMessage && (
              <p className="text-xs text-gray-500 italic mt-1">
                &ldquo;{r.responseMessage}&rdquo;
              </p>
            )}
            {r.respondedAt && (
              <p className="text-xs text-gray-300 mt-0.5">
                {new Date(r.respondedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

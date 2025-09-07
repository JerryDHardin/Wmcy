// src/components/ModelSelector.jsx
import React, { useEffect, useState } from "react";

export default function ModelSelector({ selectedModel, onChange }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/models")
      .then(res => res.json())
      .then(data => setModels(data.models || []))
      .catch(() => setModels([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedModel}
        onChange={e => onChange(e.target.value)}
        className="bg-black border border-green-700 text-green-300 rounded px-2 py-1"
        disabled={loading}
      >
        {loading && <option>Loading...</option>}
        {models.map(model =>
          <option key={model.id} value={model.id} title={model.displayName}>
  {model.shortName || model.displayName || model.id}
</option>
        )}
      </select>
    </div>
  );
}

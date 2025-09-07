import React from "react";

export default function PromptDisplay({
  input,
  response,
  inputColor = "text-green-300",
  responseColor = "text-green-200",
}) {
  return (
    <div className="mb-4">
      <div className={`font-semibold ${inputColor}`}>You: {input}</div>
      <div className={`mt-1 whitespace-pre-wrap ${responseColor}`}>
        {response}
      </div>
    </div>
  );
}

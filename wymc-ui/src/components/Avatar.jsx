import React from 'react';

export default function Avatar({ src = "/wmcy-assets/avatars/wymc_default.png", alt = "WymC Avatar" }) {
  return (
    <div className="h-36 overflow-hidden flex items-center justify-center border border-green-600">
      <img
        src={src}
        alt={alt}
        className="h-full object-contain"
      />
    </div>
  );
}

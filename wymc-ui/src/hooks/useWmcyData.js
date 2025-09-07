import { useState, useEffect } from 'react';

export function useWmcyData() {
  const [wmcyData, setWmcyData] = useState(null);

  useEffect(() => {
    fetch('/api/getWmcyData')
      .then((res) => res.json())
      .then(setWmcyData)
      .catch((err) => console.error('Fetch failed:', err));
  }, []);

  return wmcyData;
}

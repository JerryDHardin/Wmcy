// Tiny concurrency gate to avoid GPU thrash
// Set MAX_CONCURRENT (default 1) for /route only

const MAX = Number(process.env.MAX_CONCURRENT || 1);
let active = 0;
const q = [];

function runNext() {
  if (active >= MAX) return;
  const job = q.shift();
  if (!job) return;
  active++;
  job()
    .catch(() => {})
    .finally(() => {
      active = Math.max(0, active - 1);
      runNext();
    });
}

export function queueMiddleware(handler) {
  return (req, res, next) => {
    q.push(async () => handler(req, res, next));
    runNext();
  };
}
// naive hybrid: fulltext LIKE + vector cosine threshold
export async function search(query, k=8) {
  const idsByText = await db.all("SELECT id FROM chunks WHERE text LIKE ?", [`%${query}%`]);
  const qVec = await embedService.embed(query);
  const byVec  = await vectors.search(qVec, k);
  return dedupe([...idsByText.map(r=>r.id), ...byVec.map(v=>v.id)]).slice(0,k);
}

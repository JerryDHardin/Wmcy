// POST /tools/run { name:"vault.search", args:{q:"..."} }
router.post("/run", async (req,res) => {
  const { name, args } = req.body || {};
  if (!ALLOWED_TOOLS.includes(name)) return res.status(403).json({error:"tool not allowed"});
  const out = await toolBroker.run(name, args, { timeoutMs: 12000, ioBudget: "read-only" });
  res.json({ ok:true, out });
});

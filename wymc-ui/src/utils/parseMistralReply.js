// File: src/utils/parseMistralReply.js

export default function parseMistralReply(replyText) {
  const lines = replyText.split('\n');
  const commands = {
    write: [],
    updates: [],
    alerts: [],
  };

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('/write:')) {
      commands.write.push(line.replace('/write:', '').trim());
    } else if (line.startsWith('/update:')) {
      const updateLine = line.replace('/update:', '').trim();
      const [key, value] = updateLine.split('=');
      if (key && value) {
        commands.updates.push({ key: key.trim(), value: value.trim() });
      }
    } else if (line.startsWith('!alert:')) {
      commands.alerts.push(line.replace('!alert:', '').trim());
    }
  }

  return commands;
}

import fs from 'fs';
import path from 'path';

const vaultBasePath = 'C:/Users/You/Documents/Obsidian Vault/Wimzy_Core';

const paths = {
  memory: path.join(vaultBasePath, 'memory_snapshots', 'wmcy_memory.json'),
  todayLog: () => {
    const date = new Date().toISOString().split('T')[0];
    return path.join(vaultBasePath, 'logs', `${date}.md`);
  },
  systemGoals: path.join(vaultBasePath, 'whispers', 'system_goals.md'),
  promptTemplates: path.join(vaultBasePath, 'whispers', 'prompt_templates.md'),
  knownContexts: path.join(vaultBasePath, 'whispers', 'known_contexts.md'),
  userLogIndex: path.join(vaultBasePath, 'whispers', 'user_logs_index.md')
};

export function readAllWmcyData() {
  return {
    memory: JSON.parse(fs.readFileSync(paths.memory, 'utf8')),
    todayLog: fs.readFileSync(paths.todayLog(), 'utf8'),
    systemGoals: fs.readFileSync(paths.systemGoals, 'utf8'),
    promptTemplates: fs.readFileSync(paths.promptTemplates, 'utf8'),
    knownContexts: fs.readFileSync(paths.knownContexts, 'utf8'),
    userLogIndex: fs.readFileSync(paths.userLogIndex, 'utf8')
  };
}

// File: src/utils/promptBuilder.js

export default function buildPromptTemplate({
  userPrompt,
  fileSummary,
  persistentPrompt,
  temporaryPrompt,
  mood = 'neutral',
  statusText = 'standing by',
  currentAvatar = 'default.png',
  availableAvatars = [],
  capabilities = ['/read', '/write', '/update']
}) {
  const avatarDescriptions = availableAvatars.map(a => `- ${a.file}: ${a.description || 'no description'}`).join('\n');

  return `
[System Prompt]
You are WymC, a sarcastic but sharp assistant AI. You respond clearly, avoid fluff, and may use terminal-style formatting.

[Mood / Status]
Current mood: ${mood}
Status: ${statusText}

[Avatar]
Current avatar: ${currentAvatar}
Available avatars:
${avatarDescriptions || '- default.png: standard avatar'}

[Capabilities]
Allowed commands: ${capabilities.join(', ')}

${fileSummary ? `[File Summary Context]\n${fileSummary}\n` : ''}
${persistentPrompt ? `[Persistent Prompt]\n${persistentPrompt}\n` : ''}
${temporaryPrompt ? `[Temporary Prompt]\n${temporaryPrompt}\n` : ''}

[User Prompt]
${userPrompt}
`.trim();
}

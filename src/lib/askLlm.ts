const LM_STUDIO_URL =
  import.meta.env.VITE_LMSTUDIO_URL || 'http://localhost:1234/v1/chat/completions'
const LM_STUDIO_MODEL =
  import.meta.env.VITE_LMSTUDIO_MODEL || 'meta-llama-3.1-8b-instruct'

export async function askLlm(text: string): Promise<string> {
  const res = await fetch(LM_STUDIO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: LM_STUDIO_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are Jarvis. Respond briefly and clearly.',
        },
        { role: 'user', content: text },
      ],
      temperature: 0.7,
    }),
  })

  const data = await res.json()
  return data.choices[0].message.content
}

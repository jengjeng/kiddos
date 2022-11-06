import { Client } from 'novelapi'

export default async function handler(req, res) {
  const NovelAI = new Client(process.env.NOVELAI_AUTH_TOKEN)

  const character = req.query.character
  const intro = req.query.intro
  const max = 3
  let texts = []
  texts.push(`Once upon a time, ${character} ${intro} ...`)
  for (let i = 0; i < max; i++) {
    const { output } = await _gen(texts.join(' '), i === max - 1)
    const msgs = output
      .split('\n')
      .map(t => t.trim() === '.' ? null : t.trim())
      .filter(Boolean)
    texts.push(msgs.join(' '))
    // for (const msg of msgs) {
    //   if (texts[texts.length - 1].length + msg.length > 300) {
    //     texts.push(msg)
    //   } else {
    //     texts[texts.length - 1] = `${texts[texts.length - 1]} ${msg}`
    //   }
    // }
  }
  
  console.log(texts)
  const drawTexts = texts.map(t => `${character} as painting art or cartoon, ${t}`)
  console.log(drawTexts.join('\n'))

  const result = { texts, drawTexts }
  console.log('[NOVEL] handler:', JSON.stringify({ character, intro, result}, null, 2))
  res.status(200).json({ result })

  ////////

  async function _gen (text, isLast = false) {
    console.log('[GEN]', text)
    return NovelAI.Generator.Generate(
      text,
      NovelAI.Generator.defaultModel,
      {
        "prefix": "theme_childrens",
        "temperature": 0.63,
        "max_length": 250,
        "min_length": 400,
        "top_k": 0,
        "top_p": 0.975,
        "tail_free_sampling": 0.975,
        "repetition_penalty": 1.148125,
        "repetition_penalty_range": 2048,
        "repetition_penalty_slope": 0.09,
        "repetition_penalty_frequency": 0,
        "repetition_penalty_presence": 0,
        "generate_until_sentence": true,
        "use_cache": false,
        "use_string": true,
        "return_full_text": isLast
      },
    )
  }
}

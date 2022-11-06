import { Dalle } from '../../libs/Dalle'

export default async function handler(req, res) {
  try {
    const dalle = new Dalle(process.env.DALLE_SESSION_ID);
    const query = req.query.q
    const generations = await dalle.generate(query.slice(0, 400), { batch_size: 1 });
    console.log(generations.data);
    res.status(200).json({ result: generations.data })
  } catch (err) {
    res.status(500).json({ error: err.toString() })
  }
}

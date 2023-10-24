import {NextApiRequest, NextApiRequest } from "next"

export default (req: NextApiRequest, res: NextApiResponse) => {
  console.log('evento recebido')

  return res.status(200).json({ ok: true })
}
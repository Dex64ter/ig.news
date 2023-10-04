import { NextApiResponse, NextApiRequest} from 'next'

const handler = (request: NextApiRequest, response: NextApiResponse) => {
  const users = [
    {id: 1, name: 'Davi'},
    {id: 2, name: 'Diego'},
    {id: 3, name: 'Dani'}
  ]

  return response.json(users)
}

export default handler

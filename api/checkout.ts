import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // <CHANGE> Handle GET requests first to avoid 405 errors
  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'PIX API is running', 
      status: 'ok' 
    })
  }

  // Handle POST requests
  if (req.method === 'POST') {
    try {
      const { amount, description, customerEmail } = req.body

      if (!amount || !description || !customerEmail) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // Aqui você integra com sua API de pagamento
      const response = {
        success: true,
        message: 'Pedido criado com sucesso',
        orderId: Math.random().toString(36).substr(2, 9),
        amount,
        description,
        customerEmail,
        paymentUrl: 'https://pix.example.com/pay'
      }

      res.status(200).json(response)
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  // Reject other methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
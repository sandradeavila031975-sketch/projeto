import type { VercelRequest, VercelResponse } from "@vercel/node"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true")
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT")
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  )

  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { amount, description } = req.body

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" })
    }

    const lirapayResponse = await fetch("https://api.lirapay.com/pix/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LIRA_PAY_API_SECRET}`,
      },
      body: JSON.stringify({
        amount: Number.parseFloat(amount),
        description: description || "Vakinha Solidária",
        type: "pix",
      }),
    })

    if (!lirapayResponse.ok) {
      const error = await lirapayResponse.text()
      console.error("Lira Pay error:", error)
      return res.status(400).json({
        error: "Failed to generate PIX",
        details: error,
      })
    }

    const data = await lirapayResponse.json()

    return res.status(200).json({
      pixCode: data.qr_code,
      qrCode: data.qr_code_image || data.qr_code_url,
      transactionId: data.transaction_id,
      amount: amount,
    })
  } catch (error) {
    console.error("Error:", error)
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function POST(request: Request) {
  const adminPassword = process.env.NEXT_ADMIN_PASSWORD
  const { password } = await request.json()

  if (!adminPassword || password !== adminPassword) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Generate a simple token (in production, use a proper JWT or session)
  const token = Buffer.from(`admin:${Date.now()}`).toString('base64')

  return Response.json({ token, success: true })
}

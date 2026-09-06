import { JoinClaimClient } from './join-claim-client'

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  return <JoinClaimClient code={code} />
}

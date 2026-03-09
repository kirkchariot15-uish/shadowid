import { IdentityManagementPage } from '@/components/identity-management-page'

export const metadata = {
  title: 'My ShadowID - Identity Management',
  description: 'Manage your zero-knowledge identity, shadow score, and peer endorsements'
}

export default function Page() {
  return <IdentityManagementPage />
}

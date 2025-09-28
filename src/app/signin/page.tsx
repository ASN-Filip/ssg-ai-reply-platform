import SignInFormClient from '@/components/SignInFormClient'

export const metadata = {
  title: 'Sign in',
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <SignInFormClient />
    </div>
  )
}

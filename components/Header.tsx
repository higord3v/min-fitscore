import LogoutButton from './LogoutButton'

interface HeaderProps {
  title: string
  email: string
}

export default function Header({ title, email }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600">Bem-vindo, {email}!</p>
        </div>
        <LogoutButton />
      </div>
    </header>
  )
}
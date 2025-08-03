export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
          Welcome to Spoon Story
        </h1>
        <p className="mb-8 text-xl text-gray-400">Discover and create amazing audio series</p>
        <div className="flex gap-4 justify-center">
          <a
            href="/auth/login"
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            Login
          </a>
          <a
            href="/auth/register"
            className="px-6 py-3 bg-gray-800 text-gray-100 rounded-lg hover:bg-gray-700 transition-colors font-medium border border-gray-700"
          >
            Register
          </a>
        </div>
      </div>
    </main>
  )
}
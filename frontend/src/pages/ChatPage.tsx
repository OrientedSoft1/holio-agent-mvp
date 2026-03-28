export default function ChatPage() {
  return (
    <div className="flex h-screen bg-holio-offwhite">
      <aside className="w-80 border-r border-gray-200 bg-white">
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          <h1 className="text-lg font-bold text-holio-text">HOLIO</h1>
        </div>
        <p className="p-4 text-sm text-holio-muted">Chat list coming soon</p>
      </aside>
      <main className="flex flex-1 items-center justify-center">
        <p className="text-holio-muted">Select a chat to start messaging</p>
      </main>
    </div>
  )
}

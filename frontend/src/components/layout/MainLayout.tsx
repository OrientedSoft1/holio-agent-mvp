import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNavBar from './BottomNavBar'

export default function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-holio-offwhite">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden pb-14 md:pb-0">
        <Outlet />
      </main>
      <BottomNavBar />
    </div>
  )
}

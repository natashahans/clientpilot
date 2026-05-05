export default function Home() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-6">
        <h1 className="text-xl font-bold mb-8">ClientPilot</h1>

        <ul className="space-y-4">
          <li className="hover:text-gray-300 cursor-pointer">Dashboard</li>
          <li className="hover:text-gray-300 cursor-pointer">Clients</li>
          <li className="hover:text-gray-300 cursor-pointer">Appointments</li>
          <li className="hover:text-gray-300 cursor-pointer">Services</li>
          <li className="hover:text-gray-300 cursor-pointer">Analytics</li>
          <li className="hover:text-gray-300 cursor-pointer">Settings</li>
        </ul>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        
        {/* Topbar */}
        <div className="h-16 border-b flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <p className="text-sm text-gray-500">Natasha</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Welcome back 👋</h1>
          <p className="text-gray-500">Here’s what’s happening in your business today.</p>
        </div>

      </div>
    </div>
  );
}
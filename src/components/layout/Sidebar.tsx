import { NavLink } from 'react-router-dom';
import {
  Shield,
  Key,
  FileKey,
  ScrollText,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Certificates', path: '/certificates', icon: Shield },
  { name: 'SSH Keys', path: '/ssh-keys', icon: Key },
  { name: 'Code Signing', path: '/code-signing', icon: FileKey },
  { name: 'Audit Logs', path: '/audit-logs', icon: ScrollText },
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#1a2332] border-r border-gray-700 transform transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                ID
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Identity Asset</h1>
                <p className="text-xs text-gray-400">Security dashboard</p>
              </div>
            </div>
          </div>

          <div className="px-6 mb-4">
            <p className="text-xs font-medium text-gray-400 mb-3">Modules</p>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gray-700/50 text-white'
                      : 'text-gray-400 hover:bg-gray-700/30 hover:text-gray-200'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4">
            <div className="bg-white rounded-lg p-3">
              <div className="text-xs text-gray-600">
                <span className="font-medium">Environment:</span> Production
              </div>
              <div className="text-xs text-gray-500 mt-1">
                All changes are local-only for this demo.
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

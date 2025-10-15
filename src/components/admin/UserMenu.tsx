// src/components/admin/UserMenu.tsx
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export function UserMenu() {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="-m-1.5 flex items-center p-1.5">
        <span className="sr-only">Open user menu</span>
        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
          <UserCircleIcon className="h-6 w-6 text-indigo-600" />
        </div>
        <span className="hidden lg:flex lg:items-center">
          <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
            Admin User
          </span>
        </span>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <a
                href="#"
                className={cn(
                  active ? 'bg-gray-50' : '',
                  'block px-3 py-2 text-sm leading-6 text-gray-900'
                )}
              >
                <div className="flex items-center">
                  <UserCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Your Profile
                </div>
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                href="#"
                className={cn(
                  active ? 'bg-gray-50' : '',
                  'block px-3 py-2 text-sm leading-6 text-gray-900'
                )}
              >
                <div className="flex items-center">
                  <Cog6ToothIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Settings
                </div>
              </a>
            )}
          </Menu.Item>
          <div className="my-1 h-px bg-gray-100" />
          <Menu.Item>
            {({ active }) => (
              <a
                href="#"
                className={cn(
                  active ? 'bg-gray-50' : '',
                  'block px-3 py-2 text-sm leading-6 text-gray-900'
                )}
              >
                <div className="flex items-center text-red-600">
                  <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                  Sign out
                </div>
              </a>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
'use client'

import { IconType } from 'react-icons';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AiFillFolder } from 'react-icons/ai';
import { MdAccountBalanceWallet, MdAdminPanelSettings } from 'react-icons/md';
import Link from 'next/link';

import Logo from '../../components/logo';
;

interface MenuItem {
  label: string;
  IconComponent?: IconType;
  route: string;
  subItems: SubItem[];
}
interface SubItem {
  label: string;
  route: string;
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const currentRoute = usePathname();
  const router = useRouter();
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem>();
  const menuItems: MenuItem[] = useMemo(() => [
    // {
    //   IconComponent: AiFillFolder,
    //   label: 'Gerenciamento',
    //   route: '/management',
    //   subItems: [
    //     { label: 'Categorias de Despesas', route: '/management/expense-categories' },
    //     { label: 'Fluxo de Caixa', route: '/managemenet/cash-flow' }
    //   ]
    // },
    {
      IconComponent: MdAccountBalanceWallet,
      label: 'Portfolio',
      route: '/portfolio',
      subItems: [
        { label: 'Dashboard', route: '/portfolio/dashboard' },
        { label: 'Ativos', route: '/portfolio/assets' },
        { label: 'Transações', route: '/portfolio/transactions' },
        // { label: 'Proventos', route: '/portfolio/dividends' },
        // { label: 'Rentabilidade', route: '/portfolio/performance }
      ]
    },
    {
      IconComponent: MdAdminPanelSettings,
      label: 'Admin',
      route: '/admin',
      subItems: [
        { label: 'Ativos', route: '/admin/assets' }
      ]
    }
  ], []);
  const selectedMenuItemClasses = `
    bg-green-500/[.3]
    text-white
  `;
  const nonSelectedMenuItemClasses = `
    hover:bg-green-500/[.05]
    hover:text-green-500
    hover:before:content-['*']
    hover:before:absolute
    hover:before:bg-green-500
    hover:before:h-full
    hover:before:left-0
    hover:before:top-0
    hover:before:w-1.5
  `;
  const handleMenuItemClick = (item: MenuItem | SubItem) => {
    if ('subItems' in item)  {
      if (item.label === selectedMenuItem?.label) {
        setSelectedMenuItem(undefined);
      } else {
        setSelectedMenuItem(item);
      }
    }
  };

  useEffect(() => {
    menuItems.forEach((item) => {
      if (currentRoute.includes(item.route)) {
        setSelectedMenuItem(item);
      }
    });
  }, [currentRoute, menuItems]);

  return (
    <div className="flex h-full">
      <div className="flex flex-col py-11 gap-24 bg-black-800">
        <Logo fontSize="text-3xl" />
        <div>
          {menuItems.map((menuItem) => {
            const { label, IconComponent } = menuItem;

            return (
              <div key={label}>
                <div
                  className={`
                    py-4
                    px-9
                    flex
                    gap-6
                    items-center
                    cursor-pointer
                    relative
                    ${menuItem.label === selectedMenuItem?.label ? selectedMenuItemClasses : nonSelectedMenuItemClasses}
                  `}
                  onClick={() => handleMenuItemClick(menuItem)}
                >
                  {IconComponent && (<IconComponent size={24} />)}
                  {label}
                </div>

                {
                  (
                    menuItem.label === selectedMenuItem?.label && 
                    selectedMenuItem?.subItems.length
                  ) && (
                    <div className="bg-green-500/[0.05] flex flex-col">
                      {selectedMenuItem.subItems.map((subItem) => (
                        <Link
                          key={subItem.label}
                          href={subItem.route}
                          className={`
                             py-4
                             pr-9
                             pl-[84px]
                             cursor-pointer
                             hover:text-green-500
                             ${currentRoute.includes(subItem.route) && 'text-green-500'}
                          `}
                        >
                          {subItem.label}
                        </Link>
                        // <div
                        //   key={subItem.label}
                        //   className={`
                        //     py-4
                        //     pr-9
                        //     pl-[84px]
                        //     cursor-pointer
                        //     hover:text-green-500
                        //     ${currentRoute.includes(subItem.route) && 'text-green-500'}
                        //   `}
                        //   onClick={() => handleMenuItemClick(subItem)}
                        // >
                        //   {subItem.label}
                        // </div>
                      ))}
                    </div>
                  )
                }
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center items-start overflow-auto flex-1 p-12">
        {children}
      </div>
    </div>
  );
}

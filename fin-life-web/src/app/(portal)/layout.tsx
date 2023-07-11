import { IconType } from 'react-icons';
import { AiFillFolder } from 'react-icons/ai';
import { MdAccountBalanceWallet } from 'react-icons/md';
import Logo from '../_components/logo';

interface MenuItem {
  label: string;
  IconComponent?: IconType;
  subItems?: {
    label: string;
  }[];
}

export default function PortalLayout({
  children
}: {
  children: React.ReactNode
}) {
  const menuItems: MenuItem[] = [
    {
      IconComponent: AiFillFolder,
      label: 'Gerenciamento',
      subItems: [
        { label: 'Categorias de Despesas' },
        { label: 'Fluxo de Caixa' }
      ]
    },
    {
      IconComponent: MdAccountBalanceWallet,
      label: 'Portfólio'
    }
  ];

  return (
    <div className="flex h-full">
      <div className="flex flex-col py-11 gap-24 bg-black-800">
        <Logo fontSize="text-3xl" />
        <div>
          {menuItems.map((menuItem) => {
            const { label, IconComponent } = menuItem;

            return (
              <div
                key={label}
                className="
                  py-4
                  px-9
                  flex
                  gap-6
                  items-center
                  cursor-pointer
                  relative
                  hover:bg-green-500/[.05]
                  hover:text-green-500
                  hover:before:content-['*']
                  hover:before:absolute
                  hover:before:bg-green-500
                  hover:before:h-full
                  hover:before:left-0
                  hover:before:top-0
                  hover:before:w-1.5
                "
              >
                {IconComponent && (
                  <IconComponent size={24} />
                )}
                {label}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex-1 p-12 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

'use client'

import { useModalContext } from '@/providers/modal';

export interface ModalProps {
  children: React.ReactNode;
  title: string;
}

export default function Modal({ children, title }: ModalProps) {
  const { show } = useModalContext();

  return show && (
    <div className="
      absolute
      top-0
      left-0
      w-full
      h-full
      bg-white/[.08]
      flex
      justify-center
      items-center
    ">
      <div className="bg-black-800 p-8 flex flex-col gap-12 rounded-md">
        {title && (
          <h1 className="text-2xl font-bold">
            {title}
          </h1>
        )}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
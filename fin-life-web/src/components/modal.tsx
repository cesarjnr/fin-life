'use client'

import { useModalContext } from '@/app/providers/modal';

export default function Modal() {
  const { show, title, content, actions } = useModalContext();

  return (
    show &&
    (
      <div className="
        absolute
        top-0
        left-0
        w-full
        h-full
        bg-white/[.1]
        flex
        justify-center
        items-center
      ">
        <div className="bg-black-800 p-6 flex flex-col gap-6 rounded-md">
          <h1 className="text-2xl">
            {title}
          </h1>
          <div>
            {content}
          </div>
          <div className="flex justify-end gap-5">
            {actions}
          </div>
        </div>
      </div>
    )
  );
}
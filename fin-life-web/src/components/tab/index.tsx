'use client'

import { useEffect, useMemo, useState } from 'react';

interface TabProps {
  children: React.ReactElement | React.ReactElement[];
  onChange?: (tab: TabConfig) => void;
  tabs: TabConfig[];
}
export interface TabConfig {
  id: number | string;
  label: string;
}

export default function Tab({ children, onChange, tabs }: TabProps) {
  const childrenArr = useMemo(
    () => Array.isArray(children) ? children : [children],
    [children]
  );
  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const [currentTabContent, setCurrentTabContent] = useState(childrenArr[0]);
  const handleTabChange = (tab: TabConfig) => {

    setCurrentTab(tab);

    if (onChange) {
      onChange(tab);
    }
  };

  useEffect(() => {
    const currentTabContent = childrenArr.find((child) => child.props['data-id'] === currentTab.id);

    if (currentTabContent) {
      setCurrentTabContent(currentTabContent);
    }
  }, [childrenArr, currentTab]);

  return (
    <div className="tab h-full flex flex-col">
      <div className="flex border-b border-white/[.1]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`
              px-5
              py-3
              text-sm
              font-bold
              ${currentTab.id === tab.id ? 'border-b-2 border-green-500 text-green-500' : ''}
            `}
            onClick={() => handleTabChange(tab)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 p-6">
        {currentTabContent}
      </div>
    </div>
  );
}
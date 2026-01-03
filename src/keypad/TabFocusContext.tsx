import React, { createContext, useContext, useState, ReactNode } from "react";

type TabFocusContextType = {
  tabFocusIndex: number | null;
  setTabFocusIndex: (index: number | null) => void;
};

const TabFocusContext = createContext<TabFocusContextType>({
  tabFocusIndex: null,
  setTabFocusIndex: () => {},
});

export function TabFocusProvider({ children }: { children: ReactNode }) {
  const [tabFocusIndex, setTabFocusIndex] = useState<number | null>(null);

  return (
    <TabFocusContext.Provider value={{ tabFocusIndex, setTabFocusIndex }}>
      {children}
    </TabFocusContext.Provider>
  );
}

export function useTabFocus() {
  return useContext(TabFocusContext);
}

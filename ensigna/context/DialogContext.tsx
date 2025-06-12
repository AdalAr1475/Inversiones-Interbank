"use client";

import { createContext, useContext, useState } from "react";

type DialogContextType = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog debe usarse dentro de DialogProvider");
  }
  return context;
};

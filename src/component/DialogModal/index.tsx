import React from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
   
} from "@/components/ui/dialog"

type DialogProps = {
    title: string;
    description: string;
   
    titleButton: string;
    isOpen?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    customStyles?: React.CSSProperties;
    children?: React.ReactNode; // Adicionando children como uma propriedade opcional
}

export default function DialogModal({
  title,
  description,
    
  isOpen = false,
  onOpen,
  onClose,
  customStyles,
  children, // Recebendo children
}: DialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => open ? onOpen?.() : onClose?.()}>
      
      <DialogContent style={customStyles}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='text-[#3A5AAA]'>
            {description}
          </DialogDescription>
        </DialogHeader>
        {children} {/* Renderizando children aqui */}
      </DialogContent>
    </Dialog>
  )
}

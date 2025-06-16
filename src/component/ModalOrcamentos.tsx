import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import React from 'react';

interface ModalOrcamentosProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  subTitle?: string;
  content?: React.ReactNode;
}

const ModalOrcamentos: React.FC<ModalOrcamentosProps> = ({
  isOpen,
  onClose,
  title,
  subTitle,
  content,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay com fundo escuro semi-transparente */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur"
        onClick={onClose}
      />

      {/* Conteúdo do Modal */}
      <div className="relative bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-6">
          <div>
            {title && (
              <h2 className="text-2xl font-bold text-[#1E3A8A]">{title}</h2>
            )}
            {subTitle && <p className="text-[#152C6B] mt-1">{subTitle}</p>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[#152C6B] hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Fechar modal</span>
          </Button>
        </div>

        {/* Corpo do Modal */}
        <div className="prose prose-sm max-w-none">{content}</div>
      </div>
    </div>
  );
};

export default ModalOrcamentos;

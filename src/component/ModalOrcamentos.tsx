import React from 'react';

interface ModalOrcamentosProps {
  isOpen?: boolean;
  onClose?: () => void;
  content?: React.ReactNode;
}

const ModalOrcamentos: React.FC<ModalOrcamentosProps> = ({
  isOpen,
  onClose,
  content,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay com fundo escuro semi-transparente */}
      <div
        className="absolute inset-0 bg-green/20 backdrop-blur"
        onClick={onClose}
      />

      {/* Conteúdo do Modal */}
      <div className="relative bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}

        {/* Corpo do Modal */}
        <div className="prose prose-sm max-w-none">{content}</div>
      </div>
    </div>
  );
};

export default ModalOrcamentos;

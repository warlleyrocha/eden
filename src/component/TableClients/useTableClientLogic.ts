// Hook para TableClients

import { useState, useMemo } from 'react';
import type { Client } from '@/@types/clients';

interface UseClientesTableLogicProps {
  formattedClients: Client[];
}

export default function useClientesTableLogic({
  formattedClients,
}: UseClientesTableLogicProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered data based on searchTerm
  const filteredClients = useMemo(() => {
    return formattedClients.filter((c) =>
      c.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [formattedClients, searchTerm]);

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  return {
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    toggleModal,
    filteredClients,
  };
}

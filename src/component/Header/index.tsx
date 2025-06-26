import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  LogOut,
  Smartphone,
  UserPlus,
  Bell,
  BellDot,
} from 'lucide-react';
import Forms from '../Forms';
import { useNavigate, useLocation } from 'react-router-dom';
import { DynamicSheet } from '@/component/Sheet';
import { ModalImpressao } from '@/component/ModalImpressao';
import { useHeaderLogic } from './useHeaderLogic';
import { useOrcamentoSequencia } from '@/contexts/orcamentoContext';

import { useModalImpressao } from '@/hooks/useModalOrcamento';

import { useEffect, useState } from 'react';

type HeaderProps = Readonly<{
  name?: string;
}>;

export function Header({ name }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setOrcamentos, getNumeroSequencial } = useOrcamentoSequencia();
  const { abrirModalImpressao } = useModalImpressao();

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Hook customizado que encapsula toda a lógica da interface para manter o componente limpo
  const {
    nameStore,
    orcamentos,
    loading,
    error,
    errorMessage,
    processingActionId,
    showModal,
    setShowModal,
    hasNotifications,
    handleLogOut,
    atualizarStatus,
    removerOrcamento,
    refreshOrcamentos,
  } = useHeaderLogic();

  // Sincronizar orçamentos com o context sempre que os dados mudarem
  useEffect(() => {
    if (orcamentos.length > 0) {
      setOrcamentos(orcamentos);
    }
  }, [orcamentos, setOrcamentos]);

  const handleOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (open) {
      refreshOrcamentos(); // Força a atualização ao abrir o sheet
    }
  };

  return (
    <div className="w-full flex justify-between items-center px-6 py-4 md:px-8 md:py-3 bg-white">
      <div className="flex items-center gap-4 container mx-4 md:mx-20">
        {['/orcamento', '/caixa', '/estoque'].includes(location.pathname) ? (
          <Button
            className="flex items-center justify-center p-2 rounded-md hover:bg-gray-200 transition duration-200"
            variant="ghost"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-6 w-6 md:h-7 md:w-7 text-[#081534]" />
          </Button>
        ) : (
          <Smartphone className="h-6 w-6 md:h-7 md:w-7 text-[#081534]" />
        )}

        <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-[#081534]">
          <a href="/">{nameStore}</a>
        </h1>
      </div>
      <div className="flex gap-6">
        <DynamicSheet
          title="Notificações"
          description="Aqui estão suas notificações."
          icon={
            hasNotifications ? (
              <BellDot className="h-6 w-6 text-[#152C6B]" />
            ) : (
              <Bell className="h-6 w-6 text-[#152C6B]" />
            )
          }
          isOpen={isSheetOpen}
          onOpenChange={handleOpenChange} // Adicionar esta prop
        >
          <div className="space-y-2 text-sm text-[#0E1F4D]">
            {loading && <p>Carregando orçamentos...</p>}
            {error && (
              <p className="text-red-500">
                Erro: {error.message}
                {error.status && ` (Status: ${error.status})`}
              </p>
            )}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}

            {/*Exibe os orçamentos mais recentes*/}
            <div className="flex flex-col overflow-y-auto max-h-[750px] space-y-3 p-[8px]">
              {!loading &&
                orcamentos
                  .slice()
                  .sort((a, b) => {
                    const dateA = new Date(
                      a.criadoEm ?? '1970-01-01'
                    ).getTime();
                    const dateB = new Date(
                      b.criadoEm ?? '1970-01-01'
                    ).getTime();
                    return dateB - dateA;
                  })

                  .map((orcamento) => {
                    const numeroSequencial = getNumeroSequencial(orcamento.id);
                    const statusColor =
                      {
                        ABERTO: 'bg-yellow-100 text-yellow-800',
                        APROVADO: 'bg-green-100 text-green-800',
                        REJEITADO: 'bg-red-100 text-red-800',
                      }[orcamento.status] ?? 'bg-gray-100 text-gray-800';
                    return (
                      <button
                        key={orcamento.id}
                        tabIndex={0}
                        className="relative group border border-gray-200 rounded-lg p-4 bg-white hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                        onDoubleClick={() => abrirModalImpressao(orcamento)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            abrirModalImpressao(orcamento);
                          }
                        }}
                      >
                        {/* Badge de status */}
                        <span
                          className={`absolute -top-2 -right-2 text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor}`}
                        >
                          {orcamento.status}
                        </span>

                        {/* Cabeçalho */}
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-900 truncate max-w-[180px]">
                            {orcamento.cliente.nome}
                          </h3>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                            #{numeroSequencial}
                          </span>
                        </div>

                        {/* Detalhes */}
                        <div className="text-sm text-gray-600 mb-3">
                          <p className="truncate">
                            Criado em:{' '}
                            {orcamento.criadoEm
                              ? new Date(orcamento.criadoEm).toLocaleString(
                                  'pt-BR'
                                )
                              : 'Sem data'}
                          </p>
                        </div>

                        {orcamento.status === 'ABERTO' && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                atualizarStatus(orcamento.id, 'APROVADO');
                              }}
                              disabled={!!processingActionId}
                              className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                                processingActionId === `approve-${orcamento.id}`
                                  ? 'bg-green-300 cursor-not-allowed'
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              {processingActionId ===
                              `approve-${orcamento.id}` ? (
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="animate-spin h-3 w-3 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Processando...
                                </span>
                              ) : (
                                'Aprovar'
                              )}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removerOrcamento(orcamento.id);
                              }}
                              disabled={!!processingActionId}
                              className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                                processingActionId === `reject-${orcamento.id}`
                                  ? 'bg-red-300 cursor-not-allowed'
                                  : 'bg-red-500 hover:bg-red-600 text-white'
                              }`}
                            >
                              {processingActionId ===
                              `reject-${orcamento.id}` ? (
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="animate-spin h-3 w-3 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Processando...
                                </span>
                              ) : (
                                'Rejeitar'
                              )}
                            </button>
                          </div>
                        )}
                      </button>
                    );
                  })}
            </div>
          </div>
        </DynamicSheet>

        <Button
          onClick={() => setShowModal(true)}
          variant="outline"
          className="flex items-center justify-center p-2 rounded-md hover:bg-gray-200 transition duration-200"
        >
          <UserPlus className="h-6 w-6 text-gray-700" />
        </Button>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-8">
            <div className="bg-black opacity-60 absolute inset-0"></div>
            <div className="bg-white rounded-2xl p-6 sm:p-8 relative z-10 max-w-lg w-full">
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
                <Forms showModal={showModal} setShowModal={setShowModal} />
              </div>
            </div>
          </div>
        )}

        <Button
          className="flex items-center justify-center p-2 rounded-md hover:bg-gray-200 transition duration-200"
          variant="outline"
          onClick={handleLogOut}
        >
          <LogOut className="h-6 w-6 text-gray-700" />
        </Button>
      </div>
      <ModalImpressao />
    </div>
  );
}

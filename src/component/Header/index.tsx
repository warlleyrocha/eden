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
import { useHeaderLogic } from './useHeaderLogic';
import { useOrcamentoSequencia } from '@/contexts/orcamentoContext';
import { useEffect, useState } from 'react';

type HeaderProps = Readonly<{
  name?: string;
}>;

export function Header({ name }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setOrcamentos, getNumeroSequencial } = useOrcamentoSequencia();

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
            <div className="overflow-y-auto max-h-[850px] border rounded-lg p-2 bg-gray-50 shadow-sm">
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
                    return (
                      <div
                        key={orcamento.id}
                        className="border rounded-lg p-2 bg-gray-50 shadow-sm"
                      >
                        <div className="bg-gray-50 flex justify-between">
                          <h1 className="font-bold">
                            {orcamento.cliente.nome}{' '}
                          </h1>
                          <p>Orçamento #{numeroSequencial}</p>
                        </div>
                        <p className="font-semibold">
                          Status: {orcamento.status}
                        </p>
                        <p className="text-xs text-gray-600">
                          {orcamento.criadoEm
                            ? new Date(orcamento.criadoEm).toLocaleString(
                                'pt-BR'
                              )
                            : 'Sem data'}
                        </p>

                        {orcamento.status === 'ABERTO' && (
                          <div className="mt-2 flex gap-2">
                            <Button
                              onClick={() =>
                                atualizarStatus(orcamento.id, 'APROVADO')
                              }
                              disabled={!!processingActionId}
                              variant="default"
                              size="sm"
                              className="text-xs px-3 py-1"
                            >
                              {processingActionId ===
                              `approve-${orcamento.id}` ? (
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="animate-spin h-3 w-3"
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
                            </Button>
                            <Button
                              onClick={() => removerOrcamento(orcamento.id)}
                              disabled={!!processingActionId}
                              variant="destructive"
                              size="sm"
                              className="text-xs px-3 py-1"
                            >
                              {processingActionId ===
                              `reject-${orcamento.id}` ? (
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="animate-spin h-3 w-3"
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
                            </Button>
                          </div>
                        )}

                        {orcamento.status === 'APROVADO' && (
                          <div className="mt-2 flex gap-2">
                            <Button
                              onClick={() => navigate(`/`)}
                              variant="outline"
                              size="sm"
                              className="text-xs px-3 py-1"
                            >
                              Ver Detalhes
                            </Button>
                          </div>
                        )}
                      </div>
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
    </div>
  );
}

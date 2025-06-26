'use client';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { Header } from '@/component/Header';
import CashClosureModel from '@/component/PaymentModel';
import MovimentacoesTab from '@/component/MovimentacoesTab';
import { RegistroModal } from '@/component/RegistroModal';

import { useCaixa } from './useCaixa';

export default function Caixa() {
  const [activeTab, setActiveTab] = useState<'entradas' | 'saidas'>('entradas');

  const {
    isSubmitting,
    isGeneratingPDF,
    error,
    showCashClosureModal,
    showSaidaModal,
    totalEntradas,
    totalSaidas,
    saldoFinal,
    pixSaida,
    dinheiroSaida,
    debitoSaida,
    totalCreditoSaida,
    pixEntrada,
    dinheiroEntrada,
    debitoEntrada,
    totalCreditoEntrada,
    metodoPagamento,
    valorSaida,
    descricaoSaida,
    parcelas,
    juros,
    movimentacoes,

    // Setters
    setShowCashClosureModal,
    setShowSaidaModal,
    setShowEntradaModal,
    setMetodoPagamento,
    setValorSaida,
    setDescricaoSaida,
    setParcelas,
    setJuros,

    // Funções
    formatarData,
    formatarMoeda,
    formatarMetodoPagamentoCompleto,
    handleSaidaSubmit,
    handleDateChange,
    downloadPDF,
  } = useCaixa();

  return (
    <>
      <div className="flex flex-row">
        <Header name="" />
      </div>
      <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F5F5] text-[#333] p-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 rounded-xl p-16 sm:p-8 w-full max-w-7xl">
          <div className="rounded-xl p-6 sm:p-8 glow-shadow">
            {/* Header com Tabs */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A]">
                    Resumo do Caixa
                  </h1>
                </div>
                <Button
                  className="px-4 py-2 rounded-lg bg-[#1E3A8A] text-white hover:bg-[#152C6B] transition-colors duration-200"
                  onClick={() => setShowCashClosureModal(true)}
                  disabled={isGeneratingPDF}
                >
                  {isGeneratingPDF ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando PDF...
                    </>
                  ) : (
                    'FECHAR CAIXA'
                  )}
                </Button>
              </div>

              {/* Nav Tabs */}
              <div className="flex bg-white p-1 rounded-lg shadow-inner">
                <button
                  onClick={() => setActiveTab('entradas')}
                  className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
                    activeTab === 'entradas'
                      ? 'bg-[#1E3A8A] text-white shadow-md'
                      : 'text-[#1E3A8A] hover:bg-[#F0F4FF]'
                  }`}
                >
                  Entradas
                </button>
                <button
                  onClick={() => setActiveTab('saidas')}
                  className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
                    activeTab === 'saidas'
                      ? 'bg-[#1E3A8A] text-white shadow-md'
                      : 'text-[#1E3A8A] hover:bg-[#F0F4FF]'
                  }`}
                >
                  Saídas
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Entradas Tab */}
              {activeTab === 'entradas' && (
                <MovimentacoesTab
                  // Valores dos cartões de resumo
                  pixValue={pixEntrada}
                  dinheiroValue={dinheiroEntrada}
                  debitoValue={debitoEntrada}
                  creditoValue={totalCreditoEntrada}
                  // Configurações da seção principal
                  sectionTitle="Vendas"
                  movimentacoes={movimentacoes}
                  tipoMovimento="ENTRADA"
                  totalValue={totalEntradas}
                  emptyMessage="Nenhuma venda registrada"
                  // Dados do resumo final
                  totalEntradas={totalEntradas}
                  totalSaidas={totalSaidas}
                  saldoFinal={saldoFinal}
                  // Handler para adicionar
                  onAddClick={() => {
                    if (activeTab === 'entradas') {
                      setShowEntradaModal(true);
                    } else {
                      setShowSaidaModal(true);
                    }
                  }}
                  // Funções de formatação
                  formatarMoeda={formatarMoeda}
                  formatarData={formatarData}
                  formatarMetodoPagamentoCompleto={
                    formatarMetodoPagamentoCompleto
                  }
                />
              )}

              {/* Saídas Tab */}
              {activeTab === 'saidas' && (
                <MovimentacoesTab
                  // Valores dos cartões de resumo
                  pixValue={pixSaida}
                  dinheiroValue={dinheiroSaida}
                  debitoValue={debitoSaida}
                  creditoValue={totalCreditoSaida}
                  // Configurações da seção principal
                  sectionTitle="Resumo de Saídas"
                  movimentacoes={movimentacoes}
                  tipoMovimento="SAIDA"
                  totalValue={totalSaidas}
                  emptyMessage="Nenhuma saída registrada"
                  // Dados do resumo final
                  totalEntradas={totalEntradas}
                  totalSaidas={totalSaidas}
                  saldoFinal={saldoFinal}
                  // Handler para adicionar
                  onAddClick={() => setShowSaidaModal(true)}
                  // Funções de formatação
                  formatarMoeda={formatarMoeda}
                  formatarData={formatarData}
                  formatarMetodoPagamentoCompleto={
                    formatarMetodoPagamentoCompleto
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Fechamento de Caixa */}
      {showCashClosureModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-8">
          <button
            className="bg-black opacity-60 absolute inset-0 backdrop-blur-sm transition-opacity"
            onClick={() => setShowCashClosureModal(false)}
            disabled={isGeneratingPDF}
          ></button>
          <div className="bg-white rounded-2xl p-6 sm:p-8 relative z-10 max-w-lg w-full shadow-lg min-h-[32rem]">
            <button
              onClick={() => setShowCashClosureModal(false)}
              disabled={isGeneratingPDF}
              className="absolute top-6 right-6 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#1E3A8A] hover:text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            {/* Overlay de loading durante geração do PDF */}
            {isGeneratingPDF && (
              <div className="absolute inset-0 bg-white bg-opacity-90 rounded-2xl flex items-center justify-center z-20">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#1E3A8A] mx-auto mb-4" />
                  <p className="text-[#1E3A8A] font-medium">
                    Gerando relatório PDF...
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Por favor, aguarde
                  </p>
                </div>
              </div>
            )}

            <CashClosureModel
              totalEntries={totalEntradas}
              totalExits={totalSaidas}
              finalBalance={saldoFinal}
              onDateChange={handleDateChange}
            />

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
              <Button
                className="bg-[#22C55E] text-white px-6 py-4 rounded-full hover:bg-[#1AAE4E] w-full sm:w-auto text-lg transition-colors duration-200"
                onClick={downloadPDF}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar como PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registro de Entrada */}
      {/*{showEntradaModal && (
        <RegistroModal
          isOpen={showEntradaModal}
          onClose={() => setShowEntradaModal(false)}
          tipo='entrada'
          isSubmitting={isSubmitting}
          onSubmit={handleEntradaSubmit}
          error={error}
          valor={valorEntrada}
          setValor={setValorEntarda}
          descricao={descricaoEntrada}
          setDescricao={setDescricaoEntrada}
          metodoPagamento={metodoPagamento}
          setMetodoPagamento={setMetodoPagamento}
          parcelas={parcelas}
          setParcelas={setParcelas}
          juros={juros}
          setJuros={setJuros}
        />
      )}*/}

      {/* Modal de Registro de Saída */}
      {showSaidaModal && (
        <RegistroModal
          isOpen={showSaidaModal}
          onClose={() => setShowSaidaModal(false)}
          tipo="saida"
          isSubmitting={isSubmitting}
          onSubmit={handleSaidaSubmit}
          error={error}
          valor={valorSaida}
          setValor={setValorSaida}
          descricao={descricaoSaida}
          setDescricao={setDescricaoSaida}
          metodoPagamento={metodoPagamento}
          setMetodoPagamento={setMetodoPagamento}
          parcelas={parcelas}
          setParcelas={setParcelas}
          juros={juros}
          setJuros={setJuros}
        />
      )}
    </>
  );
}

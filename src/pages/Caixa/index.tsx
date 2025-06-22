'use client';

import { useState } from 'react';
import { Header } from '@/component/Header';
import LabelBullet from '@/component/LabelBullet';
import CashClosureModel from '@/component/PaymentModel';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  Banknote,
  CreditCard,
  ArrowRight,
  Download,
  Loader2,
} from 'lucide-react';
import { useCaixa } from './useCaixa';

export default function Caixa() {
  const [activeTab, setActiveTab] = useState<'entradas' | 'saidas'>('entradas');

  const {
    isSubmitting,
    isGeneratingPDF,
    error,
    showModal,
    showExitModal,
    totalEntries,
    totalSaidas,
    finalBalance,
    PIX,
    DINHEIRO,
    DEBITO,
    totalCreditoEntrada,
    metodoPagamento,
    valorSaida,
    descricaoSaida,
    parcelas,
    juros,
    movimentacoes,

    // Setters
    setShowModal,
    setShowExitModal,
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
                  onClick={() => setShowModal(true)}
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
                <div className="flex-1">
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
                    <LabelBullet
                      title="PIX"
                      type="pix"
                      value={formatarMoeda(PIX)}
                    />
                    <LabelBullet
                      title="Dinheiro"
                      type="money"
                      value={formatarMoeda(DINHEIRO)}
                    />
                    <LabelBullet
                      title="Débito"
                      type="debit"
                      value={formatarMoeda(DEBITO)}
                    />
                    <LabelBullet
                      title="Crédito"
                      type="credit"
                      value={formatarMoeda(totalCreditoEntrada)}
                    />
                  </div>

                  <div className="mt-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                    <span className="text-lg font-semibold text-[#1E3A8A]">
                      Total Entradas
                    </span>
                    <span className="text-lg font-bold text-[#1E3A8A]">
                      {totalEntries}
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl p-6 bg-white shadow-sm">
                    <div className="flex flex-col items-center bg-green-100 p-4 rounded-lg">
                      <div className="text-gray-900 font-medium">
                        Total de Entradas
                      </div>
                      <div className="text-[#22C55E] text-lg font-bold">
                        {totalEntries}
                      </div>
                    </div>
                    <div className="flex flex-col items-center bg-red-100 p-4 rounded-lg">
                      <div className="text-gray-700 font-medium">
                        Total de Saídas
                      </div>
                      <div className="text-[#EF4444] text-lg font-bold">
                        {totalSaidas}
                      </div>
                    </div>
                    <div className="flex flex-col items-center bg-gray-100 p-4 rounded-lg">
                      <div className="text-[#1E3A8A] font-medium">
                        Saldo Final
                      </div>
                      <div className="text-[#1E3A8A] text-lg font-bold">
                        {finalBalance}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Saídas Tab */}
              {activeTab === 'saidas' && (
                <div className="flex-1">
                  <div className="bg-white rounded-xl p-6 shadow-sm h-[100%]">
                    <h2 className="text-xl font-semibold text-[#1E3A8A] mb-6">
                      <div className="flex justify-between">
                        Resumo de Saídas
                        <Button
                          variant={'ghost'}
                          onClick={() => setShowExitModal(true)}
                          className="cursor-pointer hover:bg-[#F0F4FF] rounded-full p-2"
                        >
                          <PlusCircle className="text-[#1E3A8A]" />
                        </Button>
                      </div>
                    </h2>
                    <div className="space-y-4">
                      {movimentacoes.length === 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex justify-between text-[#1E3A8A]">
                            <span>Nenhuma saída registrada</span>
                            <span>R$ 0,00</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-4 max-h-60 overflow-y-auto">
                            {movimentacoes
                              .filter((m) => m.tipo === 'SAIDA')
                              .slice()
                              .map((movimento) => (
                                <div
                                  key={movimento.id}
                                  className="flex items-center justify-between border-b pb-2"
                                >
                                  <div>
                                    <p className="font-medium">
                                      {movimento.descricao || 'Saída'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {formatarData(movimento.criadoEm)} •{' '}
                                      {formatarMetodoPagamentoCompleto(
                                        movimento.metodoPagamento,
                                        movimento.parcelas,
                                        movimento.juros
                                      )}
                                    </p>
                                  </div>
                                  <p className="font-medium text-red-600">
                                    -{formatarMoeda(movimento.valor)}
                                  </p>
                                </div>
                              ))}
                          </div>
                          <div className="flex justify-between text-[#1E3A8A] border-t pt-2">
                            <span className="font-medium">Total de Saídas</span>
                            <span className="text-red-500 font-bold">
                              {totalSaidas}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Fechamento de Caixa */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-8">
          <button
            className="bg-black opacity-60 absolute inset-0 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModal(false)}
            disabled={isGeneratingPDF}
          ></button>
          <div className="bg-white rounded-2xl p-6 sm:p-8 relative z-10 max-w-lg w-full shadow-lg min-h-[32rem]">
            <button
              onClick={() => setShowModal(false)}
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
              totalEntries={totalEntries}
              totalExits={totalSaidas}
              finalBalance={finalBalance}
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

      {showExitModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-8">
          <button
            className="bg-black opacity-60 absolute inset-0"
            onClick={() => setShowExitModal(false)}
            disabled={isSubmitting}
          ></button>
          <div className="bg-white rounded-2xl p-6 sm:p-8 relative z-10 max-w-lg w-full shadow-lg">
            <h2 className="text-xl font-semibold text-[#1E3A8A] mb-4">
              Registrar Nova Saída
            </h2>

            {/* Overlay de loading durante submissão */}
            {isSubmitting && (
              <div className="absolute inset-0 bg-white bg-opacity-90 rounded-2xl flex items-center justify-center z-20">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#1E3A8A] mx-auto mb-4" />
                  <p className="text-[#1E3A8A] font-medium">
                    Registrando saída...
                  </p>
                </div>
              </div>
            )}

            <form className="space-y-4 justify-between">
              <div>
                <label
                  htmlFor="value"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="0,00"
                  value={valorSaida}
                  onChange={(e) => setValorSaida(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Descrição
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Descrição da saída"
                  value={descricaoSaida}
                  onChange={(e) => setDescricaoSaida(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="payment-method"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Método de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="pix"
                      name="metodo"
                      value="pix"
                      checked={metodoPagamento === 'pix'}
                      onChange={() => setMetodoPagamento('pix')}
                      disabled={isSubmitting}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="pix" className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      PIX
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="dinheiro"
                      name="metodo"
                      value="dinheiro"
                      checked={metodoPagamento === 'dinheiro'}
                      onChange={() => setMetodoPagamento('dinheiro')}
                      disabled={isSubmitting}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label
                      htmlFor="dinheiro"
                      className="flex items-center gap-2"
                    >
                      <Banknote className="h-4 w-4" />
                      Dinheiro
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="debito"
                      name="metodo"
                      value="debito"
                      checked={metodoPagamento === 'debito'}
                      onChange={() => setMetodoPagamento('debito')}
                      disabled={isSubmitting}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="debito" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Débito
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="credito"
                      name="metodo"
                      value="credito"
                      checked={metodoPagamento === 'credito'}
                      onChange={() => setMetodoPagamento('credito')}
                      disabled={isSubmitting}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label
                      htmlFor="credito"
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      Crédito
                    </label>
                  </div>
                </div>
              </div>

              {metodoPagamento === 'credito' && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="parcelas-select"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Número de Parcelas
                    </label>
                    <select
                      id="parcelas-select"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={parcelas}
                      onChange={(e) => setParcelas(Number(e.target.value))}
                      disabled={isSubmitting}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                        <option key={num} value={num}>
                          {num}x
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="juros"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Juros (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="0"
                      value={juros}
                      onChange={(e) => setJuros(Number(e.target.value))}
                      disabled={isSubmitting}
                    />
                  </div>
                  {juros > 0 && valorSaida && (
                    <div className="text-sm text-gray-600">
                      <p>Valor Original: R$ {Number(valorSaida).toFixed(2)}</p>
                      <p>
                        Valor com Juros: R${' '}
                        {(Number(valorSaida) * (1 + juros / 100)).toFixed(2)}
                      </p>
                      <p>
                        Valor por Parcela: R${' '}
                        {(
                          (Number(valorSaida) * (1 + juros / 100)) /
                          parcelas
                        ).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto rounded-full border-gray-300 hover:bg-gray-50"
                  onClick={() => setShowExitModal(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  className="w-full sm:w-auto bg-[#22C55E] hover:bg-[#1AAE4E] text-white px-5 py-3 rounded-full transition-colors duration-200"
                  disabled={isSubmitting}
                  onClick={handleSaidaSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    'Registrar Saída'
                  )}
                </Button>
              </div>
              {error && (
                <div className="error-message text-red-600 text-sm mt-2 text-center">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}

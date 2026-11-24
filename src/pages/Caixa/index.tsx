import { useState } from 'react';
import { ArrowUpRight, Download, FileDown, Loader2, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KpiCard } from '@/components/app/kpi-card';
import { SectionCard } from '@/components/app/section-card';
import { PageToolbar } from '@/components/app/page-toolbar';

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
    showEntradaModal,
    totalEntradas,
    totalSaidas,
    saldoFinal,
    totalEntradasPeriodo,
    totalSaidasPeriodo,
    saldoFinalPeriodo,
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
    valorEntrada,
    descricaoEntrada,
    parcelas,
    juros,
    movimentacoes,
    produtosSelecionados,
    products,
    produtoParaAdicionar,
    quantidadeParaAdicionar,
    valorParaAdicionar,
    showEditModal,
    tipoEdicao,
    isEditing,
    startDate,
    endDate,

    // Setters
    setValorParaAdicionar,
    setShowCashClosureModal,
    setShowSaidaModal,
    setShowEntradaModal,
    setMetodoPagamento,
    setValorSaida,
    setDescricaoSaida,
    setValorEntrada,
    setDescricaoEntrada,
    setParcelas,
    setJuros,
    setProdutoParaAdicionar,
    setQuantidadeParaAdicionar,

    // Funções
    resetCashClosureModal,
    formatarMoeda,
    formatarMetodoPagamentoCompleto,
    handleSaidaSubmit,
    handleEntradaSubmit,
    handleDateChange,
    handleDoubleClick,
    handleEditSubmit,
    handleCloseEditModal,
    downloadPDF,
    handleCloseEntradaModal,
    adicionarProduto,
    removerProduto,
    deleteFinanceiro,
  } = useCaixa();

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const tabProps = {
    movimentacoes,
    onDoubleClick: handleDoubleClick,
    onClick: deleteFinanceiro,
    formatarMoeda,
    formatarMetodoPagamentoCompleto,
  };

  return (
    <>
      <PageToolbar
        description={<span className="first-letter:uppercase">Hoje, {hoje}</span>}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setShowCashClosureModal(true)}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <Loader2 className="animate-spin" />
              ) : (
                <FileDown />
              )}
              Fechar caixa
            </Button>
            <Button variant="outline" onClick={() => setShowSaidaModal(true)}>
              <ArrowUpRight /> Nova saída
            </Button>
            <Button onClick={() => setShowEntradaModal(true)}>
              <Plus /> Nova entrada
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Entradas do dia" value={totalEntradas} />
        <KpiCard label="Saídas do dia" value={totalSaidas} />
        <KpiCard label="Saldo do dia" value={saldoFinal} />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'entradas' | 'saidas')}
      >
        <SectionCard
          title="Movimentações do dia"
          flush
          actions={
            <TabsList>
              <TabsTrigger value="entradas" className="px-4">
                Entradas
              </TabsTrigger>
              <TabsTrigger value="saidas" className="px-4">
                Saídas
              </TabsTrigger>
            </TabsList>
          }
        >
          <TabsContent value="entradas">
            <MovimentacoesTab
              {...tabProps}
              pixValue={pixEntrada}
              dinheiroValue={dinheiroEntrada}
              debitoValue={debitoEntrada}
              creditoValue={totalCreditoEntrada}
              tipoMovimento="ENTRADA"
              totalValue={totalEntradas}
              emptyMessage="Não foram registradas entradas financeiras para a data de hoje."
              onAddClick={() => setShowEntradaModal(true)}
            />
          </TabsContent>
          <TabsContent value="saidas">
            <MovimentacoesTab
              {...tabProps}
              pixValue={pixSaida}
              dinheiroValue={dinheiroSaida}
              debitoValue={debitoSaida}
              creditoValue={totalCreditoSaida}
              tipoMovimento="SAIDA"
              totalValue={totalSaidas}
              emptyMessage="Não foram registradas saídas financeiras para a data de hoje."
              onAddClick={() => setShowSaidaModal(true)}
            />
          </TabsContent>
        </SectionCard>
      </Tabs>

      {/* Fechamento de caixa */}
      <Dialog
        open={showCashClosureModal}
        onOpenChange={(open) => {
          if (!open && !isGeneratingPDF) resetCashClosureModal();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fechamento de caixa</DialogTitle>
            <DialogDescription>
              Selecione o período para visualizar e exportar o fechamento.
            </DialogDescription>
          </DialogHeader>

          {isGeneratingPDF && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-card bg-surface/90">
              <Loader2 className="size-7 animate-spin text-primary" />
              <p className="font-medium">Gerando relatório PDF...</p>
              <p className="text-sm text-foreground-secondary">Por favor, aguarde</p>
            </div>
          )}

          <CashClosureModel
            totalEntries={startDate && endDate ? totalEntradasPeriodo : totalEntradas}
            totalExits={startDate && endDate ? totalSaidasPeriodo : totalSaidas}
            finalBalance={startDate && endDate ? saldoFinalPeriodo : saldoFinal}
            onDateChange={handleDateChange}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetCashClosureModal}
              disabled={isGeneratingPDF}
            >
              Cancelar
            </Button>
            <Button onClick={downloadPDF} disabled={isGeneratingPDF}>
              {isGeneratingPDF ? <Loader2 className="animate-spin" /> : <Download />}
              Exportar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Registro de Entrada */}
      {showEntradaModal && (
        <RegistroModal
          isOpen={showEntradaModal}
          onClose={handleCloseEntradaModal}
          tipo="entrada"
          isSubmitting={isSubmitting}
          onSubmit={handleEntradaSubmit}
          error={error}
          valor={valorEntrada}
          setValor={setValorEntrada}
          descricao={descricaoEntrada}
          setDescricao={setDescricaoEntrada}
          metodoPagamento={metodoPagamento}
          setMetodoPagamento={setMetodoPagamento}
          parcelas={parcelas}
          setParcelas={setParcelas}
          juros={juros}
          setJuros={setJuros}
          products={products}
          produtosSelecionados={produtosSelecionados}
          produtoParaAdicionar={produtoParaAdicionar}
          quantidadeParaAdicionar={quantidadeParaAdicionar}
          setProdutoParaAdicionar={setProdutoParaAdicionar}
          setQuantidadeParaAdicionar={setQuantidadeParaAdicionar}
          setValorParaAdicionar={setValorParaAdicionar}
          valorParaAdicionar={valorParaAdicionar}
          adicionarProduto={adicionarProduto}
          removerProduto={removerProduto}
        />
      )}

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

      {/* Modal de Edição */}
      {showEditModal && (
        <RegistroModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          tipo={tipoEdicao}
          isSubmitting={isSubmitting}
          onSubmit={handleEditSubmit}
          error={error}
          valor={tipoEdicao === 'entrada' ? valorEntrada : valorSaida}
          setValor={tipoEdicao === 'entrada' ? setValorEntrada : setValorSaida}
          descricao={
            tipoEdicao === 'entrada' ? descricaoEntrada : descricaoSaida
          }
          setDescricao={
            tipoEdicao === 'entrada' ? setDescricaoEntrada : setDescricaoSaida
          }
          metodoPagamento={metodoPagamento}
          setMetodoPagamento={setMetodoPagamento}
          parcelas={parcelas}
          setParcelas={setParcelas}
          juros={juros}
          setJuros={setJuros}
          // Props de produtos (sempre passadas, mas só usadas se for entrada)
          products={products}
          produtosSelecionados={produtosSelecionados}
          produtoParaAdicionar={produtoParaAdicionar}
          quantidadeParaAdicionar={quantidadeParaAdicionar}
          setProdutoParaAdicionar={setProdutoParaAdicionar}
          setQuantidadeParaAdicionar={setQuantidadeParaAdicionar}
          setValorParaAdicionar={setValorParaAdicionar}
          valorParaAdicionar={valorParaAdicionar}
          adicionarProduto={adicionarProduto}
          removerProduto={removerProduto}
          isEditing={isEditing}
        />
      )}
    </>
  );
}

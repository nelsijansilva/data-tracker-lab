import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";

export type Metric = {
  id: string;
  name: string;
  field: string;
  formula?: string;
  isCustom?: boolean;
};

const DEFAULT_METRICS: Metric[] = [
  // Métricas básicas
  { id: "name", name: "Nome", field: "name" },
  { id: "status", name: "Status", field: "status" },
  { id: "objective", name: "Objetivo", field: "objective" },
  { id: "bid_strategy", name: "Estratégia de lance", field: "bid_strategy" },
  { id: "last_significant_edit", name: "Edição significativa mais recente", field: "last_significant_edit" },
  { id: "attribution_setting", name: "Configuração de atribuição", field: "attribution_spec" },
  
  // Métricas de orçamento
  { id: "budget", name: "Orçamento", field: "budget" },
  { id: "spend", name: "Valor usado", field: "spend" },
  { id: "budget_remaining", name: "Orçamento restante", field: "budget_remaining" },
  { id: "budget_spent_percentage", name: "Porcentagem do valor gasto", field: "budget_spent_percentage", formula: "(spend / budget) * 100" },
  
  // Métricas de resultados
  { id: "results", name: "Resultados", field: "actions" },
  { id: "cost_per_result", name: "Custo por resultado", field: "cost_per_action_type" },
  { id: "roas", name: "ROAS", field: "purchase_roas" },
  { id: "website_roas", name: "ROAS das compras no site", field: "website_purchase_roas" },
  { id: "app_roas", name: "ROAS das compras no app", field: "mobile_app_purchase_roas" },
  
  // Métricas de alcance
  { id: "impressions", name: "Impressões", field: "impressions" },
  { id: "cpm", name: "CPM", field: "cpm" },
  
  // Métricas de visualização
  { id: "landing_page_views", name: "Visualizações da página de destino", field: "landing_page_views" },
  { id: "cost_per_landing_page_view", name: "Custo por visualização da página de destino", field: "cost_per_landing_page_view" },
  { id: "content_views", name: "Visualizações do conteúdo", field: "content_views" },
  { id: "app_content_views", name: "Visualizações de conteúdo no app", field: "app_content_views" },
  { id: "website_content_views", name: "Visualizações de conteúdo no site", field: "website_content_views" },
  { id: "offline_content_views", name: "Visualizações de conteúdo offline", field: "offline_content_views" },
  { id: "meta_content_views", name: "Visualizações de conteúdo na Meta", field: "onsite_content_views" },
  { id: "cost_per_content_view", name: "Custo por visualização de conteúdo", field: "cost_per_content_view" },
  
  // Métricas de carrinho
  { id: "add_to_cart", name: "Adições ao carrinho", field: "add_to_cart" },
  { id: "app_add_to_cart", name: "Adições ao carrinho no app", field: "mobile_app_add_to_cart" },
  { id: "website_add_to_cart", name: "Adições ao carrinho no site", field: "website_add_to_cart" },
  { id: "offline_add_to_cart", name: "Adições ao carrinho offline", field: "offline_add_to_cart" },
  { id: "meta_add_to_cart", name: "Adições ao carrinho na Meta", field: "onsite_add_to_cart" },
  { id: "add_to_cart_value", name: "Valor de conversão de adições ao carrinho", field: "add_to_cart_value" },
  { id: "app_add_to_cart_value", name: "Valor de conversão das adições ao carrinho no app", field: "mobile_app_add_to_cart_value" },
  { id: "website_add_to_cart_value", name: "Valor de conversão de adições ao carrinho no site", field: "website_add_to_cart_value" },
  { id: "offline_add_to_cart_value", name: "Valor de conversão das adições ao carrinho offline", field: "offline_add_to_cart_value" },
  { id: "cost_per_add_to_cart", name: "Custo por adição ao carrinho", field: "cost_per_add_to_cart" },
  
  // Métricas de checkout
  { id: "initiated_checkout", name: "Finalizações de compra iniciadas", field: "initiated_checkout" },
  { id: "app_initiated_checkout", name: "Finalizações de compra iniciadas no app", field: "mobile_app_initiated_checkout" },
  { id: "website_initiated_checkout", name: "Finalizações de compra iniciadas no site", field: "website_initiated_checkout" },
  { id: "offline_initiated_checkout", name: "Finalizações de pagamento iniciadas offline", field: "offline_initiated_checkout" },
  { id: "meta_initiated_checkout", name: "Finalizações de compras iniciadas na Meta", field: "onsite_initiated_checkout" },
  { id: "initiated_checkout_value", name: "Valor de conversão de finalizações de compra iniciadas", field: "initiated_checkout_value" },
  { id: "app_initiated_checkout_value", name: "Valor de conversão de finalizações da compra iniciadas no app", field: "mobile_app_initiated_checkout_value" },
  { id: "website_initiated_checkout_value", name: "Valor de conversão de finalizações de compra iniciadas no site", field: "website_initiated_checkout_value" },
  { id: "offline_initiated_checkout_value", name: "Valor de conversão de finalizações de compra iniciadas offline", field: "offline_initiated_checkout_value" },
  { id: "cost_per_initiated_checkout", name: "Custo por finalização de compra iniciada", field: "cost_per_initiated_checkout" },
  
  // Métricas de informações de pagamento
  { id: "add_payment_info", name: "Inclusões de informações de pagamento", field: "add_payment_info" },
  { id: "app_add_payment_info", name: "Inclusões de informações de pagamento no app", field: "mobile_app_add_payment_info" },
  { id: "website_add_payment_info", name: "Adições de informações de pagamento no site", field: "website_add_payment_info" },
  { id: "offline_add_payment_info", name: "Adições de informações de pagamento offline", field: "offline_add_payment_info" },
  { id: "add_payment_info_value", name: "Valor de conversão de inclusões de informações de pagamento", field: "add_payment_info_value" },
  { id: "app_add_payment_info_value", name: "Valor de conversão das inclusões de informações de pagamento no app", field: "mobile_app_add_payment_info_value" },
  { id: "website_add_payment_info_value", name: "Valor de conversão de adições de informações de pagamento no site", field: "website_add_payment_info_value" },
  { id: "offline_add_payment_info_value", name: "Valor de conversão de adições das informações de pagamento offline", field: "offline_add_payment_info_value" },
  { id: "cost_per_add_payment_info", name: "Custo por inclusão de informações de pagamento", field: "cost_per_add_payment_info" },
  
  // Métricas de compra
  { id: "purchases", name: "Compras", field: "purchases" },
  { id: "app_purchases", name: "Compras no app", field: "mobile_app_purchases" },
  { id: "website_purchases", name: "Compras no site", field: "website_purchases" },
  { id: "offline_purchases", name: "Compras offline", field: "offline_purchases" },
  { id: "meta_purchases", name: "Compras na Meta", field: "onsite_purchases" },
  { id: "purchase_value", name: "Valor de conversão da compra", field: "purchase_value" },
  { id: "app_purchase_value", name: "Valor de conversão das compras no app", field: "mobile_app_purchase_value" },
  { id: "website_purchase_value", name: "Valor de conversão da compra no site", field: "website_purchase_value" },
  { id: "offline_purchase_value", name: "Valor de conversão de compras offline", field: "offline_purchase_value" },
  { id: "meta_purchase_value", name: "Valor de conversão da compra na Meta", field: "onsite_purchase_value" },
  { id: "cost_per_purchase", name: "Custo por compra", field: "cost_per_purchase" },
];

interface MetricSelectorProps {
  selectedMetrics: Metric[];
  onMetricsChange: (metrics: Metric[]) => void;
}

export const MetricSelector = ({ selectedMetrics, onMetricsChange }: MetricSelectorProps) => {
  const [customMetricName, setCustomMetricName] = useState("");
  const [customMetricFormula, setCustomMetricFormula] = useState("");

  const addMetric = (metricId: string) => {
    const metric = DEFAULT_METRICS.find(m => m.id === metricId);
    if (metric && !selectedMetrics.find(m => m.id === metric.id)) {
      onMetricsChange([...selectedMetrics, metric]);
    }
  };

  const removeMetric = (metricId: string) => {
    onMetricsChange(selectedMetrics.filter(m => m.id !== metricId));
  };

  const addCustomMetric = () => {
    if (customMetricName && customMetricFormula) {
      const newMetric: Metric = {
        id: `custom_${Date.now()}`,
        name: customMetricName,
        field: customMetricName.toLowerCase().replace(/\s+/g, '_'),
        formula: customMetricFormula,
        isCustom: true
      };
      onMetricsChange([...selectedMetrics, newMetric]);
      setCustomMetricName("");
      setCustomMetricFormula("");
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Personalizar Métricas</h3>
      
      <div className="flex gap-2">
        <Select onValueChange={addMetric}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Adicionar métrica" />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_METRICS.filter(metric => 
              !selectedMetrics.find(m => m.id === metric.id)
            ).map(metric => (
              <SelectItem key={metric.id} value={metric.id}>
                {metric.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Métricas Selecionadas</h4>
        <div className="flex flex-wrap gap-2">
          {selectedMetrics.map(metric => (
            <div key={metric.id} className="flex items-center gap-2 bg-secondary p-2 rounded-md">
              <span>{metric.name}</span>
              <button
                onClick={() => removeMetric(metric.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Criar Métrica Personalizada</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Nome da métrica"
            value={customMetricName}
            onChange={(e) => setCustomMetricName(e.target.value)}
          />
          <Input
            placeholder="Fórmula (ex: clicks / impressions * 100)"
            value={customMetricFormula}
            onChange={(e) => setCustomMetricFormula(e.target.value)}
          />
          <Button onClick={addCustomMetric} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
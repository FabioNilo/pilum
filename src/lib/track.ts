/**
 * Medição de cliques. Não faz nada até existir um script de análise na página.
 * TODO(fabio): adicionar o script do Plausible (mais leve, sem banner de cookies) ou do GA4 em index.html.
 * Cada clique de WhatsApp envia "whatsapp_click" com o `ref` do botão (ex.: "hero", "card-marmitas", "dor-comissao").
 */
type Props = Record<string, string | number>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props: Props }) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: string, props: Props = {}) {
  try {
    window.plausible?.(event, { props });
    window.gtag?.("event", event, props);
  } catch {
    // análise nunca pode quebrar a página
  }
}

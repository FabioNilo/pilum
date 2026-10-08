import { site } from "@/config";
import { track } from "@/lib/track";

/**
 * Link do WhatsApp com mensagem pronta. O `ref` vai no fim da mensagem, para você ver na conversa
 * de qual botão o contato veio (parâmetros UTM não funcionam em links wa.me).
 */
export function whatsappLink(message: string, ref?: string) {
  const text = ref ? `${message}\n\n(ref: ${ref})` : message;
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}

/** Props prontas para um <a>: link, nova aba e registro do clique. */
export function waProps(message: string, ref: string) {
  return {
    href: whatsappLink(message, ref),
    target: "_blank",
    rel: "noopener noreferrer",
    onClick: () => track("whatsapp_click", { ref }),
  } as const;
}

export const defaultMessage =
  "Olá, Fabio! Vi seu portfólio e quero conversar sobre um sistema para o meu negócio.";

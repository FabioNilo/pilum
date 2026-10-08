import { site } from "@/config";

export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const defaultMessage =
  "Olá, Fabio! Vi seu portfólio e quero conversar sobre um sistema para o meu negócio.";

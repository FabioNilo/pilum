// Dados de contato exibidos na página. Preencha antes de publicar.
export const site = {
  brand: "Pilum Code",
  tagline: "Feito para acertar.",
  role: "Desenvolvimento de software sob medida",
  city: "Ilhéus e Itabuna – BA (atendimento em todo o Brasil)",
  // Somente dígitos, com DDI e DDD. Ex.: "5573999999999"
  whatsapp: "5573999099040",
  email: "pilumcode@gmail.com",
  instagram: "fabioniloss",
  // TODO(fabio): preencher o CNPJ se quiser exibir no rodapé (vazio = não aparece).
  cnpj: "",
};

export type Founder = { name: string; role: string; bio: string; photo?: string };

/** Seção "Quem somos". Sem `photo`, aparecem as iniciais; lista vazia = só o texto institucional. */
export const founders: Founder[] = [
  // TODO(fabio): incluir o Ricardo só depois de ele concordar (nome, papel, bio e foto).
];

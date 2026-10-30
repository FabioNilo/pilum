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

/** Seção "Quem somos". Sem `photo`, aparecem as iniciais. */
export const founders: Founder[] = [
  {
    name: "Fabio Soares",
    role: "Fundador · desenvolvedor fullstack",
    // TODO(fabio): revisar a bio e, se quiser, adicionar a foto em public/ e preencher `photo`.
    bio: "Cuida do contato com o cliente, do desenho da solução e do desenvolvimento, do banco de dados à tela.",
  },
  // TODO(fabio): incluir o Ricardo só depois de ele concordar (nome, papel, bio e foto).
];

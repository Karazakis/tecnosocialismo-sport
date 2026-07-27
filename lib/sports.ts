export type SportDefinition = { id: string; name: string; group: string; mode: "individuale" | "squadra" | "entrambi"; mark: string };

export const sports: SportDefinition[] = [
  { id:"calcio",name:"Calcio",group:"Squadra",mode:"squadra",mark:"CA" },
  { id:"basket",name:"Basket",group:"Squadra",mode:"squadra",mark:"BA" },
  { id:"pallavolo",name:"Pallavolo",group:"Squadra",mode:"squadra",mark:"PV" },
  { id:"rugby",name:"Rugby",group:"Squadra",mode:"squadra",mark:"RU" },
  { id:"hockey",name:"Hockey",group:"Squadra",mode:"squadra",mark:"HO" },
  { id:"running",name:"Corsa",group:"Resistenza",mode:"individuale",mark:"CO" },
  { id:"ciclismo",name:"Ciclismo",group:"Resistenza",mode:"entrambi",mark:"CI" },
  { id:"nuoto",name:"Nuoto",group:"Acqua",mode:"individuale",mark:"NU" },
  { id:"canottaggio",name:"Canottaggio",group:"Acqua",mode:"entrambi",mark:"CN" },
  { id:"surf",name:"Surf",group:"Acqua",mode:"individuale",mark:"SU" },
  { id:"palestra",name:"Forza e palestra",group:"Forza",mode:"individuale",mark:"FO" },
  { id:"calisthenics",name:"Calisthenics",group:"Forza",mode:"individuale",mark:"CL" },
  { id:"cross-training",name:"Cross training",group:"Forza",mode:"entrambi",mark:"CR" },
  { id:"boxe",name:"Boxe",group:"Combattimento",mode:"individuale",mark:"BX" },
  { id:"arti-marziali",name:"Arti marziali",group:"Combattimento",mode:"individuale",mark:"AM" },
  { id:"lotta",name:"Lotta",group:"Combattimento",mode:"individuale",mark:"LO" },
  { id:"tennis",name:"Tennis",group:"Racchetta",mode:"entrambi",mark:"TE" },
  { id:"padel",name:"Padel",group:"Racchetta",mode:"squadra",mark:"PA" },
  { id:"badminton",name:"Badminton",group:"Racchetta",mode:"entrambi",mark:"BD" },
  { id:"arrampicata",name:"Arrampicata",group:"Outdoor",mode:"individuale",mark:"AR" },
  { id:"trekking",name:"Trekking",group:"Outdoor",mode:"entrambi",mark:"TR" },
  { id:"sci",name:"Sci e snowboard",group:"Outdoor",mode:"individuale",mark:"SC" },
  { id:"skate",name:"Skate",group:"Urban",mode:"individuale",mark:"SK" },
  { id:"parkour",name:"Parkour",group:"Urban",mode:"individuale",mark:"PK" },
  { id:"danza",name:"Danza",group:"Movimento",mode:"entrambi",mark:"DA" },
  { id:"yoga",name:"Yoga",group:"Movimento",mode:"individuale",mark:"YO" },
  { id:"ginnastica",name:"Ginnastica",group:"Movimento",mode:"entrambi",mark:"GI" },
  { id:"atletica",name:"Atletica",group:"Atletica",mode:"individuale",mark:"AT" },
  { id:"triathlon",name:"Triathlon",group:"Resistenza",mode:"individuale",mark:"3X" },
  { id:"adaptive",name:"Sport adattivo",group:"Adattivo",mode:"entrambi",mark:"AD" },
];

export const sportGroups = [...new Set(sports.map((sport) => sport.group))];

export function resolveSport(nameOrId: string) {
  const clean = nameOrId.trim();
  return sports.find((sport) => sport.id === clean || sport.name.toLocaleLowerCase("it") === clean.toLocaleLowerCase("it")) ?? { id: clean.toLocaleLowerCase("it").replace(/[^a-z0-9]+/g,"-") || "altro", name: clean || "Altro sport", group: "Altro", mode: "entrambi" as const, mark: clean.slice(0,2).toUpperCase() || "SP" };
}

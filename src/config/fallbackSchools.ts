export interface FallbackSchoolRecord {
  name: string;
  concelho: string | null;
  me_code: string | null;
}

export const FALLBACK_SCHOOLS_BY_DISTRICT: Record<string, FallbackSchoolRecord[]> = {
  "Aveiro": [
    {
      "name": "Agrupamento de Escolas de Valongo do Vouga, Águeda",
      "concelho": "Águeda",
      "me_code": "160106"
    },
    {
      "name": "Agrupamento de Escolas de Águeda",
      "concelho": "Águeda",
      "me_code": "160908"
    },
    {
      "name": "Agrupamento de Escolas Águeda Sul",
      "concelho": "Águeda",
      "me_code": "161962"
    },
    {
      "name": "Escola Secundária Adolfo Portela, Águeda",
      "concelho": "Águeda",
      "me_code": "400695"
    },
    {
      "name": "Agrupamento de Escolas de Albergaria-a-Velha",
      "concelho": "Albergaria-a-Velha",
      "me_code": "160003"
    },
    {
      "name": "Agrupamento de Escolas de Branca, Albergaria-a-Velha",
      "concelho": "Albergaria-a-Velha",
      "me_code": "160027"
    },
    {
      "name": "Agrupamento de Escolas Dr. Mário Sacramento, Aveiro",
      "concelho": "Aveiro",
      "me_code": "160015"
    },
    {
      "name": "Agrupamento de Escolas Rio Novo do Príncipe, Cacia, Aveiro",
      "concelho": "Aveiro",
      "me_code": "160039"
    },
    {
      "name": "Agrupamento de Escolas de Oliveirinha, Aveiro",
      "concelho": "Aveiro",
      "me_code": "160120"
    },
    {
      "name": "Agrupamento de Escolas de Eixo, Aveiro",
      "concelho": "Aveiro",
      "me_code": "160131"
    },
    {
      "name": "Agrupamento de Escolas de Aveiro",
      "concelho": "Aveiro",
      "me_code": "160933"
    },
    {
      "name": "Agrupamento de Escolas de Esgueira, Aveiro",
      "concelho": "Aveiro",
      "me_code": "160945"
    },
    {
      "name": "Agrupamento de Escolas José Estêvão, Aveiro",
      "concelho": "Aveiro",
      "me_code": "160957"
    },
    {
      "name": "Escola Artística do Conservatório de Música Calouste Gulbenkian, Aveiro",
      "concelho": "Aveiro",
      "me_code": "404196"
    },
    {
      "name": "Agrupamento de Escolas de Castelo de Paiva",
      "concelho": "Castelo de Paiva",
      "me_code": "151312"
    },
    {
      "name": "Agrupamento de Escolas de Couto Mineiro do Pejão, Castelo de Paiva",
      "concelho": "Castelo de Paiva",
      "me_code": "151646"
    },
    {
      "name": "Agrupamento de Escolas Dr. Manuel Gomes de Almeida, Espinho",
      "concelho": "Espinho",
      "me_code": "151336"
    },
    {
      "name": "Agrupamento de Escolas Dr. Manuel Laranjeira, Espinho",
      "concelho": "Espinho",
      "me_code": "151361"
    },
    {
      "name": "Agrupamento de Escolas de Estarreja",
      "concelho": "Estarreja",
      "me_code": "160155"
    },
    {
      "name": "Agrupamento de Escolas de Pardilhó, Estarreja",
      "concelho": "Estarreja",
      "me_code": "160519"
    },
    {
      "name": "Agrupamento de Escolas de Gafanha da Encarnação, Ílhavo",
      "concelho": "Ílhavo",
      "me_code": "160970"
    },
    {
      "name": "Agrupamento de Escolas de Gafanha da Nazaré, Ílhavo",
      "concelho": "Ílhavo",
      "me_code": "160982"
    },
    {
      "name": "Agrupamento de Escolas de Ílhavo",
      "concelho": "Ílhavo",
      "me_code": "160994"
    },
    {
      "name": "Agrupamento de Escolas de Mealhada",
      "concelho": "Mealhada",
      "me_code": "161007"
    },
    {
      "name": "Agrupamento de Escolas de Murtosa",
      "concelho": "Murtosa",
      "me_code": "161020"
    },
    {
      "name": "Agrupamento de Escolas Dr. Ferreira da Silva, Oliveira de Azeméis",
      "concelho": "Oliveira de Azeméis",
      "me_code": "151324"
    },
    {
      "name": "Agrupamento de Escolas de Fajões, Oliveira de Azeméis",
      "concelho": "Oliveira de Azeméis",
      "me_code": "151348"
    },
    {
      "name": "Agrupamento de Escolas de Loureiro, Oliveira de Azeméis",
      "concelho": "Oliveira de Azeméis",
      "me_code": "151609"
    },
    {
      "name": "Agrupamento de Escolas Soares Basto, Oliveira de Azeméis",
      "concelho": "Oliveira de Azeméis",
      "me_code": "151658"
    },
    {
      "name": "Agrupamento de Escolas Ferreira de Castro, Oliveira de Azeméis",
      "concelho": "Oliveira de Azeméis",
      "me_code": "153047"
    },
    {
      "name": "Agrupamento de Escolas de Oliveira do Bairro",
      "concelho": "Oliveira do Bairro",
      "me_code": "160568"
    },
    {
      "name": "Agrupamento de Escolas de Ovar",
      "concelho": "Ovar",
      "me_code": "161056"
    },
    {
      "name": "Agrupamento de Escolas de Esmoriz/Ovar Norte",
      "concelho": "Ovar",
      "me_code": "161949"
    },
    {
      "name": "Agrupamento de Escolas de Ovar Sul",
      "concelho": "Ovar",
      "me_code": "161950"
    },
    {
      "name": "Agrupamento de Escolas António Alves de Amorim, Santa Maria da Feira",
      "concelho": "Santa Maria da Feira",
      "me_code": "150356"
    },
    {
      "name": "Agrupamento de Escolas de Arrifana, Santa Maria da Feira",
      "concelho": "Santa Maria da Feira",
      "me_code": "150551"
    },
    {
      "name": "Agrupamento de Escolas de Paços de Brandão, Santa Maria da Feira",
      "concelho": "Santa Maria da Feira",
      "me_code": "150563"
    },
    {
      "name": "Agrupamento de Escolas de Corga do Lobão, Santa Maria da Feira",
      "concelho": "Santa Maria da Feira",
      "me_code": "151178"
    },
    {
      "name": "Agrupamento de Escolas de Argoncilhe, Santa Maria da Feira",
      "concelho": "Santa Maria da Feira",
      "me_code": "151282"
    },
    {
      "name": "Agrupamento de Escolas de Canedo, Santa Maria da Feira",
      "concelho": "Santa Maria da Feira",
      "me_code": "151294"
    },
    {
      "name": "Agrupamento de Escolas Coelho e Castro, Santa Maria da Feira",
      "concelho": "Santa Maria da Feira",
      "me_code": "151350"
    },
    {
      "name": "Agrupamento de Escolas de Santa Maria da Feira",
      "concelho": "Santa Maria da Feira",
      "me_code": "151660"
    },
    {
      "name": "Agrupamento de Escolas Fernando Pessoa, Santa Maria da Feira",
      "concelho": "Santa Maria da Feira",
      "me_code": "151671"
    },
    {
      "name": "Agrupamento de Escolas João Silva Correia, S. João da Madeira",
      "concelho": "São João da Madeira",
      "me_code": "151683"
    },
    {
      "name": "Agrupamento de Escolas Oliveira Júnior, São João da Madeira",
      "concelho": "São João da Madeira",
      "me_code": "152900"
    },
    {
      "name": "Agrupamento de Escolas Dr. Serafim Leite, São João da Madeira",
      "concelho": "São João da Madeira",
      "me_code": "153060"
    },
    {
      "name": "Agrupamento de Escolas de Sever do Vouga",
      "concelho": "Sever do Vouga",
      "me_code": "161068"
    },
    {
      "name": "Agrupamento de Escolas de Vagos",
      "concelho": "Vagos",
      "me_code": "161070"
    },
    {
      "name": "Escola Profissional de Agricultura e Desenvolvimento Rural de Vagos",
      "concelho": "Vagos",
      "me_code": "404299"
    },
    {
      "name": "Agrupamento de Escolas de Búzio, Vale de Cambra",
      "concelho": "Vale de Cambra",
      "me_code": "151701"
    }
  ],
  "Beja": [
    {
      "name": "Agrupamento de Escolas de Mourão",
      "concelho": "Mourão",
      "me_code": "135161"
    },
    {
      "name": "Agrupamento de Escolas de Aljustrel",
      "concelho": "Aljustrel",
      "me_code": "135367"
    },
    {
      "name": "Agrupamento de Escolas de Almodôvar",
      "concelho": "Almodôvar",
      "me_code": "130229"
    },
    {
      "name": "Agrupamento de Escolas de Alvito",
      "concelho": "Alvito",
      "me_code": "130000"
    },
    {
      "name": "Agrupamento de Escolas de Barrancos",
      "concelho": "Barrancos",
      "me_code": "135010"
    },
    {
      "name": "Agrupamento de Escolas n.º 1 de Beja",
      "concelho": "Beja",
      "me_code": "135021"
    },
    {
      "name": "Agrupamento de Escolas n.º 2 de Beja",
      "concelho": "Beja",
      "me_code": "135379"
    },
    {
      "name": "Agrupamento de Escolas de Castro Verde",
      "concelho": "Castro Verde",
      "me_code": "135033"
    },
    {
      "name": "Agrupamento de Escolas de Cuba",
      "concelho": "Cuba",
      "me_code": "135045"
    },
    {
      "name": "Agrupamento de Escolas de Ferreira do Alentejo",
      "concelho": "Ferreira do Alentejo",
      "me_code": "130242"
    },
    {
      "name": "Agrupamento de Escolas de Mértola",
      "concelho": "Mértola",
      "me_code": "135616"
    },
    {
      "name": "Agrupamento de Escolas de Amareleja, Moura",
      "concelho": "Moura",
      "me_code": "135057"
    },
    {
      "name": "Agrupamento de Escolas de Moura",
      "concelho": "Moura",
      "me_code": "135471"
    },
    {
      "name": "Escola Secundária de Moura",
      "concelho": "Moura",
      "me_code": "402308"
    },
    {
      "name": "Agrupamento de Escolas de Vila Nova de Milfontes, Odemira",
      "concelho": "Odemira",
      "me_code": "130333"
    },
    {
      "name": "Agrupamento de Escolas de São Teotónio, Odemira",
      "concelho": "Odemira",
      "me_code": "135069"
    },
    {
      "name": "Agrupamento de Escolas de Colos, Odemira",
      "concelho": "Odemira",
      "me_code": "135070"
    },
    {
      "name": "Agrupamento de Escolas de Sabóia, Odemira",
      "concelho": "Odemira",
      "me_code": "135082"
    },
    {
      "name": "Agrupamento de Escolas de Odemira",
      "concelho": "Odemira",
      "me_code": "135434"
    },
    {
      "name": "Agrupamento de Escolas de Ourique",
      "concelho": "Ourique",
      "me_code": "135392"
    },
    {
      "name": "Agrupamento de Escolas nº 1 de Serpa",
      "concelho": "Serpa",
      "me_code": "135094"
    },
    {
      "name": "Agrupamento de Escolas nº 2 de Serpa",
      "concelho": "Serpa",
      "me_code": "135100"
    },
    {
      "name": "Escola Profissional de Desenvolvimento Rural de Serpa",
      "concelho": "Serpa",
      "me_code": "404330"
    },
    {
      "name": "Agrupamento de Escolas de Vidigueira",
      "concelho": "Vidigueira",
      "me_code": "135112"
    }
  ],
  "Braga": [
    {
      "name": "Agrupamento de Escolas de Amares",
      "concelho": "Amares",
      "me_code": "150459"
    },
    {
      "name": "Agrupamento de Escolas Alcaides de Faria, Barcelos",
      "concelho": "Barcelos",
      "me_code": "150137"
    },
    {
      "name": "Agrupamento de Escolas de Vila Cova, Barcelos",
      "concelho": "Barcelos",
      "me_code": "150460"
    },
    {
      "name": "Agrupamento de Escolas Gonçalo Nunes, Barcelos",
      "concelho": "Barcelos",
      "me_code": "150710"
    },
    {
      "name": "Agrupamento de Escolas de Barcelos",
      "concelho": "Barcelos",
      "me_code": "150927"
    },
    {
      "name": "Agrupamento de Escolas de Vale do Tamel, Barcelos",
      "concelho": "Barcelos",
      "me_code": "150939"
    },
    {
      "name": "Agrupamento de Escolas Rosa Ramalho, Barcelos",
      "concelho": "Barcelos",
      "me_code": "150940"
    },
    {
      "name": "Agrupamento de Escolas de Fragoso, Barcelos",
      "concelho": "Barcelos",
      "me_code": "151245"
    },
    {
      "name": "Agrupamento de Escolas de Vale D´Este, Barcelos",
      "concelho": "Barcelos",
      "me_code": "151257"
    },
    {
      "name": "Escola Secundária de Barcelinhos, Barcelos",
      "concelho": "Barcelos",
      "me_code": "403787"
    },
    {
      "name": "Agrupamento de Escolas Carlos Amarante, Braga",
      "concelho": "Braga",
      "me_code": "150149"
    },
    {
      "name": "Agrupamento de Escolas Sá de Miranda, Braga",
      "concelho": "Braga",
      "me_code": "150241"
    },
    {
      "name": "Agrupamento de Escolas de Braga Oeste",
      "concelho": "Braga",
      "me_code": "150253"
    },
    {
      "name": "Agrupamento de Escolas de Maximinos, Braga",
      "concelho": "Braga",
      "me_code": "150721"
    },
    {
      "name": "Agrupamento de Escolas André Soares, Braga",
      "concelho": "Braga",
      "me_code": "150952"
    },
    {
      "name": "Agrupamento de Escolas de Trigal de Santa Maria, Braga",
      "concelho": "Braga",
      "me_code": "150964"
    },
    {
      "name": "Agrupamento de Escolas Alberto Sampaio, Braga",
      "concelho": "Braga",
      "me_code": "150976"
    },
    {
      "name": "Agrupamento de Escolas Dr. Francisco Sanches, Braga",
      "concelho": "Braga",
      "me_code": "150988"
    },
    {
      "name": "Agrupamento de Escolas D. Maria II, Braga",
      "concelho": "Braga",
      "me_code": "150990"
    },
    {
      "name": "Agrupamento de Escolas de Celeirós, Braga",
      "concelho": "Braga",
      "me_code": "151002"
    },
    {
      "name": "Agrupamento de Escolas de Mosteiro e Cávado, Braga",
      "concelho": "Braga",
      "me_code": "151713"
    },
    {
      "name": "Agrupamento de Escolas de Real, Braga",
      "concelho": "Braga",
      "me_code": "151725"
    },
    {
      "name": "Escola Artística do Conservatório de Música Calouste Gulbenkian, Braga",
      "concelho": "Braga",
      "me_code": "404251"
    },
    {
      "name": "Agrupamento de Escolas de Cabeceiras de Basto",
      "concelho": "Cabeceiras de Basto",
      "me_code": "150162"
    },
    {
      "name": "Agrupamento de Escolas de Celorico de Basto",
      "concelho": "Celorico de Basto",
      "me_code": "151737"
    },
    {
      "name": "Escola Profissional de Fermil, Molares, Celorico de Basto",
      "concelho": "Celorico de Basto",
      "me_code": "404070"
    },
    {
      "name": "Agrupamento de Escolas António Correia de Oliveira, Esposende",
      "concelho": "Esposende",
      "me_code": "150850"
    },
    {
      "name": "Agrupamento de Escolas António Rodrigues Sampaio, Esposende",
      "concelho": "Esposende",
      "me_code": "152894"
    },
    {
      "name": "Escola Secundária Henrique Medina, Esposende",
      "concelho": "Esposende",
      "me_code": "401882"
    },
    {
      "name": "Agrupamento de Escolas de Montelongo, Fafe",
      "concelho": "Fafe",
      "me_code": "150496"
    },
    {
      "name": "Agrupamento de Escolas Prof. Carlos Teixeira, Fafe",
      "concelho": "Fafe",
      "me_code": "150502"
    },
    {
      "name": "Agrupamento de Escolas de Fafe",
      "concelho": "Fafe",
      "me_code": "152882"
    },
    {
      "name": "Agrupamento de Escolas Virgínia Moura, Guimarães",
      "concelho": "Guimarães",
      "me_code": "150290"
    },
    {
      "name": "Agrupamento de Escolas do Vale de São Torcato, Guimarães",
      "concelho": "Guimarães",
      "me_code": "150307"
    },
    {
      "name": "Agrupamento de Escolas Arquiteto Fernando Távora, Guimarães",
      "concelho": "Guimarães",
      "me_code": "150514"
    },
    {
      "name": "Agrupamento de Escolas Professor Abel Salazar, Guimarães",
      "concelho": "Guimarães",
      "me_code": "150812"
    },
    {
      "name": "Agrupamento de Escolas Francisco de Holanda, Guimarães",
      "concelho": "Guimarães",
      "me_code": "151014"
    },
    {
      "name": "Agrupamento de Escolas das Taipas, Guimarães",
      "concelho": "Guimarães",
      "me_code": "151026"
    },
    {
      "name": "Agrupamento de Escolas D. Afonso Henriques, Guimarães",
      "concelho": "Guimarães",
      "me_code": "151038"
    },
    {
      "name": "Agrupamento de Escolas de Pevidém, Guimarães",
      "concelho": "Guimarães",
      "me_code": "151040"
    },
    {
      "name": "Agrupamento de Escolas Arqueólogo Mário Cardoso, Guimarães",
      "concelho": "Guimarães",
      "me_code": "151051"
    },
    {
      "name": "Agrupamento de Escolas Gil Vicente, Guimarães",
      "concelho": "Guimarães",
      "me_code": "151063"
    },
    {
      "name": "Agrupamento de Escolas João de Meira, Guimarães",
      "concelho": "Guimarães",
      "me_code": "151749"
    },
    {
      "name": "Agrupamento de Escolas de Briteiros, Guimarães",
      "concelho": "Guimarães",
      "me_code": "151750"
    },
    {
      "name": "Agrupamento de Escolas Santos Simões, Guimarães",
      "concelho": "Guimarães",
      "me_code": "152912"
    },
    {
      "name": "Agrupamento de Escolas de Abação, Guimarães",
      "concelho": "Guimarães",
      "me_code": "152924"
    },
    {
      "name": "Escola Secundária de Caldas das Taipas, Guimarães",
      "concelho": "Guimarães",
      "me_code": "401031"
    },
    {
      "name": "Escola Secundária Martins Sarmento, Guimarães",
      "concelho": "Guimarães",
      "me_code": "402187"
    },
    {
      "name": "Agrupamento de Escolas Gonçalo Sampaio, Póvoa de Lanhoso",
      "concelho": "Póvoa de Lanhoso",
      "me_code": "150320"
    },
    {
      "name": "Agrupamento de Escolas de Póvoa de Lanhoso",
      "concelho": "Póvoa de Lanhoso",
      "me_code": "150915"
    },
    {
      "name": "Agrupamento de Escolas de Terras de Bouro",
      "concelho": "Terras de Bouro",
      "me_code": "150319"
    },
    {
      "name": "Agrupamento de Escolas Vieira Araújo, Vieira do Minho",
      "concelho": "Vieira do Minho",
      "me_code": "150605"
    },
    {
      "name": "Agrupamento de Escolas de Gondifelos, Vila Nova de Famalicão",
      "concelho": "Vila Nova de Famalicão",
      "me_code": "150617"
    },
    {
      "name": "Agrupamento de Escolas de Pedome, Vila Nova de Famalicão",
      "concelho": "Vila Nova de Famalicão",
      "me_code": "150629"
    },
    {
      "name": "Agrupamento de Escolas de Ribeirão, Vila Nova de Famalicão",
      "concelho": "Vila Nova de Famalicão",
      "me_code": "150630"
    },
    {
      "name": "Agrupamento de Escolas D. Sancho I, Vila Nova de Famalicão",
      "concelho": "Vila Nova de Famalicão",
      "me_code": "150642"
    },
    {
      "name": "Agrupamento de Escolas Padre Benjamim Salgado, Vila Nova de Famalicão",
      "concelho": "Vila Nova de Famalicão",
      "me_code": "150800"
    },
    {
      "name": "Agrupamento de Escolas D. Maria II, Vila Nova de Famalicão",
      "concelho": "Vila Nova de Famalicão",
      "me_code": "151075"
    },
    {
      "name": "Agrupamento de Escolas Camilo Castelo Branco, Vila Nova de Famalicão",
      "concelho": "Vila Nova de Famalicão",
      "me_code": "151762"
    },
    {
      "name": "Agrupamento de Escolas de Moure e Ribeira de Neiva, Vila Verde",
      "concelho": "Vila Verde",
      "me_code": "150885"
    },
    {
      "name": "Agrupamento de Escolas de Prado, Vila Verde",
      "concelho": "Vila Verde",
      "me_code": "150897"
    },
    {
      "name": "Agrupamento de Escolas de Vila Verde",
      "concelho": "Vila Verde",
      "me_code": "151774"
    },
    {
      "name": "Escola Secundária de Vila Verde",
      "concelho": "Vila Verde",
      "me_code": "403751"
    },
    {
      "name": "Agrupamento de Escolas de Ínfias, Vízela",
      "concelho": "Vizela",
      "me_code": "100377"
    },
    {
      "name": "Agrupamento de Escolas de Caldas de Vizela, Vizela",
      "concelho": "Vizela",
      "me_code": "151786"
    }
  ],
  "Bragança": [
    {
      "name": "Agrupamento de Escolas de Alfândega da Fé",
      "concelho": "Alfândega da Fé",
      "me_code": "150447"
    },
    {
      "name": "Agrupamento de Escolas Emídio Garcia, Bragança",
      "concelho": "Bragança",
      "me_code": "151816"
    },
    {
      "name": "Agrupamento de Escolas Abade de Baçal, Bragança",
      "concelho": "Bragança",
      "me_code": "152973"
    },
    {
      "name": "Agrupamento de Escolas Miguel Torga, Bragança",
      "concelho": "Bragança",
      "me_code": "153059"
    },
    {
      "name": "Agrupamento de Escolas de Carrazeda de Ansiães",
      "concelho": "Carrazeda de Ansiães",
      "me_code": "151828"
    },
    {
      "name": "Agrupamento de Escolas de Freixo de Espada à Cinta",
      "concelho": "Freixo de Espada à Cinta",
      "me_code": "151208"
    },
    {
      "name": "Agrupamento de Escolas de Macedo de Cavaleiros",
      "concelho": "Macedo de Cavaleiros",
      "me_code": "150526"
    },
    {
      "name": "Agrupamento de Escolas de Mirandela",
      "concelho": "Mirandela",
      "me_code": "152997"
    },
    {
      "name": "Escola Profissional de Agricultura e Desenvolvimento Rural de Carvalhais, Mirandela",
      "concelho": "Mirandela",
      "me_code": "404263"
    },
    {
      "name": "Agrupamento de Escolas de Mogadouro",
      "concelho": "Mogadouro",
      "me_code": "151191"
    },
    {
      "name": "Agrupamento de Escolas Dr. Ramiro Salgado, Torre de Moncorvo",
      "concelho": "Torre de Moncorvo",
      "me_code": "150575"
    },
    {
      "name": "Agrupamento de Escolas de Vila Flor",
      "concelho": "Vila Flor",
      "me_code": "151841"
    },
    {
      "name": "Agrupamento de Escolas de Vimioso",
      "concelho": "Vimioso",
      "me_code": "150678"
    },
    {
      "name": "Agrupamento de Escolas D. Afonso III, Vinhais",
      "concelho": "Vinhais",
      "me_code": "150680"
    }
  ],
  "Castelo Branco": [
    {
      "name": "Agrupamento de Escolas Álvaro Coutinho - o Magriço, Penedono",
      "concelho": "Penedono",
      "me_code": "150095"
    },
    {
      "name": "Agrupamento de Escolas Pedro Álvares Cabral, Belmonte",
      "concelho": "Belmonte",
      "me_code": "161100"
    },
    {
      "name": "Agrupamento de Escolas José Sanches e S. Vicente da Beira",
      "concelho": "Castelo Branco",
      "me_code": "160763"
    },
    {
      "name": "Agrupamento de Escolas Afonso de Paiva, Castelo Branco",
      "concelho": "Castelo Branco",
      "me_code": "161111"
    },
    {
      "name": "Agrupamento de Escolas Amato Lusitano, Castelo Branco",
      "concelho": "Castelo Branco",
      "me_code": "161135"
    },
    {
      "name": "Agrupamento de Escolas Nuno Álvares, Castelo Branco",
      "concelho": "Castelo Branco",
      "me_code": "162024"
    },
    {
      "name": "Agrupamento de Escolas A Lã e a Neve, Covilhã",
      "concelho": "Covilhã",
      "me_code": "160702"
    },
    {
      "name": "Agrupamento de Escolas Pêro da Covilhã, Covilhã",
      "concelho": "Covilhã",
      "me_code": "161159"
    },
    {
      "name": "Agrupamento de Escolas de Teixoso, Covilhã",
      "concelho": "Covilhã",
      "me_code": "161184"
    },
    {
      "name": "Agrupamento de Escolas Frei Heitor Pinto, Covilhã",
      "concelho": "Covilhã",
      "me_code": "162036"
    },
    {
      "name": "Escola Secundária Campos de Melo, Covilhã",
      "concelho": "Covilhã",
      "me_code": "401092"
    },
    {
      "name": "Escola Profissional Agrícola Quinta da Lageosa, Aldeia do Souto, Covilhã",
      "concelho": "Covilhã",
      "me_code": "404020"
    },
    {
      "name": "Escola Secundária Quinta das Palmeiras, Covilhã",
      "concelho": "Covilhã",
      "me_code": "404676"
    },
    {
      "name": "Agrupamento de Escolas Gardunha e Xisto, Fundão",
      "concelho": "Fundão",
      "me_code": "161123"
    },
    {
      "name": "Agrupamento de Escolas do Fundão",
      "concelho": "Fundão",
      "me_code": "161196"
    },
    {
      "name": "Agrupamento de Escolas José Silvestre Ribeiro, Idanha-a-Nova",
      "concelho": "Idanha-a-Nova",
      "me_code": "160805"
    },
    {
      "name": "Agrupamento de Escolas Padre António de Andrade, Oleiros",
      "concelho": "Oleiros",
      "me_code": "160489"
    },
    {
      "name": "Agrupamento de Escolas Ribeiro Sanches, Penamacor",
      "concelho": "Penamacor",
      "me_code": "161214"
    },
    {
      "name": "Agrupamento de Escolas de Proença-a-Nova",
      "concelho": "Proença-a-Nova",
      "me_code": "160799"
    },
    {
      "name": "Agrupamento de Escolas de Sertã",
      "concelho": "Sertã",
      "me_code": "161226"
    },
    {
      "name": "Agrupamento de Escolas de Vila de Rei",
      "concelho": "Vila de Rei",
      "me_code": "160581"
    },
    {
      "name": "Agrupamento de Escolas de Vila Velha de Ródão",
      "concelho": "Vila Velha de Ródão",
      "me_code": "160787"
    }
  ],
  "Coimbra": [
    {
      "name": "Agrupamento de Escolas de Miranda do Douro",
      "concelho": "Miranda do Douro",
      "me_code": "150538"
    },
    {
      "name": "Agrupamento de Escolas de Anadia",
      "concelho": "Anadia",
      "me_code": "160910"
    },
    {
      "name": "Agrupamento de Escolas de Arganil",
      "concelho": "Arganil",
      "me_code": "161238"
    },
    {
      "name": "Agrupamento de Escolas Gândara-Mar, Tocha, Cantanhede",
      "concelho": "Cantanhede",
      "me_code": "160179"
    },
    {
      "name": "Agrupamento de Escolas Lima-de-Faria, Cantanhede",
      "concelho": "Cantanhede",
      "me_code": "160180"
    },
    {
      "name": "Agrupamento de Escolas Marquês de Marialva, Cantanhede",
      "concelho": "Cantanhede",
      "me_code": "161240"
    },
    {
      "name": "Agrupamento de Escolas Coimbra Sul",
      "concelho": "Coimbra",
      "me_code": "161251"
    },
    {
      "name": "Agrupamento de Escolas Rainha Santa Isabel, Pedrulha, Coimbra",
      "concelho": "Coimbra",
      "me_code": "161263"
    },
    {
      "name": "Agrupamento de Escolas Eugénio de Castro, Coimbra",
      "concelho": "Coimbra",
      "me_code": "161305"
    },
    {
      "name": "Agrupamento de Escolas Martim de Freitas, Coimbra",
      "concelho": "Coimbra",
      "me_code": "161329"
    },
    {
      "name": "Agrupamento de Escolas Coimbra Centro",
      "concelho": "Coimbra",
      "me_code": "161974"
    },
    {
      "name": "Agrupamento de Escolas Coimbra Oeste",
      "concelho": "Coimbra",
      "me_code": "161986"
    },
    {
      "name": "Escola Secundária Avelar Brotero, Coimbra",
      "concelho": "Coimbra",
      "me_code": "400026"
    },
    {
      "name": "Escola Secundária Infanta D. Maria, Coimbra",
      "concelho": "Coimbra",
      "me_code": "400257"
    },
    {
      "name": "Escola Secundária José Falcão, Coimbra",
      "concelho": "Coimbra",
      "me_code": "400294"
    },
    {
      "name": "Escola Secundária D. Dinis, Coimbra",
      "concelho": "Coimbra",
      "me_code": "401249"
    },
    {
      "name": "Escola Básica e Secundária Quinta das Flores, Coimbra",
      "concelho": "Coimbra",
      "me_code": "402590"
    },
    {
      "name": "Escola Artística do Conservatório de Música de Coimbra",
      "concelho": "Coimbra",
      "me_code": "404202"
    },
    {
      "name": "Agrupamento de Escolas de Condeixa-a-Nova",
      "concelho": "Condeixa-a-Nova",
      "me_code": "161342"
    },
    {
      "name": "Agrupamento de Escolas Figueira Norte, Figueira da Foz",
      "concelho": "Figueira da Foz",
      "me_code": "161354"
    },
    {
      "name": "Agrupamento de Escolas Figueira Mar, Figueira da Foz",
      "concelho": "Figueira da Foz",
      "me_code": "161366"
    },
    {
      "name": "Agrupamento de Escolas de Paião, Figueira da Foz",
      "concelho": "Figueira da Foz",
      "me_code": "161378"
    },
    {
      "name": "Agrupamento de Escolas da Zona Urbana da Figueira da Foz",
      "concelho": "Figueira da Foz",
      "me_code": "161380"
    },
    {
      "name": "Escola Secundária Dr. Joaquim de Carvalho, Figueira da Foz",
      "concelho": "Figueira da Foz",
      "me_code": "401470"
    },
    {
      "name": "Agrupamento de Escolas de Góis",
      "concelho": "Góis",
      "me_code": "160192"
    },
    {
      "name": "Agrupamento de Escolas da Lousã",
      "concelho": "Lousã",
      "me_code": "161391"
    },
    {
      "name": "Agrupamento de Escolas de Mira",
      "concelho": "Mira",
      "me_code": "160209"
    },
    {
      "name": "Agrupamento de Escolas de Miranda do Corvo",
      "concelho": "Miranda do Corvo",
      "me_code": "161410"
    },
    {
      "name": "Agrupamento de Escolas de Oliveira do Hospital",
      "concelho": "Oliveira do Hospital",
      "me_code": "162000"
    },
    {
      "name": "Agrupamento de Escolas Escalada, Pampilhosa da Serra",
      "concelho": "Pampilhosa da Serra",
      "me_code": "160507"
    },
    {
      "name": "Agrupamento de Escolas de Penacova",
      "concelho": "Penacova",
      "me_code": "161901"
    },
    {
      "name": "Agrupamento de Escolas Infante D. Pedro, Penela",
      "concelho": "Penela",
      "me_code": "160234"
    },
    {
      "name": "Agrupamento de Escolas de Soure",
      "concelho": "Soure",
      "me_code": "161469"
    },
    {
      "name": "Agrupamento de Escolas de Tábua",
      "concelho": "Tábua",
      "me_code": "161482"
    },
    {
      "name": "Agrupamento de Escolas de Vila Nova de Poiares",
      "concelho": "Vila Nova de Poiares",
      "me_code": "160520"
    }
  ],
  "Évora": [
    {
      "name": "Agrupamento de Escolas de Montemor-o-Velho",
      "concelho": "Montemor-o-Velho",
      "me_code": "161433"
    },
    {
      "name": "Agrupamento de Escolas de Arraiolos",
      "concelho": "Arraiolos",
      "me_code": "135525"
    },
    {
      "name": "Agrupamento de Escolas de Borba",
      "concelho": "Borba",
      "me_code": "135136"
    },
    {
      "name": "Agrupamento de Escolas de Estremoz",
      "concelho": "Estremoz",
      "me_code": "135574"
    },
    {
      "name": "Escola Secundária Rainha Santa Isabel, Estremoz",
      "concelho": "Estremoz",
      "me_code": "402643"
    },
    {
      "name": "Agrupamento de Escolas Manuel Ferreira Patrício, Évora",
      "concelho": "Évora",
      "me_code": "135537"
    },
    {
      "name": "Agrupamento de Escolas n.º 2 de Évora",
      "concelho": "Évora",
      "me_code": "135549"
    },
    {
      "name": "Agrupamento de Escolas Severim de Faria",
      "concelho": "Évora",
      "me_code": "135550"
    },
    {
      "name": "Agrupamento de Escolas n.º 4 de Évora",
      "concelho": "Évora",
      "me_code": "135562"
    },
    {
      "name": "Agrupamento de Escolas de Montemor-o-Novo",
      "concelho": "Montemor-o-Novo",
      "me_code": "135586"
    },
    {
      "name": "Agrupamento de Escolas de Mora",
      "concelho": "Mora",
      "me_code": "135150"
    },
    {
      "name": "Agrupamento de Escolas de Portel",
      "concelho": "Portel",
      "me_code": "130140"
    },
    {
      "name": "Agrupamento de Escolas de Redondo",
      "concelho": "Redondo",
      "me_code": "135598"
    },
    {
      "name": "Agrupamento de Escolas de Reguengos de Monsaraz",
      "concelho": "Reguengos de Monsaraz",
      "me_code": "135604"
    },
    {
      "name": "Agrupamento de Escolas de Vendas Novas",
      "concelho": "Vendas Novas",
      "me_code": "135410"
    },
    {
      "name": "Agrupamento de Escolas de Vila Viçosa",
      "concelho": "Vila Viçosa",
      "me_code": "135483"
    }
  ],
  "Faro": [
    {
      "name": "Agrupamento de Escolas de Sines",
      "concelho": "Sines",
      "me_code": "135628"
    },
    {
      "name": "Escola Secundária Poeta Al Berto, Sines",
      "concelho": "Sines",
      "me_code": "403192"
    },
    {
      "name": "Agrupamento de Escolas de Albufeira Poente, Albufeira",
      "concelho": "Albufeira",
      "me_code": "145014"
    },
    {
      "name": "Agrupamento de Escolas de Ferreiras, Albufeira",
      "concelho": "Albufeira",
      "me_code": "145026"
    },
    {
      "name": "Agrupamento de Escolas de Albufeira",
      "concelho": "Albufeira",
      "me_code": "145385"
    },
    {
      "name": "Agrupamento de Escolas de Alcoutim",
      "concelho": "Alcoutim",
      "me_code": "145520"
    },
    {
      "name": "Agrupamento de Escolas de Aljezur",
      "concelho": "Aljezur",
      "me_code": "145051"
    },
    {
      "name": "Agrupamento de Escolas de Castro Marim",
      "concelho": "Castro Marim",
      "me_code": "145063"
    },
    {
      "name": "Agrupamento de Escolas D. Afonso III, Faro",
      "concelho": "Faro",
      "me_code": "145087"
    },
    {
      "name": "Agrupamento de Escolas João de Deus, Faro",
      "concelho": "Faro",
      "me_code": "145099"
    },
    {
      "name": "Agrupamento de Escolas de Montenegro, Faro",
      "concelho": "Faro",
      "me_code": "145105"
    },
    {
      "name": "Agrupamento de Escolas Tomás Cabreira, Faro",
      "concelho": "Faro",
      "me_code": "145397"
    },
    {
      "name": "Agrupamento de Escolas Pinheiro e Rosa, Faro",
      "concelho": "Faro",
      "me_code": "145567"
    },
    {
      "name": "Agrupamento de Escolas Rio Arade, Lagoa",
      "concelho": "Lagoa",
      "me_code": "145130"
    },
    {
      "name": "Agrupamento de Escolas Padre António Martins de Oliveira, Lagoa",
      "concelho": "Lagoa",
      "me_code": "145403"
    },
    {
      "name": "Agrupamento de Escolas Júlio Dantas, Lagos",
      "concelho": "Lagos",
      "me_code": "145415"
    },
    {
      "name": "Agrupamento de Escolas Gil Eanes, Lagos",
      "concelho": "Lagos",
      "me_code": "145427"
    },
    {
      "name": "Agrupamento de Escolas de Almancil, Loulé",
      "concelho": "Loulé",
      "me_code": "145142"
    },
    {
      "name": "Agrupamento de Escolas Eng. Duarte Pacheco, Loulé",
      "concelho": "Loulé",
      "me_code": "145178"
    },
    {
      "name": "Agrupamento de Escolas Drª Laura Ayres, Loulé",
      "concelho": "Loulé",
      "me_code": "145336"
    },
    {
      "name": "Agrupamento de Escolas D. Dinis, Loulé",
      "concelho": "Loulé",
      "me_code": "145439"
    },
    {
      "name": "Agrupamento de Escolas Padre João Coelho Cabanita, Loulé",
      "concelho": "Loulé",
      "me_code": "145440"
    },
    {
      "name": "Escola Secundária de Loulé",
      "concelho": "Loulé",
      "me_code": "400324"
    },
    {
      "name": "Agrupamento de Escolas de Monchique",
      "concelho": "Monchique",
      "me_code": "145180"
    },
    {
      "name": "Agrupamento de Escolas Professor Paula Nogueira, Olhão",
      "concelho": "Olhão",
      "me_code": "145191"
    },
    {
      "name": "Agrupamento de Escolas João da Rosa, Olhão",
      "concelho": "Olhão",
      "me_code": "145221"
    },
    {
      "name": "Agrupamento de Escolas Dr. Alberto Iria, Olhão",
      "concelho": "Olhão",
      "me_code": "145452"
    },
    {
      "name": "Agrupamento de Escolas Dr. Francisco Fernandes Lopes, Olhão",
      "concelho": "Olhão",
      "me_code": "145543"
    },
    {
      "name": "Agrupamento de Escolas Manuel Teixeira Gomes, Portimão",
      "concelho": "Portimão",
      "me_code": "145464"
    },
    {
      "name": "Agrupamento de Escolas Poeta António Aleixo",
      "concelho": "Portimão",
      "me_code": "145476"
    },
    {
      "name": "Agrupamento de Escolas Eng. Nuno Mergulhão, Portimão",
      "concelho": "Portimão",
      "me_code": "145488"
    },
    {
      "name": "Agrupamento de Escolas Júdice Fialho, Portimão",
      "concelho": "Portimão",
      "me_code": "145490"
    },
    {
      "name": "Agrupamento de Escolas de Bemposta, Portimão",
      "concelho": "Portimão",
      "me_code": "145531"
    },
    {
      "name": "Agrupamento de Escolas José Belchior Viegas, São Brás de Alportel",
      "concelho": "São Brás de Alportel",
      "me_code": "145373"
    },
    {
      "name": "Agrupamento de Escolas Dr. António da Costa Contreiras, Silves",
      "concelho": "Silves",
      "me_code": "145269"
    },
    {
      "name": "Agrupamento de Escolas de Silves",
      "concelho": "Silves",
      "me_code": "145555"
    },
    {
      "name": "Agrupamento de Escolas Dr. Jorge Augusto Correia, Tavira",
      "concelho": "Tavira",
      "me_code": "145312"
    },
    {
      "name": "Agrupamento de Escolas D. Manuel I, Tavira",
      "concelho": "Tavira",
      "me_code": "145324"
    },
    {
      "name": "Agrupamento de Escolas de Vila do Bispo",
      "concelho": "Vila do Bispo",
      "me_code": "145282"
    },
    {
      "name": "Agrupamento de Escolas de Vila Real de Santo António",
      "concelho": "Vila Real de Santo António",
      "me_code": "145348"
    },
    {
      "name": "Agrupamento de Escolas D. José I, Vila Real de Santo António",
      "concelho": "Vila Real de Santo António",
      "me_code": "145518"
    }
  ],
  "Guarda": [
    {
      "name": "Agrupamento de Escolas Tenente Coronel Adão Carrapatoso, Vila Nova de Foz Côa",
      "concelho": "Vila Nova de Foz Côa",
      "me_code": "151269"
    },
    {
      "name": "Agrupamento de Escolas Padre José Augusto da Fonseca, Aguiar da Beira",
      "concelho": "Aguiar da Beira",
      "me_code": "160854"
    },
    {
      "name": "Agrupamento de Escolas de Almeida",
      "concelho": "Almeida",
      "me_code": "161500"
    },
    {
      "name": "Agrupamento de Escolas de Celorico da Beira",
      "concelho": "Celorico da Beira",
      "me_code": "160866"
    },
    {
      "name": "Agrupamento de Escolas de Figueira de Castelo Rodrigo",
      "concelho": "Figueira de Castelo Rodrigo",
      "me_code": "160714"
    },
    {
      "name": "Agrupamento de Escolas de Fornos de Algodres",
      "concelho": "Fornos de Algodres",
      "me_code": "160842"
    },
    {
      "name": "Agrupamento de Escolas de Gouveia",
      "concelho": "Gouveia",
      "me_code": "161597"
    },
    {
      "name": "Agrupamento de Escolas Afonso de Albuquerque, Guarda",
      "concelho": "Guarda",
      "me_code": "161512"
    },
    {
      "name": "Agrupamento de Escolas da Sé, Guarda",
      "concelho": "Guarda",
      "me_code": "162012"
    },
    {
      "name": "Agrupamento de Escolas de Manteigas",
      "concelho": "Manteigas",
      "me_code": "160258"
    },
    {
      "name": "Agrupamento de Escolas de Meda",
      "concelho": "Meda",
      "me_code": "160076"
    },
    {
      "name": "Agrupamento de Escolas de Pinhel",
      "concelho": "Pinhel",
      "me_code": "161585"
    },
    {
      "name": "Agrupamento de Escolas de Sabugal",
      "concelho": "Sabugal",
      "me_code": "161548"
    },
    {
      "name": "Agrupamento de Escolas de Seia",
      "concelho": "Seia",
      "me_code": "161925"
    },
    {
      "name": "Agrupamento de Escolas Dr. Guilherme Correia de Carvalho, Seia",
      "concelho": "Seia",
      "me_code": "161937"
    },
    {
      "name": "Agrupamento de Escolas de Trancoso",
      "concelho": "Trancoso",
      "me_code": "161561"
    }
  ],
  "Leiria": [
    {
      "name": "Agrupamento de Escolas Gualdim Pais, Pombal",
      "concelho": "Pombal",
      "me_code": "160374"
    },
    {
      "name": "Agrupamento de Escolas de Pombal",
      "concelho": "Pombal",
      "me_code": "161615"
    },
    {
      "name": "Agrupamento de Escolas de Guia, Pombal",
      "concelho": "Pombal",
      "me_code": "161690"
    },
    {
      "name": "Agrupamento de Escolas de Alvaiázere",
      "concelho": "Alvaiázere",
      "me_code": "161603"
    },
    {
      "name": "Agrupamento de Escolas de Ansião",
      "concelho": "Ansião",
      "me_code": "160829"
    },
    {
      "name": "Agrupamento de Escolas de Batalha",
      "concelho": "Batalha",
      "me_code": "160301"
    },
    {
      "name": "Agrupamento de Escolas Dr. Bissaya Barreto, Castanheira de Pera",
      "concelho": "Castanheira de Pêra",
      "me_code": "160544"
    },
    {
      "name": "Agrupamento de Escolas de Figueiró dos Vinhos",
      "concelho": "Figueiró dos Vinhos",
      "me_code": "160623"
    },
    {
      "name": "Agrupamento de Escolas Caranguejeira - Santa Catarina da Serra, Leiria",
      "concelho": "Leiria",
      "me_code": "160313"
    },
    {
      "name": "Agrupamento de Escolas de Colmeias, Leiria",
      "concelho": "Leiria",
      "me_code": "160325"
    },
    {
      "name": "Agrupamento de Escolas Henrique Sommer, Maceira, Leiria",
      "concelho": "Leiria",
      "me_code": "160337"
    },
    {
      "name": "Agrupamento de Escolas de Marrazes, Leiria",
      "concelho": "Leiria",
      "me_code": "160349"
    },
    {
      "name": "Agrupamento de Escolas Rainha Santa Isabel, Carreira, Leiria",
      "concelho": "Leiria",
      "me_code": "160556"
    },
    {
      "name": "Agrupamento de Escolas Dr. Correia Mateus, Leiria",
      "concelho": "Leiria",
      "me_code": "161627"
    },
    {
      "name": "Agrupamento de Escolas D. Dinis, Leiria",
      "concelho": "Leiria",
      "me_code": "161639"
    },
    {
      "name": "Agrupamento de Escolas Domingos Sequeira, Leiria",
      "concelho": "Leiria",
      "me_code": "161640"
    },
    {
      "name": "Escola Secundária Francisco Rodrigues Lobo, Leiria",
      "concelho": "Leiria",
      "me_code": "400208"
    },
    {
      "name": "Escola Secundária Afonso Lopes Vieira, Leiria",
      "concelho": "Leiria",
      "me_code": "400725"
    },
    {
      "name": "Agrupamento de Escolas de Vieira de Leiria, Marinha Grande",
      "concelho": "Marinha Grande",
      "me_code": "160362"
    },
    {
      "name": "Agrupamento de Escolas Marinha Grande Nascente",
      "concelho": "Marinha Grande",
      "me_code": "161676"
    },
    {
      "name": "Agrupamento de Escolas Marinha Grande Poente",
      "concelho": "Marinha Grande",
      "me_code": "161688"
    },
    {
      "name": "Agrupamento de Escolas de Pedrógão Grande",
      "concelho": "Pedrógão Grande",
      "me_code": "160659"
    },
    {
      "name": "Agrupamento de Escolas de Porto de Mós",
      "concelho": "Porto de Mós",
      "me_code": "160672"
    },
    {
      "name": "Agrupamento de Escolas da Benedita, Alcobaça",
      "concelho": "Alcobaça",
      "me_code": "170082"
    },
    {
      "name": "Agrupamento de Escolas São Martinho do Porto, Alcobaça",
      "concelho": "Alcobaça",
      "me_code": "171438"
    },
    {
      "name": "Agrupamento de Escolas de Cister de Alcobaça, Alcobaça",
      "concelho": "Alcobaça",
      "me_code": "172480"
    },
    {
      "name": "Escola Profissional de Agricultura e Desenvolvimento Rural de Cister, Alcobaça",
      "concelho": "Alcobaça",
      "me_code": "404317"
    },
    {
      "name": "Agrupamento de Escolas Rafael Bordalo Pinheiro, Caldas da Rainha",
      "concelho": "Caldas da Rainha",
      "me_code": "170239"
    },
    {
      "name": "Agrupamento de Escolas D. João II, Caldas da Rainha",
      "concelho": "Caldas da Rainha",
      "me_code": "171967"
    },
    {
      "name": "Agrupamento de Escolas Raul Proença, Caldas da Rainha",
      "concelho": "Caldas da Rainha",
      "me_code": "172170"
    },
    {
      "name": "Agrupamento de Escolas da Nazaré",
      "concelho": "Nazaré",
      "me_code": "170306"
    },
    {
      "name": "Agrupamento de Escolas Josefa de Óbidos, Óbidos",
      "concelho": "Óbidos",
      "me_code": "171335"
    },
    {
      "name": "Agrupamento de Escolas D. Luís de Ataíde, Peniche",
      "concelho": "Peniche",
      "me_code": "120297"
    },
    {
      "name": "Agrupamento de Escolas de Atouguia da Baleia, Peniche",
      "concelho": "Peniche",
      "me_code": "170008"
    },
    {
      "name": "Agrupamento de Escolas de Peniche",
      "concelho": "Peniche",
      "me_code": "172285"
    },
    {
      "name": "Escola Secundária de Peniche",
      "concelho": "Peniche",
      "me_code": "402497"
    }
  ],
  "Lisboa": [
    {
      "name": "Agrupamento de Escolas Visconde de Chanceleiros, Alenquer",
      "concelho": "Alenquer",
      "me_code": "120996"
    },
    {
      "name": "Agrupamento de Escolas do Carregado, Alenquer",
      "concelho": "Alenquer",
      "me_code": "170136"
    },
    {
      "name": "Agrupamento de Escolas Damião de Goes, Alenquer",
      "concelho": "Alenquer",
      "me_code": "170598"
    },
    {
      "name": "Agrupamento de Escolas da Abrigada, Alenquer",
      "concelho": "Alenquer",
      "me_code": "170604"
    },
    {
      "name": "Agrupamento de Escolas de Arruda dos Vinhos",
      "concelho": "Arruda dos Vinhos",
      "me_code": "121009"
    },
    {
      "name": "Agrupamento de Escolas da Azambuja",
      "concelho": "Azambuja",
      "me_code": "170537"
    },
    {
      "name": "Agrupamento de Escolas Vale Aveiras, Azambuja",
      "concelho": "Azambuja",
      "me_code": "170574"
    },
    {
      "name": "Agrupamento de Escolas do Alto da Azambuja",
      "concelho": "Azambuja",
      "me_code": "170641"
    },
    {
      "name": "Agrupamento de Escolas do Cadaval",
      "concelho": "Cadaval",
      "me_code": "170549"
    },
    {
      "name": "Agrupamento de Escolas D. Lourenço Vicente, Lourinhã",
      "concelho": "Lourinhã",
      "me_code": "121381"
    },
    {
      "name": "Agrupamento de Escolas da Lourinhã",
      "concelho": "Lourinhã",
      "me_code": "121393"
    },
    {
      "name": "Agrupamento de Escolas de Venda do Pinheiro, Mafra",
      "concelho": "Mafra",
      "me_code": "121423"
    },
    {
      "name": "Agrupamento de Escolas da Ericeira, Mafra",
      "concelho": "Mafra",
      "me_code": "170112"
    },
    {
      "name": "Agrupamento de Escolas Professor Armando Lucena, Mafra",
      "concelho": "Mafra",
      "me_code": "171499"
    },
    {
      "name": "Agrupamento de Escolas de Mafra",
      "concelho": "Mafra",
      "me_code": "171505"
    },
    {
      "name": "Escola Secundária José Saramago, Mafra",
      "concelho": "Mafra",
      "me_code": "400580"
    },
    {
      "name": "Agrupamento de Escolas Joaquim Inácio da Cruz Sobral, Sobral do Monte Agraço",
      "concelho": "Sobral de Monte Agraço",
      "me_code": "172364"
    },
    {
      "name": "Agrupamento de Escolas de São Gonçalo, Torres Vedras",
      "concelho": "Torres Vedras",
      "me_code": "170616"
    },
    {
      "name": "Agrupamento de Escolas Henriques Nogueira, Torres Vedras",
      "concelho": "Torres Vedras",
      "me_code": "170963"
    },
    {
      "name": "Agrupamento de Escolas Padre Vítor Melícias, Torres Vedras",
      "concelho": "Torres Vedras",
      "me_code": "170987"
    },
    {
      "name": "Agrupamento de Escolas Madeira Torres, Torres Vedras",
      "concelho": "Torres Vedras",
      "me_code": "171517"
    },
    {
      "name": "Agrupamento de Escolas de Alfornelos, Amadora",
      "concelho": "Amadora",
      "me_code": "170161"
    },
    {
      "name": "Agrupamento de Escolas Almeida Garrett, Amadora",
      "concelho": "Amadora",
      "me_code": "170264"
    },
    {
      "name": "Agrupamento de Escolas José Cardoso Pires, Amadora",
      "concelho": "Amadora",
      "me_code": "170719"
    },
    {
      "name": "Agrupamento de Escolas Pioneiros da Aviação Portuguesa, Amadora",
      "concelho": "Amadora",
      "me_code": "170744"
    },
    {
      "name": "Agrupamento de Escolas Cardoso Lopes, Amadora",
      "concelho": "Amadora",
      "me_code": "171232"
    },
    {
      "name": "Agrupamento de Escolas Miguel Torga, Amadora",
      "concelho": "Amadora",
      "me_code": "171244"
    },
    {
      "name": "Agrupamento de Escolas Amadora Oeste, Amadora",
      "concelho": "Amadora",
      "me_code": "171451"
    },
    {
      "name": "Agrupamento de Escolas Amadora Nº 3, Amadora",
      "concelho": "Amadora",
      "me_code": "171463"
    },
    {
      "name": "Agrupamento de Escolas da Damaia, Amadora",
      "concelho": "Amadora",
      "me_code": "171669"
    },
    {
      "name": "Agrupamento de Escolas Dr. Azevedo Neves, Amadora",
      "concelho": "Amadora",
      "me_code": "172182"
    },
    {
      "name": "Agrupamento de Escolas Mães D´Agua, Amadora",
      "concelho": "Amadora",
      "me_code": "172303"
    },
    {
      "name": "Agrupamento de Escolas D. João V, Amadora",
      "concelho": "Amadora",
      "me_code": "172431"
    },
    {
      "name": "Agrupamento de Escolas Ibn Mucana, Cascais",
      "concelho": "Cascais",
      "me_code": "170677"
    },
    {
      "name": "Agrupamento de Escolas de São João do Estoril, Cascais",
      "concelho": "Cascais",
      "me_code": "170689"
    },
    {
      "name": "Agrupamento de Escolas da Alapraia, Cascais",
      "concelho": "Cascais",
      "me_code": "170690"
    },
    {
      "name": "Agrupamento de Escolas de Parede, Cascais",
      "concelho": "Cascais",
      "me_code": "170707"
    },
    {
      "name": "Agrupamento de Escolas de Cascais",
      "concelho": "Cascais",
      "me_code": "170732"
    },
    {
      "name": "Agrupamento de Escolas de Alcabideche, Cascais",
      "concelho": "Cascais",
      "me_code": "170756"
    },
    {
      "name": "Agrupamento de Escolas Matilde Rosa Araújo, Cascais",
      "concelho": "Cascais",
      "me_code": "170768"
    },
    {
      "name": "Agrupamento de Escolas de Carcavelos, Cascais",
      "concelho": "Cascais",
      "me_code": "172250"
    },
    {
      "name": "Agrupamento de Escolas Frei Gonçalo de Azevedo, Cascais",
      "concelho": "Cascais",
      "me_code": "172261"
    },
    {
      "name": "Agrupamento de Escolas de Alvide, Cascais",
      "concelho": "Cascais",
      "me_code": "172273"
    },
    {
      "name": "Agrupamento de Escolas da Cidadela, Cascais",
      "concelho": "Cascais",
      "me_code": "172443"
    },
    {
      "name": "Agrupamento de Escolas Padre Bartolomeu de Gusmão, Lisboa",
      "concelho": "Lisboa",
      "me_code": "170150"
    },
    {
      "name": "Agrupamento de Escolas Vergílio Ferreira, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171098"
    },
    {
      "name": "Agrupamento de Escolas do Restelo, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171153"
    },
    {
      "name": "Agrupamento de Escolas Patrício Prazeres, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171165"
    },
    {
      "name": "Agrupamento de Escolas Professor Lindley Cintra - Lumiar, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171177"
    },
    {
      "name": "Agrupamento de Escolas das Olaias, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171189"
    },
    {
      "name": "Agrupamento de Escolas Fernando Pessoa, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171190"
    },
    {
      "name": "Agrupamento de Escolas Marquesa de Alorna, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171360"
    },
    {
      "name": "Agrupamento de Escolas Francisco de Arruda, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171372"
    },
    {
      "name": "Agrupamento de Escolas D. Dinis, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171384"
    },
    {
      "name": "Agrupamento de Escolas Luís António Verney, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171396"
    },
    {
      "name": "Agrupamento de Escolas do Bairro Padre Cruz, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171402"
    },
    {
      "name": "Agrupamento de Escolas Piscinas - Olivais, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171682"
    },
    {
      "name": "Agrupamento de Escolas das Laranjeiras, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171700"
    },
    {
      "name": "Agrupamento de Escolas de Santa Maria dos Olivais, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171712"
    },
    {
      "name": "Agrupamento de Escolas Manuel da Maia, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171724"
    },
    {
      "name": "Agrupamento de Escolas do Alto do Lumiar, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171736"
    },
    {
      "name": "Agrupamento de Escolas Rainha D. Leonor, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171748"
    },
    {
      "name": "Agrupamento de Escolas Luís de Camões, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171750"
    },
    {
      "name": "Agrupamento de Escolas de Alvalade, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171761"
    },
    {
      "name": "Agrupamento de Escolas de Benfica, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171773"
    },
    {
      "name": "Agrupamento de Escolas Quinta de Marrocos, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171785"
    },
    {
      "name": "Agrupamento de Escolas Pintor Almada Negreiros, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171797"
    },
    {
      "name": "Agrupamento de Escolas Baixa-Chiado, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171943"
    },
    {
      "name": "Agrupamento de Escolas Nuno Gonçalves, Lisboa",
      "concelho": "Lisboa",
      "me_code": "171955"
    },
    {
      "name": "Agrupamento de Escolas D. Filipa de Lencastre, Lisboa",
      "concelho": "Lisboa",
      "me_code": "172315"
    },
    {
      "name": "Agrupamento de Escolas Gil Vicente, Lisboa",
      "concelho": "Lisboa",
      "me_code": "172339"
    },
    {
      "name": "Agrupamento de Escolas Eça de Queirós, Lisboa",
      "concelho": "Lisboa",
      "me_code": "172420"
    },
    {
      "name": "Escola Secundária Maria Amália Vaz de Carvalho, Lisboa",
      "concelho": "Lisboa",
      "me_code": "400348"
    },
    {
      "name": "Escola Secundária Camões, Lisboa",
      "concelho": "Lisboa",
      "me_code": "401109"
    },
    {
      "name": "Escola Secundária Fonseca Benevides, Lisboa",
      "concelho": "Lisboa",
      "me_code": "401778"
    },
    {
      "name": "Escola Secundária Marquês de Pombal, Lisboa",
      "concelho": "Lisboa",
      "me_code": "402163"
    },
    {
      "name": "Escola Artística António Arroio, Lisboa",
      "concelho": "Lisboa",
      "me_code": "404172"
    },
    {
      "name": "Escola Artística do Instituto Gregoriano de Lisboa",
      "concelho": "Lisboa",
      "me_code": "404226"
    },
    {
      "name": "Escola Artística de Dança do Conservatório Nacional, Lisboa",
      "concelho": "Lisboa",
      "me_code": "404238"
    },
    {
      "name": "Escola Artística de Música do Conservatório Nacional, Lisboa",
      "concelho": "Lisboa",
      "me_code": "404240"
    },
    {
      "name": "Escola Profissional de Ciências Geográficas, Lisboa",
      "concelho": "Lisboa",
      "me_code": "404354"
    },
    {
      "name": "Escola Secundária Rainha Dona Amélia, Lisboa",
      "concelho": "Lisboa",
      "me_code": "404408"
    },
    {
      "name": "Escola Secundária Pedro Nunes, Lisboa",
      "concelho": "Lisboa",
      "me_code": "404652"
    },
    {
      "name": "Agrupamento de Escolas de Camarate - D. Nuno Álvares Pereira, Loures",
      "concelho": "Loures",
      "me_code": "171116"
    },
    {
      "name": "Agrupamento de Escolas 4 de Outubro, Loures",
      "concelho": "Loures",
      "me_code": "171128"
    },
    {
      "name": "Agrupamento de Escolas de Catujal - Unhos, Loures",
      "concelho": "Loures",
      "me_code": "171130"
    },
    {
      "name": "Agrupamento de Escolas de Portela e Moscavide, Loures",
      "concelho": "Loures",
      "me_code": "171141"
    },
    {
      "name": "Agrupamento de Escolas n.º 1 de Loures",
      "concelho": "Loures",
      "me_code": "172029"
    },
    {
      "name": "Agrupamento de Escolas João Villaret, Loures",
      "concelho": "Loures",
      "me_code": "172030"
    },
    {
      "name": "Agrupamento de Escolas General Humberto Delgado, Loures",
      "concelho": "Loures",
      "me_code": "172042"
    },
    {
      "name": "Agrupamento de Escolas n.º 2 de Loures",
      "concelho": "Loures",
      "me_code": "172054"
    },
    {
      "name": "Agrupamento de Escolas da Bobadela, Loures",
      "concelho": "Loures",
      "me_code": "172066"
    },
    {
      "name": "Agrupamento de Escolas de Santa Iria de Azóia, Loures",
      "concelho": "Loures",
      "me_code": "172078"
    },
    {
      "name": "Agrupamento de Escolas de São João da Talha, Loures",
      "concelho": "Loures",
      "me_code": "172080"
    },
    {
      "name": "Agrupamento de Escolas Eduardo Gageiro, Loures",
      "concelho": "Loures",
      "me_code": "172091"
    },
    {
      "name": "Agrupamento de Escolas da Apelação, Loures",
      "concelho": "Loures",
      "me_code": "172108"
    },
    {
      "name": "Escola Secundária de Camarate, Loures",
      "concelho": "Loures",
      "me_code": "403490"
    },
    {
      "name": "Agrupamento de Escolas Braamcamp Freire",
      "concelho": "Odivelas",
      "me_code": "171074"
    },
    {
      "name": "Agrupamento de Escolas Pedro Alexandrino - Póvoa de Santo Adrião, Odivelas",
      "concelho": "Odivelas",
      "me_code": "171086"
    },
    {
      "name": "Agrupamento de Escolas Vasco Santana, Odivelas",
      "concelho": "Odivelas",
      "me_code": "171840"
    },
    {
      "name": "Agrupamento de Escolas de Moinhos da Arroja, Odivelas",
      "concelho": "Odivelas",
      "me_code": "171852"
    },
    {
      "name": "Agrupamento de Escolas n.º 4 de Odivelas",
      "concelho": "Odivelas",
      "me_code": "171906"
    },
    {
      "name": "Agrupamento de Escolas a Sudoeste de Odivelas",
      "concelho": "Odivelas",
      "me_code": "171918"
    },
    {
      "name": "Agrupamento de Escolas de Caneças, Odivelas",
      "concelho": "Odivelas",
      "me_code": "171920"
    },
    {
      "name": "Agrupamento de Escolas D. Dinis, Odivelas",
      "concelho": "Odivelas",
      "me_code": "171992"
    },
    {
      "name": "Escola Secundária da Ramada, Odivelas",
      "concelho": "Odivelas",
      "me_code": "403507"
    },
    {
      "name": "Escola Profissional Agrícola D. Dinis - Paiã, Odivelas",
      "concelho": "Odivelas",
      "me_code": "404019"
    },
    {
      "name": "Agrupamento de Escolas Aquilino Ribeiro, Oeiras",
      "concelho": "Oeiras",
      "me_code": "121617"
    },
    {
      "name": "Agrupamento de Escolas de São Bruno, Oeiras",
      "concelho": "Oeiras",
      "me_code": "171475"
    },
    {
      "name": "Agrupamento de Escolas de Carnaxide, Oeiras",
      "concelho": "Oeiras",
      "me_code": "171487"
    },
    {
      "name": "Agrupamento de Escolas de Carnaxide - Portela, Oeiras",
      "concelho": "Oeiras",
      "me_code": "171803"
    },
    {
      "name": "Agrupamento de Escolas de Miraflores, Oeiras",
      "concelho": "Oeiras",
      "me_code": "171815"
    },
    {
      "name": "Agrupamento de Escolas de Paço de Arcos, Oeiras",
      "concelho": "Oeiras",
      "me_code": "171827"
    },
    {
      "name": "Agrupamento de Escolas Conde de Oeiras, Oeiras",
      "concelho": "Oeiras",
      "me_code": "171979"
    },
    {
      "name": "Agrupamento de Escolas de São Julião da Barra, Oeiras",
      "concelho": "Oeiras",
      "me_code": "171980"
    },
    {
      "name": "Agrupamento de Escolas Linda-a-Velha e Queijas, Oeiras",
      "concelho": "Oeiras",
      "me_code": "172110"
    },
    {
      "name": "Agrupamento de Escolas de Santa Catarina, Oeiras",
      "concelho": "Oeiras",
      "me_code": "172376"
    },
    {
      "name": "Escola Secundária da Quinta do Marquês, Oeiras",
      "concelho": "Oeiras",
      "me_code": "402606"
    },
    {
      "name": "Agrupamento de Escolas D. João II, Sintra",
      "concelho": "Sintra",
      "me_code": "170185"
    },
    {
      "name": "Agrupamento de Escolas Leal da Câmara, Sintra",
      "concelho": "Sintra",
      "me_code": "170318"
    },
    {
      "name": "Agrupamento de Escolas Alto dos Moinhos, Sintra",
      "concelho": "Sintra",
      "me_code": "170720"
    },
    {
      "name": "Agrupamento de Escolas António Sérgio, Sintra",
      "concelho": "Sintra",
      "me_code": "171219"
    },
    {
      "name": "Agrupamento de Escolas de Mem Martins, Sintra",
      "concelho": "Sintra",
      "me_code": "171530"
    },
    {
      "name": "Agrupamento de Escolas D. Carlos I, Sintra",
      "concelho": "Sintra",
      "me_code": "171554"
    },
    {
      "name": "Agrupamento de Escolas Alfredo da Silva, Sintra",
      "concelho": "Sintra",
      "me_code": "171578"
    },
    {
      "name": "Agrupamento de Escolas Lapiás, Sintra",
      "concelho": "Sintra",
      "me_code": "171580"
    },
    {
      "name": "Agrupamento de Escolas do Algueirão, Sintra",
      "concelho": "Sintra",
      "me_code": "171591"
    },
    {
      "name": "Agrupamento de Escolas Agualva Mira Sintra, Sintra",
      "concelho": "Sintra",
      "me_code": "171608"
    },
    {
      "name": "Agrupamento de Escolas Ferreira de Castro, Sintra",
      "concelho": "Sintra",
      "me_code": "171876"
    },
    {
      "name": "Agrupamento de Escolas Professor Agostinho da Silva, Sintra",
      "concelho": "Sintra",
      "me_code": "171888"
    },
    {
      "name": "Agrupamento de Escolas Visconde de Juromenha, Sintra",
      "concelho": "Sintra",
      "me_code": "171890"
    },
    {
      "name": "Agrupamento de Escolas de Queluz-Belas, Sintra",
      "concelho": "Sintra",
      "me_code": "172121"
    },
    {
      "name": "Agrupamento de Escolas Escultor Francisco dos Santos, Sintra",
      "concelho": "Sintra",
      "me_code": "172133"
    },
    {
      "name": "Agrupamento de Escolas Miguel Torga, Sintra",
      "concelho": "Sintra",
      "me_code": "172224"
    },
    {
      "name": "Agrupamento de Escolas de Massamá, Sintra",
      "concelho": "Sintra",
      "me_code": "172236"
    },
    {
      "name": "Agrupamento de Escolas Ruy Belo, Sintra",
      "concelho": "Sintra",
      "me_code": "172248"
    },
    {
      "name": "Agrupamento de Escolas Monte da Lua, Sintra",
      "concelho": "Sintra",
      "me_code": "172455"
    },
    {
      "name": "Agrupamento de Escolas D. Maria II, Sintra",
      "concelho": "Sintra",
      "me_code": "172467"
    },
    {
      "name": "Escola Secundária Ferreira Dias, Agualva, Sintra",
      "concelho": "Sintra",
      "me_code": "401754"
    },
    {
      "name": "Agrupamento de Escolas do Bom Sucesso, Vila Franca de Xira",
      "concelho": "Vila Franca de Xira",
      "me_code": "170070"
    },
    {
      "name": "Agrupamento de Escolas Alves Redol, Vila Franca de Xira",
      "concelho": "Vila Franca de Xira",
      "me_code": "170770"
    },
    {
      "name": "Agrupamento de Escolas Póvoa de Santa Iria, Vila Franca de Xira",
      "concelho": "Vila Franca de Xira",
      "me_code": "170781"
    },
    {
      "name": "Agrupamento de Escolas de Alhandra, Sobralinho e São João dos Montes, Vila Franca de Xira",
      "concelho": "Vila Franca de Xira",
      "me_code": "170793"
    },
    {
      "name": "Agrupamento de Escolas de Vialonga, Vila Franca de Xira",
      "concelho": "Vila Franca de Xira",
      "me_code": "170800"
    },
    {
      "name": "Agrupamento de Escolas Pedro Jacques de Magalhães, Vila Franca de Xira",
      "concelho": "Vila Franca de Xira",
      "me_code": "170811"
    },
    {
      "name": "Agrupamento de Escolas Professor Reynaldo dos Santos, Vila Franca de Xira",
      "concelho": "Vila Franca de Xira",
      "me_code": "171414"
    },
    {
      "name": "Agrupamento de Escolas do Forte da Casa, Vila Franca de Xira",
      "concelho": "Vila Franca de Xira",
      "me_code": "171864"
    },
    {
      "name": "Agrupamento de Escolas D. António de Ataíde, Vila Franca de Xira",
      "concelho": "Vila Franca de Xira",
      "me_code": "172157"
    },
    {
      "name": "Escola Secundária Gago Coutinho, Alverca do Ribatejo, Vila Franca de Xira",
      "concelho": "Vila Franca de Xira",
      "me_code": "400221"
    }
  ],
  "Portalegre": [
    {
      "name": "Agrupamento de Escolas de Alter do Chão",
      "concelho": "Alter do Chão",
      "me_code": "135185"
    },
    {
      "name": "Escola Profissional de Desenvolvimento Rural de Alter do Chão",
      "concelho": "Alter do Chão",
      "me_code": "404391"
    },
    {
      "name": "Agrupamento de Escolas de Arronches",
      "concelho": "Arronches",
      "me_code": "135197"
    },
    {
      "name": "Agrupamento de Escolas de Avis",
      "concelho": "Avis",
      "me_code": "135203"
    },
    {
      "name": "Agrupamento de Escolas de Campo Maior",
      "concelho": "Campo Maior",
      "me_code": "135215"
    },
    {
      "name": "Agrupamento de Escolas de Castelo de Vide",
      "concelho": "Castelo de Vide",
      "me_code": "135227"
    },
    {
      "name": "Agrupamento de Escolas do Crato",
      "concelho": "Crato",
      "me_code": "135239"
    },
    {
      "name": "Agrupamento de Escolas n.º 2 de Elvas",
      "concelho": "Elvas",
      "me_code": "130280"
    },
    {
      "name": "Agrupamento de Escolas n.º 1 de Elvas",
      "concelho": "Elvas",
      "me_code": "135240"
    },
    {
      "name": "Agrupamento de Escolas nº 3 de Elvas",
      "concelho": "Elvas",
      "me_code": "135252"
    },
    {
      "name": "Agrupamento de Escolas de Fronteira",
      "concelho": "Fronteira",
      "me_code": "135264"
    },
    {
      "name": "Agrupamento de Escolas de Gavião",
      "concelho": "Gavião",
      "me_code": "135495"
    },
    {
      "name": "Agrupamento de Escolas de Marvão",
      "concelho": "Marvão",
      "me_code": "135641"
    },
    {
      "name": "Agrupamento de Escolas de Monforte",
      "concelho": "Monforte",
      "me_code": "135290"
    },
    {
      "name": "Agrupamento de Escolas de Nisa",
      "concelho": "Nisa",
      "me_code": "130291"
    },
    {
      "name": "Agrupamento de Escolas de Ponte de Sôr",
      "concelho": "Ponte de Sor",
      "me_code": "135653"
    },
    {
      "name": "Agrupamento de Escolas do Bonfim, Portalegre",
      "concelho": "Portalegre",
      "me_code": "135318"
    },
    {
      "name": "Agrupamento de Escolas n.º 1 de Portalegre",
      "concelho": "Portalegre",
      "me_code": "135320"
    },
    {
      "name": "Escola Secundária de S. Lourenço, Portalegre",
      "concelho": "Portalegre",
      "me_code": "402862"
    },
    {
      "name": "Agrupamento de Escolas de Sousel",
      "concelho": "Sousel",
      "me_code": "135331"
    }
  ],
  "Porto": [
    {
      "name": "Agrupamento de Escolas de Amarante",
      "concelho": "Amarante",
      "me_code": "151099"
    },
    {
      "name": "Agrupamento de Escolas Amadeo de Souza Cardoso, Amarante",
      "concelho": "Amarante",
      "me_code": "152936"
    },
    {
      "name": "Escola Secundária de Amarante",
      "concelho": "Amarante",
      "me_code": "400828"
    },
    {
      "name": "Agrupamento de Escolas do Sudeste de Baião",
      "concelho": "Baião",
      "me_code": "150198"
    },
    {
      "name": "Agrupamento de Escolas de Eiriz, Baião",
      "concelho": "Baião",
      "me_code": "150204"
    },
    {
      "name": "Agrupamento de Escolas de Vale de Ovil, Baião",
      "concelho": "Baião",
      "me_code": "150216"
    },
    {
      "name": "Agrupamento de Escolas de Airães, Felgueiras",
      "concelho": "Felgueiras",
      "me_code": "151439"
    },
    {
      "name": "Agrupamento de Escolas de Idães, Felgueiras",
      "concelho": "Felgueiras",
      "me_code": "151440"
    },
    {
      "name": "Agrupamento de Escolas de Felgueiras",
      "concelho": "Felgueiras",
      "me_code": "151490"
    },
    {
      "name": "Agrupamento de Escolas da Lixa, Felgueiras",
      "concelho": "Felgueiras",
      "me_code": "151506"
    },
    {
      "name": "Agrupamento de Escolas D. Manuel de Faria e Sousa, Felgueiras",
      "concelho": "Felgueiras",
      "me_code": "151520"
    },
    {
      "name": "Escola Secundária de Felgueiras",
      "concelho": "Felgueiras",
      "me_code": "401687"
    },
    {
      "name": "Agrupamento de Escolas n.º 3 de Rio Tinto, Gondomar",
      "concelho": "Gondomar",
      "me_code": "150009"
    },
    {
      "name": "Agrupamento de Escolas À Beira Douro, Gondomar",
      "concelho": "Gondomar",
      "me_code": "151105"
    },
    {
      "name": "Agrupamento de Escolas Santa Bárbara, Gondomar",
      "concelho": "Gondomar",
      "me_code": "151956"
    },
    {
      "name": "Agrupamento de Escolas de Gondomar",
      "concelho": "Gondomar",
      "me_code": "151968"
    },
    {
      "name": "Agrupamento de Escolas de Valbom, Gondomar",
      "concelho": "Gondomar",
      "me_code": "151970"
    },
    {
      "name": "Agrupamento de Escolas Infanta D. Mafalda, Gondomar",
      "concelho": "Gondomar",
      "me_code": "151981"
    },
    {
      "name": "Agrupamento de Escolas n.º 1 de Gondomar",
      "concelho": "Gondomar",
      "me_code": "151993"
    },
    {
      "name": "Agrupamento de Escolas de Rio Tinto, Gondomar",
      "concelho": "Gondomar",
      "me_code": "152006"
    },
    {
      "name": "Agrupamento de Escolas de São Pedro da Cova, Gondomar",
      "concelho": "Gondomar",
      "me_code": "152018"
    },
    {
      "name": "Escola Secundária de São Pedro da Cova, Gondomar",
      "concelho": "Gondomar",
      "me_code": "403404"
    },
    {
      "name": "Agrupamento de Escolas Dr. Mário Fonseca, Lousada",
      "concelho": "Lousada",
      "me_code": "150370"
    },
    {
      "name": "Agrupamento de Escolas de Lousada Este",
      "concelho": "Lousada",
      "me_code": "151464"
    },
    {
      "name": "Agrupamento de Escolas de Lousada",
      "concelho": "Lousada",
      "me_code": "151518"
    },
    {
      "name": "Agrupamento de Escolas de Lousada Oeste",
      "concelho": "Lousada",
      "me_code": "151531"
    },
    {
      "name": "Agrupamento de Escolas da Maia",
      "concelho": "Maia",
      "me_code": "152020"
    },
    {
      "name": "Agrupamento de Escolas Gonçalo Mendes da Maia, Maia",
      "concelho": "Maia",
      "me_code": "152031"
    },
    {
      "name": "Agrupamento de Escolas de Pedrouços, Maia",
      "concelho": "Maia",
      "me_code": "152043"
    },
    {
      "name": "Agrupamento de Escolas Dr. Vieira de Carvalho, Maia",
      "concelho": "Maia",
      "me_code": "152055"
    },
    {
      "name": "Agrupamento de Escolas do Castêlo da Maia, Maia",
      "concelho": "Maia",
      "me_code": "152067"
    },
    {
      "name": "Agrupamento de Escolas do Levante da Maia, Maia",
      "concelho": "Maia",
      "me_code": "152079"
    },
    {
      "name": "Agrupamento de Escolas de Águas Santas, Maia",
      "concelho": "Maia",
      "me_code": "152961"
    },
    {
      "name": "Agrupamento de Escolas de Sande, Marco de Canaveses",
      "concelho": "Marco de Canaveses",
      "me_code": "150733"
    },
    {
      "name": "Agrupamento de Escolas n.º 1 de Marco de Canaveses",
      "concelho": "Marco de Canaveses",
      "me_code": "150745"
    },
    {
      "name": "Agrupamento de Escolas de Alpendurada, Marco de Canaveses",
      "concelho": "Marco de Canaveses",
      "me_code": "150824"
    },
    {
      "name": "Agrupamento de Escolas de Marco de Canaveses",
      "concelho": "Marco de Canaveses",
      "me_code": "150836"
    },
    {
      "name": "Escola Profissional de Agricultura e Desenvolvimento Rural de Marco de Canaveses",
      "concelho": "Marco de Canaveses",
      "me_code": "404275"
    },
    {
      "name": "Escola Profissional de Arqueologia do Freixo, Marco de Canaveses",
      "concelho": "Marco de Canaveses",
      "me_code": "404366"
    },
    {
      "name": "Agrupamento de Escolas Dr. José Domingues dos Santos, Matosinhos",
      "concelho": "Matosinhos",
      "me_code": "150393"
    },
    {
      "name": "Agrupamento de Escolas de Perafita, Matosinhos",
      "concelho": "Matosinhos",
      "me_code": "150757"
    },
    {
      "name": "Agrupamento de Escolas de Padrão da Légua, Matosinhos",
      "concelho": "Matosinhos",
      "me_code": "151403"
    },
    {
      "name": "Agrupamento de Escolas Abel Salazar, Matosinhos",
      "concelho": "Matosinhos",
      "me_code": "151610"
    },
    {
      "name": "Agrupamento de Escolas da Senhora da Hora, Matosinhos",
      "concelho": "Matosinhos",
      "me_code": "152080"
    },
    {
      "name": "Agrupamento de Escolas Engº Fernando Pinto de Oliveira, Matosinhos",
      "concelho": "Matosinhos",
      "me_code": "152092"
    },
    {
      "name": "Agrupamento de Escolas de Matosinhos",
      "concelho": "Matosinhos",
      "me_code": "152109"
    },
    {
      "name": "Agrupamento de Escolas Irmãos Passos, Matosinhos",
      "concelho": "Matosinhos",
      "me_code": "152110"
    },
    {
      "name": "Agrupamento de Escolas Professor Óscar Lopes, Matosinhos",
      "concelho": "Matosinhos",
      "me_code": "152122"
    },
    {
      "name": "Escola Secundária Augusto Gomes, Matosinhos",
      "concelho": "Matosinhos",
      "me_code": "400956"
    },
    {
      "name": "Escola Secundária da Boa Nova, Leça da Palmeira, Matosinhos",
      "concelho": "Matosinhos",
      "me_code": "401006"
    },
    {
      "name": "Escola Secundária João Gonçalves Zarco, Matosinhos",
      "concelho": "Matosinhos",
      "me_code": "402011"
    },
    {
      "name": "Agrupamento de Escolas de Freamunde, Paços de Ferreira",
      "concelho": "Paços de Ferreira",
      "me_code": "150769"
    },
    {
      "name": "Agrupamento de Escolas de Paços de Ferreira",
      "concelho": "Paços de Ferreira",
      "me_code": "151117"
    },
    {
      "name": "Agrupamento de Escolas de Eiriz, Paços de Ferreira",
      "concelho": "Paços de Ferreira",
      "me_code": "151476"
    },
    {
      "name": "Agrupamento de Escolas de Frazão, Paços de Ferreira",
      "concelho": "Paços de Ferreira",
      "me_code": "151488"
    },
    {
      "name": "Escola Secundária de Paços de Ferreira",
      "concelho": "Paços de Ferreira",
      "me_code": "403374"
    },
    {
      "name": "Agrupamento de Escolas de Cristelo, Paredes",
      "concelho": "Paredes",
      "me_code": "150770"
    },
    {
      "name": "Agrupamento de Escolas de Sobreira, Paredes",
      "concelho": "Paredes",
      "me_code": "150782"
    },
    {
      "name": "Agrupamento de Escolas de Lordelo, Paredes",
      "concelho": "Paredes",
      "me_code": "150861"
    },
    {
      "name": "Agrupamento de Escolas Daniel Faria, Paredes",
      "concelho": "Paredes",
      "me_code": "151452"
    },
    {
      "name": "Agrupamento de Escolas de Paredes",
      "concelho": "Paredes",
      "me_code": "151543"
    },
    {
      "name": "Agrupamento de Escolas de Vilela, Paredes",
      "concelho": "Paredes",
      "me_code": "151555"
    },
    {
      "name": "Escola Secundária de Paredes",
      "concelho": "Paredes",
      "me_code": "402424"
    },
    {
      "name": "Agrupamento de Escolas de Paço de Sousa, Penafiel",
      "concelho": "Penafiel",
      "me_code": "152535"
    },
    {
      "name": "Agrupamento de Escolas D. António Ferreira Gomes, Penafiel",
      "concelho": "Penafiel",
      "me_code": "152547"
    },
    {
      "name": "Agrupamento de Escolas Joaquim de Araújo, Penafiel",
      "concelho": "Penafiel",
      "me_code": "152559"
    },
    {
      "name": "Agrupamento de Escolas de Penafiel Sudeste",
      "concelho": "Penafiel",
      "me_code": "152560"
    },
    {
      "name": "Agrupamento de Escolas de Pinheiro, Penafiel",
      "concelho": "Penafiel",
      "me_code": "152572"
    },
    {
      "name": "Escola Secundária de Penafiel",
      "concelho": "Penafiel",
      "me_code": "402473"
    },
    {
      "name": "Agrupamento de Escolas do Viso, Porto",
      "concelho": "Porto",
      "me_code": "150400"
    },
    {
      "name": "Agrupamento de Escolas Fontes Pereira de Melo, Porto",
      "concelho": "Porto",
      "me_code": "150873"
    },
    {
      "name": "Agrupamento de Escolas Eugénio de Andrade, Porto",
      "concelho": "Porto",
      "me_code": "151385"
    },
    {
      "name": "Agrupamento de Escolas do Cerco, Porto",
      "concelho": "Porto",
      "me_code": "152158"
    },
    {
      "name": "Agrupamento de Escolas Pêro Vaz de Caminha, Porto",
      "concelho": "Porto",
      "me_code": "152160"
    },
    {
      "name": "Agrupamento de Escolas Infante D. Henrique, Porto",
      "concelho": "Porto",
      "me_code": "152171"
    },
    {
      "name": "Agrupamento de Escolas Carolina Michaelis, Porto",
      "concelho": "Porto",
      "me_code": "152183"
    },
    {
      "name": "Agrupamento de Escolas Manoel de Oliveira, Porto",
      "concelho": "Porto",
      "me_code": "152195"
    },
    {
      "name": "Agrupamento de Escolas Garcia de Orta, Porto",
      "concelho": "Porto",
      "me_code": "152201"
    },
    {
      "name": "Agrupamento de Escolas Leonardo Coimbra-Filho, Porto",
      "concelho": "Porto",
      "me_code": "152213"
    },
    {
      "name": "Agrupamento de Escolas Aurélia de Sousa, Porto",
      "concelho": "Porto",
      "me_code": "152225"
    },
    {
      "name": "Agrupamento de Escolas António Nobre, Porto",
      "concelho": "Porto",
      "me_code": "152237"
    },
    {
      "name": "Agrupamento de Escolas Clara de Resende, Porto",
      "concelho": "Porto",
      "me_code": "152870"
    },
    {
      "name": "Agrupamento de Escolas Rodrigues de Freitas, Porto",
      "concelho": "Porto",
      "me_code": "152950"
    },
    {
      "name": "Agrupamento de Escolas Alexandre Herculano, Porto",
      "concelho": "Porto",
      "me_code": "153000"
    },
    {
      "name": "Escola Secundária Filipa de Vilhena, Porto",
      "concelho": "Porto",
      "me_code": "401766"
    },
    {
      "name": "Escola Artística Soares dos Reis, Porto",
      "concelho": "Porto",
      "me_code": "404184"
    },
    {
      "name": "Escola Artística do Conservatório de Música do Porto",
      "concelho": "Porto",
      "me_code": "404214"
    },
    {
      "name": "Escola Profissional Infante D. Henrique",
      "concelho": "Porto",
      "me_code": "404378"
    },
    {
      "name": "Agrupamento de Escolas Dr. Flávio Gonçalves, Póvoa de Varzim",
      "concelho": "Póvoa de Varzim",
      "me_code": "152249"
    },
    {
      "name": "Agrupamento de Escolas Cego do Maio, Póvoa de Varzim",
      "concelho": "Póvoa de Varzim",
      "me_code": "152250"
    },
    {
      "name": "Agrupamento de Escolas de Aver-o-Mar, Póvoa de Varzim",
      "concelho": "Póvoa de Varzim",
      "me_code": "152262"
    },
    {
      "name": "Agrupamento de Escolas Campo Aberto, Póvoa de Varzim",
      "concelho": "Póvoa de Varzim",
      "me_code": "152274"
    },
    {
      "name": "Agrupamento de Escolas de Rates, Póvoa de Varzim",
      "concelho": "Póvoa de Varzim",
      "me_code": "152286"
    },
    {
      "name": "Escola Secundária Eça de Queirós, Póvoa de Varzim",
      "concelho": "Póvoa de Varzim",
      "me_code": "401675"
    },
    {
      "name": "Escola Secundária Rocha Peixoto, Póvoa de Varzim",
      "concelho": "Póvoa de Varzim",
      "me_code": "402680"
    },
    {
      "name": "Agrupamento de Escolas D. Afonso Henriques, Santo Tirso",
      "concelho": "Santo Tirso",
      "me_code": "151130"
    },
    {
      "name": "Agrupamento de Escolas Tomaz Pelayo, Santo Tirso",
      "concelho": "Santo Tirso",
      "me_code": "151142"
    },
    {
      "name": "Agrupamento de Escolas D.Dinis,Santo Tirso",
      "concelho": "Santo Tirso",
      "me_code": "152298"
    },
    {
      "name": "Agrupamento de Escolas de São Martinho, Santo Tirso",
      "concelho": "Santo Tirso",
      "me_code": "152304"
    },
    {
      "name": "Escola Básica da Ponte, Vila das Aves, Santo Tirso",
      "concelho": "Santo Tirso",
      "me_code": "330838"
    },
    {
      "name": "Escola Profissional Agrícola Conde de São Bento, Santo Tirso",
      "concelho": "Santo Tirso",
      "me_code": "404007"
    },
    {
      "name": "Agrupamento de Escolas de Coronado e Castro, Trofa",
      "concelho": "Trofa",
      "me_code": "151154"
    },
    {
      "name": "Agrupamento de Escolas da Trofa",
      "concelho": "Trofa",
      "me_code": "152316"
    },
    {
      "name": "Agrupamento de Escolas de São Lourenço, Valongo",
      "concelho": "Valongo",
      "me_code": "152328"
    },
    {
      "name": "Agrupamento de Escolas de Vallis Longus, Valongo",
      "concelho": "Valongo",
      "me_code": "152330"
    },
    {
      "name": "Agrupamento de Escolas de Campo, Valongo",
      "concelho": "Valongo",
      "me_code": "152341"
    },
    {
      "name": "Agrupamento de Escolas de Valongo",
      "concelho": "Valongo",
      "me_code": "152353"
    },
    {
      "name": "Agrupamento de Escolas de Alfena, Valongo",
      "concelho": "Valongo",
      "me_code": "152365"
    },
    {
      "name": "Agrupamento de Escolas de Ermesinde, Valongo",
      "concelho": "Valongo",
      "me_code": "152377"
    },
    {
      "name": "Agrupamento de Escolas Dr. Carlos Pinto Ferreira, Vila do Conde",
      "concelho": "Vila do Conde",
      "me_code": "150411"
    },
    {
      "name": "Agrupamento de Escolas D. Pedro IV, Vila do Conde",
      "concelho": "Vila do Conde",
      "me_code": "150848"
    },
    {
      "name": "Agrupamento de Escolas Frei João de Vila do Conde, Vila do Conde",
      "concelho": "Vila do Conde",
      "me_code": "152389"
    },
    {
      "name": "Agrupamento de Escolas D. Afonso Sanches, Vila do Conde",
      "concelho": "Vila do Conde",
      "me_code": "152390"
    },
    {
      "name": "Escola Secundária José Régio, Vila do Conde",
      "concelho": "Vila do Conde",
      "me_code": "401997"
    },
    {
      "name": "Agrupamento de Escolas Júlio Dinis, Vila Nova de Gaia",
      "concelho": "Vila Nova de Gaia",
      "me_code": "151397"
    },
    {
      "name": "Agrupamento de Escolas Sophia de Mello Breyner, Vila Nova de Gaia",
      "concelho": "Vila Nova de Gaia",
      "me_code": "151427"
    },
    {
      "name": "Agrupamento de Escolas da Madalena, Vila Nova de Gaia",
      "concelho": "Vila Nova de Gaia",
      "me_code": "152419"
    },
    {
      "name": "Agrupamento de Escolas Diogo de Macedo, Vila Nova de Gaia",
      "concelho": "Vila Nova de Gaia",
      "me_code": "152420"
    },
    {
      "name": "Agrupamento de Escolas Escultor António Fernandes Sá, Vila Nova de Gaia",
      "concelho": "Vila Nova de Gaia",
      "me_code": "152432"
    },
    {
      "name": "Agrupamento de Escolas António Sérgio, Vila Nova de Gaia",
      "concelho": "Vila Nova de Gaia",
      "me_code": "152444"
    },
    {
      "name": "Agrupamento de Escolas de Valadares, Vila Nova de Gaia",
      "concelho": "Vila Nova de Gaia",
      "me_code": "152456"
    },
    {
      "name": "Agrupamento de Escolas de Carvalhos, Vila Nova de Gaia",
      "concelho": "Vila Nova de Gaia",
      "me_code": "152468"
    },
    {
      "name": "Agrupamento de Escolas Soares dos Reis, Vila Nova de Gaia",
      "concelho": "Vila Nova de Gaia",
      "me_code": "152470"
    },
    {
      "name": "Agrupamento de Escolas de Canelas, Vila Nova de Gaia",
      "concelho": "Vila Nova de Gaia",
      "me_code": "152481"
    },
    {
      "name": "Agrupamento de Escolas de Vila D´Este, Vila Nova de Gaia",
      "concelho": "Vila Nova de Gaia",
      "me_code": "152493"
    },
    {
      "name": "Agrupamento de Escolas D. Pedro I, Vila Nova de Gaia",
      "concelho": "Vila Nova de Gaia",
      "me_code": "152500"
    },
    {
      "name": "Agrupamento de Escolas Dr. Costa Matos, Vila Nova de Gaia",
      "concelho": "Vila Nova de Gaia",
      "me_code": "152511"
    },
    {
      "name": "Agrupamento de Escolas Gaia Nascente, Vila Nova de Gaia",
      "concelho": "Vila Nova de Gaia",
      "me_code": "153011"
    },
    {
      "name": "Escola Secundária Almeida Garrett, Vila Nova de Gaia",
      "concelho": "Vila Nova de Gaia",
      "me_code": "400798"
    },
    {
      "name": "Escola Secundária Dr. Joaquim Gomes Ferreira Alves, Valadares, Vila Nova de Gaia",
      "concelho": "Vila Nova de Gaia",
      "me_code": "401468"
    },
    {
      "name": "Escola Secundária Inês de Castro, Canidelo, Vila Nova de Gaia",
      "concelho": "Vila Nova de Gaia",
      "me_code": "401936"
    },
    {
      "name": "Escola Secundária Arquitecto Oliveira Ferreira, Praia da Granja, Vila Nova de Gaia",
      "concelho": "Vila Nova de Gaia",
      "me_code": "403337"
    },
    {
      "name": "Agrupamento de Escolas de Escariz, Arouca",
      "concelho": "Arouca",
      "me_code": "151622"
    },
    {
      "name": "Agrupamento de Escolas de Arouca",
      "concelho": "Arouca",
      "me_code": "151634"
    }
  ],
  "Santarém": [
    {
      "name": "Agrupamento de Escolas Nº 2 de Abrantes",
      "concelho": "Abrantes",
      "me_code": "121502"
    },
    {
      "name": "Agrupamento de Escolas Nº 1 de Abrantes",
      "concelho": "Abrantes",
      "me_code": "170320"
    },
    {
      "name": "Escola Profissional de Desenvolvimento Rural de Abrantes, Mouriscas, Abrantes",
      "concelho": "Abrantes",
      "me_code": "404329"
    },
    {
      "name": "Agrupamento de Escolas de Alcanena",
      "concelho": "Alcanena",
      "me_code": "172390"
    },
    {
      "name": "Agrupamento de Escolas de Fazendas de Almeirim, Almeirim",
      "concelho": "Almeirim",
      "me_code": "170240"
    },
    {
      "name": "Agrupamento de Escolas de Almeirim",
      "concelho": "Almeirim",
      "me_code": "171293"
    },
    {
      "name": "Agrupamento de Escolas José Relvas, Alpiarça",
      "concelho": "Alpiarça",
      "me_code": "170630"
    },
    {
      "name": "Agrupamento de Escolas de Samora Correia, Benavente",
      "concelho": "Benavente",
      "me_code": "170331"
    },
    {
      "name": "Agrupamento de Escolas de Benavente",
      "concelho": "Benavente",
      "me_code": "170458"
    },
    {
      "name": "Agrupamento de Escolas de Fernão do Pó, Bombarral",
      "concelho": "Bombarral",
      "me_code": "171347"
    },
    {
      "name": "Agrupamento de Escolas D. Sancho I - Pontével, Cartaxo",
      "concelho": "Cartaxo",
      "me_code": "170379"
    },
    {
      "name": "Agrupamento de Escolas Marcelino Mesquita do Cartaxo",
      "concelho": "Cartaxo",
      "me_code": "171323"
    },
    {
      "name": "Agrupamento de Escolas da Chamusca",
      "concelho": "Chamusca",
      "me_code": "170471"
    },
    {
      "name": "Agrupamento de Escolas de Constância",
      "concelho": "Constância",
      "me_code": "170124"
    },
    {
      "name": "Agrupamento de Escolas de Coruche",
      "concelho": "Coruche",
      "me_code": "170367"
    },
    {
      "name": "Agrupamento de Escolas Cidade do Entroncamento",
      "concelho": "Entroncamento",
      "me_code": "170586"
    },
    {
      "name": "Agrupamento de Escolas de Ferreira do Zêzere",
      "concelho": "Ferreira do Zêzere",
      "me_code": "170525"
    },
    {
      "name": "Agrupamento de Escolas da Golegã, Azinhaga e Pombalinho, Golegã",
      "concelho": "Golegã",
      "me_code": "170460"
    },
    {
      "name": "Agrupamento de Escolas Verde Horizonte, Mação",
      "concelho": "Mação",
      "me_code": "160660"
    },
    {
      "name": "Agrupamento de Escolas de Ourém",
      "concelho": "Ourém",
      "me_code": "120960"
    },
    {
      "name": "Agrupamento de Escolas do Cónego Dr. Manuel Lopes Perdigão, Ourém",
      "concelho": "Ourém",
      "me_code": "170021"
    },
    {
      "name": "Agrupamento de Escolas Conde de Ourém, Ourém",
      "concelho": "Ourém",
      "me_code": "170057"
    },
    {
      "name": "Agrupamento de Escolas Marinhas do Sal, Rio Maior",
      "concelho": "Rio Maior",
      "me_code": "170501"
    },
    {
      "name": "Agrupamento de Escolas Fernando Casimiro Pereira da Silva, Rio Maior",
      "concelho": "Rio Maior",
      "me_code": "170513"
    },
    {
      "name": "Escola Secundária Dr. Augusto César da Silva Ferreira, Rio Maior",
      "concelho": "Rio Maior",
      "me_code": "401419"
    },
    {
      "name": "Agrupamento de Escolas de Marinhais, Salvaterra de Magos",
      "concelho": "Salvaterra de Magos",
      "me_code": "170355"
    },
    {
      "name": "Agrupamento de Escolas de Salvaterra de Magos",
      "concelho": "Salvaterra de Magos",
      "me_code": "170665"
    },
    {
      "name": "Agrupamento de Escolas D. Afonso Henriques, Santarém",
      "concelho": "Santarém",
      "me_code": "170409"
    },
    {
      "name": "Agrupamento de Escolas Alexandre Herculano, Santarém",
      "concelho": "Santarém",
      "me_code": "170550"
    },
    {
      "name": "Agrupamento de Escolas Sá da Bandeira, Santarém",
      "concelho": "Santarém",
      "me_code": "170562"
    },
    {
      "name": "Agrupamento de Escolas Dr. Ginestal Machado, Santarém",
      "concelho": "Santarém",
      "me_code": "170653"
    },
    {
      "name": "Agrupamento de Escolas do Sardoal",
      "concelho": "Sardoal",
      "me_code": "170069"
    },
    {
      "name": "Agrupamento de Escolas Nuno de Santa Maria, Tomar",
      "concelho": "Tomar",
      "me_code": "171207"
    },
    {
      "name": "Agrupamento de Escolas Templários, Tomar",
      "concelho": "Tomar",
      "me_code": "172479"
    },
    {
      "name": "Agrupamento de Escolas Gil Paes, Torres Novas",
      "concelho": "Torres Novas",
      "me_code": "170434"
    },
    {
      "name": "Agrupamento de Escolas Artur Gonçalves, Torres Novas",
      "concelho": "Torres Novas",
      "me_code": "172340"
    },
    {
      "name": "Agrupamento de Escolas de Vila Nova da Barquinha",
      "concelho": "Vila Nova da Barquinha",
      "me_code": "170392"
    }
  ],
  "Setúbal": [
    {
      "name": "Agrupamento de Escolas de Alcochete",
      "concelho": "Alcochete",
      "me_code": "121198"
    },
    {
      "name": "Agrupamento de Escolas da Trafaria, Almada",
      "concelho": "Almada",
      "me_code": "170173"
    },
    {
      "name": "Agrupamento de Escolas Elias Garcia, Almada",
      "concelho": "Almada",
      "me_code": "170215"
    },
    {
      "name": "Agrupamento de Escolas do Monte da Caparica, Almada",
      "concelho": "Almada",
      "me_code": "170227"
    },
    {
      "name": "Agrupamento de Escolas da Caparica, Almada",
      "concelho": "Almada",
      "me_code": "170926"
    },
    {
      "name": "Agrupamento de Escolas Emídio Navarro, Almada",
      "concelho": "Almada",
      "me_code": "170938"
    },
    {
      "name": "Agrupamento de Escolas António Gedeão, Almada",
      "concelho": "Almada",
      "me_code": "170940"
    },
    {
      "name": "Agrupamento de Escolas Romeu Correia, Almada",
      "concelho": "Almada",
      "me_code": "170951"
    },
    {
      "name": "Agrupamento de Escolas Miradouro de Alfazina, Almada",
      "concelho": "Almada",
      "me_code": "171839"
    },
    {
      "name": "Agrupamento de Escolas Daniel Sampaio, Almada",
      "concelho": "Almada",
      "me_code": "172194"
    },
    {
      "name": "Agrupamento de Escolas Professor Ruy Luís Gomes, Almada",
      "concelho": "Almada",
      "me_code": "172200"
    },
    {
      "name": "Agrupamento de Escolas Anselmo de Andrade, Almada",
      "concelho": "Almada",
      "me_code": "172212"
    },
    {
      "name": "Agrupamento de Escolas Carlos Gargaté, Charneca da Caparica, Almada",
      "concelho": "Almada",
      "me_code": "172327"
    },
    {
      "name": "Agrupamento de Escolas Francisco Simões, Almada",
      "concelho": "Almada",
      "me_code": "172406"
    },
    {
      "name": "Escola Secundária de Cacilhas-Tejo, Almada",
      "concelho": "Almada",
      "me_code": "401602"
    },
    {
      "name": "Escola Secundária Fernão Mendes Pinto, Pragal , Almada",
      "concelho": "Almada",
      "me_code": "401729"
    },
    {
      "name": "Agrupamento de Escolas de Santo André, Barreiro",
      "concelho": "Barreiro",
      "me_code": "120340"
    },
    {
      "name": "Agrupamento de Escolas de Santo António, Barreiro",
      "concelho": "Barreiro",
      "me_code": "121216"
    },
    {
      "name": "Agrupamento de Escolas do Barreiro",
      "concelho": "Barreiro",
      "me_code": "170148"
    },
    {
      "name": "Agrupamento de Escolas Augusto Cabrita, Barreiro",
      "concelho": "Barreiro",
      "me_code": "170628"
    },
    {
      "name": "Agrupamento de Escolas de Casquilhos, Barreiro",
      "concelho": "Barreiro",
      "me_code": "170884"
    },
    {
      "name": "Agrupamento de Escolas de Álvaro Velho, Barreiro",
      "concelho": "Barreiro",
      "me_code": "171050"
    },
    {
      "name": "Agrupamento de Escolas Alfredo da Silva, Barreiro",
      "concelho": "Barreiro",
      "me_code": "172352"
    },
    {
      "name": "Agrupamento de Escolas D. João I, Moita",
      "concelho": "Moita",
      "me_code": "170896"
    },
    {
      "name": "Agrupamento de Escolas do Vale da Amoreira, Moita",
      "concelho": "Moita",
      "me_code": "170902"
    },
    {
      "name": "Agrupamento de Escolas José Afonso, Moita",
      "concelho": "Moita",
      "me_code": "171013"
    },
    {
      "name": "Agrupamento de Escolas Mouzinho da Silveira, Moita",
      "concelho": "Moita",
      "me_code": "171220"
    },
    {
      "name": "Agrupamento de Escolas Fragata do Tejo, Moita",
      "concelho": "Moita",
      "me_code": "171300"
    },
    {
      "name": "Agrupamento de Escolas da Moita",
      "concelho": "Moita",
      "me_code": "171311"
    },
    {
      "name": "Escola Secundária da Baixa da Banheira, Vale da Amoreira, Moita",
      "concelho": "Moita",
      "me_code": "403234"
    },
    {
      "name": "Agrupamento de Escolas de Pegões, Canha e Santo Isidro, Montijo",
      "concelho": "Montijo",
      "me_code": "170100"
    },
    {
      "name": "Agrupamento de Escolas do Montijo",
      "concelho": "Montijo",
      "me_code": "171670"
    },
    {
      "name": "Agrupamento de Escolas Poeta Joaquim Serra, Montijo",
      "concelho": "Montijo",
      "me_code": "172418"
    },
    {
      "name": "Escola Secundária Jorge Peixinho, Montijo",
      "concelho": "Montijo",
      "me_code": "401948"
    },
    {
      "name": "Agrupamento de Escolas José Saramago, Palmela",
      "concelho": "Palmela",
      "me_code": "121265"
    },
    {
      "name": "Agrupamento de Escolas de Palmela",
      "concelho": "Palmela",
      "me_code": "171104"
    },
    {
      "name": "Agrupamento de Escolas José Maria dos Santos, Palmela",
      "concelho": "Palmela",
      "me_code": "172145"
    },
    {
      "name": "Escola Secundária de Palmela",
      "concelho": "Palmela",
      "me_code": "403210"
    },
    {
      "name": "Escola Secundária de Pinhal Novo, Palmela",
      "concelho": "Palmela",
      "me_code": "403222"
    },
    {
      "name": "Agrupamento de Escolas de Vale de Milhaços, Seixal",
      "concelho": "Seixal",
      "me_code": "170835"
    },
    {
      "name": "Agrupamento de Escolas de Pinhal de Frades, Seixal",
      "concelho": "Seixal",
      "me_code": "170847"
    },
    {
      "name": "Agrupamento de Escolas Nun´Álvares, Seixal",
      "concelho": "Seixal",
      "me_code": "170859"
    },
    {
      "name": "Agrupamento de Escolas Dr. António Augusto Louro, Seixal",
      "concelho": "Seixal",
      "me_code": "170860"
    },
    {
      "name": "Agrupamento de Escolas Pedro Eanes Lobato, Seixal",
      "concelho": "Seixal",
      "me_code": "170872"
    },
    {
      "name": "Agrupamento de Escolas João de Barros, Seixal",
      "concelho": "Seixal",
      "me_code": "171268"
    },
    {
      "name": "Agrupamento de Escolas Terras de Larus, Seixal",
      "concelho": "Seixal",
      "me_code": "171270"
    },
    {
      "name": "Agrupamento de Escolas Paulo da Gama, Seixal",
      "concelho": "Seixal",
      "me_code": "171281"
    },
    {
      "name": "Escola Secundária Alfredo dos Reis Silveira, Cavadas, Seixal",
      "concelho": "Seixal",
      "me_code": "400786"
    },
    {
      "name": "Escola Secundária Dr. José Afonso, Arrentela, Seixal",
      "concelho": "Seixal",
      "me_code": "401481"
    },
    {
      "name": "Escola Secundária Manuel Cargaleiro, Amora, Seixal",
      "concelho": "Seixal",
      "me_code": "402114"
    },
    {
      "name": "Escola Secundária da Amora, Seixal",
      "concelho": "Seixal",
      "me_code": "403209"
    },
    {
      "name": "Agrupamento de Escolas da Quinta do Conde, Sesimbra",
      "concelho": "Sesimbra",
      "me_code": "170094"
    },
    {
      "name": "Agrupamento de Escolas Michel Giacometti, Sesimbra",
      "concelho": "Sesimbra",
      "me_code": "170823"
    },
    {
      "name": "Agrupamento de Escolas de Sampaio, Sesimbra",
      "concelho": "Sesimbra",
      "me_code": "170914"
    },
    {
      "name": "Agrupamento de Escolas Navegador Rodrigues Soromenho, Sesimbra",
      "concelho": "Sesimbra",
      "me_code": "171062"
    },
    {
      "name": "Agrupamento de Escolas Boa Água, Sesimbra",
      "concelho": "Sesimbra",
      "me_code": "172388"
    },
    {
      "name": "Agrupamento de Escolas Sebastião da Gama, Setúbal",
      "concelho": "Setúbal",
      "me_code": "171025"
    },
    {
      "name": "Agrupamento de Escolas Ordem de Santiago, Setúbal",
      "concelho": "Setúbal",
      "me_code": "171037"
    },
    {
      "name": "Agrupamento de Escolas de Azeitão, Setúbal",
      "concelho": "Setúbal",
      "me_code": "171049"
    },
    {
      "name": "Agrupamento de Escolas Luísa Todi, Setúbal",
      "concelho": "Setúbal",
      "me_code": "171256"
    },
    {
      "name": "Agrupamento de Escolas Barbosa du Bocage, Setúbal",
      "concelho": "Setúbal",
      "me_code": "171359"
    },
    {
      "name": "Agrupamento de Escolas Lima de Freitas, Setúbal",
      "concelho": "Setúbal",
      "me_code": "172169"
    },
    {
      "name": "Escola Secundária Dom Manuel Martins, Setúbal",
      "concelho": "Setúbal",
      "me_code": "400105"
    },
    {
      "name": "Escola Secundária du Bocage, Setúbal",
      "concelho": "Setúbal",
      "me_code": "401018"
    },
    {
      "name": "Escola Secundária D. João II, Setúbal",
      "concelho": "Setúbal",
      "me_code": "401316"
    },
    {
      "name": "Agrupamento de Escolas de Alandroal",
      "concelho": "Alandroal",
      "me_code": "135124"
    },
    {
      "name": "Agrupamento de Escolas de Alcácer do Sal",
      "concelho": "Alcácer do Sal",
      "me_code": "130345"
    },
    {
      "name": "Agrupamento de Escolas de Torrão, Alcácer do Sal",
      "concelho": "Alcácer do Sal",
      "me_code": "135343"
    },
    {
      "name": "Agrupamento de Escolas de Grândola",
      "concelho": "Grândola",
      "me_code": "130308"
    },
    {
      "name": "Escola Profissional de Desenvolvimento Rural de Grândola",
      "concelho": "Grândola",
      "me_code": "404342"
    },
    {
      "name": "Agrupamento de Escolas Prof. Arménio Lança, Santiago do Cacém",
      "concelho": "Santiago do Cacém",
      "me_code": "135355"
    },
    {
      "name": "Agrupamento de Escolas de Cercal do Alentejo, Santiago do Cacém",
      "concelho": "Santiago do Cacém",
      "me_code": "135446"
    },
    {
      "name": "Agrupamento de Escolas de Santiago do Cacém",
      "concelho": "Santiago do Cacém",
      "me_code": "135501"
    },
    {
      "name": "Agrupamento de Escolas de Santo André, Santiago do Cacém",
      "concelho": "Santiago do Cacém",
      "me_code": "135513"
    }
  ],
  "Viana do Castelo": [
    {
      "name": "Agrupamento de Escolas de Valdevez, Arcos de Valdevez",
      "concelho": "Arcos de Valdevez",
      "me_code": "152584"
    },
    {
      "name": "Agrupamento de Escolas Sidónio Pais, Caminha",
      "concelho": "Caminha",
      "me_code": "152596"
    },
    {
      "name": "Agrupamento de Escolas de Melgaço",
      "concelho": "Melgaço",
      "me_code": "152602"
    },
    {
      "name": "Agrupamento de Escolas de Monção",
      "concelho": "Monção",
      "me_code": "153023"
    },
    {
      "name": "Agrupamento de Escolas de Paredes de Coura",
      "concelho": "Paredes de Coura",
      "me_code": "152614"
    },
    {
      "name": "Agrupamento de Escolas de Ponte da Barca",
      "concelho": "Ponte da Barca",
      "me_code": "152626"
    },
    {
      "name": "Agrupamento de Escolas de Ponte de Lima",
      "concelho": "Ponte de Lima",
      "me_code": "152638"
    },
    {
      "name": "Agrupamento de Escolas de Arcozelo, Ponte de Lima",
      "concelho": "Ponte de Lima",
      "me_code": "152640"
    },
    {
      "name": "Agrupamento de Escolas António Feijó, Ponte de Lima",
      "concelho": "Ponte de Lima",
      "me_code": "152651"
    },
    {
      "name": "Agrupamento de Escolas de Freixo, Ponte de Lima",
      "concelho": "Ponte de Lima",
      "me_code": "152663"
    },
    {
      "name": "Escola Profissional de Agricultura e Desenvolvimento Rural de Ponte de Lima",
      "concelho": "Ponte de Lima",
      "me_code": "404287"
    },
    {
      "name": "Agrupamento de Escolas de Muralhas do Minho, Valença",
      "concelho": "Valença",
      "me_code": "150587"
    },
    {
      "name": "Agrupamento de Escolas da Abelheira, Viana do Castelo",
      "concelho": "Viana do Castelo",
      "me_code": "150083"
    },
    {
      "name": "Agrupamento de Escolas de Monserrate, Viana do Castelo",
      "concelho": "Viana do Castelo",
      "me_code": "150381"
    },
    {
      "name": "Agrupamento de Escolas de Santa Maria Maior, Viana do Castelo",
      "concelho": "Viana do Castelo",
      "me_code": "151567"
    },
    {
      "name": "Agrupamento de Escolas de Arga e Lima, Viana do Castelo",
      "concelho": "Viana do Castelo",
      "me_code": "151580"
    },
    {
      "name": "Agrupamento de Escolas Pintor José de Brito, Viana do Castelo",
      "concelho": "Viana do Castelo",
      "me_code": "151592"
    },
    {
      "name": "Agrupamento de Escolas de Barroselas, Viana do Castelo",
      "concelho": "Viana do Castelo",
      "me_code": "152675"
    },
    {
      "name": "Agrupamento de Escolas de Monte da Ola, Viana do Castelo",
      "concelho": "Viana do Castelo",
      "me_code": "152687"
    },
    {
      "name": "Agrupamento de Escolas de Vila Nova de Cerveira",
      "concelho": "Vila Nova de Cerveira",
      "me_code": "151579"
    },
    {
      "name": "Agrupamento de Escolas de Viana do Alentejo",
      "concelho": "Viana do Alentejo",
      "me_code": "135173"
    }
  ],
  "Vila Real": [
    {
      "name": "Agrupamento de Escolas D.Sancho II, Alijó",
      "concelho": "Alijó",
      "me_code": "152699"
    },
    {
      "name": "Agrupamento de Escolas Gomes Monteiro, Boticas",
      "concelho": "Boticas",
      "me_code": "152717"
    },
    {
      "name": "Agrupamento de Escolas Fernão de Magalhães, Chaves",
      "concelho": "Chaves",
      "me_code": "150230"
    },
    {
      "name": "Agrupamento de Escolas Dr. Júlio Martins, Chaves",
      "concelho": "Chaves",
      "me_code": "152729"
    },
    {
      "name": "Agrupamento de Escolas Dr. António Granjo, Chaves",
      "concelho": "Chaves",
      "me_code": "152730"
    },
    {
      "name": "Agrupamento de Escolas Professor António da Natividade, Mesão Frio",
      "concelho": "Mesão Frio",
      "me_code": "152742"
    },
    {
      "name": "Agrupamento de Escolas de Mondim de Basto",
      "concelho": "Mondim de Basto",
      "me_code": "152754"
    },
    {
      "name": "Agrupamento de Escolas Dr. Bento da Cruz, Montalegre",
      "concelho": "Montalegre",
      "me_code": "152766"
    },
    {
      "name": "Agrupamento de Escolas de Murça",
      "concelho": "Murça",
      "me_code": "152778"
    },
    {
      "name": "Agrupamento de Escolas Dr. João Araújo Correia, Peso da Régua",
      "concelho": "Peso da Régua",
      "me_code": "152780"
    },
    {
      "name": "Escola Profissional de Desenvolvimento Rural do Rodo, Peso da Régua",
      "concelho": "Peso da Régua",
      "me_code": "404068"
    },
    {
      "name": "Agrupamento de Escolas de Ribeira de Pena",
      "concelho": "Ribeira de Pena",
      "me_code": "152791"
    },
    {
      "name": "Agrupamento de Escolas Miguel Torga, Sabrosa",
      "concelho": "Sabrosa",
      "me_code": "152808"
    },
    {
      "name": "Agrupamento de Escolas de Santa Marta de Penaguião",
      "concelho": "Santa Marta de Penaguião",
      "me_code": "152810"
    },
    {
      "name": "Agrupamento de Escolas de Valpaços",
      "concelho": "Valpaços",
      "me_code": "152821"
    },
    {
      "name": "Agrupamento de Escolas de Vila Pouca de Aguiar - Sul",
      "concelho": "Vila Pouca de Aguiar",
      "me_code": "150666"
    },
    {
      "name": "Agrupamento de Escolas Morgado de Mateus, Vila Real",
      "concelho": "Vila Real",
      "me_code": "152857"
    },
    {
      "name": "Agrupamento de Escolas Diogo Cão, Vila Real",
      "concelho": "Vila Real",
      "me_code": "152869"
    },
    {
      "name": "Escola Secundária Camilo Castelo Branco, Vila Real",
      "concelho": "Vila Real",
      "me_code": "401079"
    },
    {
      "name": "Escola Secundária São Pedro, Vila Real",
      "concelho": "Vila Real",
      "me_code": "402874"
    }
  ],
  "Viseu": [
    {
      "name": "Agrupamento de Escolas Gomes Teixeira, Armamar",
      "concelho": "Armamar",
      "me_code": "151853"
    },
    {
      "name": "Agrupamento de Escolas General Serpa Pinto, Cinfães",
      "concelho": "Cinfães",
      "me_code": "151865"
    },
    {
      "name": "Agrupamento de Escolas de Souselo, Cinfães",
      "concelho": "Cinfães",
      "me_code": "151877"
    },
    {
      "name": "Escola Secundária Professor Doutor Flávio F. Pinto Resende, Cinfães",
      "concelho": "Cinfães",
      "me_code": "402564"
    },
    {
      "name": "Agrupamento de Escolas Latino Coelho, Lamego",
      "concelho": "Lamego",
      "me_code": "151889"
    },
    {
      "name": "Agrupamento de Escolas da Sé, Lamego",
      "concelho": "Lamego",
      "me_code": "152948"
    },
    {
      "name": "Agrupamento de Escolas de Moimenta da Beira",
      "concelho": "Moimenta da Beira",
      "me_code": "151890"
    },
    {
      "name": "Agrupamento de Escolas de Resende",
      "concelho": "Resende",
      "me_code": "151907"
    },
    {
      "name": "Agrupamento de Escolas de São João da Pesqueira",
      "concelho": "São João da Pesqueira",
      "me_code": "151919"
    },
    {
      "name": "Agrupamento de Escolas Padre João Rodrigues, Sernancelhe",
      "concelho": "Sernancelhe",
      "me_code": "151920"
    },
    {
      "name": "Agrupamento de Escolas Abel Botelho, Tabuaço",
      "concelho": "Tabuaço",
      "me_code": "151932"
    },
    {
      "name": "Agrupamento de Escolas Dr. José Leite de Vasconcelos, Tarouca",
      "concelho": "Tarouca",
      "me_code": "151944"
    },
    {
      "name": "Agrupamento de Escolas de Carregal do Sal",
      "concelho": "Carregal do Sal",
      "me_code": "161706"
    },
    {
      "name": "Agrupamento de Escolas de Castro Daire",
      "concelho": "Castro Daire",
      "me_code": "161718"
    },
    {
      "name": "Agrupamento de Escolas de Mangualde",
      "concelho": "Mangualde",
      "me_code": "161895"
    },
    {
      "name": "Agrupamento de Escolas de Mortágua",
      "concelho": "Mortágua",
      "me_code": "161743"
    },
    {
      "name": "Agrupamento de Escolas de Canas de Senhorim, Nelas",
      "concelho": "Nelas",
      "me_code": "161755"
    },
    {
      "name": "Agrupamento de Escolas de Nelas",
      "concelho": "Nelas",
      "me_code": "161767"
    },
    {
      "name": "Agrupamento de Escolas de Oliveira de Frades",
      "concelho": "Oliveira de Frades",
      "me_code": "161779"
    },
    {
      "name": "Agrupamento de Escolas de Penalva do Castelo",
      "concelho": "Penalva do Castelo",
      "me_code": "160416"
    },
    {
      "name": "Agrupamento de Escolas de Santa Comba Dão",
      "concelho": "Santa Comba Dão",
      "me_code": "161792"
    },
    {
      "name": "Agrupamento de Escolas de Santa Cruz da Trapa, São Pedro do Sul",
      "concelho": "São Pedro do Sul",
      "me_code": "160465"
    },
    {
      "name": "Agrupamento de Escolas de São Pedro do Sul",
      "concelho": "São Pedro do Sul",
      "me_code": "161780"
    },
    {
      "name": "Agrupamento de Escolas de Sátão",
      "concelho": "Sátão",
      "me_code": "161913"
    },
    {
      "name": "Agrupamento de Escolas de Tondela Candido de Figueiredo",
      "concelho": "Tondela",
      "me_code": "161822"
    },
    {
      "name": "Agrupamento de Escolas de Tondela Tomaz Ribeiro",
      "concelho": "Tondela",
      "me_code": "161998"
    },
    {
      "name": "Agrupamento de Escolas de Vila Nova de Paiva",
      "concelho": "Vila Nova de Paiva",
      "me_code": "161883"
    },
    {
      "name": "Agrupamento de Escolas de Mundão, Viseu",
      "concelho": "Viseu",
      "me_code": "160593"
    },
    {
      "name": "Agrupamento de Escolas Viseu Norte",
      "concelho": "Viseu",
      "me_code": "160635"
    },
    {
      "name": "Agrupamento de Escolas Grão Vasco",
      "concelho": "Viseu",
      "me_code": "161858"
    },
    {
      "name": "Agrupamento de Escolas Infante D. Henrique, Repeses, Viseu",
      "concelho": "Viseu",
      "me_code": "161860"
    },
    {
      "name": "Agrupamento de Escolas de Viso, Viseu",
      "concelho": "Viseu",
      "me_code": "161871"
    },
    {
      "name": "Escola Secundária Alves Martins, Viseu",
      "concelho": "Viseu",
      "me_code": "400002"
    },
    {
      "name": "Escola Secundária Emídio Navarro, Viseu",
      "concelho": "Viseu",
      "me_code": "401626"
    },
    {
      "name": "Escola Secundária Viriato, Abraveses, Viseu",
      "concelho": "Viseu",
      "me_code": "402977"
    },
    {
      "name": "Agrupamento de Escolas de Vouzela e Campia",
      "concelho": "Vouzela",
      "me_code": "160453"
    },
    {
      "name": "Agrupamento de Escolas de Vouzela",
      "concelho": "Vouzela",
      "me_code": "160532"
    }
  ]
} as const;

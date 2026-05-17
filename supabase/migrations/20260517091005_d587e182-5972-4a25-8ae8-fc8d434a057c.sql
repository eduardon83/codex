
-- 1. COUNTRIES
CREATE TABLE IF NOT EXISTS public.countries (
  code text PRIMARY KEY,
  name_pt text NOT NULL, name_en text NOT NULL, name_es text NOT NULL, name_fr text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read countries" ON public.countries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage countries" ON public.countries FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
INSERT INTO public.countries (code, name_pt, name_en, name_es, name_fr) VALUES
  ('PT','Portugal','Portugal','Portugal','Portugal'),('ES','Espanha','Spain','España','Espagne'),
  ('FR','França','France','Francia','France'),('GB','Reino Unido','United Kingdom','Reino Unido','Royaume-Uni'),
  ('DE','Alemanha','Germany','Alemania','Allemagne'),('IT','Itália','Italy','Italia','Italie'),
  ('BR','Brasil','Brazil','Brasil','Brésil'),('DK','Dinamarca','Denmark','Dinamarca','Danemark'),
  ('NO','Noruega','Norway','Noruega','Norvège'),('SE','Suécia','Sweden','Suecia','Suède')
ON CONFLICT (code) DO NOTHING;

-- 2. DISTRICTS — add name_en, seed all
ALTER TABLE public.districts ADD COLUMN IF NOT EXISTS name_en text;
INSERT INTO public.districts (id, country_code, name, name_en, region) VALUES
  (gen_random_uuid(),'PT','Aveiro','Aveiro','Centro'),(gen_random_uuid(),'PT','Beja','Beja','Alentejo'),
  (gen_random_uuid(),'PT','Braga','Braga','Norte'),(gen_random_uuid(),'PT','Bragança','Bragança','Norte'),
  (gen_random_uuid(),'PT','Castelo Branco','Castelo Branco','Centro'),(gen_random_uuid(),'PT','Coimbra','Coimbra','Centro'),
  (gen_random_uuid(),'PT','Évora','Évora','Alentejo'),(gen_random_uuid(),'PT','Faro','Faro','Algarve'),
  (gen_random_uuid(),'PT','Guarda','Guarda','Centro'),(gen_random_uuid(),'PT','Leiria','Leiria','Centro'),
  (gen_random_uuid(),'PT','Lisboa','Lisbon','Lisboa'),(gen_random_uuid(),'PT','Portalegre','Portalegre','Alentejo'),
  (gen_random_uuid(),'PT','Porto','Porto','Norte'),(gen_random_uuid(),'PT','Santarém','Santarém','Centro'),
  (gen_random_uuid(),'PT','Setúbal','Setúbal','Lisboa'),(gen_random_uuid(),'PT','Viana do Castelo','Viana do Castelo','Norte'),
  (gen_random_uuid(),'PT','Vila Real','Vila Real','Norte'),(gen_random_uuid(),'PT','Viseu','Viseu','Centro'),
  (gen_random_uuid(),'PT','Região Autónoma dos Açores','Azores','Açores'),
  (gen_random_uuid(),'PT','Região Autónoma da Madeira','Madeira','Madeira');
INSERT INTO public.districts (id, country_code, name, name_en) VALUES
  (gen_random_uuid(),'ES','Andalucía','Andalusia'),(gen_random_uuid(),'ES','Aragón','Aragon'),(gen_random_uuid(),'ES','Asturias','Asturias'),
  (gen_random_uuid(),'ES','Islas Baleares','Balearic Islands'),(gen_random_uuid(),'ES','Canarias','Canary Islands'),
  (gen_random_uuid(),'ES','Cantabria','Cantabria'),(gen_random_uuid(),'ES','Castilla-La Mancha','Castile-La Mancha'),
  (gen_random_uuid(),'ES','Castilla y León','Castile and León'),(gen_random_uuid(),'ES','Cataluña','Catalonia'),
  (gen_random_uuid(),'ES','Comunidad Valenciana','Valencian Community'),(gen_random_uuid(),'ES','Extremadura','Extremadura'),
  (gen_random_uuid(),'ES','Galicia','Galicia'),(gen_random_uuid(),'ES','La Rioja','La Rioja'),
  (gen_random_uuid(),'ES','Madrid','Madrid'),(gen_random_uuid(),'ES','Murcia','Murcia'),
  (gen_random_uuid(),'ES','Navarra','Navarre'),(gen_random_uuid(),'ES','País Vasco','Basque Country'),
  (gen_random_uuid(),'FR','Auvergne-Rhône-Alpes','Auvergne-Rhône-Alpes'),(gen_random_uuid(),'FR','Bourgogne-Franche-Comté','Burgundy-Franche-Comté'),
  (gen_random_uuid(),'FR','Bretagne','Brittany'),(gen_random_uuid(),'FR','Centre-Val de Loire','Centre-Val de Loire'),
  (gen_random_uuid(),'FR','Corse','Corsica'),(gen_random_uuid(),'FR','Grand Est','Grand Est'),
  (gen_random_uuid(),'FR','Hauts-de-France','Hauts-de-France'),(gen_random_uuid(),'FR','Île-de-France','Île-de-France'),
  (gen_random_uuid(),'FR','Normandie','Normandy'),(gen_random_uuid(),'FR','Nouvelle-Aquitaine','New Aquitaine'),
  (gen_random_uuid(),'FR','Occitanie','Occitania'),(gen_random_uuid(),'FR','Pays de la Loire','Pays de la Loire'),
  (gen_random_uuid(),'FR','Provence-Alpes-Côte d''Azur','Provence-Alpes-Côte d''Azur'),
  (gen_random_uuid(),'GB','England','England'),(gen_random_uuid(),'GB','Scotland','Scotland'),
  (gen_random_uuid(),'GB','Wales','Wales'),(gen_random_uuid(),'GB','Northern Ireland','Northern Ireland'),
  (gen_random_uuid(),'DE','Baden-Württemberg','Baden-Württemberg'),(gen_random_uuid(),'DE','Bayern','Bavaria'),
  (gen_random_uuid(),'DE','Berlin','Berlin'),(gen_random_uuid(),'DE','Brandenburg','Brandenburg'),
  (gen_random_uuid(),'DE','Bremen','Bremen'),(gen_random_uuid(),'DE','Hamburg','Hamburg'),
  (gen_random_uuid(),'DE','Hessen','Hesse'),(gen_random_uuid(),'DE','Mecklenburg-Vorpommern','Mecklenburg-Vorpommern'),
  (gen_random_uuid(),'DE','Niedersachsen','Lower Saxony'),(gen_random_uuid(),'DE','Nordrhein-Westfalen','North Rhine-Westphalia'),
  (gen_random_uuid(),'DE','Rheinland-Pfalz','Rhineland-Palatinate'),(gen_random_uuid(),'DE','Saarland','Saarland'),
  (gen_random_uuid(),'DE','Sachsen','Saxony'),(gen_random_uuid(),'DE','Sachsen-Anhalt','Saxony-Anhalt'),
  (gen_random_uuid(),'DE','Schleswig-Holstein','Schleswig-Holstein'),(gen_random_uuid(),'DE','Thüringen','Thuringia'),
  (gen_random_uuid(),'IT','Abruzzo','Abruzzo'),(gen_random_uuid(),'IT','Basilicata','Basilicata'),
  (gen_random_uuid(),'IT','Calabria','Calabria'),(gen_random_uuid(),'IT','Campania','Campania'),
  (gen_random_uuid(),'IT','Emilia-Romagna','Emilia-Romagna'),(gen_random_uuid(),'IT','Friuli-Venezia Giulia','Friuli-Venezia Giulia'),
  (gen_random_uuid(),'IT','Lazio','Lazio'),(gen_random_uuid(),'IT','Liguria','Liguria'),
  (gen_random_uuid(),'IT','Lombardia','Lombardy'),(gen_random_uuid(),'IT','Marche','Marche'),
  (gen_random_uuid(),'IT','Molise','Molise'),(gen_random_uuid(),'IT','Piemonte','Piedmont'),
  (gen_random_uuid(),'IT','Puglia','Apulia'),(gen_random_uuid(),'IT','Sardegna','Sardinia'),
  (gen_random_uuid(),'IT','Sicilia','Sicily'),(gen_random_uuid(),'IT','Toscana','Tuscany'),
  (gen_random_uuid(),'IT','Trentino-Alto Adige','Trentino-Alto Adige'),(gen_random_uuid(),'IT','Umbria','Umbria'),
  (gen_random_uuid(),'IT','Valle d''Aosta','Aosta Valley'),(gen_random_uuid(),'IT','Veneto','Veneto'),
  (gen_random_uuid(),'BR','Acre','Acre'),(gen_random_uuid(),'BR','Alagoas','Alagoas'),(gen_random_uuid(),'BR','Amapá','Amapá'),
  (gen_random_uuid(),'BR','Amazonas','Amazonas'),(gen_random_uuid(),'BR','Bahia','Bahia'),(gen_random_uuid(),'BR','Ceará','Ceará'),
  (gen_random_uuid(),'BR','Distrito Federal','Federal District'),(gen_random_uuid(),'BR','Espírito Santo','Espírito Santo'),
  (gen_random_uuid(),'BR','Goiás','Goiás'),(gen_random_uuid(),'BR','Maranhão','Maranhão'),
  (gen_random_uuid(),'BR','Mato Grosso','Mato Grosso'),(gen_random_uuid(),'BR','Mato Grosso do Sul','Mato Grosso do Sul'),
  (gen_random_uuid(),'BR','Minas Gerais','Minas Gerais'),(gen_random_uuid(),'BR','Pará','Pará'),
  (gen_random_uuid(),'BR','Paraíba','Paraíba'),(gen_random_uuid(),'BR','Paraná','Paraná'),
  (gen_random_uuid(),'BR','Pernambuco','Pernambuco'),(gen_random_uuid(),'BR','Piauí','Piauí'),
  (gen_random_uuid(),'BR','Rio de Janeiro','Rio de Janeiro'),(gen_random_uuid(),'BR','Rio Grande do Norte','Rio Grande do Norte'),
  (gen_random_uuid(),'BR','Rio Grande do Sul','Rio Grande do Sul'),(gen_random_uuid(),'BR','Rondônia','Rondônia'),
  (gen_random_uuid(),'BR','Roraima','Roraima'),(gen_random_uuid(),'BR','Santa Catarina','Santa Catarina'),
  (gen_random_uuid(),'BR','São Paulo','São Paulo'),(gen_random_uuid(),'BR','Sergipe','Sergipe'),(gen_random_uuid(),'BR','Tocantins','Tocantins'),
  (gen_random_uuid(),'DK','Hovedstaden','Capital Region'),(gen_random_uuid(),'DK','Sjælland','Zealand'),
  (gen_random_uuid(),'DK','Syddanmark','Southern Denmark'),(gen_random_uuid(),'DK','Midtjylland','Central Jutland'),
  (gen_random_uuid(),'DK','Nordjylland','North Jutland'),
  (gen_random_uuid(),'NO','Oslo','Oslo'),(gen_random_uuid(),'NO','Rogaland','Rogaland'),
  (gen_random_uuid(),'NO','Møre og Romsdal','Møre og Romsdal'),(gen_random_uuid(),'NO','Nordland','Nordland'),
  (gen_random_uuid(),'NO','Viken','Viken'),(gen_random_uuid(),'NO','Innlandet','Innlandet'),
  (gen_random_uuid(),'NO','Vestfold og Telemark','Vestfold og Telemark'),(gen_random_uuid(),'NO','Agder','Agder'),
  (gen_random_uuid(),'NO','Vestland','Vestland'),(gen_random_uuid(),'NO','Trøndelag','Trøndelag'),
  (gen_random_uuid(),'NO','Troms og Finnmark','Troms og Finnmark'),
  (gen_random_uuid(),'SE','Stockholm','Stockholm'),(gen_random_uuid(),'SE','Uppsala','Uppsala'),
  (gen_random_uuid(),'SE','Södermanland','Södermanland'),(gen_random_uuid(),'SE','Östergötland','Östergötland'),
  (gen_random_uuid(),'SE','Jönköping','Jönköping'),(gen_random_uuid(),'SE','Kronoberg','Kronoberg'),
  (gen_random_uuid(),'SE','Kalmar','Kalmar'),(gen_random_uuid(),'SE','Gotland','Gotland'),
  (gen_random_uuid(),'SE','Blekinge','Blekinge'),(gen_random_uuid(),'SE','Skåne','Scania'),
  (gen_random_uuid(),'SE','Halland','Halland'),(gen_random_uuid(),'SE','Västra Götaland','Västra Götaland'),
  (gen_random_uuid(),'SE','Värmland','Värmland'),(gen_random_uuid(),'SE','Örebro','Örebro'),
  (gen_random_uuid(),'SE','Västmanland','Västmanland'),(gen_random_uuid(),'SE','Dalarna','Dalarna'),
  (gen_random_uuid(),'SE','Gävleborg','Gävleborg'),(gen_random_uuid(),'SE','Västernorrland','Västernorrland'),
  (gen_random_uuid(),'SE','Jämtland','Jämtland'),(gen_random_uuid(),'SE','Västerbotten','Västerbotten'),
  (gen_random_uuid(),'SE','Norrbotten','Norrbotten');

-- 3. CITIES
CREATE TABLE IF NOT EXISTS public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  name text NOT NULL, name_en text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cities_district ON public.cities(district_id);
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cities" ON public.cities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage cities" ON public.cities FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 4. PT CONCELHOS (308)
DO $$
DECLARE
  d_aveiro uuid; d_beja uuid; d_braga uuid; d_braganca uuid; d_cb uuid;
  d_coimbra uuid; d_evora uuid; d_faro uuid; d_guarda uuid; d_leiria uuid;
  d_lisboa uuid; d_portalegre uuid; d_porto uuid; d_santarem uuid; d_setubal uuid;
  d_viana uuid; d_vilareal uuid; d_viseu uuid; d_acores uuid; d_madeira uuid;
BEGIN
  SELECT id INTO d_aveiro FROM public.districts WHERE country_code='PT' AND name='Aveiro';
  SELECT id INTO d_beja FROM public.districts WHERE country_code='PT' AND name='Beja';
  SELECT id INTO d_braga FROM public.districts WHERE country_code='PT' AND name='Braga';
  SELECT id INTO d_braganca FROM public.districts WHERE country_code='PT' AND name='Bragança';
  SELECT id INTO d_cb FROM public.districts WHERE country_code='PT' AND name='Castelo Branco';
  SELECT id INTO d_coimbra FROM public.districts WHERE country_code='PT' AND name='Coimbra';
  SELECT id INTO d_evora FROM public.districts WHERE country_code='PT' AND name='Évora';
  SELECT id INTO d_faro FROM public.districts WHERE country_code='PT' AND name='Faro';
  SELECT id INTO d_guarda FROM public.districts WHERE country_code='PT' AND name='Guarda';
  SELECT id INTO d_leiria FROM public.districts WHERE country_code='PT' AND name='Leiria';
  SELECT id INTO d_lisboa FROM public.districts WHERE country_code='PT' AND name='Lisboa';
  SELECT id INTO d_portalegre FROM public.districts WHERE country_code='PT' AND name='Portalegre';
  SELECT id INTO d_porto FROM public.districts WHERE country_code='PT' AND name='Porto';
  SELECT id INTO d_santarem FROM public.districts WHERE country_code='PT' AND name='Santarém';
  SELECT id INTO d_setubal FROM public.districts WHERE country_code='PT' AND name='Setúbal';
  SELECT id INTO d_viana FROM public.districts WHERE country_code='PT' AND name='Viana do Castelo';
  SELECT id INTO d_vilareal FROM public.districts WHERE country_code='PT' AND name='Vila Real';
  SELECT id INTO d_viseu FROM public.districts WHERE country_code='PT' AND name='Viseu';
  SELECT id INTO d_acores FROM public.districts WHERE country_code='PT' AND name='Região Autónoma dos Açores';
  SELECT id INTO d_madeira FROM public.districts WHERE country_code='PT' AND name='Região Autónoma da Madeira';

  INSERT INTO public.cities (district_id, name) VALUES
  (d_aveiro,'Águeda'),(d_aveiro,'Albergaria-a-Velha'),(d_aveiro,'Anadia'),(d_aveiro,'Arouca'),(d_aveiro,'Aveiro'),
  (d_aveiro,'Castelo de Paiva'),(d_aveiro,'Espinho'),(d_aveiro,'Estarreja'),(d_aveiro,'Ílhavo'),(d_aveiro,'Mealhada'),
  (d_aveiro,'Murtosa'),(d_aveiro,'Oliveira de Azeméis'),(d_aveiro,'Oliveira do Bairro'),(d_aveiro,'Ovar'),
  (d_aveiro,'Santa Maria da Feira'),(d_aveiro,'São João da Madeira'),(d_aveiro,'Sever do Vouga'),(d_aveiro,'Vagos'),(d_aveiro,'Vale de Cambra'),
  (d_beja,'Aljustrel'),(d_beja,'Almodôvar'),(d_beja,'Alvito'),(d_beja,'Barrancos'),(d_beja,'Beja'),
  (d_beja,'Castro Verde'),(d_beja,'Cuba'),(d_beja,'Ferreira do Alentejo'),(d_beja,'Mértola'),(d_beja,'Moura'),
  (d_beja,'Odemira'),(d_beja,'Ourique'),(d_beja,'Serpa'),(d_beja,'Vidigueira'),
  (d_braga,'Amares'),(d_braga,'Barcelos'),(d_braga,'Braga'),(d_braga,'Cabeceiras de Basto'),(d_braga,'Celorico de Basto'),
  (d_braga,'Esposende'),(d_braga,'Fafe'),(d_braga,'Guimarães'),(d_braga,'Póvoa de Lanhoso'),(d_braga,'Terras de Bouro'),
  (d_braga,'Vieira do Minho'),(d_braga,'Vila Nova de Famalicão'),(d_braga,'Vila Verde'),(d_braga,'Vizela'),
  (d_braganca,'Alfândega da Fé'),(d_braganca,'Bragança'),(d_braganca,'Carrazeda de Ansiães'),(d_braganca,'Freixo de Espada à Cinta'),
  (d_braganca,'Macedo de Cavaleiros'),(d_braganca,'Miranda do Douro'),(d_braganca,'Mirandela'),(d_braganca,'Mogadouro'),
  (d_braganca,'Torre de Moncorvo'),(d_braganca,'Vila Flor'),(d_braganca,'Vimioso'),(d_braganca,'Vinhais'),
  (d_cb,'Belmonte'),(d_cb,'Castelo Branco'),(d_cb,'Covilhã'),(d_cb,'Fundão'),(d_cb,'Idanha-a-Nova'),
  (d_cb,'Oleiros'),(d_cb,'Penamacor'),(d_cb,'Proença-a-Nova'),(d_cb,'Sertã'),(d_cb,'Vila de Rei'),(d_cb,'Vila Velha de Ródão'),
  (d_coimbra,'Arganil'),(d_coimbra,'Cantanhede'),(d_coimbra,'Coimbra'),(d_coimbra,'Condeixa-a-Nova'),(d_coimbra,'Figueira da Foz'),
  (d_coimbra,'Góis'),(d_coimbra,'Lousã'),(d_coimbra,'Mira'),(d_coimbra,'Miranda do Corvo'),(d_coimbra,'Montemor-o-Velho'),
  (d_coimbra,'Oliveira do Hospital'),(d_coimbra,'Pampilhosa da Serra'),(d_coimbra,'Penacova'),(d_coimbra,'Penela'),
  (d_coimbra,'Soure'),(d_coimbra,'Tábua'),(d_coimbra,'Vila Nova de Poiares'),
  (d_evora,'Alandroal'),(d_evora,'Arraiolos'),(d_evora,'Borba'),(d_evora,'Estremoz'),(d_evora,'Évora'),
  (d_evora,'Montemor-o-Novo'),(d_evora,'Mora'),(d_evora,'Mourão'),(d_evora,'Portel'),(d_evora,'Redondo'),
  (d_evora,'Reguengos de Monsaraz'),(d_evora,'Vendas Novas'),(d_evora,'Viana do Alentejo'),(d_evora,'Vila Viçosa'),
  (d_faro,'Albufeira'),(d_faro,'Alcoutim'),(d_faro,'Aljezur'),(d_faro,'Castro Marim'),(d_faro,'Faro'),
  (d_faro,'Lagoa'),(d_faro,'Lagos'),(d_faro,'Loulé'),(d_faro,'Monchique'),(d_faro,'Olhão'),
  (d_faro,'Portimão'),(d_faro,'São Brás de Alportel'),(d_faro,'Silves'),(d_faro,'Tavira'),
  (d_faro,'Vila do Bispo'),(d_faro,'Vila Real de Santo António'),
  (d_guarda,'Aguiar da Beira'),(d_guarda,'Almeida'),(d_guarda,'Celorico da Beira'),(d_guarda,'Figueira de Castelo Rodrigo'),
  (d_guarda,'Fornos de Algodres'),(d_guarda,'Gouveia'),(d_guarda,'Guarda'),(d_guarda,'Manteigas'),(d_guarda,'Meda'),
  (d_guarda,'Pinhel'),(d_guarda,'Sabugal'),(d_guarda,'Seia'),(d_guarda,'Trancoso'),(d_guarda,'Vila Nova de Foz Côa'),
  (d_leiria,'Alcobaça'),(d_leiria,'Alvaiázere'),(d_leiria,'Ansião'),(d_leiria,'Batalha'),(d_leiria,'Bombarral'),
  (d_leiria,'Caldas da Rainha'),(d_leiria,'Castanheira de Pera'),(d_leiria,'Figueiró dos Vinhos'),(d_leiria,'Leiria'),
  (d_leiria,'Marinha Grande'),(d_leiria,'Nazaré'),(d_leiria,'Óbidos'),(d_leiria,'Pedrógão Grande'),(d_leiria,'Peniche'),
  (d_leiria,'Pombal'),(d_leiria,'Porto de Mós'),
  (d_lisboa,'Alenquer'),(d_lisboa,'Amadora'),(d_lisboa,'Arruda dos Vinhos'),(d_lisboa,'Azambuja'),(d_lisboa,'Cadaval'),
  (d_lisboa,'Cascais'),(d_lisboa,'Lisboa'),(d_lisboa,'Loures'),(d_lisboa,'Lourinhã'),(d_lisboa,'Mafra'),
  (d_lisboa,'Odivelas'),(d_lisboa,'Oeiras'),(d_lisboa,'Sintra'),(d_lisboa,'Sobral de Monte Agraço'),
  (d_lisboa,'Torres Vedras'),(d_lisboa,'Vila Franca de Xira'),
  (d_portalegre,'Alter do Chão'),(d_portalegre,'Arronches'),(d_portalegre,'Avis'),(d_portalegre,'Campo Maior'),
  (d_portalegre,'Castelo de Vide'),(d_portalegre,'Crato'),(d_portalegre,'Elvas'),(d_portalegre,'Fronteira'),
  (d_portalegre,'Gavião'),(d_portalegre,'Marvão'),(d_portalegre,'Monforte'),(d_portalegre,'Nisa'),
  (d_portalegre,'Ponte de Sor'),(d_portalegre,'Portalegre'),(d_portalegre,'Sousel'),
  (d_porto,'Amarante'),(d_porto,'Baião'),(d_porto,'Felgueiras'),(d_porto,'Gondomar'),(d_porto,'Lousada'),
  (d_porto,'Maia'),(d_porto,'Marco de Canaveses'),(d_porto,'Matosinhos'),(d_porto,'Paços de Ferreira'),(d_porto,'Paredes'),
  (d_porto,'Penafiel'),(d_porto,'Porto'),(d_porto,'Póvoa de Varzim'),(d_porto,'Santo Tirso'),(d_porto,'Trofa'),
  (d_porto,'Valongo'),(d_porto,'Vila do Conde'),(d_porto,'Vila Nova de Gaia'),
  (d_santarem,'Abrantes'),(d_santarem,'Alcanena'),(d_santarem,'Almeirim'),(d_santarem,'Alpiarça'),(d_santarem,'Benavente'),
  (d_santarem,'Cartaxo'),(d_santarem,'Chamusca'),(d_santarem,'Constância'),(d_santarem,'Coruche'),(d_santarem,'Entroncamento'),
  (d_santarem,'Ferreira do Zêzere'),(d_santarem,'Golegã'),(d_santarem,'Mação'),(d_santarem,'Ourém'),(d_santarem,'Rio Maior'),
  (d_santarem,'Salvaterra de Magos'),(d_santarem,'Santarém'),(d_santarem,'Sardoal'),(d_santarem,'Tomar'),
  (d_santarem,'Torres Novas'),(d_santarem,'Vila Nova da Barquinha'),
  (d_setubal,'Alcácer do Sal'),(d_setubal,'Alcochete'),(d_setubal,'Almada'),(d_setubal,'Barreiro'),(d_setubal,'Grândola'),
  (d_setubal,'Moita'),(d_setubal,'Montijo'),(d_setubal,'Palmela'),(d_setubal,'Santiago do Cacém'),(d_setubal,'Seixal'),
  (d_setubal,'Sesimbra'),(d_setubal,'Setúbal'),(d_setubal,'Sines'),
  (d_viana,'Arcos de Valdevez'),(d_viana,'Caminha'),(d_viana,'Melgaço'),(d_viana,'Monção'),(d_viana,'Paredes de Coura'),
  (d_viana,'Ponte da Barca'),(d_viana,'Ponte de Lima'),(d_viana,'Valença'),(d_viana,'Viana do Castelo'),(d_viana,'Vila Nova de Cerveira'),
  (d_vilareal,'Alijó'),(d_vilareal,'Boticas'),(d_vilareal,'Chaves'),(d_vilareal,'Mesão Frio'),(d_vilareal,'Mondim de Basto'),
  (d_vilareal,'Montalegre'),(d_vilareal,'Murça'),(d_vilareal,'Peso da Régua'),(d_vilareal,'Ribeira de Pena'),(d_vilareal,'Sabrosa'),
  (d_vilareal,'Santa Marta de Penaguião'),(d_vilareal,'Valpaços'),(d_vilareal,'Vila Pouca de Aguiar'),(d_vilareal,'Vila Real'),
  (d_viseu,'Armamar'),(d_viseu,'Carregal do Sal'),(d_viseu,'Castro Daire'),(d_viseu,'Cinfães'),(d_viseu,'Lamego'),
  (d_viseu,'Mangualde'),(d_viseu,'Moimenta da Beira'),(d_viseu,'Mortágua'),(d_viseu,'Nelas'),(d_viseu,'Oliveira de Frades'),
  (d_viseu,'Penalva do Castelo'),(d_viseu,'Penedono'),(d_viseu,'Resende'),(d_viseu,'Santa Comba Dão'),(d_viseu,'São João da Pesqueira'),
  (d_viseu,'São Pedro do Sul'),(d_viseu,'Sátão'),(d_viseu,'Sernancelhe'),(d_viseu,'Tabuaço'),(d_viseu,'Tarouca'),
  (d_viseu,'Tondela'),(d_viseu,'Vila Nova de Paiva'),(d_viseu,'Viseu'),(d_viseu,'Vouzela'),
  (d_acores,'Angra do Heroísmo'),(d_acores,'Calheta (São Jorge)'),(d_acores,'Corvo'),(d_acores,'Horta'),(d_acores,'Lagoa (Açores)'),
  (d_acores,'Lajes das Flores'),(d_acores,'Lajes do Pico'),(d_acores,'Madalena'),(d_acores,'Nordeste'),(d_acores,'Ponta Delgada'),
  (d_acores,'Povoação'),(d_acores,'Praia da Vitória'),(d_acores,'Ribeira Grande'),(d_acores,'Santa Cruz da Graciosa'),
  (d_acores,'Santa Cruz das Flores'),(d_acores,'São Roque do Pico'),(d_acores,'Velas'),(d_acores,'Vila do Porto'),(d_acores,'Vila Franca do Campo'),
  (d_madeira,'Calheta (Madeira)'),(d_madeira,'Câmara de Lobos'),(d_madeira,'Funchal'),(d_madeira,'Machico'),(d_madeira,'Ponta do Sol'),
  (d_madeira,'Porto Moniz'),(d_madeira,'Porto Santo'),(d_madeira,'Ribeira Brava'),(d_madeira,'Santa Cruz'),(d_madeira,'Santana'),(d_madeira,'São Vicente');
END $$;

-- 5. Major cities for non-PT countries
DO $$
DECLARE d uuid;
BEGIN
  SELECT id INTO d FROM public.districts WHERE country_code='ES' AND name='Madrid'; INSERT INTO public.cities (district_id, name) VALUES (d,'Madrid'),(d,'Alcalá de Henares'),(d,'Móstoles');
  SELECT id INTO d FROM public.districts WHERE country_code='ES' AND name='Cataluña'; INSERT INTO public.cities (district_id, name) VALUES (d,'Barcelona'),(d,'Hospitalet de Llobregat'),(d,'Badalona'),(d,'Tarragona'),(d,'Girona');
  SELECT id INTO d FROM public.districts WHERE country_code='ES' AND name='Comunidad Valenciana'; INSERT INTO public.cities (district_id, name) VALUES (d,'Valencia'),(d,'Alicante'),(d,'Elche');
  SELECT id INTO d FROM public.districts WHERE country_code='ES' AND name='Andalucía'; INSERT INTO public.cities (district_id, name) VALUES (d,'Sevilla'),(d,'Málaga'),(d,'Córdoba'),(d,'Granada');
  SELECT id INTO d FROM public.districts WHERE country_code='ES' AND name='País Vasco'; INSERT INTO public.cities (district_id, name) VALUES (d,'Bilbao'),(d,'San Sebastián'),(d,'Vitoria-Gasteiz');
  SELECT id INTO d FROM public.districts WHERE country_code='ES' AND name='Galicia'; INSERT INTO public.cities (district_id, name) VALUES (d,'Vigo'),(d,'A Coruña');
  SELECT id INTO d FROM public.districts WHERE country_code='FR' AND name='Île-de-France'; INSERT INTO public.cities (district_id, name) VALUES (d,'Paris'),(d,'Versailles'),(d,'Boulogne-Billancourt');
  SELECT id INTO d FROM public.districts WHERE country_code='FR' AND name='Provence-Alpes-Côte d''Azur'; INSERT INTO public.cities (district_id, name) VALUES (d,'Marseille'),(d,'Nice'),(d,'Toulon'),(d,'Aix-en-Provence');
  SELECT id INTO d FROM public.districts WHERE country_code='FR' AND name='Auvergne-Rhône-Alpes'; INSERT INTO public.cities (district_id, name) VALUES (d,'Lyon'),(d,'Grenoble'),(d,'Saint-Étienne');
  SELECT id INTO d FROM public.districts WHERE country_code='FR' AND name='Occitanie'; INSERT INTO public.cities (district_id, name) VALUES (d,'Toulouse'),(d,'Montpellier');
  SELECT id INTO d FROM public.districts WHERE country_code='FR' AND name='Hauts-de-France'; INSERT INTO public.cities (district_id, name) VALUES (d,'Lille');
  SELECT id INTO d FROM public.districts WHERE country_code='FR' AND name='Nouvelle-Aquitaine'; INSERT INTO public.cities (district_id, name) VALUES (d,'Bordeaux');
  SELECT id INTO d FROM public.districts WHERE country_code='FR' AND name='Pays de la Loire'; INSERT INTO public.cities (district_id, name) VALUES (d,'Nantes');
  SELECT id INTO d FROM public.districts WHERE country_code='FR' AND name='Grand Est'; INSERT INTO public.cities (district_id, name) VALUES (d,'Strasbourg'),(d,'Reims');
  SELECT id INTO d FROM public.districts WHERE country_code='FR' AND name='Bretagne'; INSERT INTO public.cities (district_id, name) VALUES (d,'Rennes');
  SELECT id INTO d FROM public.districts WHERE country_code='GB' AND name='England'; INSERT INTO public.cities (district_id, name) VALUES (d,'London'),(d,'Birmingham'),(d,'Manchester'),(d,'Leeds'),(d,'Liverpool'),(d,'Bristol'),(d,'Sheffield'),(d,'Newcastle'),(d,'Oxford'),(d,'Cambridge'),(d,'Brighton'),(d,'Nottingham');
  SELECT id INTO d FROM public.districts WHERE country_code='GB' AND name='Scotland'; INSERT INTO public.cities (district_id, name) VALUES (d,'Edinburgh'),(d,'Glasgow'),(d,'Aberdeen'),(d,'Dundee');
  SELECT id INTO d FROM public.districts WHERE country_code='GB' AND name='Wales'; INSERT INTO public.cities (district_id, name) VALUES (d,'Cardiff'),(d,'Swansea');
  SELECT id INTO d FROM public.districts WHERE country_code='GB' AND name='Northern Ireland'; INSERT INTO public.cities (district_id, name) VALUES (d,'Belfast'),(d,'Derry');
  SELECT id INTO d FROM public.districts WHERE country_code='DE' AND name='Berlin'; INSERT INTO public.cities (district_id, name) VALUES (d,'Berlin');
  SELECT id INTO d FROM public.districts WHERE country_code='DE' AND name='Hamburg'; INSERT INTO public.cities (district_id, name) VALUES (d,'Hamburg');
  SELECT id INTO d FROM public.districts WHERE country_code='DE' AND name='Bayern'; INSERT INTO public.cities (district_id, name) VALUES (d,'München'),(d,'Nürnberg'),(d,'Augsburg');
  SELECT id INTO d FROM public.districts WHERE country_code='DE' AND name='Nordrhein-Westfalen'; INSERT INTO public.cities (district_id, name) VALUES (d,'Köln'),(d,'Düsseldorf'),(d,'Dortmund'),(d,'Essen'),(d,'Bonn');
  SELECT id INTO d FROM public.districts WHERE country_code='DE' AND name='Hessen'; INSERT INTO public.cities (district_id, name) VALUES (d,'Frankfurt am Main'),(d,'Wiesbaden');
  SELECT id INTO d FROM public.districts WHERE country_code='DE' AND name='Baden-Württemberg'; INSERT INTO public.cities (district_id, name) VALUES (d,'Stuttgart'),(d,'Mannheim'),(d,'Karlsruhe');
  SELECT id INTO d FROM public.districts WHERE country_code='DE' AND name='Sachsen'; INSERT INTO public.cities (district_id, name) VALUES (d,'Dresden'),(d,'Leipzig');
  SELECT id INTO d FROM public.districts WHERE country_code='DE' AND name='Bremen'; INSERT INTO public.cities (district_id, name) VALUES (d,'Bremen');
  SELECT id INTO d FROM public.districts WHERE country_code='DE' AND name='Niedersachsen'; INSERT INTO public.cities (district_id, name) VALUES (d,'Hannover');
  SELECT id INTO d FROM public.districts WHERE country_code='IT' AND name='Lazio'; INSERT INTO public.cities (district_id, name) VALUES (d,'Roma');
  SELECT id INTO d FROM public.districts WHERE country_code='IT' AND name='Lombardia'; INSERT INTO public.cities (district_id, name) VALUES (d,'Milano'),(d,'Brescia'),(d,'Bergamo');
  SELECT id INTO d FROM public.districts WHERE country_code='IT' AND name='Campania'; INSERT INTO public.cities (district_id, name) VALUES (d,'Napoli'),(d,'Salerno');
  SELECT id INTO d FROM public.districts WHERE country_code='IT' AND name='Piemonte'; INSERT INTO public.cities (district_id, name) VALUES (d,'Torino');
  SELECT id INTO d FROM public.districts WHERE country_code='IT' AND name='Sicilia'; INSERT INTO public.cities (district_id, name) VALUES (d,'Palermo'),(d,'Catania');
  SELECT id INTO d FROM public.districts WHERE country_code='IT' AND name='Liguria'; INSERT INTO public.cities (district_id, name) VALUES (d,'Genova');
  SELECT id INTO d FROM public.districts WHERE country_code='IT' AND name='Emilia-Romagna'; INSERT INTO public.cities (district_id, name) VALUES (d,'Bologna'),(d,'Parma'),(d,'Modena');
  SELECT id INTO d FROM public.districts WHERE country_code='IT' AND name='Toscana'; INSERT INTO public.cities (district_id, name) VALUES (d,'Firenze'),(d,'Pisa');
  SELECT id INTO d FROM public.districts WHERE country_code='IT' AND name='Veneto'; INSERT INTO public.cities (district_id, name) VALUES (d,'Venezia'),(d,'Verona'),(d,'Padova');
  SELECT id INTO d FROM public.districts WHERE country_code='IT' AND name='Puglia'; INSERT INTO public.cities (district_id, name) VALUES (d,'Bari');
  SELECT id INTO d FROM public.districts WHERE country_code='BR' AND name='São Paulo'; INSERT INTO public.cities (district_id, name) VALUES (d,'São Paulo'),(d,'Campinas'),(d,'Santos'),(d,'São Bernardo do Campo'),(d,'Guarulhos');
  SELECT id INTO d FROM public.districts WHERE country_code='BR' AND name='Rio de Janeiro'; INSERT INTO public.cities (district_id, name) VALUES (d,'Rio de Janeiro'),(d,'Niterói');
  SELECT id INTO d FROM public.districts WHERE country_code='BR' AND name='Minas Gerais'; INSERT INTO public.cities (district_id, name) VALUES (d,'Belo Horizonte'),(d,'Uberlândia');
  SELECT id INTO d FROM public.districts WHERE country_code='BR' AND name='Bahia'; INSERT INTO public.cities (district_id, name) VALUES (d,'Salvador');
  SELECT id INTO d FROM public.districts WHERE country_code='BR' AND name='Ceará'; INSERT INTO public.cities (district_id, name) VALUES (d,'Fortaleza');
  SELECT id INTO d FROM public.districts WHERE country_code='BR' AND name='Distrito Federal'; INSERT INTO public.cities (district_id, name) VALUES (d,'Brasília');
  SELECT id INTO d FROM public.districts WHERE country_code='BR' AND name='Paraná'; INSERT INTO public.cities (district_id, name) VALUES (d,'Curitiba');
  SELECT id INTO d FROM public.districts WHERE country_code='BR' AND name='Pernambuco'; INSERT INTO public.cities (district_id, name) VALUES (d,'Recife');
  SELECT id INTO d FROM public.districts WHERE country_code='BR' AND name='Rio Grande do Sul'; INSERT INTO public.cities (district_id, name) VALUES (d,'Porto Alegre');
  SELECT id INTO d FROM public.districts WHERE country_code='BR' AND name='Amazonas'; INSERT INTO public.cities (district_id, name) VALUES (d,'Manaus');
  SELECT id INTO d FROM public.districts WHERE country_code='BR' AND name='Pará'; INSERT INTO public.cities (district_id, name) VALUES (d,'Belém');
  SELECT id INTO d FROM public.districts WHERE country_code='DK' AND name='Hovedstaden'; INSERT INTO public.cities (district_id, name) VALUES (d,'København'),(d,'Frederiksberg'),(d,'Helsingør');
  SELECT id INTO d FROM public.districts WHERE country_code='DK' AND name='Midtjylland'; INSERT INTO public.cities (district_id, name) VALUES (d,'Aarhus'),(d,'Herning'),(d,'Silkeborg');
  SELECT id INTO d FROM public.districts WHERE country_code='DK' AND name='Syddanmark'; INSERT INTO public.cities (district_id, name) VALUES (d,'Odense'),(d,'Esbjerg'),(d,'Kolding');
  SELECT id INTO d FROM public.districts WHERE country_code='DK' AND name='Nordjylland'; INSERT INTO public.cities (district_id, name) VALUES (d,'Aalborg');
  SELECT id INTO d FROM public.districts WHERE country_code='DK' AND name='Sjælland'; INSERT INTO public.cities (district_id, name) VALUES (d,'Roskilde'),(d,'Næstved');
  SELECT id INTO d FROM public.districts WHERE country_code='NO' AND name='Oslo'; INSERT INTO public.cities (district_id, name) VALUES (d,'Oslo');
  SELECT id INTO d FROM public.districts WHERE country_code='NO' AND name='Vestland'; INSERT INTO public.cities (district_id, name) VALUES (d,'Bergen');
  SELECT id INTO d FROM public.districts WHERE country_code='NO' AND name='Trøndelag'; INSERT INTO public.cities (district_id, name) VALUES (d,'Trondheim');
  SELECT id INTO d FROM public.districts WHERE country_code='NO' AND name='Rogaland'; INSERT INTO public.cities (district_id, name) VALUES (d,'Stavanger');
  SELECT id INTO d FROM public.districts WHERE country_code='NO' AND name='Viken'; INSERT INTO public.cities (district_id, name) VALUES (d,'Drammen'),(d,'Bærum'),(d,'Fredrikstad');
  SELECT id INTO d FROM public.districts WHERE country_code='NO' AND name='Agder'; INSERT INTO public.cities (district_id, name) VALUES (d,'Kristiansand');
  SELECT id INTO d FROM public.districts WHERE country_code='NO' AND name='Troms og Finnmark'; INSERT INTO public.cities (district_id, name) VALUES (d,'Tromsø');
  SELECT id INTO d FROM public.districts WHERE country_code='NO' AND name='Nordland'; INSERT INTO public.cities (district_id, name) VALUES (d,'Bodø');
  SELECT id INTO d FROM public.districts WHERE country_code='SE' AND name='Stockholm'; INSERT INTO public.cities (district_id, name) VALUES (d,'Stockholm'),(d,'Södertälje');
  SELECT id INTO d FROM public.districts WHERE country_code='SE' AND name='Västra Götaland'; INSERT INTO public.cities (district_id, name) VALUES (d,'Göteborg'),(d,'Borås');
  SELECT id INTO d FROM public.districts WHERE country_code='SE' AND name='Skåne'; INSERT INTO public.cities (district_id, name) VALUES (d,'Malmö'),(d,'Helsingborg'),(d,'Lund');
  SELECT id INTO d FROM public.districts WHERE country_code='SE' AND name='Uppsala'; INSERT INTO public.cities (district_id, name) VALUES (d,'Uppsala');
  SELECT id INTO d FROM public.districts WHERE country_code='SE' AND name='Östergötland'; INSERT INTO public.cities (district_id, name) VALUES (d,'Linköping'),(d,'Norrköping');
  SELECT id INTO d FROM public.districts WHERE country_code='SE' AND name='Örebro'; INSERT INTO public.cities (district_id, name) VALUES (d,'Örebro');
  SELECT id INTO d FROM public.districts WHERE country_code='SE' AND name='Västmanland'; INSERT INTO public.cities (district_id, name) VALUES (d,'Västerås');
  SELECT id INTO d FROM public.districts WHERE country_code='SE' AND name='Jönköping'; INSERT INTO public.cities (district_id, name) VALUES (d,'Jönköping');
  SELECT id INTO d FROM public.districts WHERE country_code='SE' AND name='Västerbotten'; INSERT INTO public.cities (district_id, name) VALUES (d,'Umeå');
END $$;

-- 6. PROFILES — drop view, drop location columns, add city_id, recreate view
DROP VIEW IF EXISTS public.public_profiles;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES public.cities(id) ON DELETE SET NULL;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS location;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS location_lat;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS location_lng;

CREATE VIEW public.public_profiles AS
SELECT
  p.user_id, p.username, p.first_name, p.last_name, p.avatar_url,
  p.city_id, p.district_id, p.country_code,
  p.pro_entity_name, p.pro_city, p.pro_website, p.pro_platform_url, p.pro_verified,
  (SELECT array_agg(ur.role::text) FROM public.user_roles ur
    WHERE ur.user_id = p.user_id AND ur.role::text = ANY (ARRAY['bookstore','author','influencer'])) AS pro_roles
FROM public.profiles p;

-- 7. EVENTS — add country_code, city_id
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS country_code text REFERENCES public.countries(code);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES public.cities(id) ON DELETE SET NULL;

-- 8. EVENTS INSERT RLS — only pro roles
DROP POLICY IF EXISTS "Authorized users can create events" ON public.events;
DROP POLICY IF EXISTS "Only pro roles can create events" ON public.events;
CREATE POLICY "Only pro roles can create events"
ON public.events FOR INSERT TO authenticated
WITH CHECK (
  created_by_user_id = auth.uid()
  AND (
    has_role(auth.uid(), 'bookstore'::app_role)
    OR has_role(auth.uid(), 'entity'::app_role)
    OR has_role(auth.uid(), 'global_admin'::app_role)
    OR is_admin(auth.uid())
  )
);

-- 9. Localized default library name
CREATE OR REPLACE FUNCTION public.handle_profile_completed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _name text;
BEGIN
  IF NEW.profile_completed = true AND OLD.profile_completed = false THEN
    _name := CASE lower(coalesce(NEW.language, 'pt'))
      WHEN 'en' THEN 'My library'
      WHEN 'es' THEN 'Mi biblioteca'
      WHEN 'fr' THEN 'Ma bibliothèque'
      ELSE 'A minha biblioteca'
    END;
    INSERT INTO public.libraries (user_id, name) VALUES (NEW.user_id, _name);
  END IF;
  RETURN NEW;
END;
$function$;

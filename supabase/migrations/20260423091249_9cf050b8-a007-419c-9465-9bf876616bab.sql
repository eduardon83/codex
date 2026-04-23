INSERT INTO public.app_content (key, category, value_pt, value_en, value_es, value_fr)
VALUES
  (
    'listas.planosHelp',
    'lists',
    'Aqui podes ver os teus planos de leitura, criar um novo à medida das tuas ambições de leitura ou seguir um plano recomendado pelo Professor! Podes também exportar ou importar um plano. Atenção, só podes ter um plano de cada vez!',
    'Here you can view your reading plans, create a new one tailored to your reading ambitions, or follow a plan recommended by your teacher! You can also export or import a plan. Please note: you can only have one plan at a time!',
    'Aquí puedes ver tus planes de lectura, crear uno nuevo a la medida de tus ambiciones lectoras o seguir un plan recomendado por el profesor. También puedes exportar o importar un plan. Atención: solo puedes tener un plan a la vez.',
    'Ici, tu peux consulter tes plans de lecture, en créer un nouveau adapté à tes ambitions de lecture ou suivre un plan recommandé par ton professeur ! Tu peux aussi exporter ou importer un plan. Attention : tu ne peux avoir qu’un seul plan à la fois !'
  ),
  (
    'listas.listasHelp',
    'lists',
    'Importa listas de leitura recomendadas como o Plano Nacional de Leitura ou cria as tuas próprias listas de leitura!',
    'Import recommended reading lists such as the National Reading Plan, or create your own reading lists!',
    'Importa listas de lectura recomendadas, como el Plan Nacional de Lectura, o crea tus propias listas de lectura.',
    'Importe des listes de lecture recommandées, comme le Plan National de Lecture, ou crée tes propres listes de lecture !'
  )
ON CONFLICT (key) DO UPDATE SET
  category = EXCLUDED.category,
  value_pt = EXCLUDED.value_pt,
  value_en = EXCLUDED.value_en,
  value_es = EXCLUDED.value_es,
  value_fr = EXCLUDED.value_fr,
  updated_at = now();
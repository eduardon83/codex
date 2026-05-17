// Legal & about content for the landing page (pre-auth) and the in-app About screen.
// Each language provides two documents: about, termsPrivacy.
// Rendered via the LandingInfoModal on the landing page and AboutScreen in-app.

export type LegalBlock =
  | { type: 'eyebrow'; text: string }
  | { type: 'lead'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string };

export type LandingLegalLang = 'pt' | 'en' | 'es' | 'fr';

export interface LandingLegalContent {
  about: { title: string; blocks: LegalBlock[] };
  termsPrivacy: { title: string; blocks: LegalBlock[] };
}

// ---------- PT ----------
const pt: LandingLegalContent = {
  about: {
    title: 'Sobre',
    blocks: [
      { type: 'eyebrow', text: 'Versão 1.0.0' },
      { type: 'lead', text: 'Um sistema de gestão de bibliotecas pessoais e promoção do ciclo de vida do livro.' },
      { type: 'h2', text: 'Sobre' },
      { type: 'p', text: 'Codex foi criado para dar corpo ao desejo de muitos de nós com tantos livros a nosso cuidado e empréstimos entre diversos amigos e familiares. Um projeto da Kendir Studios (Worlds4Education – Jogos e Ambientes Educativos, Lda.), gémeo de Folium, que promove e fomenta hábitos e valores de leitura entre os jovens. Construído do nosso amor por livros e pelo prazer de construir a nossa pequena biblioteca, um livro de cada vez. Somos enormes fãs de leitura e acreditamos que os livros nos dão algo que não encontramos em mais nenhum lugar.' },
      { type: 'p', text: 'Procuramos ajudar através de Codex, permitindo que cada pessoa tenha um registo adequado das suas bibliotecas pessoais, onde se encontram os seus empréstimos, organizar as suas listas de livros que futuramente farão parte dessas bibliotecas e encontrar eventos associados a leitura e escrita.' },
      { type: 'h2', text: 'A nossa intenção' },
      { type: 'p', text: 'A nossa intenção é simples: dar aos alunos um local onde possam catalogar os seus livros, partilhá-los com amigos e colegas e descobrir novas leituras. Sem algoritmos, publicidade ou ruído – apenas o aluno e as suas folhas!' },
      { type: 'p', text: 'Worlds4Education – Jogos e Ambientes Educativos, Lda.' },
      { type: 'p', text: 'Avenida da República 1629 – 2.º Esquerdo' },
      { type: 'p', text: '4430-206 Vila Nova de Gaia · Portugal' },
    ],
  },
  termsPrivacy: {
    title: 'Termos e Privacidade',
    blocks: [
      { type: 'h2', text: 'Termos e Condições de Utilização' },
      { type: 'eyebrow', text: 'Última atualização: 15 de Maio de 2026' },
      { type: 'lead', text: 'Bem-vindo ao Codex. Ao criar uma conta, aceita estes termos.' },

      { type: 'h3', text: '1. O que é o Codex' },
      { type: 'p', text: 'O Codex é uma aplicação para gestão da sua biblioteca pessoal, descobrir livros, subscrever e partilhar listas de leitura, empréstimo de livros e visualização de eventos associados a leitura e escrita.' },

      { type: 'h3', text: '2. Quem pode usar' },
      { type: 'p', text: 'O Codex está disponível para pessoas com mais de 18 anos.' },

      { type: 'h3', text: '3. A sua conta' },
      { type: 'p', text: 'Quando cria uma conta, concorda em: dar informação verdadeira sobre si (nome, apelido, ano de nascimento); não criar contas falsas ou criar conta em nome de outra pessoa; manter a sua palavra-passe segura; avisar-nos se alguém entrar na sua conta sem autorização. Se usar a conta de forma imprópria (insultos, partilha de conteúdo ofensivo, tentativas de fraude), podemos suspender ou apagar a conta sem aviso prévio.' },

      { type: 'h3', text: '4. Empréstimos de livros' },
      { type: 'p', text: 'O Codex permite pedir livros emprestados a outros utilizadores. Os livros são dos utilizadores, não do Codex. Nós somos apenas uma plataforma de ligação. Você é responsável pelo livro que pede emprestado. Se o perder ou danificar, deve resolver diretamente com quem lhe emprestou. Combine sempre a entrega dos livros em sítios seguros, de preferência em locais públicos e a pessoas de confiança. Nunca combine encontros com desconhecidos em sítios privados. O Codex não se responsabiliza por livros perdidos, danificados ou conflitos entre utilizadores.' },

      { type: 'h3', text: '5. O que não pode fazer' },
      { type: 'p', text: 'Insultar, ameaçar ou intimidar outros utilizadores. Partilhar conteúdo ofensivo, pornográfico ou ilegal. Tentar aceder a contas de outras pessoas. Usar o Codex para vender livros ou para fins comerciais. Copiar ou revender dados de outros utilizadores.' },

      { type: 'h3', text: '6. Conteúdo que partilha' },
      { type: 'p', text: 'As notas, classificações e listas que cria são suas. Se tornar uma lista pública, outros utilizadores podem ver. Pode apagar o seu conteúdo a qualquer momento.' },

      { type: 'h3', text: '7. Apagar a conta' },
      { type: 'p', text: 'Pode apagar a sua conta a qualquer momento nas Definições. Quando apaga, removemos todos os seus dados em até 30 dias, exceto o que somos obrigados a manter por lei (ex.: registos de empréstimos em curso até serem devolvidos).' },

      { type: 'h3', text: '8. Alterações aos termos' },
      { type: 'p', text: 'Podemos atualizar estes termos. Se houver mudanças importantes, avisamos por email ou no próprio Codex. Continuar a usar o Codex após as alterações significa que aceita os novos termos.' },

      { type: 'h3', text: '9. Lei aplicável' },
      { type: 'p', text: 'Estes termos são regidos pela lei portuguesa. Para questões, contacte: codex@kendirstudios.pt' },

      { type: 'h3', text: '10. Contactos' },
      { type: 'p', text: 'Codex é operado por Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, sediada em Avenida da República 1629, 2.º Esquerdo – 4430-206 Vila Nova de Gaia, Portugal. Email: codex@kendirstudios.pt' },

      { type: 'h2', text: 'Política de Privacidade' },
      { type: 'eyebrow', text: 'Última atualização: 15 de Maio de 2026' },
      { type: 'lead', text: 'Esta política explica que informação recolhemos sobre si, porque é que a recolhemos, e o que pode fazer para controlar a sua informação. Se algo não for claro, escreva-nos: codex@kendirstudios.pt' },

      { type: 'h3', text: '1. Quem somos' },
      { type: 'p', text: 'Codex é operado por Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, sediada em Avenida da República 1629, 2.º Esquerdo – 4430-206 Vila Nova de Gaia, Portugal. Somos os responsáveis pelo tratamento dos seus dados, nos termos do RGPD.' },

      { type: 'h3', text: '2. Que informação recolhemos' },
      { type: 'p', text: 'Quando cria uma conta: nome e apelido; email; ano de nascimento (para verificar idade); username que escolher.' },
      { type: 'p', text: 'Quando usa o Codex: livros que adiciona à sua biblioteca; listas de leitura que cria; empréstimos que faz ou pede; classificações, notas e favoritos; preferências de tema e idioma; foto de perfil (se carregar uma).' },
      { type: 'p', text: 'Automaticamente: endereço IP (para segurança, apagado após 90 dias); tipo de dispositivo e navegador; páginas que visita no Codex.' },
      { type: 'p', text: 'Não recolhemos: localização GPS precisa; contactos – telefone, morada; informação de redes sociais (exceto perfil de profissional).' },

      { type: 'h3', text: '3. Porque é que recolhemos estes dados' },
      { type: 'p', text: 'Base legal (RGPD Artigo 6): execução do contrato (precisamos destes dados para o Codex funcionar adequadamente); consentimento (quando nos dá permissão explícita, ex.: tornar biblioteca pública); obrigação legal (quando a lei nos obriga, ex.: responder a pedidos de autoridades). Para menores, aplicamos também o Artigo 8 do RGPD e a Lei n.º 58/2019.' },

      { type: 'h3', text: '4. Com quem partilhamos' },
      { type: 'p', text: 'Com outros utilizadores: o seu username, escola e distrito ficam visíveis para colegas do seu distrito quando coloca livros disponíveis para empréstimo. Nunca mostramos o seu nome real, email, idade ou foto a outros utilizadores, a não ser que o indique.' },
      { type: 'p', text: 'Com fornecedores: Supabase (base de dados, localizada na UE); Cloudflare (alojamento e segurança). Estes fornecedores apenas processam dados em nosso nome, sob contratos RGPD.' },
      { type: 'p', text: 'Com autoridades: apenas se formos legalmente obrigados (ex.: investigação criminal mediante ordem judicial).' },

      { type: 'h3', text: '5. Quanto tempo guardamos' },
      { type: 'p', text: 'Conta ativa: enquanto usar o Codex. Conta apagada: removemos tudo em até 30 dias. Registos de empréstimo fechados: 2 anos (para histórico). Logs técnicos: 90 dias.' },

      { type: 'h3', text: '6. Os seus direitos (RGPD)' },
      { type: 'p', text: 'Tem o direito de: aceder aos seus dados (pode exportar a qualquer momento); corrigir dados errados; apagar a sua conta e dados; limitar como usamos os seus dados; opor-se a certos tratamentos; levar os seus dados para outra aplicação (portabilidade). Para exercer qualquer destes direitos, escreva-nos: codex@kendirstudios.pt. Respondemos em até 30 dias. Se não ficar satisfeito, pode reclamar junto da CNPD (Comissão Nacional de Proteção de Dados): www.cnpd.pt' },

      { type: 'h3', text: '7. Segurança' },
      { type: 'p', text: 'Usamos encriptação (HTTPS), palavras-passe encriptadas, acesso restrito à base de dados, e fazemos cópias de segurança regulares. Nenhum sistema é 100% seguro — se soubermos de uma violação que o afete, avisamos em até 72 horas.' },

      { type: 'h3', text: '8. Cookies e armazenamento local' },
      { type: 'p', text: 'O Codex usa apenas armazenamento local técnico (para manter a sessão aberta e lembrar preferências). Não usamos cookies de rastreamento ou publicidade.' },

      { type: 'h3', text: '9. Alterações' },
      { type: 'p', text: 'Se mudarmos esta política, avisamos no Codex e por email.' },

      { type: 'h3', text: '10. Contactos' },
      { type: 'p', text: 'Responsável pelo tratamento: Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, Avenida da República 1629, 2.º Esquerdo – 4430-206 Vila Nova de Gaia, Portugal. Email: codex@kendirstudios.pt. DPO (Encarregado de Proteção de Dados): Catarina Pinto – codex@kendirstudios.pt' },
    ],
  },
};

// ---------- EN ----------
const en: LandingLegalContent = {
  about: {
    title: 'About',
    blocks: [
      { type: 'eyebrow', text: 'Version 1.0.0' },
      { type: 'lead', text: 'A system for managing personal libraries and promoting the book life cycle.' },
      { type: 'h2', text: 'About' },
      { type: 'p', text: "Codex was created to embody the desire of many of us with so many books in our care and loans among various friends and family. A project by Kendir Studios (Worlds4Education – Jogos e Ambientes Educativos, Lda.), twin of Folium, which promotes and fosters reading habits and values among young people. Built from our love of books and the pleasure of building our little library, one book at a time. We're huge fans of reading, and we believe that books give us something we can't find anywhere else." },
      { type: 'p', text: 'We seek to help through Codex, allowing each person to have a proper record of their personal libraries, where their loans are located, organize their lists of books that will be part of those libraries in the future, and find events associated with reading and writing.' },
      { type: 'h2', text: 'Our intention' },
      { type: 'p', text: 'Our intention is simple: to give students a place where they can catalogue their books, share them with friends and colleagues and discover new readings. No algorithms, advertising or noise – just the student and their sheets!' },
      { type: 'p', text: 'Worlds4Education – Jogos e Ambientes Educativos, Lda.' },
      { type: 'p', text: 'Avenida da República 1629 – 2nd Left' },
      { type: 'p', text: '4430-206 Vila Nova de Gaia · Portugal' },
    ],
  },
  termsPrivacy: {
    title: 'Terms & Privacy',
    blocks: [
      { type: 'h2', text: 'Terms and Conditions of Use' },
      { type: 'eyebrow', text: 'Last updated: May 15, 2026' },
      { type: 'lead', text: 'Welcome to Codex. By creating an account, you accept these terms.' },

      { type: 'h3', text: '1. What is Codex' },
      { type: 'p', text: 'Codex is an application for managing your personal library, discovering books, subscribing to and sharing reading lists, borrowing books, and viewing events associated with reading and writing.' },

      { type: 'h3', text: '2. Who can use it' },
      { type: 'p', text: 'Codex is available to people over the age of 18.' },

      { type: 'h3', text: '3. Your account' },
      { type: 'p', text: "When you create an account, you agree to: give true information about yourself (name, surname, year of birth); not create fake accounts or create an account in someone else's name; keep your password secure; let us know if someone logs into your account without authorization. If you use your account improperly (insults, sharing offensive content, attempts to cheat), we may suspend or delete your account without notice." },

      { type: 'h3', text: '4. Book loans' },
      { type: 'p', text: 'Codex allows you to borrow books from other users. The books belong to the users, not to Codex. We are just a connecting platform. You are responsible for the book you borrow. If you lose or damage it, you should settle it directly with the person who lent it. Always arrange the delivery of books in safe places, preferably in public places and to trusted people. Never arrange meetings with strangers in private places. Codex is not responsible for lost, damaged books or conflicts between users.' },

      { type: 'h3', text: "5. What you can't do" },
      { type: 'p', text: "Insulting, threatening, or intimidating other users. Sharing offensive, pornographic, or illegal content. Trying to access other people's accounts. Using Codex to sell books or for commercial purposes. Copying or reselling other users' data." },

      { type: 'h3', text: '6. Content you share' },
      { type: 'p', text: 'The notes, ratings, and lists you create are yours. If you make a list public, other users can see it. You can delete your content at any time.' },

      { type: 'h3', text: '7. Delete the account' },
      { type: 'p', text: 'You can delete your account at any time in Settings. When you delete, we remove all of your data within 30 days, except for what we are required to keep by law (e.g., records of ongoing loans until they are returned).' },

      { type: 'h3', text: '8. Changes to the terms' },
      { type: 'p', text: 'We may update these terms. If there are any major changes, we will let you know by email or on Codex itself. Continuing to use Codex after the changes means that you accept the new terms.' },

      { type: 'h3', text: '9. Governing law' },
      { type: 'p', text: 'These terms are governed by Portuguese law. For questions, please contact: codex@kendirstudios.pt' },

      { type: 'h3', text: '10. Contacts' },
      { type: 'p', text: 'Codex is operated by Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, headquartered at Avenida da República 1629, 2.º Esquerda – 4430-206 Vila Nova de Gaia, Portugal. Email: codex@kendirstudios.pt' },

      { type: 'h2', text: 'Privacy Policy' },
      { type: 'eyebrow', text: 'Last updated: May 15, 2026' },
      { type: 'lead', text: 'This policy explains what information we collect about you, why we collect it, and what you can do to control your information. If something is not clear, write to us: codex@kendirstudios.pt' },

      { type: 'h3', text: '1. Who we are' },
      { type: 'p', text: 'Codex is operated by Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, headquartered at Avenida da República 1629, 2.º Esquerda – 4430-206 Vila Nova de Gaia, Portugal. We are the controllers of your data, under the terms of the GDPR (General Data Protection Regulation).' },

      { type: 'h3', text: '2. What information we collect' },
      { type: 'p', text: 'When you create an account: name and surname; email; year of birth (to verify age); username of your choice.' },
      { type: 'p', text: 'When you use Codex: books you add to your library; reading lists you create; loans you make or ask for; ratings, grades, and favorites; theme and language preferences; profile picture (if you upload one).' },
      { type: 'p', text: 'Automatically: IP address (for security, erased after 90 days); device type and browser; pages you visit in Codex.' },
      { type: 'p', text: 'We do not collect: accurate GPS location; contacts – telephone, address; social media information (except professional profile).' },

      { type: 'h3', text: '3. Why we collect this data' },
      { type: 'p', text: 'Legal basis (GDPR Article 6): contract execution (we need this data for Codex to function properly); consent (when you give us explicit permission, e.g., make library public); legal obligation (when the law obliges us, e.g., to respond to requests from authorities). For minors, we also apply Article 8 of the GDPR and Law No. 58/2019.' },

      { type: 'h3', text: '4. With whom we share' },
      { type: 'p', text: 'With other users: your username, school, and district are visible to colleagues in your district when you make books available for loan. We never show your real name, email, age, or photo to other users unless you indicate it.' },
      { type: 'p', text: 'With suppliers: Supabase (database, located in the EU); Cloudflare (hosting and security). These providers only process data on our behalf under GDPR contracts.' },
      { type: 'p', text: 'With authorities: only if we are legally obliged to (e.g., criminal investigation by court order).' },

      { type: 'h3', text: '5. How long we keep' },
      { type: 'p', text: 'Active account: while using Codex. Account deleted: we remove everything within 30 days. Closed loan records: 2 years (for history). Technical logs: 90 days.' },

      { type: 'h3', text: '6. Your rights (GDPR)' },
      { type: 'p', text: 'You have the right to: access your data (you can export at any time); correct erroneous data; delete your account and data; limit how we use your data; oppose certain treatments; take your data to another application (portability). To exercise any of these rights, please write to us: codex@kendirstudios.pt. We respond within 30 days. If you are not satisfied, you can complain to the CNPD (National Data Protection Commission): www.cnpd.pt' },

      { type: 'h3', text: '7. Safety' },
      { type: 'p', text: 'We use encryption (HTTPS), encrypted passwords, restricted database access, and make regular backups. No system is 100% secure — if we know of a breach affecting you, we notify you within 72 hours.' },

      { type: 'h3', text: '8. Cookies and local storage' },
      { type: 'p', text: 'Codex uses only technical local storage (to keep the session open and remember preferences). We do not use tracking or advertising cookies.' },

      { type: 'h3', text: '9. Amendments' },
      { type: 'p', text: 'If we change this policy, we will let you know on Codex and by email.' },

      { type: 'h3', text: '10. Contacts' },
      { type: 'p', text: 'Responsible for the processing: Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, headquartered at Avenida da República 1629, 2.º Esquerda – 4430-206 Vila Nova de Gaia, Portugal. Email: codex@kendirstudios.pt. DPO (Data Protection Officer): Catarina Pinto – codex@kendirstudios.pt' },
    ],
  },
};

// ---------- ES ----------
const es: LandingLegalContent = {
  about: {
    title: 'Acerca de',
    blocks: [
      { type: 'eyebrow', text: 'Versión 1.0.0' },
      { type: 'lead', text: 'Un sistema para gestionar bibliotecas personales y promover el ciclo de vida del libro.' },
      { type: 'h2', text: 'Acerca de' },
      { type: 'p', text: 'Codex fue creado para encarnar el deseo de muchos de nosotros, con tantos libros bajo nuestro cuidado y préstamos entre amigos y familiares. Un proyecto de Kendir Studios (Worlds4Education – Jogos e Ambientes Educativos, Lda.), gemelo de Folium, que promueve y fomenta los hábitos y valores de lectura entre los jóvenes. Construido a partir de nuestro amor por los libros y el placer de construir nuestra pequeña biblioteca, un libro a la vez. Somos grandes aficionados a la lectura y creemos que los libros nos ofrecen algo que no encontramos en ningún otro sitio.' },
      { type: 'p', text: 'Buscamos ayudar a través de Codex, permitiendo que cada persona tenga un registro adecuado de sus bibliotecas personales, dónde se encuentran sus préstamos, organizar su lista de libros que formarán parte de esas bibliotecas en el futuro y encontrar eventos relacionados con la lectura y la escritura.' },
      { type: 'h2', text: 'Nuestra intención' },
      { type: 'p', text: 'Nuestra intención es sencilla: ofrecer a los estudiantes un lugar donde puedan catalogar sus libros, compartirlos con amigos y compañeros y descubrir nuevas lecturas. Sin algoritmos, publicidad ni ruido, ¡solo el estudiante y sus sábanas!' },
      { type: 'p', text: 'Worlds4Education – Jogos e Ambientes Educativos, Lda.' },
      { type: 'p', text: 'Avenida da República 1629 – 2ª izquierda' },
      { type: 'p', text: '4430-206 Vila Nova de Gaia · Portugal' },
    ],
  },
  termsPrivacy: {
    title: 'Términos y Privacidad',
    blocks: [
      { type: 'h2', text: 'Términos y Condiciones de Uso' },
      { type: 'eyebrow', text: 'Última actualización: 15 de mayo de 2026' },
      { type: 'lead', text: 'Bienvenido al Codex. Al crear una cuenta, aceptas estos términos.' },

      { type: 'h3', text: '1. Qué es el Codex' },
      { type: 'p', text: 'Codex es una aplicación para gestionar tu biblioteca personal, descubrir libros, suscribirte y compartir listas de lectura, pedir préstamos y ver eventos relacionados con la lectura y la escritura.' },

      { type: 'h3', text: '2. Quién puede usarlo' },
      { type: 'p', text: 'Codex está disponible para mayores de 18 años.' },

      { type: 'h3', text: '3. Tu cuenta' },
      { type: 'p', text: 'Cuando creas una cuenta, aceptas: proporcionar información verdadera sobre uno mismo (nombre, apellido, año de nacimiento); no crear cuentas falsas ni crear una cuenta a nombre de otra persona; mantener tu contraseña segura; informarnos si alguien inicia sesión en tu cuenta sin autorización. Si usas tu cuenta de forma incorrecta (insultos, compartir contenido ofensivo, intentos de hacer trampa), podemos suspender o eliminar tu cuenta sin previo aviso.' },

      { type: 'h3', text: '4. Préstamos de libros' },
      { type: 'p', text: 'Codex te permite pedir prestados libros a otros usuarios. Los libros pertenecen a los usuarios, no al Códice. Somos solo una plataforma de conexión. Eres responsable del libro que te prestes. Si lo pierdes o dañas, deberías liquidarlo directamente con la persona que te lo prestó. Organiza siempre la entrega de libros en lugares seguros, preferiblemente en lugares públicos y a personas de confianza. Nunca organices encuentros con desconocidos en lugares privados. Codex no se hace responsable de libros perdidos o dañados ni de conflictos entre usuarios.' },

      { type: 'h3', text: '5. Lo que no puedes hacer' },
      { type: 'p', text: 'Insultar, amenazar o intimidar a otros usuarios. Compartir contenido ofensivo, pornográfico o ilegal. Intentar acceder a las cuentas de otros. Utilizar el Códice para vender libros o con fines comerciales. Copiar o revender datos de otros usuarios.' },

      { type: 'h3', text: '6. Contenido que compartes' },
      { type: 'p', text: 'Las notas, valoraciones y listas que crees son tuyas. Si haces pública una lista, otros usuarios pueden verla. Puedes eliminar tu contenido en cualquier momento.' },

      { type: 'h3', text: '7. Eliminar la cuenta' },
      { type: 'p', text: 'Puedes eliminar tu cuenta en cualquier momento en Configuración. Cuando eliminas, eliminamos todos tus datos en un plazo de 30 días, excepto lo que la ley nos obliga a conservar (por ejemplo, registros de préstamos en curso hasta que se devuelvan).' },

      { type: 'h3', text: '8. Cambios en los términos' },
      { type: 'p', text: 'Podemos actualizar estos términos. Si hay cambios importantes, te lo comunicaremos por correo electrónico o directamente en Codex. Seguir usando Codex tras los cambios significa que aceptas los nuevos términos.' },

      { type: 'h3', text: '9. Derecho regulador' },
      { type: 'p', text: 'Estos términos están regulados por la ley portuguesa. Para preguntas, por favor contacta con: codex@kendirstudios.pt' },

      { type: 'h3', text: '10. Contactos' },
      { type: 'p', text: 'Codex está gestionado por Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, con sede en la Avenida da República 1629, 2.º Esquerda – 4430-206 Vila Nova de Gaia, Portugal. Correo electrónico: codex@kendirstudios.pt' },

      { type: 'h2', text: 'Política de Privacidad' },
      { type: 'eyebrow', text: 'Última actualización: 15 de mayo de 2026' },
      { type: 'lead', text: 'Esta política explica qué información recopilamos sobre ti, por qué la recopilamos y qué puedes hacer para controlar tu información. Si algo no está claro, escríbenos: codex@kendirstudios.pt' },

      { type: 'h3', text: '1. Quiénes somos' },
      { type: 'p', text: 'Codex está gestionado por Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, con sede en la Avenida da República 1629, 2.º Esquerda – 4430-206 Vila Nova de Gaia, Portugal. Somos los responsables de sus datos, conforme a los términos del RGPD (Reglamento General de Protección de Datos).' },

      { type: 'h3', text: '2. Qué información recopilamos' },
      { type: 'p', text: 'Cuando creas una cuenta: nombre y apellidos; correo electrónico; año de nacimiento (para verificar la edad); nombre de usuario que elijas.' },
      { type: 'p', text: 'Cuando usas el Codex: libros que añades a tu biblioteca; listas de lectura que creas; préstamos que hagas o pides; valoraciones, calificaciones y favoritos; temas y preferencias lingüísticas; foto de perfil (si subes una).' },
      { type: 'p', text: 'Automáticamente: dirección IP (por seguridad, borrada tras 90 días); tipo de dispositivo y navegador; páginas que visitas en el Códice.' },
      { type: 'p', text: 'No recopilamos: localización GPS precisa; contactos – teléfono, dirección; información sobre redes sociales (excepto perfil profesional).' },

      { type: 'h3', text: '3. Por qué recopilamos estos datos' },
      { type: 'p', text: 'Base legal (Artículo 6 del RGPD): ejecución por contrato (necesitamos estos datos para que el Codex funcione correctamente); consentimiento (cuando nos das permiso explícito, por ejemplo, hacer pública la biblioteca); obligación legal (cuando la ley nos obliga, por ejemplo, a responder a solicitudes de las autoridades). Para menores, también aplicamos el Artículo 8 del RGPD y la Ley nº 58/2019.' },

      { type: 'h3', text: '4. Con quién compartimos' },
      { type: 'p', text: 'Con otros usuarios: tu nombre de usuario, escuela y distrito son visibles para los colegas de tu distrito cuando pones a disposición los libros para préstamo. Nunca mostramos tu nombre real, correo electrónico, edad o foto a otros usuarios a menos que tú lo indiques.' },
      { type: 'p', text: 'Con los proveedores: Supabase (base de datos, ubicada en la UE); Cloudflare (alojamiento y seguridad). Estos proveedores solo procesan datos en nuestro nombre bajo contratos RGPD.' },
      { type: 'p', text: 'Con las autoridades: solo si estamos legalmente obligados a ello (por ejemplo, investigación penal por orden judicial).' },

      { type: 'h3', text: '5. Cuánto tiempo guardamos' },
      { type: 'p', text: 'Cuenta activa: mientras se utiliza el Codex. Cuenta eliminada: eliminamos todo en un plazo de 30 días. Registros de préstamos cerrados: 2 años (para la historia). Registros técnicos: 90 días.' },

      { type: 'h3', text: '6. Tus derechos (RGPD)' },
      { type: 'p', text: 'Tienes derecho a: acceder a tus datos (puedes exportarlos en cualquier momento); corregir datos erróneos; borrar tu cuenta y tus datos; limitar cómo usamos tus datos; oponerse a ciertos tratamientos; llevar tus datos a otra aplicación (portabilidad). Para ejercer cualquiera de estos derechos, por favor escríbenos: codex@kendirstudios.pt. Respondemos en un plazo de 30 días. Si no estás satisfecho, puedes presentar una queja ante la CNPD (Comisión Nacional de Protección de Datos): www.cnpd.pt' },

      { type: 'h3', text: '7. Seguridad' },
      { type: 'p', text: 'Usamos cifrado (HTTPS), contraseñas cifradas, acceso restringido a bases de datos y realizamos copias de seguridad regulares. Ningún sistema es 100% seguro — si tenemos conocimiento de una brecha que te afecta, te notificamos en un plazo de 72 horas.' },

      { type: 'h3', text: '8. Cookies y almacenamiento local' },
      { type: 'p', text: 'Codex utiliza solo almacenamiento local técnico (para mantener la sesión abierta y recordar preferencias). No utilizamos cookies de rastreo ni de publicidad.' },

      { type: 'h3', text: '9. Enmiendas' },
      { type: 'p', text: 'Si cambiamos esta política, te lo comunicaremos por Codex y por correo electrónico.' },

      { type: 'h3', text: '10. Contactos' },
      { type: 'p', text: 'Responsable del procesamiento: Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, con sede en la Avenida da República 1629, 2.º Esquerda – 4430-206 Vila Nova de Gaia, Portugal. Correo electrónico: codex@kendirstudios.pt. DPO (Responsable de Protección de Datos): Catarina Pinto – codex@kendirstudios.pt' },
    ],
  },
};

// ---------- FR ----------
const fr: LandingLegalContent = {
  about: {
    title: 'À propos',
    blocks: [
      { type: 'eyebrow', text: 'Version 1.0.0' },
      { type: 'lead', text: 'Un système pour gérer les bibliothèques personnelles et promouvoir le cycle de vie du livre.' },
      { type: 'h2', text: 'À propos' },
      { type: 'p', text: "Codex a été créé pour incarner le désir de beaucoup d'entre nous, avec autant de livres sous notre responsabilité et des prêts entre divers amis et familles. Un projet de Kendir Studios (Worlds4Education – Jogos e Ambientes Educativos, Lda.), jumeau de Folium, qui promeut et favorise les habitudes et valeurs de lecture chez les jeunes. Construit à partir de notre amour des livres et du plaisir de construire notre petite bibliothèque, un livre à la fois. Nous sommes de grands amateurs de lecture, et nous croyons que les livres nous offrent quelque chose que nous ne trouvons nulle part ailleurs." },
      { type: 'p', text: "Nous cherchons à aider via Codex, permettant à chaque personne d'avoir un registre approprié de ses bibliothèques personnelles, de l'emplacement de ses prêts, d'organiser sa liste de livres qui feront partie de ces bibliothèques à l'avenir, et de trouver des événements liés à la lecture et à l'écriture." },
      { type: 'h2', text: 'Notre intention' },
      { type: 'p', text: "Notre intention est simple : offrir aux élèves un espace où ils peuvent cataloguer leurs livres, les partager avec des amis et des collègues et découvrir de nouvelles lectures. Pas d'algorithmes, de publicité ni de bruit – juste l'étudiant et ses feuilles !" },
      { type: 'p', text: 'Worlds4Education – Jogos e Ambientes Educativos, Lda.' },
      { type: 'p', text: 'Avenida da República 1629 – 2e à gauche' },
      { type: 'p', text: '4430-206 Vila Nova de Gaia · Portugal' },
    ],
  },
  termsPrivacy: {
    title: 'Conditions & Confidentialité',
    blocks: [
      { type: 'h2', text: "Conditions Générales d'Utilisation" },
      { type: 'eyebrow', text: 'Dernière mise à jour : 15 mai 2026' },
      { type: 'lead', text: 'Bienvenue au Codex. En créant un compte, vous acceptez ces conditions.' },

      { type: 'h3', text: "1. Qu'est-ce que le Codex" },
      { type: 'p', text: "Codex est une application pour gérer votre bibliothèque personnelle, découvrir des livres, s'abonner et partager des listes de lecture, emprunter des livres et visionner des événements liés à la lecture et à l'écriture." },

      { type: 'h3', text: '2. Qui peut l\'utiliser' },
      { type: 'p', text: 'Codex est accessible aux personnes de plus de 18 ans.' },

      { type: 'h3', text: '3. Votre compte' },
      { type: 'p', text: "Lorsque vous créez un compte, vous acceptez de : donner des informations véritables sur soi-même (nom, nom de famille, année de naissance); ne pas créer de faux comptes ni créer un compte au nom de quelqu'un d'autre; garder votre mot de passe en sécurité; nous informer si quelqu'un se connecte à votre compte sans autorisation. Si vous utilisez votre compte de manière incorrecte (insultes, partage de contenu offensant, tentatives de triche), nous pouvons suspendre ou supprimer votre compte sans préavis." },

      { type: 'h3', text: '4. Prêts de livres' },
      { type: 'p', text: "Codex vous permet d'emprunter des livres à d'autres utilisateurs. Les livres appartiennent aux utilisateurs, pas au Codex. Nous ne sommes qu'une plateforme de liaison. Vous êtes responsable du livre que vous empruntez. Si vous le perdez ou l'abîmez, vous devriez le régler directement avec la personne qui l'a prêté. Organisez toujours la livraison des livres dans des lieux sûrs, de préférence dans des lieux publics et à des personnes de confiance. N'organisez jamais de rencontres avec des inconnus dans des lieux privés. Codex n'est pas responsable des livres perdus, endommagés ou des conflits entre utilisateurs." },

      { type: 'h3', text: '5. Ce que vous ne pouvez pas faire' },
      { type: 'p', text: "Insulter, menacer ou intimider d'autres utilisateurs. Partage de contenus offensants, pornographiques ou illégaux. Essayer d'accéder aux comptes des autres. Utiliser le Codex pour vendre des livres ou à des fins commerciales. Copie ou revente des données d'autres utilisateurs." },

      { type: 'h3', text: '6. Contenu que vous partagez' },
      { type: 'p', text: "Les notes, notes et listes que vous créez vous appartiennent. Si vous rendez une liste publique, d'autres utilisateurs peuvent la voir. Vous pouvez supprimer votre contenu à tout moment." },

      { type: 'h3', text: '7. Supprimer le compte' },
      { type: 'p', text: "Vous pouvez supprimer votre compte à tout moment dans les Paramètres. Lorsque vous supprimez, nous supprimons toutes vos données dans un délai de 30 jours, sauf ce que la loi nous oblige à conserver (par exemple, les dossiers des prêts en cours jusqu'à leur remboursement)." },

      { type: 'h3', text: '8. Modifications des termes' },
      { type: 'p', text: "Nous pourrions mettre à jour ces conditions. En cas de changements majeurs, nous vous en informerons par e-mail ou via Codex lui-même. Continuer à utiliser Codex après les changements signifie que vous acceptez les nouveaux termes." },

      { type: 'h3', text: '9. Droit applicable' },
      { type: 'p', text: 'Ces termes sont régis par la loi portugaise. Pour toute question, veuillez contacter : codex@kendirstudios.pt' },

      { type: 'h3', text: '10. Contacts' },
      { type: 'p', text: "Codex est géré par Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, dont le siège est à l'Avenida da República 1629, 2.º Esquerda – 4430-206 Vila Nova de Gaia, Portugal. Email : codex@kendirstudios.pt" },

      { type: 'h2', text: 'Politique de Confidentialité' },
      { type: 'eyebrow', text: 'Dernière mise à jour : 15 mai 2026' },
      { type: 'lead', text: "Cette politique explique quelles informations nous recueillons à votre sujet, pourquoi nous les recueillons, et ce que vous pouvez faire pour contrôler vos informations. Si quelque chose n'est pas clair, écrivez-nous : codex@kendirstudios.pt" },

      { type: 'h3', text: '1. Qui nous sommes' },
      { type: 'p', text: "Codex est géré par Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, dont le siège est à l'Avenida da República 1629, 2.º Esquerda – 4430-206 Vila Nova de Gaia, Portugal. Nous sommes les responsables du traitement de vos données, conformément aux termes du RGPD (Règlement général sur la protection des données)." },

      { type: 'h3', text: '2. Quelles informations nous collectons' },
      { type: 'p', text: "Lorsque vous créez un compte : nom et nom de famille; email; année de naissance (pour vérifier l'âge); nom d'utilisateur de votre choix." },
      { type: 'p', text: "Quand vous utilisez le Codex : livres que vous ajoutez à votre bibliothèque; listes de lecture que vous créez; prêts que vous faites ou demandez; notes, classements et favoris; thèmes et préférences linguistiques; photo de profil (si vous en téléchargez une)." },
      { type: 'p', text: "Automatiquement : adresse IP (pour la sécurité, effacée après 90 jours); type d'appareil et navigateur; pages que vous visitez dans le Codex." },
      { type: 'p', text: "Nous ne collectons pas : localisation GPS précise; contacts – téléphone, adresse; informations sur les réseaux sociaux (sauf le profil professionnel)." },

      { type: 'h3', text: '3. Pourquoi nous collectons ces données' },
      { type: 'p', text: "Base juridique (RGPD, article 6) : exécution du contrat (nous avons besoin de ces données pour que le Codex fonctionne correctement); consentement (lorsque vous nous donnez une permission explicite, par exemple, rendre la bibliothèque publique); obligation légale (lorsque la loi nous oblige, par exemple, à répondre aux demandes des autorités). Pour les mineurs, nous appliquons également l'article 8 du RGPD et la loi n° 58/2019." },

      { type: 'h3', text: '4. Avec qui nous partageons' },
      { type: 'p', text: "Avec d'autres utilisateurs : votre nom d'utilisateur, votre école et votre district sont visibles pour vos collègues de votre district lorsque vous mettez des livres à disposition en emprunt. Nous ne montrons jamais votre vrai nom, e-mail, âge ou photo à d'autres utilisateurs à moins que vous ne l'indiquiez." },
      { type: 'p', text: "Avec les fournisseurs : Supabase (base de données, située dans l'UE); Cloudflare (hébergement et sécurité). Ces prestataires ne traitent les données qu'en notre nom dans le cadre de contrats RGPD." },
      { type: 'p', text: "Avec les autorités : seulement si nous y sommes légalement obligés (par exemple, enquête pénale par ordonnance judiciaire)." },

      { type: 'h3', text: '5. Combien de temps nous gardons' },
      { type: 'p', text: "Compte actif : pendant l'utilisation du Codex. Compte supprimé : nous supprimons tout dans les 30 jours. Dossiers de prêts fermés : 2 ans (pour l'historique). Journaux techniques : 90 jours." },

      { type: 'h3', text: '6. Vos droits (RGPD)' },
      { type: 'p', text: "Vous avez le droit de : accéder à vos données (vous pouvez exporter à tout moment); corriger des données erronées; supprimer votre compte et vos données; limiter la façon dont nous utilisons vos données; s'opposer à certains traitements; transférer vos données vers une autre application (portabilité). Pour exercer l'un de ces droits, veuillez nous écrire : codex@kendirstudios.pt. Nous répondons dans un délai de 30 jours. Si vous n'êtes pas satisfait, vous pouvez vous plaindre auprès de la CNPD (Commission nationale de protection des données) : www.cnpd.pt" },

      { type: 'h3', text: '7. Sécurité' },
      { type: 'p', text: "Nous utilisons le chiffrement (HTTPS), des mots de passe chiffrés, un accès restreint à la base de données et réalisons des sauvegardes régulières. Aucun système n'est 100 % sécurisé — si nous avons connaissance d'une violation vous concernant, nous vous en informons sous 72 heures." },

      { type: 'h3', text: '8. Cookies et stockage local' },
      { type: 'p', text: "Codex utilise uniquement un stockage local technique (pour garder la session ouverte et mémoriser les préférences). Nous n'utilisons pas de cookies de suivi ou de publicité." },

      { type: 'h3', text: '9. Amendements' },
      { type: 'p', text: 'Si nous modifions cette politique, nous vous en informerons via Codex et par email.' },

      { type: 'h3', text: '10. Contacts' },
      { type: 'p', text: "Responsable du traitement : Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, dont le siège est à l'Avenida da República 1629, 2.º Esquerda – 4430-206 Vila Nova de Gaia, Portugal. Email : codex@kendirstudios.pt. DPO (Responsable de la Protection des Données) : Catarina Pinto – codex@kendirstudios.pt" },
    ],
  },
};

export const LANDING_LEGAL: Record<LandingLegalLang, LandingLegalContent> = { pt, en, es, fr };

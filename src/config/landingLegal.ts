// Legal & about content for the landing page (pre-auth).
// Each language provides three documents: about, terms, privacy.
// Rendered via the LandingInfoModal in the landing-page aesthetic.

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
      { type: 'lead', text: 'Um sistema de gestão de bibliotecas pessoais e promoção da leitura.' },
      { type: 'h2', text: 'Sobre' },
      { type: 'p', text: 'Codex é um projeto da Kendir Studios (Worlds4Education – Jogos e Ambientes Educativos, Lda.), construído do nosso amor por livros e pelo prazer de construir a nossa pequena biblioteca, um livro de cada vez. Somos enormes fãs de leitura e acreditamos que os livros nos dão algo que não encontramos em mais nenhum lugar. Mas os hábitos de leitura estão a desaparecer, lentamente, em todo o lado.' },
      { type: 'p', text: 'Procuramos ajudar através de Codex, permitindo a qualquer pessoa catalogar as suas bibliotecas, descobrir novos livros, explorar planos de leitura, encontrar bibliotecas, partilhar livros e leituras com amigos, e fazer evoluir uma biblioteca pessoal que possa ser um local de refúgio, amor e crescimento.' },
      { type: 'h2', text: 'A nossa intenção' },
      { type: 'p', text: 'A nossa intenção é simples: dar a qualquer pessoa um local onde possa catalogar os seus livros, partilhá-los com amigos e descobrir novas leituras. Sem algoritmos, publicidade ou ruído – apenas tu e os teus livros!' },
      { type: 'p', text: 'Worlds4Education – Jogos e Ambientes Educativos, Lda.' },
      { type: 'p', text: 'Avenida da República 1629 – 2.º Esquerdo' },
      { type: 'p', text: '4430-206 Vila Nova de Gaia · Portugal' },
    ],
  },
  termsPrivacy: {
    title: 'Termos e Privacidade',
    blocks: [
      { type: 'h2', text: 'Termos e Condições de Utilização' },
      { type: 'eyebrow', text: 'Última atualização: 20 de Abril de 2026' },
      { type: 'lead', text: 'Bem-vindo ao Codex. Ao criar uma conta, aceitas estes termos. Lê com atenção — se tiveres menos de 18 anos, pede ajuda a um adulto para perceber bem o que estás a aceitar.' },

      { type: 'h3', text: '1. O que é o Codex' },
      { type: 'p', text: 'O Codex é uma aplicação para gerires a tua biblioteca pessoal, descobrir livros, partilhar listas de leitura e emprestar livros a colegas da tua escola e distrito.' },

      { type: 'h3', text: '2. Quem pode usar' },
      { type: 'p', text: 'O Codex está disponível para pessoas com mais de 12 anos. Se tens entre 12 e 17 anos, precisas da autorização dos teus pais ou encarregados de educação. Vamos confirmar essa autorização por email antes de ativar a tua conta.' },

      { type: 'h3', text: '3. A tua conta' },
      { type: 'p', text: 'Quando crias uma conta, concordas em: dar informação verdadeira sobre ti (nome, escola, distrito); não criar contas falsas ou passar-te por outra pessoa; manter a tua palavra-passe segura; avisar-nos se alguém entrar na tua conta sem autorização. Se usares a conta de forma imprópria (insultos, partilha de conteúdo ofensivo, tentativas de fraude), podemos suspender ou apagar a conta sem aviso prévio.' },

      { type: 'h3', text: '4. Empréstimos de livros' },
      { type: 'p', text: 'O Codex permite pedir livros emprestados a outros utilizadores da tua escola ou distrito. Os livros são dos utilizadores, não do Codex. Tu és responsável pelo livro que pedes emprestado. Combina sempre a entrega dos livros em sítios seguros, de preferência na tua escola, em bibliotecas públicas, ou com um adulto presente. Nunca combines encontros com desconhecidos em sítios privados. O Codex não se responsabiliza por livros perdidos, danificados ou conflitos entre utilizadores.' },

      { type: 'h3', text: '5. O que não podes fazer' },
      { type: 'p', text: 'Insultar, ameaçar ou intimidar outros utilizadores. Partilhar conteúdo ofensivo, pornográfico ou ilegal. Tentar aceder a contas de outras pessoas. Usar o Codex para vender livros ou para fins comerciais. Copiar ou revender dados de outros utilizadores.' },

      { type: 'h3', text: '6. Conteúdo que partilhas' },
      { type: 'p', text: 'As notas, classificações e listas que crias são tuas. Se tornares uma lista pública, outros utilizadores podem ver. Podes apagar o teu conteúdo a qualquer momento.' },

      { type: 'h3', text: '7. Apagar a conta' },
      { type: 'p', text: 'Podes apagar a tua conta a qualquer momento nas Definições. Quando apagas, removemos todos os teus dados em até 30 dias, exceto o que somos obrigados a manter por lei (ex.: registos de empréstimos em curso até serem devolvidos).' },

      { type: 'h3', text: '8. Alterações aos termos' },
      { type: 'p', text: 'Podemos atualizar estes termos. Se houver mudanças importantes, avisamos-te por email ou no próprio Codex. Continuar a usar o Codex após as alterações significa que aceitas os novos termos.' },

      { type: 'h3', text: '9. Lei aplicável' },
      { type: 'p', text: 'Estes termos são regidos pela lei portuguesa. Para questões, contacta: codex@kendirstudios.pt' },

      { type: 'h3', text: '10. Contactos' },
      { type: 'p', text: 'Codex é operado por Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, sediada em Avenida da República 1629, 2.º Esquerdo – 4430-206 Vila Nova de Gaia, Portugal. Email: codex@kendirstudios.pt' },

      { type: 'h2', text: 'Política de Privacidade' },
      { type: 'eyebrow', text: 'Última atualização: 20 de Abril de 2026' },
      { type: 'lead', text: 'Esta política explica que informação recolhemos sobre ti, porque é que a recolhemos, e o que podes fazer para controlar a tua informação. Se algo não for claro, escreve-nos: codex@kendirstudios.pt' },

      { type: 'h3', text: '1. Quem somos' },
      { type: 'p', text: 'Codex é operado por Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, sediada em Avenida da República 1629, 2.º Esquerdo – 4430-206 Vila Nova de Gaia, Portugal. Somos os responsáveis pelo tratamento dos teus dados, nos termos do RGPD.' },

      { type: 'h3', text: '2. Que informação recolhemos' },
      { type: 'p', text: 'Quando crias uma conta: nome e apelido; email; data de nascimento (para verificar idade); se tens menos de 18, o email de um encarregado de educação; país, distrito e escola (para empréstimos entre colegas); username que escolheres.' },
      { type: 'p', text: 'Quando usas o Codex: livros que adicionas à tua biblioteca; listas de leitura que crias; empréstimos que fazes ou pedes; classificações, notas e favoritos; preferências de tema e idioma; foto de perfil (se carregares uma).' },
      { type: 'p', text: 'Automaticamente: endereço IP (para segurança, apagado após 90 dias); tipo de dispositivo e navegador; páginas que visitas no Codex.' },
      { type: 'p', text: 'Não recolhemos: localização GPS precisa, contactos do teu telefone, informação de redes sociais.' },

      { type: 'h3', text: '3. Porque é que recolhemos estes dados' },
      { type: 'p', text: 'Base legal (RGPD Artigo 6): execução do contrato; consentimento; obrigação legal. Para menores, aplicamos também o Artigo 8 do RGPD e a Lei n.º 58/2019.' },

      { type: 'h3', text: '4. Com quem partilhamos' },
      { type: 'p', text: 'Com outros utilizadores: o teu username, escola e distrito ficam visíveis para colegas do teu distrito quando colocas livros disponíveis para empréstimo. Nunca mostramos o teu nome real, email, idade ou foto a outros utilizadores, a não ser que o indiques.' },
      { type: 'p', text: 'Com fornecedores: Supabase (base de dados, localizada na UE); Cloudflare (alojamento e segurança). Estes fornecedores apenas processam dados em nosso nome, sob contratos RGPD.' },
      { type: 'p', text: 'Com autoridades: apenas se formos legalmente obrigados. Nunca vendemos os teus dados. Nunca mostramos publicidade direcionada a menores.' },

      { type: 'h3', text: '5. Quanto tempo guardamos' },
      { type: 'p', text: 'Conta ativa: enquanto usares o Codex. Conta apagada: removemos tudo em até 30 dias. Registos de empréstimo fechados: 2 anos. Logs técnicos: 90 dias.' },

      { type: 'h3', text: '6. Os teus direitos (RGPD)' },
      { type: 'p', text: 'Tens o direito de aceder aos teus dados, corrigir dados errados, apagar a tua conta e dados, limitar como usamos os teus dados, opor-te a certos tratamentos, e levar os teus dados para outra aplicação (portabilidade). Para exercer qualquer destes direitos, escreve-nos: codex@kendirstudios.pt. Respondemos em até 30 dias. Se não ficares satisfeito, podes reclamar junto da CNPD: www.cnpd.pt' },

      { type: 'h3', text: '7. Menores de 18 anos' },
      { type: 'p', text: 'Aplicamos proteções extra: precisamos da autorização de um encarregado de educação antes de ativar a conta; os teus dados ficam menos visíveis por predefinição; não te mostramos publicidade; podemos recusar pedidos de empréstimo suspeitos. Se és pai, mãe ou encarregado e queres pedir informação sobre o teu educando, escreve-nos: codex@kendirstudios.pt' },

      { type: 'h3', text: '8. Segurança' },
      { type: 'p', text: 'Usamos encriptação (HTTPS), palavras-passe encriptadas, acesso restrito à base de dados, e fazemos cópias de segurança regulares. Nenhum sistema é 100% seguro — se soubermos de uma violação que te afete, avisamos-te em até 72 horas.' },

      { type: 'h3', text: '9. Cookies e armazenamento local' },
      { type: 'p', text: 'O Codex usa apenas armazenamento local técnico (para manter a sessão aberta e lembrar preferências). Não usamos cookies de rastreamento ou publicidade.' },

      { type: 'h3', text: '10. Alterações' },
      { type: 'p', text: 'Se mudarmos esta política, avisamos-te no Codex e por email. Alterações substanciais que afetem menores terão novo consentimento dos encarregados.' },

      { type: 'h3', text: '11. Contactos' },
      { type: 'p', text: 'Responsável pelo tratamento: Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, Avenida da República 1629, 2.º Esquerdo – 4430-206 Vila Nova de Gaia, Portugal. Email: codex@kendirstudios.pt. DPO: Catarina Pinto – codex@kendirstudios.pt' },
    ],
  },
};

// ---------- EN ----------
const en: LandingLegalContent = {
  about: {
    title: 'About',
    blocks: [
      { type: 'eyebrow', text: 'Version 1.0.0' },
      { type: 'lead', text: 'A system for managing personal libraries and promoting reading.' },
      { type: 'h2', text: 'About' },
      { type: 'p', text: "Codex is a project by Kendir Studios (Worlds4Education – Jogos e Ambientes Educativos, Lda.), built from our love for books and the pleasure of building our small library, one book at a time. We're huge fans of reading, and we believe that books give us something we can't find anywhere else. But reading habits are slowly disappearing everywhere." },
      { type: 'p', text: 'We seek to help through Codex, allowing anyone to catalogue their libraries, discover new books, explore reading plans, find libraries, share books and readings with peers, and evolve a personal library that can be a place of refuge, love and growth.' },
      { type: 'h2', text: 'Our intention' },
      { type: 'p', text: 'Our intention is simple: to give anyone a place where they can catalogue their books, share them with friends and discover new readings. No algorithms, advertising or noise - just you and your books!' },
      { type: 'p', text: 'Worlds4Education – Jogos e Ambientes Educativos, Lda.' },
      { type: 'p', text: 'Avenida da República 1629 – 2nd Left' },
      { type: 'p', text: '4430-206 Vila Nova de Gaia · Portugal' },
    ],
  },
  termsPrivacy: {
    title: 'Terms & Privacy',
    blocks: [
      { type: 'h2', text: 'Terms and Conditions of Use' },
      { type: 'eyebrow', text: 'Last updated: April 20, 2026' },
      { type: 'lead', text: "Welcome to Codex. By creating an account, you accept these terms. Read carefully — if you're under 18, ask an adult for help to understand what you're accepting." },

      { type: 'h3', text: '1. What is Codex' },
      { type: 'p', text: 'Codex is an app for managing your personal library, discovering books, sharing reading lists, and lending books to classmates in your school and district.' },

      { type: 'h3', text: '2. Who can use it' },
      { type: 'p', text: 'Codex is available for people over the age of 12. If you are between 12 and 17 years old, you need the permission of your parents or guardians. We will confirm this authorization by email before activating your account.' },

      { type: 'h3', text: '3. Your account' },
      { type: 'p', text: 'When you create an account, you agree to: give true information about yourself (name, school, district); not create fake accounts or impersonate someone else; keep your password secure; let us know if someone logs into your account without authorization. If you use your account improperly, we may suspend or delete your account without notice.' },

      { type: 'h3', text: '4. Book loans' },
      { type: 'p', text: 'Codex lets you borrow books from other users in your school or district. The books belong to the users, not to Codex. You are responsible for the book you borrow. Always arrange to deliver books in safe places — preferably at your school, in public libraries, or with an adult present. Never arrange meetings with strangers in private places. Codex is not responsible for lost or damaged books or conflicts between users.' },

      { type: 'h3', text: "5. What you can't do" },
      { type: 'p', text: "Insulting, threatening, or intimidating other users. Sharing offensive, pornographic, or illegal content. Trying to access other people's accounts. Using Codex to sell books or for commercial purposes. Copying or reselling other users' data." },

      { type: 'h3', text: '6. Content you share' },
      { type: 'p', text: 'The notes, ratings, and lists you create are yours. If you make a list public, other users can see it. You can delete your content at any time.' },

      { type: 'h3', text: '7. Deleting your account' },
      { type: 'p', text: 'You can delete your account at any time in Settings. When you delete, we remove all of your data within 30 days, except for what we are required to keep by law (e.g., records of ongoing loans until they are returned).' },

      { type: 'h3', text: '8. Changes to the terms' },
      { type: 'p', text: 'We may update these terms. If there are major changes, we will let you know by email or in Codex itself. Continuing to use Codex after the changes means you accept the new terms.' },

      { type: 'h3', text: '9. Governing law' },
      { type: 'p', text: 'These terms are governed by Portuguese law. For questions, contact: codex@kendirstudios.pt' },

      { type: 'h3', text: '10. Contacts' },
      { type: 'p', text: 'Codex is operated by Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, headquartered at Avenida da República 1629, 2nd Left – 4430-206 Vila Nova de Gaia, Portugal. Email: codex@kendirstudios.pt' },

      { type: 'h2', text: 'Privacy Policy' },
      { type: 'eyebrow', text: 'Last updated: April 20, 2026' },
      { type: 'lead', text: 'This policy explains what information we collect about you, why we collect it, and what you can do to control your information. If something is not clear, write to us: codex@kendirstudios.pt' },

      { type: 'h3', text: '1. Who we are' },
      { type: 'p', text: 'Codex is operated by Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, headquartered at Avenida da República 1629, 2nd Left – 4430-206 Vila Nova de Gaia, Portugal. We are the controllers of your data, under the terms of the GDPR.' },

      { type: 'h3', text: '2. What information we collect' },
      { type: 'p', text: 'When you create an account: name and surname; email; date of birth (to verify age); if you are under 18, the email of a parent; country, district, and school (for peer-to-peer loans); username you choose.' },
      { type: 'p', text: 'When you use Codex: books you add to your library; reading lists you create; loans you make or request; ratings, notes, and favorites; theme and language preferences; profile picture (if you upload one).' },
      { type: 'p', text: 'Automatically: IP address (for security, erased after 90 days); device type and browser; pages you visit in Codex.' },
      { type: 'p', text: 'We do not collect: precise GPS location, contacts from your phone, information from social networks.' },

      { type: 'h3', text: '3. Why we collect this data' },
      { type: 'p', text: 'Legal basis (GDPR Article 6): contract execution; consent; legal obligation. For minors, we also apply Article 8 of the GDPR and Law No. 58/2019.' },

      { type: 'h3', text: '4. With whom we share' },
      { type: 'p', text: 'With other users: your username, school, and district are visible to peers in your district when you make books available for loan. We never show your real name, email, age, or photo to other users unless you indicate it.' },
      { type: 'p', text: 'With suppliers: Supabase (database, located in the EU); Cloudflare (hosting and security). These providers only process data on our behalf under GDPR contracts.' },
      { type: 'p', text: 'With authorities: only if we are legally obliged to. We never sell your data. We never show advertising directed to minors.' },

      { type: 'h3', text: '5. How long we keep data' },
      { type: 'p', text: 'Active account: while you use Codex. Deleted account: we remove everything within 30 days. Closed loan records: 2 years. Technical logs: 90 days.' },

      { type: 'h3', text: '6. Your rights (GDPR)' },
      { type: 'p', text: 'You have the right to access your data, correct erroneous data, delete your account and data, limit how we use your data, oppose certain processing, and take your data to another application (portability). To exercise any of these rights, write to us: codex@kendirstudios.pt. We respond within 30 days. If you are not satisfied, you can complain to the CNPD: www.cnpd.pt' },

      { type: 'h3', text: '7. Under 18 years of age' },
      { type: 'p', text: 'We apply extra protections: we need permission from a parent before activating your account; your data is less visible by default; we do not show you advertising; we may refuse loan requests that seem suspicious. If you are a parent or guardian and want to request information about your child, write to us: codex@kendirstudios.pt' },

      { type: 'h3', text: '8. Security' },
      { type: 'p', text: 'We use encryption (HTTPS), encrypted passwords, restricted database access, and make regular backups. No system is 100% secure — if we learn of a violation that affects you, we will let you know within 72 hours.' },

      { type: 'h3', text: '9. Cookies and local storage' },
      { type: 'p', text: 'Codex uses only technical local storage (to keep the session open and remember preferences). We do not use tracking or advertising cookies.' },

      { type: 'h3', text: '10. Amendments' },
      { type: 'p', text: 'If we change this policy, we will let you know on Codex and by email. Substantial changes that affect minors will require new consent from guardians.' },

      { type: 'h3', text: '11. Contacts' },
      { type: 'p', text: 'Data controller: Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, Avenida da República 1629, 2nd Left – 4430-206 Vila Nova de Gaia, Portugal. Email: codex@kendirstudios.pt. DPO: Catarina Pinto – codex@kendirstudios.pt' },
    ],
  },
};

// ---------- ES ----------
const es: LandingLegalContent = {
  about: {
    title: 'Acerca de',
    blocks: [
      { type: 'eyebrow', text: 'Versión 1.0.0' },
      { type: 'lead', text: 'Un sistema para gestionar bibliotecas personales y promover la lectura.' },
      { type: 'h2', text: 'Acerca de' },
      { type: 'p', text: 'Codex es un proyecto de Kendir Studios (Worlds4Education – Jogos e Ambientes Educativos, Lda.), construido a partir de nuestro amor por los libros y el placer de construir nuestra pequeña biblioteca, libro a libro. Somos grandes aficionados a la lectura y creemos que los libros nos ofrecen algo que no encontramos en ningún otro sitio. Pero los hábitos de lectura están desapareciendo poco a poco en todas partes.' },
      { type: 'p', text: 'Buscamos ayudar a través de Codex, permitiendo a cualquiera catalogar sus bibliotecas, descubrir nuevos libros, explorar planes de lectura, encontrar bibliotecas, compartir libros y lecturas con amigos, y desarrollar una biblioteca personal que pueda ser un lugar de refugio, amor y crecimiento.' },
      { type: 'h2', text: 'Nuestra intención' },
      { type: 'p', text: 'Nuestra intención es sencilla: ofrecer a cualquiera un lugar donde pueda catalogar sus libros, compartirlos con amigos y descubrir nuevas lecturas. Sin algoritmos, publicidad ni ruido — ¡solo tú y tus libros!' },
      { type: 'p', text: 'Worlds4Education – Jogos e Ambientes Educativos, Lda.' },
      { type: 'p', text: 'Avenida da República 1629 – 2ª izquierda' },
      { type: 'p', text: '4430-206 Vila Nova de Gaia · Portugal' },
    ],
  },
  termsPrivacy: {
    title: 'Términos y Privacidad',
    blocks: [
      { type: 'h2', text: 'Términos y Condiciones de Uso' },
      { type: 'eyebrow', text: 'Última actualización: 20 de abril de 2026' },
      { type: 'lead', text: 'Bienvenido a Codex. Al crear una cuenta, aceptas estos términos. Lee con atención — si tienes menos de 18 años, pide ayuda a un adulto para entender qué estás aceptando.' },

      { type: 'h3', text: '1. Qué es Codex' },
      { type: 'p', text: 'Codex es una aplicación para gestionar tu biblioteca personal, descubrir libros, compartir listas de lectura y prestar libros a compañeros de tu colegio y distrito.' },

      { type: 'h3', text: '2. Quién puede usarlo' },
      { type: 'p', text: 'Codex está disponible para personas mayores de 12 años. Si tienes entre 12 y 17 años, necesitas el permiso de tus padres o tutores. Confirmaremos esta autorización por correo electrónico antes de activar tu cuenta.' },

      { type: 'h3', text: '3. Tu cuenta' },
      { type: 'p', text: 'Cuando creas una cuenta, aceptas: proporcionar información real sobre ti (nombre, centro, distrito); no crear cuentas falsas ni hacerte pasar por otra persona; mantener tu contraseña segura; informarnos si alguien inicia sesión en tu cuenta sin autorización. Si usas tu cuenta de forma inadecuada, podemos suspender o eliminar tu cuenta sin previo aviso.' },

      { type: 'h3', text: '4. Préstamos de libros' },
      { type: 'p', text: 'Codex te permite pedir prestados libros de otros usuarios de tu colegio o distrito. Los libros pertenecen a los usuarios, no a Codex. Eres responsable del libro que tomas prestado. Organiza siempre la entrega en lugares seguros — preferiblemente en tu colegio, en bibliotecas públicas o con un adulto presente. Nunca organices encuentros con desconocidos en lugares privados. Codex no se hace responsable de libros perdidos, dañados o conflictos entre usuarios.' },

      { type: 'h3', text: '5. Lo que no puedes hacer' },
      { type: 'p', text: 'Insultar, amenazar o intimidar a otros usuarios. Compartir contenido ofensivo, pornográfico o ilegal. Intentar acceder a las cuentas de otras personas. Utilizar Codex para vender libros o con fines comerciales. Copiar o revender datos de otros usuarios.' },

      { type: 'h3', text: '6. Contenido que compartes' },
      { type: 'p', text: 'Las notas, valoraciones y listas que creas son tuyas. Si haces pública una lista, otros usuarios pueden verla. Puedes eliminar tu contenido en cualquier momento.' },

      { type: 'h3', text: '7. Eliminar la cuenta' },
      { type: 'p', text: 'Puedes eliminar tu cuenta en cualquier momento en Configuración. Cuando la eliminas, eliminamos todos tus datos en un plazo de 30 días, excepto lo que la ley nos obliga a conservar.' },

      { type: 'h3', text: '8. Cambios en los términos' },
      { type: 'p', text: 'Podemos actualizar estos términos. Si hay cambios importantes, te lo comunicaremos por correo electrónico o en Codex. Seguir usando Codex tras los cambios significa que aceptas los nuevos términos.' },

      { type: 'h3', text: '9. Derecho aplicable' },
      { type: 'p', text: 'Estos términos están regulados por la ley portuguesa. Para preguntas: codex@kendirstudios.pt' },

      { type: 'h3', text: '10. Contactos' },
      { type: 'p', text: 'Codex está gestionado por Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, Avenida da República 1629, 2ª izquierda – 4430-206 Vila Nova de Gaia, Portugal. Email: codex@kendirstudios.pt' },

      { type: 'h2', text: 'Política de Privacidad' },
      { type: 'eyebrow', text: 'Última actualización: 20 de abril de 2026' },
      { type: 'lead', text: 'Esta política explica qué información recopilamos sobre ti, por qué la recopilamos y qué puedes hacer para controlar tu información. Si algo no está claro, escríbenos: codex@kendirstudios.pt' },

      { type: 'h3', text: '1. Quiénes somos' },
      { type: 'p', text: 'Codex está gestionado por Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, Avenida da República 1629, 2ª izquierda – 4430-206 Vila Nova de Gaia, Portugal. Somos los responsables de tus datos conforme al RGPD.' },

      { type: 'h3', text: '2. Qué información recopilamos' },
      { type: 'p', text: 'Al crear una cuenta: nombre y apellidos; email; fecha de nacimiento; si eres menor de 18 años, el email de un tutor; país, distrito y escuela; nombre de usuario.' },
      { type: 'p', text: 'Al usar Codex: libros que añades; listas de lectura; préstamos; valoraciones, notas y favoritos; preferencias de tema e idioma; foto de perfil (si subes una).' },
      { type: 'p', text: 'Automáticamente: dirección IP (borrada tras 90 días); tipo de dispositivo y navegador; páginas que visitas. No recopilamos: ubicación GPS precisa, contactos del teléfono, información de redes sociales.' },

      { type: 'h3', text: '3. Por qué recopilamos estos datos' },
      { type: 'p', text: 'Base legal (RGPD Art. 6): ejecución del contrato; consentimiento; obligación legal. Para menores aplicamos también el Art. 8 del RGPD y la Ley n.º 58/2019.' },

      { type: 'h3', text: '4. Con quién compartimos' },
      { type: 'p', text: 'Con otros usuarios: tu nombre de usuario, escuela y distrito son visibles para compañeros de tu distrito cuando pones libros disponibles para préstamo. Nunca mostramos tu nombre real, email, edad o foto a menos que lo indiques.' },
      { type: 'p', text: 'Con proveedores: Supabase (base de datos en la UE); Cloudflare (alojamiento y seguridad). Procesan datos en nuestro nombre bajo contratos RGPD.' },
      { type: 'p', text: 'Con autoridades: solo si estamos legalmente obligados. Nunca vendemos tus datos. Nunca mostramos publicidad dirigida a menores.' },

      { type: 'h3', text: '5. Cuánto tiempo guardamos los datos' },
      { type: 'p', text: 'Cuenta activa: mientras uses Codex. Cuenta eliminada: borramos todo en 30 días. Préstamos cerrados: 2 años. Logs técnicos: 90 días.' },

      { type: 'h3', text: '6. Tus derechos (RGPD)' },
      { type: 'p', text: 'Tienes derecho a acceder a tus datos, corregirlos, eliminar tu cuenta, limitar cómo los usamos, oponerte a ciertos tratamientos y portabilidad. Escríbenos: codex@kendirstudios.pt. Respondemos en 30 días. Si no estás satisfecho, puedes reclamar ante la CNPD: www.cnpd.pt' },

      { type: 'h3', text: '7. Menores de 18 años' },
      { type: 'p', text: 'Aplicamos protecciones adicionales: necesitamos permiso de un tutor antes de activar tu cuenta; tus datos son menos visibles por defecto; no te mostramos publicidad; podemos rechazar préstamos sospechosos. Padres/tutores: codex@kendirstudios.pt' },

      { type: 'h3', text: '8. Seguridad' },
      { type: 'p', text: 'Usamos cifrado (HTTPS), contraseñas cifradas, acceso restringido a la base de datos y copias de seguridad regulares. Ningún sistema es 100% seguro — si nos enteramos de una infracción que te afecte, te informaremos en 72 horas.' },

      { type: 'h3', text: '9. Cookies y almacenamiento local' },
      { type: 'p', text: 'Codex solo usa almacenamiento local técnico. No usamos cookies de rastreo ni publicidad.' },

      { type: 'h3', text: '10. Modificaciones' },
      { type: 'p', text: 'Si cambiamos esta política, te lo comunicaremos en Codex y por email. Cambios sustanciales que afecten a menores requerirán nuevo consentimiento de los tutores.' },

      { type: 'h3', text: '11. Contactos' },
      { type: 'p', text: 'Responsable del tratamiento: Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, Avenida da República 1629, 2ª izquierda – 4430-206 Vila Nova de Gaia, Portugal. Email: codex@kendirstudios.pt. DPO: Catarina Pinto – codex@kendirstudios.pt' },
    ],
  },
};

// ---------- FR ----------
const fr: LandingLegalContent = {
  about: {
    title: 'À propos',
    blocks: [
      { type: 'eyebrow', text: 'Version 1.0.0' },
      { type: 'lead', text: 'Un système pour gérer les bibliothèques personnelles et promouvoir la lecture.' },
      { type: 'h2', text: 'À propos' },
      { type: 'p', text: "Codex est un projet de Kendir Studios (Worlds4Education – Jogos e Ambientes Educativos, Lda.), né de notre amour des livres et du plaisir de construire notre petite bibliothèque, un livre à la fois. Nous sommes de grands amateurs de lecture, et nous croyons que les livres nous offrent quelque chose que nous ne trouvons nulle part ailleurs. Mais les habitudes de lecture disparaissent lentement partout." },
      { type: 'p', text: "Nous cherchons à aider via Codex, permettant à chacun de cataloguer ses bibliothèques, de découvrir de nouveaux livres, d'explorer des plans de lecture, de trouver des bibliothèques, de partager des livres et des lectures avec ses amis, et de développer une bibliothèque personnelle pouvant être un lieu de refuge, d'amour et de croissance." },
      { type: 'h2', text: 'Notre intention' },
      { type: 'p', text: "Notre intention est simple : offrir à chacun un espace où il peut cataloguer ses livres, les partager avec ses amis et découvrir de nouvelles lectures. Pas d'algorithmes, de publicité ni de bruit — juste toi et tes livres !" },
      { type: 'p', text: 'Worlds4Education – Jogos e Ambientes Educativos, Lda.' },
      { type: 'p', text: 'Avenida da República 1629 – 2e à gauche' },
      { type: 'p', text: '4430-206 Vila Nova de Gaia · Portugal' },
    ],
  },
  termsPrivacy: {
    title: 'Conditions et Confidentialité',
    blocks: [
      { type: 'h2', text: "Conditions d'Utilisation" },
      { type: 'eyebrow', text: 'Dernière mise à jour : 20 avril 2026' },
      { type: 'lead', text: "Bienvenue chez Codex. En créant un compte, vous acceptez ces conditions. Lisez attentivement — si vous avez moins de 18 ans, demandez de l'aide à un adulte." },

      { type: 'h3', text: "1. Qu'est-ce que Codex" },
      { type: 'p', text: 'Codex est une application pour gérer votre bibliothèque personnelle, découvrir des livres, partager des listes de lecture et prêter des livres à vos camarades de votre école et de votre district.' },

      { type: 'h3', text: "2. Qui peut l'utiliser" },
      { type: 'p', text: "Codex est disponible pour les personnes de plus de 12 ans. Si vous avez entre 12 et 17 ans, vous avez besoin de l'autorisation de vos parents ou tuteurs. Nous confirmerons cette autorisation par e-mail avant d'activer votre compte." },

      { type: 'h3', text: '3. Votre compte' },
      { type: 'p', text: 'En créant un compte, vous acceptez de : donner des informations véritables sur vous-même ; ne pas créer de faux comptes ; garder votre mot de passe en sécurité ; nous informer si quelqu’un se connecte sans autorisation. Une utilisation incorrecte peut entraîner la suspension ou la suppression du compte sans préavis.' },

      { type: 'h3', text: '4. Prêts de livres' },
      { type: 'p', text: "Codex vous permet d'emprunter des livres à d'autres utilisateurs de votre école ou district. Les livres appartiennent aux utilisateurs, pas à Codex. Vous êtes responsable du livre que vous empruntez. Organisez toujours la livraison dans des lieux sûrs — de préférence à l'école, en bibliothèque publique, ou en présence d'un adulte. N'organisez jamais de rencontres avec des inconnus dans des lieux privés. Codex n'est pas responsable des livres perdus, endommagés ou des conflits entre utilisateurs." },

      { type: 'h3', text: '5. Ce que vous ne pouvez pas faire' },
      { type: 'p', text: "Insulter, menacer ou intimider d'autres utilisateurs. Partager du contenu offensant, pornographique ou illégal. Tenter d'accéder aux comptes d'autrui. Utiliser Codex pour vendre des livres ou à des fins commerciales. Copier ou revendre les données d'autres utilisateurs." },

      { type: 'h3', text: '6. Contenu que vous partagez' },
      { type: 'p', text: 'Les notes, évaluations et listes que vous créez vous appartiennent. Si vous rendez une liste publique, les autres utilisateurs peuvent la voir. Vous pouvez supprimer votre contenu à tout moment.' },

      { type: 'h3', text: '7. Supprimer le compte' },
      { type: 'p', text: 'Vous pouvez supprimer votre compte à tout moment dans les Paramètres. Nous supprimons toutes vos données dans un délai de 30 jours, sauf ce que la loi nous oblige à conserver.' },

      { type: 'h3', text: '8. Modifications des conditions' },
      { type: 'p', text: 'Nous pouvons mettre à jour ces conditions. En cas de changements majeurs, nous vous informerons par email ou dans Codex. Continuer à utiliser Codex vaut acceptation.' },

      { type: 'h3', text: '9. Droit applicable' },
      { type: 'p', text: 'Ces conditions sont régies par la loi portugaise. Contact : codex@kendirstudios.pt' },

      { type: 'h3', text: '10. Contacts' },
      { type: 'p', text: 'Codex est géré par Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, Avenida da República 1629, 2e à gauche – 4430-206 Vila Nova de Gaia, Portugal. Email : codex@kendirstudios.pt' },

      { type: 'h2', text: 'Politique de Confidentialité' },
      { type: 'eyebrow', text: 'Dernière mise à jour : 20 avril 2026' },
      { type: 'lead', text: "Cette politique explique quelles informations nous recueillons à votre sujet, pourquoi nous les recueillons, et ce que vous pouvez faire pour les contrôler. Si quelque chose n'est pas clair : codex@kendirstudios.pt" },

      { type: 'h3', text: '1. Qui nous sommes' },
      { type: 'p', text: "Codex est géré par Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, Avenida da República 1629, 2e à gauche – 4430-206 Vila Nova de Gaia, Portugal. Nous sommes les responsables du traitement, conformément au RGPD." },

      { type: 'h3', text: '2. Quelles informations nous collectons' },
      { type: 'p', text: 'À la création du compte : nom et prénom ; email ; date de naissance ; si moins de 18 ans, email d’un parent ; pays, district et école ; nom d’utilisateur.' },
      { type: 'p', text: "À l'utilisation : livres ajoutés ; listes de lecture ; prêts ; notes, évaluations et favoris ; préférences de thème et de langue ; photo de profil (si téléchargée)." },
      { type: 'p', text: "Automatiquement : adresse IP (effacée après 90 jours) ; type d'appareil et navigateur ; pages visitées. Nous ne collectons pas : localisation GPS précise, contacts du téléphone, informations de réseaux sociaux." },

      { type: 'h3', text: '3. Pourquoi nous collectons ces données' },
      { type: 'p', text: "Base juridique (RGPD Art. 6) : exécution du contrat ; consentement ; obligation légale. Pour les mineurs, nous appliquons aussi l'article 8 du RGPD et la loi n° 58/2019." },

      { type: 'h3', text: '4. Avec qui nous partageons' },
      { type: 'p', text: 'Avec d’autres utilisateurs : votre nom d’utilisateur, école et district sont visibles aux pairs de votre district lorsque vous proposez des livres en prêt. Nous ne montrons jamais votre vrai nom, email, âge ou photo sauf indication.' },
      { type: 'p', text: 'Avec des fournisseurs : Supabase (base de données dans l’UE) ; Cloudflare (hébergement et sécurité). Ils ne traitent les données qu’en notre nom sous contrats RGPD.' },
      { type: 'p', text: 'Avec les autorités : uniquement si légalement obligés. Nous ne vendons jamais vos données. Aucune publicité destinée aux mineurs.' },

      { type: 'h3', text: '5. Combien de temps conservons-nous' },
      { type: 'p', text: 'Compte actif : tant que vous utilisez Codex. Compte supprimé : tout supprimé sous 30 jours. Prêts clos : 2 ans. Journaux techniques : 90 jours.' },

      { type: 'h3', text: '6. Vos droits (RGPD)' },
      { type: 'p', text: "Vous avez le droit d'accéder à vos données, de les corriger, de supprimer votre compte, de limiter leur usage, de vous opposer à certains traitements et à la portabilité. Écrivez à : codex@kendirstudios.pt. Réponse sous 30 jours. Réclamation possible auprès de la CNPD : www.cnpd.pt" },

      { type: 'h3', text: '7. Moins de 18 ans' },
      { type: 'p', text: "Protections supplémentaires : autorisation d'un parent requise ; données moins visibles par défaut ; aucune publicité ; demandes de prêt suspectes refusées. Parents/tuteurs : codex@kendirstudios.pt" },

      { type: 'h3', text: '8. Sécurité' },
      { type: 'p', text: "Nous utilisons le chiffrement (HTTPS), des mots de passe chiffrés, un accès restreint à la base de données et des sauvegardes régulières. Aucun système n'est 100% sûr — en cas d'infraction vous concernant, nous vous informerons sous 72 heures." },

      { type: 'h3', text: '9. Cookies et stockage local' },
      { type: 'p', text: "Codex n'utilise qu'un stockage local technique. Pas de cookies de suivi ou de publicité." },

      { type: 'h3', text: '10. Modifications' },
      { type: 'p', text: 'Si nous modifions cette politique, nous vous en informerons via Codex et par email. Les changements substantiels touchant des mineurs nécessiteront un nouveau consentement des tuteurs.' },

      { type: 'h3', text: '11. Contacts' },
      { type: 'p', text: 'Responsable du traitement : Worlds4Education – Jogos e Ambientes Educativos, Lda., NIPC 516583824, Avenida da República 1629, 2e à gauche – 4430-206 Vila Nova de Gaia, Portugal. Email : codex@kendirstudios.pt. DPO : Catarina Pinto – codex@kendirstudios.pt' },
    ],
  },
};

export const LANDING_LEGAL: Record<LandingLegalLang, LandingLegalContent> = { pt, en, es, fr };

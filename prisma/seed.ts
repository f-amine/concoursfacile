import { PrismaClient, QuestionType } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.quizResponseAnswer.deleteMany();
  await prisma.quizResponse.deleteMany();
  await prisma.quizSession.deleteMany();
  await prisma.spacedRepetitionCard.deleteMany();
  await prisma.errorReport.deleteMany();
  await prisma.userLessonProgress.deleteMany();
  await prisma.userConcours.deleteMany();
  await prisma.userSubscription.deleteMany();
  await prisma.lessonObjective.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.dossier.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.concours.deleteMany();

  // ============================================
  // CONCOURS
  // ============================================

  const ensa = await prisma.concours.create({
    data: {
      name: "ENSA",
      slug: "ensa",
      description:
        "Ecoles Nationales des Sciences Appliquees - Concours d'acces post-bac en ingenierie",
      order: 1,
    },
  });

  const encg = await prisma.concours.create({
    data: {
      name: "ENCG",
      slug: "encg",
      description:
        "Ecoles Nationales de Commerce et de Gestion - Concours TAFEM",
      order: 2,
    },
  });

  const ensam = await prisma.concours.create({
    data: {
      name: "ENSAM",
      slug: "ensam",
      description:
        "Ecole Nationale Superieure des Arts et Metiers - Concours d'acces en ingenierie",
      order: 3,
    },
  });

  const medecine = await prisma.concours.create({
    data: {
      name: "Medecine",
      slug: "medecine",
      description:
        "Facultes de Medecine et de Pharmacie - Concours d'acces aux etudes medicales",
      order: 4,
    },
  });

  const cpge = await prisma.concours.create({
    data: {
      name: "CPGE",
      slug: "cpge",
      description:
        "Classes Preparatoires aux Grandes Ecoles - Concours d'acces MPSI, PCSI, TSI",
      order: 5,
    },
  });

  // ============================================
  // SUBJECTS
  // ============================================

  // ENSA subjects
  const ensaMath = await prisma.subject.create({
    data: {
      name: "Mathematiques",
      slug: "mathematiques",
      description: "Analyse, algebre, geometrie et probabilites",
      order: 1,
      concoursId: ensa.id,
    },
  });

  const ensaPhysique = await prisma.subject.create({
    data: {
      name: "Physique",
      slug: "physique",
      description: "Mecanique, electricite, optique et thermodynamique",
      order: 2,
      concoursId: ensa.id,
    },
  });

  // ENCG subjects
  const encgMath = await prisma.subject.create({
    data: {
      name: "Mathematiques",
      slug: "mathematiques",
      description: "Logique, fonctions, suites et probabilites",
      order: 1,
      concoursId: encg.id,
    },
  });

  const encgFrancais = await prisma.subject.create({
    data: {
      name: "Francais",
      slug: "francais",
      description: "Comprehension, expression ecrite et culture generale",
      order: 2,
      concoursId: encg.id,
    },
  });

  // ENSAM subjects
  const ensamMath = await prisma.subject.create({
    data: {
      name: "Mathematiques",
      slug: "mathematiques",
      description: "Mathematiques pour ingenierie",
      order: 1,
      concoursId: ensam.id,
    },
  });

  const ensamPhysique = await prisma.subject.create({
    data: {
      name: "Physique",
      slug: "physique",
      description: "Physique appliquee",
      order: 2,
      concoursId: ensam.id,
    },
  });

  // Medecine subjects
  const medBio = await prisma.subject.create({
    data: {
      name: "Biologie",
      slug: "biologie",
      description: "SVT - Sciences de la Vie et de la Terre",
      order: 1,
      concoursId: medecine.id,
    },
  });

  const medChimie = await prisma.subject.create({
    data: {
      name: "Chimie",
      slug: "chimie",
      description: "Chimie organique et minerale",
      order: 2,
      concoursId: medecine.id,
    },
  });

  const medPhysique = await prisma.subject.create({
    data: {
      name: "Physique",
      slug: "physique",
      description: "Physique pour les sciences medicales",
      order: 3,
      concoursId: medecine.id,
    },
  });

  // CPGE subjects
  const cpgeMath = await prisma.subject.create({
    data: {
      name: "Mathematiques",
      slug: "mathematiques",
      description: "Mathematiques avancees pour classes preparatoires",
      order: 1,
      concoursId: cpge.id,
    },
  });

  const cpgePhysique = await prisma.subject.create({
    data: {
      name: "Physique",
      slug: "physique",
      description: "Physique pour classes preparatoires",
      order: 2,
      concoursId: cpge.id,
    },
  });

  // ============================================
  // CHAPTERS + LESSONS + QUESTIONS (ENSA Math as detailed example)
  // ============================================

  // --- ENSA Math: Chapter 1 - Analyse ---
  const analyseChapter = await prisma.chapter.create({
    data: {
      title: "Analyse",
      slug: "analyse",
      description: "Limites, continuite, derivation et integration",
      order: 1,
      subjectId: ensaMath.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "Limites et continuite",
      slug: "limites-et-continuite",
      content: `<h2>Limites et continuite</h2>
<p>La notion de limite est fondamentale en analyse mathematique. Elle permet de decrire le comportement d'une fonction au voisinage d'un point ou a l'infini.</p>
<h3>Definition de la limite</h3>
<p>Soit f une fonction definie sur un intervalle I et a un reel. On dit que f admet une limite L en a si pour tout &epsilon; > 0, il existe &delta; > 0 tel que pour tout x dans I, |x - a| < &delta; implique |f(x) - L| < &epsilon;.</p>
<h3>Proprietes des limites</h3>
<ul>
<li>Unicite de la limite</li>
<li>Operations sur les limites (somme, produit, quotient)</li>
<li>Theoreme des gendarmes</li>
<li>Limites et comparaison</li>
</ul>
<h3>Continuite</h3>
<p>Une fonction f est continue en a si la limite de f(x) quand x tend vers a existe et est egale a f(a). La continuite est une propriete essentielle pour le theoreme des valeurs intermediaires.</p>`,
      readingTimeMin: 15,
      order: 1,
      isFree: true,
      chapterId: analyseChapter.id,
      objectives: {
        create: [
          { text: "Maitriser la definition de la limite", order: 1 },
          { text: "Savoir calculer des limites", order: 2 },
          { text: "Connaitre le theoreme des valeurs intermediaires", order: 3 },
        ],
      },
    },
  });

  await prisma.lesson.create({
    data: {
      title: "Derivation et applications",
      slug: "derivation-et-applications",
      content: `<h2>Derivation et applications</h2>
<p>La derivation est un outil fondamental de l'analyse qui permet d'etudier les variations d'une fonction.</p>
<h3>Nombre derive</h3>
<p>Le nombre derive de f en a est defini comme la limite du taux d'accroissement : f'(a) = lim (f(x) - f(a)) / (x - a) quand x tend vers a.</p>
<h3>Regles de derivation</h3>
<ul>
<li>Derivee d'une somme, d'un produit, d'un quotient</li>
<li>Derivee d'une fonction composee</li>
<li>Derivees des fonctions usuelles</li>
</ul>
<h3>Applications</h3>
<p>La derivation permet d'etudier les variations d'une fonction, de determiner les extrema locaux et globaux, et de resoudre des problemes d'optimisation.</p>`,
      readingTimeMin: 12,
      order: 2,
      chapterId: analyseChapter.id,
      objectives: {
        create: [
          { text: "Maitriser les regles de derivation", order: 1 },
          { text: "Savoir etudier les variations d'une fonction", order: 2 },
        ],
      },
    },
  });

  await prisma.lesson.create({
    data: {
      title: "Integration",
      slug: "integration",
      content: `<h2>Integration</h2>
<p>L'integration est l'operation inverse de la derivation. Elle permet de calculer des aires, des volumes et de resoudre des equations differentielles.</p>
<h3>Primitives</h3>
<p>Une primitive de f sur I est une fonction F telle que F'(x) = f(x) pour tout x dans I.</p>
<h3>Integrale definie</h3>
<p>L'integrale de f de a a b represente l'aire algebrique sous la courbe de f entre a et b.</p>
<h3>Techniques d'integration</h3>
<ul>
<li>Integration par parties</li>
<li>Changement de variable</li>
<li>Decomposition en elements simples</li>
</ul>`,
      readingTimeMin: 18,
      order: 3,
      chapterId: analyseChapter.id,
      objectives: {
        create: [
          { text: "Calculer des primitives", order: 1 },
          { text: "Maitriser l'integration par parties", order: 2 },
          { text: "Appliquer le changement de variable", order: 3 },
        ],
      },
    },
  });

  // Questions for Analyse chapter
  const analyseQuestions = [
    {
      text: "Quelle est la limite de (sin x)/x quand x tend vers 0 ?",
      type: QuestionType.QCM,
      explanation:
        "C'est une limite remarquable fondamentale. On peut la demontrer par encadrement geometrique ou par la regle de L'Hopital.",
      order: 1,
      answers: [
        { text: "0", isCorrect: false, explanation: "La fonction tend vers 1, pas vers 0.", order: 1 },
        { text: "1", isCorrect: true, explanation: "C'est la limite remarquable classique : lim (sin x)/x = 1 quand x → 0.", order: 2 },
        { text: "+∞", isCorrect: false, explanation: "La fonction est bornee au voisinage de 0.", order: 3 },
        { text: "La limite n'existe pas", isCorrect: false, explanation: "La limite existe et vaut 1.", order: 4 },
      ],
    },
    {
      text: "Une fonction continue sur un intervalle ferme [a,b] est :",
      type: QuestionType.QCM_MULTI,
      explanation:
        "Le theoreme des bornes atteignables affirme qu'une fonction continue sur un intervalle ferme borne est bornee et atteint ses bornes.",
      order: 2,
      answers: [
        { text: "Bornee", isCorrect: true, explanation: "Oui, par le theoreme des bornes.", order: 1 },
        { text: "Derivable", isCorrect: false, explanation: "La continuite n'implique pas la derivabilite (ex: |x|).", order: 2 },
        { text: "Atteint ses bornes", isCorrect: true, explanation: "Oui, elle atteint son maximum et son minimum.", order: 3 },
        { text: "Monotone", isCorrect: false, explanation: "Une fonction continue n'est pas necessairement monotone.", order: 4 },
      ],
    },
    {
      text: "La derivee de ln(x) est :",
      type: QuestionType.QCM,
      explanation: "La derivee du logarithme neperien est une formule fondamentale a connaitre.",
      order: 3,
      answers: [
        { text: "1/x", isCorrect: true, explanation: "C'est la derivee classique du logarithme neperien pour x > 0.", order: 1 },
        { text: "ln(x)/x", isCorrect: false, explanation: "Ce n'est pas la bonne formule.", order: 2 },
        { text: "e^x", isCorrect: false, explanation: "e^x est la derivee de e^x, pas de ln(x).", order: 3 },
        { text: "x", isCorrect: false, explanation: "Incorrect.", order: 4 },
      ],
    },
    {
      text: "L'integrale de 1/x dx sur [1, e] vaut :",
      type: QuestionType.QCM,
      explanation: "La primitive de 1/x est ln|x|. Donc l'integrale de 1 a e de 1/x dx = ln(e) - ln(1) = 1 - 0 = 1.",
      order: 4,
      answers: [
        { text: "0", isCorrect: false, explanation: "L'aire sous la courbe 1/x entre 1 et e est strictement positive.", order: 1 },
        { text: "1", isCorrect: true, explanation: "ln(e) - ln(1) = 1 - 0 = 1.", order: 2 },
        { text: "e", isCorrect: false, explanation: "Ce n'est pas le bon resultat.", order: 3 },
        { text: "e - 1", isCorrect: false, explanation: "Attention, la primitive de 1/x n'est pas x.", order: 4 },
      ],
    },
    {
      text: "Le theoreme des valeurs intermediaires affirme que :",
      type: QuestionType.QCM,
      explanation:
        "Le TVI est une consequence directe de la continuite. Il est tres utile pour demontrer l'existence de solutions d'equations.",
      order: 5,
      answers: [
        { text: "Toute fonction continue est derivable", isCorrect: false, explanation: "Faux, la continuite n'implique pas la derivabilite.", order: 1 },
        { text: "Une fonction continue sur [a,b] prend toutes les valeurs entre f(a) et f(b)", isCorrect: true, explanation: "C'est exactement l'enonce du TVI.", order: 2 },
        { text: "Toute fonction continue est croissante", isCorrect: false, explanation: "La continuite n'implique aucune monotonie.", order: 3 },
        { text: "Une fonction continue a toujours un maximum", isCorrect: false, explanation: "C'est le theoreme des bornes atteintes, et seulement sur un ferme borne.", order: 4 },
      ],
    },
    {
      text: "Quelle est la derivee de e^(2x) ?",
      type: QuestionType.QCM,
      explanation: "Par la regle de derivation de la composee : (e^u)' = u' * e^u. Ici u = 2x donc u' = 2.",
      order: 6,
      answers: [
        { text: "e^(2x)", isCorrect: false, explanation: "Il manque le facteur 2 de la derivee de la composee.", order: 1 },
        { text: "2e^(2x)", isCorrect: true, explanation: "Correct : derivee de la composee avec u' = 2.", order: 2 },
        { text: "2xe^(2x)", isCorrect: false, explanation: "On ne multiplie pas par x mais par u' = 2.", order: 3 },
        { text: "e^(2x)/2", isCorrect: false, explanation: "Ce serait la primitive, pas la derivee.", order: 4 },
      ],
    },
    {
      text: "La primitive de cos(x) est :",
      type: QuestionType.QCM,
      explanation: "C'est une formule de base : la derivee de sin(x) est cos(x), donc la primitive de cos(x) est sin(x) + C.",
      order: 7,
      answers: [
        { text: "sin(x) + C", isCorrect: true, explanation: "Correct car (sin x)' = cos x.", order: 1 },
        { text: "-sin(x) + C", isCorrect: false, explanation: "La derivee de -sin(x) est -cos(x), pas cos(x).", order: 2 },
        { text: "cos(x) + C", isCorrect: false, explanation: "La derivee de cos(x) est -sin(x), pas cos(x).", order: 3 },
        { text: "-cos(x) + C", isCorrect: false, explanation: "La derivee de -cos(x) est sin(x), pas cos(x).", order: 4 },
      ],
    },
    {
      text: "Quelles affirmations sont correctes concernant les suites convergentes ?",
      type: QuestionType.QCM_MULTI,
      explanation: "Une suite convergente est necessairement bornee. La reciproque est fausse. Toute suite croissante et majoree converge.",
      order: 8,
      answers: [
        { text: "Toute suite convergente est bornee", isCorrect: true, explanation: "Oui, c'est une propriete fondamentale.", order: 1 },
        { text: "Toute suite bornee est convergente", isCorrect: false, explanation: "Faux, ex: (-1)^n est bornee mais divergente.", order: 2 },
        { text: "Toute suite croissante et majoree converge", isCorrect: true, explanation: "Oui, c'est le theoreme de la suite monotone.", order: 3 },
        { text: "La somme de deux suites divergentes est divergente", isCorrect: false, explanation: "Faux, ex: u_n = n et v_n = -n, u+v = 0 converge.", order: 4 },
      ],
    },
    {
      text: "La formule de Taylor-Young a l'ordre 2 de e^x en 0 est :",
      type: QuestionType.QCM,
      explanation: "e^x = 1 + x + x^2/2 + o(x^2). C'est un developpement limite classique.",
      order: 9,
      answers: [
        { text: "1 + x + x²/2 + o(x²)", isCorrect: true, explanation: "C'est le DL classique de e^x a l'ordre 2.", order: 1 },
        { text: "1 + x + x² + o(x²)", isCorrect: false, explanation: "Le coefficient de x² est 1/2!, pas 1.", order: 2 },
        { text: "x + x²/2 + o(x²)", isCorrect: false, explanation: "Il manque le terme constant 1.", order: 3 },
        { text: "1 + 2x + x² + o(x²)", isCorrect: false, explanation: "Ce n'est pas le bon developpement.", order: 4 },
      ],
    },
    {
      text: "L'integration par parties repose sur la formule :",
      type: QuestionType.QCM,
      explanation: "La formule d'integration par parties decoule de la formule de derivation d'un produit : (uv)' = u'v + uv'.",
      order: 10,
      answers: [
        { text: "∫u'v = uv - ∫uv'", isCorrect: true, explanation: "C'est la formule classique d'integration par parties.", order: 1 },
        { text: "∫u'v = uv + ∫uv'", isCorrect: false, explanation: "Le signe est negatif, pas positif.", order: 2 },
        { text: "∫uv = u'v' - ∫u'v'", isCorrect: false, explanation: "Ce n'est pas la bonne formule.", order: 3 },
        { text: "∫u'v' = uv - ∫uv", isCorrect: false, explanation: "Ce n'est pas la bonne formule.", order: 4 },
      ],
    },
  ];

  for (const q of analyseQuestions) {
    await prisma.question.create({
      data: {
        text: q.text,
        type: q.type,
        explanation: q.explanation,
        order: q.order,
        isFree: q.order <= 3,
        chapterId: analyseChapter.id,
        answers: {
          create: q.answers,
        },
      },
    });
  }

  // --- ENSA Math: Chapter 2 - Algebre ---
  const algebraChapter = await prisma.chapter.create({
    data: {
      title: "Algebre",
      slug: "algebre",
      description: "Espaces vectoriels, matrices et systemes lineaires",
      order: 2,
      subjectId: ensaMath.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "Matrices et determinants",
      slug: "matrices-et-determinants",
      content: `<h2>Matrices et determinants</h2>
<p>Les matrices sont des tableaux de nombres qui permettent de representer des applications lineaires et de resoudre des systemes d'equations.</p>
<h3>Operations sur les matrices</h3>
<p>Addition, multiplication scalaire, produit matriciel. Le produit matriciel n'est pas commutatif en general.</p>
<h3>Determinant</h3>
<p>Le determinant d'une matrice carree est un scalaire qui permet de determiner si la matrice est inversible (determinant non nul).</p>`,
      readingTimeMin: 14,
      order: 1,
      isFree: true,
      chapterId: algebraChapter.id,
      objectives: {
        create: [
          { text: "Effectuer des operations matricielles", order: 1 },
          { text: "Calculer un determinant", order: 2 },
        ],
      },
    },
  });

  const algebraQuestions = [
    {
      text: "Le produit matriciel est :",
      type: QuestionType.QCM,
      explanation: "Le produit matriciel est associatif mais pas commutatif en general : AB ≠ BA.",
      order: 1,
      answers: [
        { text: "Commutatif et associatif", isCorrect: false, explanation: "Le produit matriciel n'est pas commutatif.", order: 1 },
        { text: "Associatif mais pas commutatif", isCorrect: true, explanation: "Correct : (AB)C = A(BC) mais AB ≠ BA en general.", order: 2 },
        { text: "Ni commutatif ni associatif", isCorrect: false, explanation: "Il est associatif.", order: 3 },
        { text: "Commutatif mais pas associatif", isCorrect: false, explanation: "C'est l'inverse : associatif mais pas commutatif.", order: 4 },
      ],
    },
    {
      text: "Une matrice est inversible si et seulement si :",
      type: QuestionType.QCM,
      explanation: "Le determinant est le critere principal d'inversibilite d'une matrice carree.",
      order: 2,
      answers: [
        { text: "Son determinant est nul", isCorrect: false, explanation: "Un determinant nul signifie que la matrice n'est PAS inversible.", order: 1 },
        { text: "Son determinant est non nul", isCorrect: true, explanation: "Correct : det(A) ≠ 0 ⟺ A est inversible.", order: 2 },
        { text: "Elle est symetrique", isCorrect: false, explanation: "La symetrie n'est ni necessaire ni suffisante pour l'inversibilite.", order: 3 },
        { text: "Elle est diagonale", isCorrect: false, explanation: "Une matrice diagonale peut etre non inversible si un element diagonal est nul.", order: 4 },
      ],
    },
    {
      text: "Le determinant d'un produit de matrices verifie :",
      type: QuestionType.QCM,
      explanation: "C'est une propriete multiplicative fondamentale des determinants.",
      order: 3,
      answers: [
        { text: "det(AB) = det(A) + det(B)", isCorrect: false, explanation: "Le determinant est multiplicatif, pas additif.", order: 1 },
        { text: "det(AB) = det(A) × det(B)", isCorrect: true, explanation: "C'est la propriete de multiplicativite du determinant.", order: 2 },
        { text: "det(AB) = det(A) - det(B)", isCorrect: false, explanation: "Incorrect.", order: 3 },
        { text: "det(AB) = det(A) / det(B)", isCorrect: false, explanation: "Incorrect.", order: 4 },
      ],
    },
    {
      text: "La trace d'une matrice est :",
      type: QuestionType.QCM,
      explanation: "La trace est la somme des elements diagonaux. Elle est invariante par similitude.",
      order: 4,
      answers: [
        { text: "La somme de tous ses elements", isCorrect: false, explanation: "C'est uniquement la somme des elements diagonaux.", order: 1 },
        { text: "La somme des elements diagonaux", isCorrect: true, explanation: "Correct : tr(A) = Σ a_ii.", order: 2 },
        { text: "Le produit des elements diagonaux", isCorrect: false, explanation: "Le produit des elements diagonaux n'a pas de nom particulier en general.", order: 3 },
        { text: "Le determinant", isCorrect: false, explanation: "Le determinant est different de la trace.", order: 4 },
      ],
    },
    {
      text: "Quelles proprietes sont vraies pour la transposee d'une matrice ?",
      type: QuestionType.QCM_MULTI,
      explanation: "La transposee inverse l'ordre du produit et la transposee de la transposee redonne la matrice originale.",
      order: 5,
      answers: [
        { text: "(A^T)^T = A", isCorrect: true, explanation: "La double transposition redonne la matrice originale.", order: 1 },
        { text: "(AB)^T = A^T × B^T", isCorrect: false, explanation: "L'ordre est inverse : (AB)^T = B^T × A^T.", order: 2 },
        { text: "(AB)^T = B^T × A^T", isCorrect: true, explanation: "Correct, la transposee inverse l'ordre du produit.", order: 3 },
        { text: "det(A^T) = det(A)", isCorrect: true, explanation: "Le determinant est invariant par transposition.", order: 4 },
      ],
    },
  ];

  for (const q of algebraQuestions) {
    await prisma.question.create({
      data: {
        text: q.text,
        type: q.type,
        explanation: q.explanation,
        order: q.order,
        isFree: q.order <= 2,
        chapterId: algebraChapter.id,
        answers: {
          create: q.answers,
        },
      },
    });
  }

  // --- ENSA Physique: Chapter 1 - Mecanique ---
  const mecaChapter = await prisma.chapter.create({
    data: {
      title: "Mecanique",
      slug: "mecanique",
      description: "Cinematique, dynamique et energetique",
      order: 1,
      subjectId: ensaPhysique.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "Les lois de Newton",
      slug: "les-lois-de-newton",
      content: `<h2>Les lois de Newton</h2>
<p>Les trois lois de Newton constituent le fondement de la mecanique classique.</p>
<h3>Premiere loi : Principe d'inertie</h3>
<p>Un corps isole ou soumis a des forces qui se compensent reste au repos ou en mouvement rectiligne uniforme.</p>
<h3>Deuxieme loi : Principe fondamental de la dynamique</h3>
<p>La somme des forces appliquees a un objet est egale au produit de sa masse par son acceleration : ΣF = ma.</p>
<h3>Troisieme loi : Principe d'action-reaction</h3>
<p>Pour toute action, il existe une reaction egale et opposee.</p>`,
      readingTimeMin: 10,
      order: 1,
      isFree: true,
      chapterId: mecaChapter.id,
      objectives: {
        create: [
          { text: "Connaitre les trois lois de Newton", order: 1 },
          { text: "Appliquer le PFD a des problemes simples", order: 2 },
        ],
      },
    },
  });

  const mecaQuestions = [
    {
      text: "Selon la deuxieme loi de Newton, la somme des forces est egale a :",
      type: QuestionType.QCM,
      explanation: "Le principe fondamental de la dynamique (PFD) relie la somme des forces a l'acceleration.",
      order: 1,
      answers: [
        { text: "m × v (masse × vitesse)", isCorrect: false, explanation: "m × v est la quantite de mouvement, pas la force.", order: 1 },
        { text: "m × a (masse × acceleration)", isCorrect: true, explanation: "C'est le PFD : ΣF = ma.", order: 2 },
        { text: "m × g (masse × gravite)", isCorrect: false, explanation: "m × g est le poids, pas la somme des forces en general.", order: 3 },
        { text: "F × d (force × distance)", isCorrect: false, explanation: "F × d est un travail, pas une force.", order: 4 },
      ],
    },
    {
      text: "Un objet en chute libre est soumis a :",
      type: QuestionType.QCM,
      explanation: "En chute libre (sans frottements), seul le poids agit sur l'objet.",
      order: 2,
      answers: [
        { text: "Aucune force", isCorrect: false, explanation: "Le poids agit toujours sur un objet.", order: 1 },
        { text: "Son poids uniquement", isCorrect: true, explanation: "En chute libre, on neglige les frottements. Seul le poids agit.", order: 2 },
        { text: "Son poids et une force de frottement", isCorrect: false, explanation: "En chute libre, on neglige les frottements par definition.", order: 3 },
        { text: "Une force constante vers le haut", isCorrect: false, explanation: "Aucune force vers le haut n'agit en chute libre.", order: 4 },
      ],
    },
    {
      text: "L'energie cinetique d'un objet de masse m et de vitesse v est :",
      type: QuestionType.QCM,
      explanation: "L'energie cinetique est proportionnelle a la masse et au carre de la vitesse.",
      order: 3,
      answers: [
        { text: "mv", isCorrect: false, explanation: "C'est la quantite de mouvement.", order: 1 },
        { text: "mv²", isCorrect: false, explanation: "Il manque le facteur 1/2.", order: 2 },
        { text: "½mv²", isCorrect: true, explanation: "Ec = ½mv² est la formule de l'energie cinetique.", order: 3 },
        { text: "2mv²", isCorrect: false, explanation: "Le coefficient est 1/2, pas 2.", order: 4 },
      ],
    },
  ];

  for (const q of mecaQuestions) {
    await prisma.question.create({
      data: {
        text: q.text,
        type: q.type,
        explanation: q.explanation,
        order: q.order,
        isFree: true,
        chapterId: mecaChapter.id,
        answers: {
          create: q.answers,
        },
      },
    });
  }

  // --- ENCG Math: Chapter ---
  const encgLogique = await prisma.chapter.create({
    data: {
      title: "Logique et raisonnement",
      slug: "logique-et-raisonnement",
      description: "Propositions, connecteurs logiques et raisonnement mathematique",
      order: 1,
      subjectId: encgMath.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "Les connecteurs logiques",
      slug: "les-connecteurs-logiques",
      content: `<h2>Les connecteurs logiques</h2>
<p>Les connecteurs logiques permettent de construire des propositions composees a partir de propositions simples.</p>
<h3>Principaux connecteurs</h3>
<ul>
<li><strong>ET (∧)</strong> : La conjonction est vraie si les deux propositions sont vraies.</li>
<li><strong>OU (∨)</strong> : La disjonction est vraie si au moins une proposition est vraie.</li>
<li><strong>NON (¬)</strong> : La negation inverse la valeur de verite.</li>
<li><strong>IMPLIQUE (⇒)</strong> : L'implication P ⇒ Q est fausse uniquement si P est vraie et Q est fausse.</li>
</ul>`,
      readingTimeMin: 8,
      order: 1,
      isFree: true,
      chapterId: encgLogique.id,
    },
  });

  // --- ENCG Francais: Chapter ---
  const encgExpression = await prisma.chapter.create({
    data: {
      title: "Expression ecrite",
      slug: "expression-ecrite",
      description: "Techniques de redaction et argumentation",
      order: 1,
      subjectId: encgFrancais.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "La dissertation",
      slug: "la-dissertation",
      content: `<h2>La dissertation</h2>
<p>La dissertation est un exercice de reflexion argumentee sur un sujet donne. Elle suit une structure rigoureuse.</p>
<h3>Structure</h3>
<ul>
<li><strong>Introduction</strong> : Amener le sujet, le problematiser, annoncer le plan</li>
<li><strong>Developpement</strong> : 2 ou 3 parties argumentees avec exemples</li>
<li><strong>Conclusion</strong> : Synthese et ouverture</li>
</ul>`,
      readingTimeMin: 10,
      order: 1,
      isFree: true,
      chapterId: encgExpression.id,
    },
  });

  // --- Remaining chapters (lighter data) ---
  for (const subject of [ensamMath, ensamPhysique]) {
    await prisma.chapter.create({
      data: {
        title: subject.name === "Mathematiques" ? "Analyse numerique" : "Thermodynamique",
        slug: subject.name === "Mathematiques" ? "analyse-numerique" : "thermodynamique",
        description:
          subject.name === "Mathematiques"
            ? "Methodes numeriques et approximations"
            : "Principes de la thermodynamique",
        order: 1,
        subjectId: subject.id,
      },
    });
  }

  for (const subject of [medBio, medChimie, medPhysique]) {
    const chapterData =
      subject.name === "Biologie"
        ? { title: "Biologie cellulaire", slug: "biologie-cellulaire", desc: "Structure et fonctionnement de la cellule" }
        : subject.name === "Chimie"
          ? { title: "Chimie organique", slug: "chimie-organique", desc: "Fonctions organiques et reactions" }
          : { title: "Optique", slug: "optique", desc: "Optique geometrique et ondulatoire" };

    await prisma.chapter.create({
      data: {
        title: chapterData.title,
        slug: chapterData.slug,
        description: chapterData.desc,
        order: 1,
        subjectId: subject.id,
      },
    });
  }

  for (const subject of [cpgeMath, cpgePhysique]) {
    await prisma.chapter.create({
      data: {
        title: subject.name === "Mathematiques" ? "Algebre lineaire" : "Mecanique du point",
        slug: subject.name === "Mathematiques" ? "algebre-lineaire" : "mecanique-du-point",
        description:
          subject.name === "Mathematiques"
            ? "Espaces vectoriels et applications lineaires"
            : "Cinematique et dynamique du point materiel",
        order: 1,
        subjectId: subject.id,
      },
    });
  }

  console.log("Seed completed successfully!");
  console.log("Created:");
  console.log(`  - 5 concours (ENSA, ENCG, ENSAM, Medecine, CPGE)`);
  console.log(`  - 11 subjects`);
  console.log(`  - Multiple chapters with lessons and questions`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

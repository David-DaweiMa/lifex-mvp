// Language detection for AI assistant responses
export type SupportedLanguage = 'en' | 'zh' | 'ja' | 'ko' | 'es' | 'fr' | 'de';

// Language detection patterns
const LANGUAGE_PATTERNS = {
  zh: /[\u4e00-\u9fff]/, // Chinese characters
  ja: /[\u3040-\u309f\u30a0-\u30ff]/, // Hiragana and Katakana
  ko: /[\uac00-\ud7af]/, // Korean Hangul
  es: /\b(el|la|los|las|de|que|y|a|en|un|es|se|no|te|lo|le|me|una|su|por|son|con|para|al|del|como|más|pero|sus|hasta|hay|donde|han|quien|están|estado|desde|todo|nos|durante|todos|uno|les|ni|contra|otros|ese|eso|ante|ellos|e|esto|mí|antes|algunos|qué|unos|yo|otro|otras|otra|él|tanto|esa|estos|mucho|quienes|nada|muchos|cual|poco|ella|estar|estas|algunas|algo|nosotros|mi|mis|tú|te|ti|tu|tus|ellas|nosotras|vosotros|vosotras|os|mío|mía|míos|mías|tuyo|tuya|tuyos|tuyas|suyo|suya|suyos|suyas|nuestro|nuestra|nuestros|nuestras|vuestro|vuestra|vuestros|vuestras|esos|esas|estoy|estás|está|estamos|estáis|están|esté|estés|estemos|estéis|estén|estaré|estarás|estará|estaremos|estaréis|estarán|estaría|estarías|estaríamos|estaríais|estarían|estaba|estabas|estábamos|estabais|estaban|estuve|estuviste|estuvo|estuvimos|estuvisteis|estuvieron|estuviera|estuvieras|estuviéramos|estuvierais|estuvieran|estuviese|estuvieses|estuviésemos|estuvieseis|estuviesen|estando|estado|estada|estados|estadas|estad)\b/i,
  fr: /\b(le|la|les|de|et|à|un|une|des|du|que|qui|dans|sur|avec|pour|par|est|sont|être|avoir|faire|aller|venir|voir|savoir|pouvoir|vouloir|devoir|prendre|donner|mettre|dire|parler|entendre|regarder|trouver|chercher|attendre|rester|partir|arriver|monter|descendre|entrer|sortir|ouvrir|fermer|commencer|finir|continuer|arrêter|changer|devenir|rester|revenir|retourner|passer|traverser|suivre|précéder|accompagner|aider|sauver|défendre|attaquer|gagner|perdre|vendre|acheter|payer|coûter|valoir|peser|mesurer|compter|calculer|écrire|lire|dessiner|peindre|chanter|danser|jouer|travailler|étudier|apprendre|enseigner|expliquer|comprendre|penser|croire|espérer|aimer|détester|préférer|choisir|décider|permettre|interdire|commander|demander|répondre|appeler|téléphoner|écrire|envoyer|recevoir|donner|prendre|porter|mettre|enlever|ajouter|retirer|augmenter|diminuer|changer|modifier|corriger|améliorer|réparer|casser|détruire|construire|créer|inventer|découvrir|explorer|visiter|voyager|habiter|vivre|mourir|naître|grandir|vieillir|maladie|santé|médecin|hôpital|médicament|traitement|opération|guérison|prévention|vaccin|symptôme|douleur|fièvre|rhume|grippe|maladie|infection|blessure|accident|urgence|ambulance|pompiers|police|sécurité|danger|risque|protection|assurance|garantie|responsabilité|obligation|droit|loi|justice|tribunal|avocat|juge|procès|condamnation|peine|prison|liberté|égalité|fraternité|démocratie|république|gouvernement|président|ministre|député|sénateur|maire|élection|vote|campagne|parti|politique|économie|commerce|industrie|agriculture|service|emploi|travail|chômage|salaire|revenu|impôt|budget|dépense|économie|épargne|investissement|bénéfice|perte|profit|coût|prix|valeur|marché|concurrence|client|fournisseur|partenaire|collaboration|coopération|rivalité|conflit|guerre|paix|négociation|accord|contrat|signature|engagement|promesse|serment|confiance|suspicion|doute|certitude|évidence|preuve|témoignage|référence|exemple|modèle|type|forme|taille|dimension|poids|volume|surface|longueur|largeur|hauteur|profondeur|distance|vitesse|temps|durée|moment|instant|période|saison|année|mois|semaine|jour|heure|minute|seconde|matin|midi|soir|nuit|hier|aujourd'hui|demain|maintenant|bientôt|tard|tôt|jamais|toujours|souvent|rarement|parfois|quelquefois|généralement|normalement|habituellement|exceptionnellement|particulièrement|spécialement|surtout|principalement|essentiellement|fondamentalement|basiquement|simplement|facilement|difficilement|rapidement|lentement|calmement|bruyamment|silencieusement|doucement|fortement|faiblement|beaucoup|peu|assez|trop|très|plus|moins|autant|tellement|si|comme|ainsi|alors|donc|parce|puisque|car|mais|cependant|pourtant|néanmoins|toutefois|sinon|autrement|sauf|excepté|hormis|outre|en|plus|de|sur|sous|devant|derrière|à|côté|près|loin|haut|bas|droite|gauche|nord|sud|est|ouest|centre|milieu|bord|coin|angle|face|surface|intérieur|extérieur|dedans|dehors|ici|là|ailleurs|partout|nulle|part|quelque|part|où|quand|comment|pourquoi|combien|quel|quelle|quels|quelles|qui|que|quoi|lequel|laquelle|lesquels|lesquelles|celui|celle|ceux|celles|ce|cette|ces|mon|ma|mes|ton|ta|tes|son|sa|ses|notre|votre|leur|leurs|mien|mienne|miens|miennes|tien|tienne|tiens|tiennes|sien|sienne|siens|siennes|nôtre|vôtre|leur|leurs|ceci|cela|ça|celui-ci|celui-là|celle-ci|celle-là|ceux-ci|ceux-là|celles-ci|celles-là|le|mien|la|mienne|les|miens|les|miennes|le|tien|la|tienne|les|tiens|les|tiennes|le|sien|la|sienne|les|siens|les|siennes|le|nôtre|la|nôtre|les|nôtres|le|vôtre|la|vôtre|les|vôtres|le|leur|la|leur|les|leurs)\b/i,
  de: /\b(der|die|das|den|dem|des|ein|eine|einer|eines|einen|einem|und|oder|aber|dann|wenn|weil|dass|ob|wie|wo|wann|warum|wer|was|welcher|welche|welches|mein|meine|meiner|meines|dein|deine|deiner|deines|sein|seine|seiner|seines|ihr|ihre|ihrer|ihres|unser|unsere|unserer|unseres|euer|eure|eurer|eures|ihr|ihre|ihrer|ihres|dieser|diese|dieses|jener|jene|jenes|welcher|welche|welches|alle|alles|jeder|jede|jedes|manche|mancher|manches|viele|vieler|vieles|wenige|weniger|weniges|einige|einiger|einiges|kein|keine|keiner|keines|nicht|nie|niemals|immer|oft|manchmal|selten|gelegentlich|normalerweise|gewöhnlich|meistens|fast|beinahe|nur|bloß|allein|auch|eben|gerade|schon|noch|erst|schließlich|endlich|bald|spät|früh|jetzt|heute|gestern|morgen|hier|dort|da|dort|überall|nirgendwo|irgendwo|irgendwann|irgendwie|irgendwer|irgendwas|etwas|nichts|alles|viel|wenig|mehr|weniger|am|meisten|beste|schlechteste|größte|kleinste|älteste|jüngste|neueste|älteste|schönste|hässlichste|teuerste|billigste|wichtigste|unwichtigste|interessanteste|langweiligste|schwierigste|einfachste|komplizierteste|praktischste|unpraktischste|nützlichste|nutzloseste|sinnvollste|sinnloseste|logischste|unlogischste|vernünftigste|unvernünftigste|klügste|dümmste|beste|schlechteste|gut|schlecht|groß|klein|alt|jung|neu|alt|schön|hässlich|teuer|billig|wichtig|unwichtig|interessant|langweilig|schwierig|einfach|kompliziert|praktisch|unpraktisch|nützlich|nutzlos|sinnvoll|sinnlos|logisch|unlogisch|vernünftig|unvernünftig|klug|dumm|gut|schlecht|groß|klein|alt|jung|neu|alt|schön|hässlich|teuer|billig|wichtig|unwichtig|interessant|langweilig|schwierig|einfach|kompliziert|praktisch|unpraktisch|nützlich|nutzlos|sinnvoll|sinnlos|logisch|unlogisch|vernünftig|unvernünftig|klug|dumm)\b/i
};

// Language names for display
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch'
};

/**
 * Detect the language of the input text
 * @param text - The text to analyze
 * @returns The detected language code or 'en' as default
 */
export const detectLanguage = (text: string): SupportedLanguage => {
  if (!text || typeof text !== 'string') {
    return 'en';
  }

  const cleanText = text.trim().toLowerCase();
  
  // Check for specific language patterns
  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (pattern.test(cleanText)) {
      return lang as SupportedLanguage;
    }
  }

  // Default to English
  return 'en';
};

/**
 * Get language name for display
 * @param langCode - Language code
 * @returns Language name in its native form
 */
export const getLanguageName = (langCode: SupportedLanguage): string => {
  return LANGUAGE_NAMES[langCode] || 'English';
};

/**
 * Check if a language is supported
 * @param langCode - Language code to check
 * @returns True if language is supported
 */
export const isSupportedLanguage = (langCode: string): langCode is SupportedLanguage => {
  return Object.keys(LANGUAGE_NAMES).includes(langCode);
};

/**
 * Get all supported languages
 * @returns Array of supported language codes
 */
export const getSupportedLanguages = (): SupportedLanguage[] => {
  return Object.keys(LANGUAGE_NAMES) as SupportedLanguage[];
};

/**
 * Get language detection confidence score
 * @param text - The text to analyze
 * @param targetLanguage - The target language to check
 * @returns Confidence score between 0 and 1
 */
export const getLanguageConfidence = (text: string, targetLanguage: SupportedLanguage): number => {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  const cleanText = text.trim().toLowerCase();
  
  // Handle English separately since it's not in LANGUAGE_PATTERNS
  if (targetLanguage === 'en') {
    return 0.5; // Default confidence for English
  }
  
  const pattern = LANGUAGE_PATTERNS[targetLanguage as keyof typeof LANGUAGE_PATTERNS];
  
  if (!pattern) {
    return 0;
  }

  const matches = cleanText.match(pattern);
  if (!matches) {
    return 0;
  }

  // Calculate confidence based on match ratio
  const matchRatio = matches.length / cleanText.length;
  return Math.min(matchRatio * 10, 1); // Scale to 0-1 range
};

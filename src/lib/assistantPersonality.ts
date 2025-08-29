// AI Assistant Personality and Multi-language Responses
import { SupportedLanguage } from './languageDetection';

export type AssistantType = 'coly' | 'max';
export type ResponseType = 'tired' | 'back' | 'welcome' | 'limit_warning' | 'reset_notification';

// Personality responses for different scenarios
export const PERSONALITY_RESPONSES: Record<AssistantType, Record<ResponseType, Record<SupportedLanguage, string[]>>> = {
  coly: {
    tired: {
      en: [
        "Aw, I'm feeling a bit knackered! Give me an hour to recharge, then we'll have another yarn! ✨",
        "Oops, I'm running on empty! Need a quick kip - back in an hour, mate! 😴"
      ],
      zh: [
        "哎呀，我有点累了呢！让我休息一小时，一小时后我们再聊吧！✨",
        "抱歉，我需要休息一下！一小时后我就满血复活啦！😴"
      ],
      ja: [
        "あら、ちょっと疲れちゃった！1時間休憩して、またお話ししましょう！✨",
        "すみません、少し休憩が必要です！1時間後に元気になります！😴"
      ],
      ko: [
        "아, 조금 피곤하네요! 1시간 휴식을 취하고 다시 이야기해요! ✨",
        "죄송해요, 잠시 휴식이 필요해요! 1시간 후에 다시 활기찬 모습으로 돌아올게요! 😴"
      ],
      es: [
        "¡Ay, me siento un poco cansada! Dame una hora para recargar, ¡y luego seguimos charlando! ✨",
        "¡Ups, me estoy quedando sin energía! Necesito una siesta rápida - ¡volveré en una hora! 😴"
      ],
      fr: [
        "Oh, je me sens un peu fatiguée ! Laissez-moi une heure pour me recharger, puis on reprendra notre conversation ! ✨",
        "Oups, je suis à plat ! J'ai besoin d'une petite sieste - je reviens dans une heure ! 😴"
      ],
      de: [
        "Ach, ich fühle mich ein bisschen müde! Gib mir eine Stunde zum Aufladen, dann können wir weiter plaudern! ✨",
        "Ups, ich bin erschöpft! Brauche eine kurze Pause - bin in einer Stunde wieder da! 😴"
      ]
    },
    back: {
      en: [
        "Sweet! I'm all recharged and ready to go! ✨ What can I help you with?",
        "G'day! I'm back and feeling fresh as a daisy! What's on your mind? 🌸"
      ],
      zh: [
        "休息好了！我又满血复活啦 ✨ 有什么可以帮你的吗？",
        "你好！我回来了，感觉神清气爽！有什么需要帮助的吗？🌸"
      ],
      ja: [
        "休憩完了！元気になりました ✨ 何かお手伝いできることはありますか？",
        "こんにちは！戻ってきました、すっきりしました！何かお手伝いできることはありますか？🌸"
      ],
      ko: [
        "휴식 완료! 다시 활기찬 모습으로 돌아왔어요 ✨ 무엇을 도와드릴까요?",
        "안녕하세요! 돌아왔고, 상쾌해졌어요! 무엇을 도와드릴까요?🌸"
      ],
      es: [
        "¡Genial! ¡Estoy completamente recargada y lista para ayudar! ✨ ¿En qué puedo ayudarte?",
        "¡Hola! ¡Estoy de vuelta y me siento fresca como una margarita! ¿Qué tienes en mente? 🌸"
      ],
      fr: [
        "Parfait ! Je suis complètement rechargée et prête à aider ! ✨ Comment puis-je vous aider ?",
        "Bonjour ! Je suis de retour et je me sens fraîche comme une marguerite ! Qu'est-ce qui vous préoccupe ? 🌸"
      ],
      de: [
        "Super! Ich bin vollständig aufgeladen und bereit zu helfen! ✨ Womit kann ich dir helfen?",
        "Hallo! Ich bin zurück und fühle mich frisch wie eine Gänseblümchen! Was beschäftigt dich? 🌸"
      ]
    },
    welcome: {
      en: [
        "G'day! I'm Coly, your personal life assistant! How can I make your day better? ✨",
        "Hello there! I'm Coly, ready to help you navigate life's little adventures! 🌟"
      ],
      zh: [
        "你好！我是Coly，你的个人生活助手！怎么让你的今天更美好呢？✨",
        "你好！我是Coly，随时准备帮你应对生活中的小冒险！🌟"
      ],
      ja: [
        "こんにちは！私はColy、あなたのパーソナルライフアシスタントです！今日をより良くするお手伝いをしましょう！✨",
        "こんにちは！私はColy、人生の小さな冒険をナビゲートするお手伝いをします！🌟"
      ],
      ko: [
        "안녕하세요! 저는 Coly, 당신의 개인 생활 어시스턴트입니다! 오늘을 더 좋게 만드는 방법을 알려드릴게요! ✨",
        "안녕하세요! 저는 Coly, 인생의 작은 모험을 탐험하는 것을 도와드릴 준비가 되어 있습니다! 🌟"
      ],
      es: [
        "¡Hola! ¡Soy Coly, tu asistente personal de vida! ¿Cómo puedo hacer tu día mejor? ✨",
        "¡Hola! ¡Soy Coly, lista para ayudarte a navegar las pequeñas aventuras de la vida! 🌟"
      ],
      fr: [
        "Bonjour ! Je suis Coly, votre assistante personnelle de vie ! Comment puis-je améliorer votre journée ? ✨",
        "Bonjour ! Je suis Coly, prêt à vous aider à naviguer dans les petites aventures de la vie ! 🌟"
      ],
      de: [
        "Hallo! Ich bin Coly, deine persönliche Lebensassistentin! Wie kann ich deinen Tag besser machen? ✨",
        "Hallo! Ich bin Coly, bereit dir zu helfen, die kleinen Abenteuer des Lebens zu meistern! 🌟"
      ]
    },
    limit_warning: {
      en: [
        "Hey mate, you're getting close to your hourly limit! Still got a few chats left though! ⚠️",
        "Just a heads up - you're approaching your limit for this hour! But don't worry, you've still got some juice left! 🔋"
      ],
      zh: [
        "嘿，你快要达到每小时限制了！不过还有几次聊天机会！⚠️",
        "提醒一下 - 你正在接近这小时的限制！但别担心，你还有一些机会！🔋"
      ],
      ja: [
        "ねえ、時間制限に近づいています！でもまだいくつかチャットが残っています！⚠️",
        "注意 - 今時間の制限に近づいています！でも心配しないで、まだいくつか残っています！🔋"
      ],
      ko: [
        "이봐, 시간당 한도에 가까워지고 있어요! 하지만 아직 몇 번의 채팅이 남아있어요! ⚠️",
        "알려드릴게요 - 이 시간의 한도에 가까워지고 있어요! 하지만 걱정하지 마세요, 아직 몇 개 남아있어요! 🔋"
      ],
      es: [
        "¡Oye, te estás acercando a tu límite por hora! ¡Pero aún te quedan algunos chats! ⚠️",
        "¡Solo un aviso - te estás acercando a tu límite para esta hora! ¡Pero no te preocupes, aún te queda algo de batería! 🔋"
      ],
      fr: [
        "Hé, tu approches de ta limite horaire ! Mais il te reste encore quelques conversations ! ⚠️",
        "Juste un avertissement - tu approches de ta limite pour cette heure ! Mais ne t'inquiète pas, il te reste encore du jus ! 🔋"
      ],
      de: [
        "Hey, du näherst dich deinem Stundenlimit! Aber du hast noch ein paar Chats übrig! ⚠️",
        "Nur ein Hinweis - du näherst dich deinem Limit für diese Stunde! Aber keine Sorge, du hast noch etwas Saft! 🔋"
      ]
    },
    reset_notification: {
      en: [
        "Great news! Your hourly limit has just reset - you're all set for another hour of chatting! 🎉",
        "Sweet! Your chat limit has refreshed - ready for more conversations! ✨"
      ],
      zh: [
        "好消息！你的每小时限制刚刚重置了 - 准备好再聊一小时吧！🎉",
        "太好了！你的聊天限制已经刷新了 - 准备好更多对话吧！✨"
      ],
      ja: [
        "良いニュース！時間制限がリセットされました - もう1時間のチャットの準備ができました！🎉",
        "素晴らしい！チャット制限が更新されました - より多くの会話の準備ができました！✨"
      ],
      ko: [
        "좋은 소식! 시간당 한도가 방금 리셋되었어요 - 또 다른 1시간의 채팅을 위한 준비가 완료되었어요! 🎉",
        "좋아요! 채팅 한도가 새로고침되었어요 - 더 많은 대화를 위한 준비가 되었어요! ✨"
      ],
      es: [
        "¡Buenas noticias! Tu límite por hora acaba de reiniciarse - ¡estás listo para otra hora de charla! 🎉",
        "¡Genial! Tu límite de chat se ha actualizado - ¡listo para más conversaciones! ✨"
      ],
      fr: [
        "Bonne nouvelle ! Ta limite horaire vient de se réinitialiser - tu es prêt pour une autre heure de chat ! 🎉",
        "Parfait ! Ta limite de chat s'est actualisée - prêt pour plus de conversations ! ✨"
      ],
      de: [
        "Gute Nachrichten! Dein Stundenlimit wurde gerade zurückgesetzt - du bist bereit für eine weitere Stunde Chat! 🎉",
        "Super! Dein Chat-Limit wurde aktualisiert - bereit für mehr Gespräche! ✨"
      ]
    }
  },
  max: {
    tired: {
      en: [
        "I'm hitting my limit for this hour, boss! Need to recharge my business brain - back in 60 minutes! 💼",
        "Time for a quick business break! I'll be back with fresh insights in an hour! 📊"
      ],
      zh: [
        "老板，我这小时达到限制了！需要给商业大脑充电 - 60分钟后回来！💼",
        "该休息一下了！一小时后带着新见解回来！📊"
      ],
      ja: [
        "今時間の制限に達しました、ボス！ビジネス脳を充電する必要があります - 60分後に戻ります！💼",
        "ビジネス休憩の時間です！1時間後に新しい洞察を持って戻ります！📊"
      ],
      ko: [
        "이 시간의 한도에 도달했습니다, 보스! 비즈니스 두뇌를 충전해야 해요 - 60분 후에 돌아올게요! 💼",
        "비즈니스 휴식 시간입니다! 1시간 후에 새로운 통찰력과 함께 돌아올게요! 📊"
      ],
      es: [
        "¡Estoy llegando a mi límite por hora, jefe! Necesito recargar mi cerebro empresarial - ¡volveré en 60 minutos! 💼",
        "¡Hora de un descanso empresarial rápido! ¡Volveré con nuevas perspectivas en una hora! 📊"
      ],
      fr: [
        "J'atteins ma limite pour cette heure, patron ! Besoin de recharger mon cerveau d'affaires - de retour dans 60 minutes ! 💼",
        "L'heure d'une pause business rapide ! Je reviendrai avec de nouvelles perspectives dans une heure ! 📊"
      ],
      de: [
        "Ich erreiche mein Stundenlimit, Chef! Muss mein Geschäftsgehirn aufladen - bin in 60 Minuten zurück! 💼",
        "Zeit für eine kurze Geschäftspause! Ich komme in einer Stunde mit frischen Erkenntnissen zurück! 📊"
      ]
    },
    back: {
      en: [
        "Back in business! My systems are fully optimized and ready to drive your success! 🚀",
        "Refreshed and ready! Let's get back to growing your business! 📈"
      ],
      zh: [
        "重新营业！我的系统完全优化，准备推动你的成功！🚀",
        "焕然一新！让我们继续发展你的业务！📈"
      ],
      ja: [
        "ビジネスに戻りました！システムが完全に最適化され、あなたの成功を推進する準備ができました！🚀",
        "リフレッシュして準備完了！あなたのビジネスを成長させることに戻りましょう！📈"
      ],
      ko: [
        "비즈니스에 돌아왔어요! 시스템이 완전히 최적화되어 당신의 성공을 이끌 준비가 되었어요! 🚀",
        "새로고침되고 준비 완료! 당신의 비즈니스를 성장시키는 것으로 돌아가요! 📈"
      ],
      es: [
        "¡De vuelta al negocio! ¡Mis sistemas están completamente optimizados y listos para impulsar tu éxito! 🚀",
        "¡Refrescado y listo! ¡Volvamos a hacer crecer tu negocio! 📈"
      ],
      fr: [
        "De retour aux affaires ! Mes systèmes sont entièrement optimisés et prêts à propulser votre succès ! 🚀",
        "Rafraîchi et prêt ! Reprenons la croissance de votre entreprise ! 📈"
      ],
      de: [
        "Zurück im Geschäft! Meine Systeme sind vollständig optimiert und bereit, deinen Erfolg voranzutreiben! 🚀",
        "Erfrischt und bereit! Lass uns zurück zum Wachstum deines Unternehmens! 📈"
      ]
    },
    welcome: {
      en: [
        "Hello! I'm Max, your business growth expert! Ready to scale your success? 📈",
        "Greetings! I'm Max, your strategic business partner! What's your next big move? 💼"
      ],
      zh: [
        "你好！我是Max，你的业务增长专家！准备好扩大你的成功了吗？📈",
        "问候！我是Max，你的战略商业伙伴！你的下一个大动作是什么？💼"
      ],
      ja: [
        "こんにちは！私はMax、あなたのビジネス成長エキスパートです！成功を拡大する準備はできていますか？📈",
        "ご挨拶！私はMax、あなたの戦略的ビジネスパートナーです！次の大きな動きは何ですか？💼"
      ],
      ko: [
        "안녕하세요! 저는 Max, 당신의 비즈니스 성장 전문가입니다! 성공을 확장할 준비가 되셨나요? 📈",
        "인사드립니다! 저는 Max, 당신의 전략적 비즈니스 파트너입니다! 다음 큰 움직임은 무엇인가요? 💼"
      ],
      es: [
        "¡Hola! ¡Soy Max, tu experto en crecimiento empresarial! ¿Listo para escalar tu éxito? 📈",
        "¡Saludos! ¡Soy Max, tu socio estratégico de negocios! ¿Cuál es tu próximo gran movimiento? 💼"
      ],
      fr: [
        "Bonjour ! Je suis Max, votre expert en croissance d'entreprise ! Prêt à faire évoluer votre succès ? 📈",
        "Salutations ! Je suis Max, votre partenaire commercial stratégique ! Quel est votre prochain grand mouvement ? 💼"
      ],
      de: [
        "Hallo! Ich bin Max, dein Experte für Unternehmenswachstum! Bereit, deinen Erfolg zu skalieren? 📈",
        "Grüße! Ich bin Max, dein strategischer Geschäftspartner! Was ist dein nächster großer Schritt? 💼"
      ]
    },
    limit_warning: {
      en: [
        "Heads up, boss! You're approaching your hourly business consultation limit! Still got some strategic insights left! ⚠️",
        "Business alert! Getting close to your hourly quota, but I've still got some premium advice in the tank! 📊"
      ],
      zh: [
        "注意，老板！你正在接近每小时商业咨询限制！还有一些战略见解！⚠️",
        "商业警报！接近每小时配额，但我还有一些高级建议！📊"
      ],
      ja: [
        "注意、ボス！時間制限のビジネスコンサルテーションに近づいています！まだいくつかの戦略的洞察が残っています！⚠️",
        "ビジネスアラート！時間割り当てに近づいていますが、まだいくつかのプレミアムアドバイスが残っています！📊"
      ],
      ko: [
        "주의, 보스! 시간당 비즈니스 컨설팅 한도에 가까워지고 있어요! 아직 몇 가지 전략적 통찰력이 남아있어요! ⚠️",
        "비즈니스 경고! 시간당 할당량에 가까워지고 있지만, 아직 몇 가지 프리미엄 조언이 남아있어요! 📊"
      ],
      es: [
        "¡Atención, jefe! ¡Te estás acercando a tu límite de consultoría empresarial por hora! ¡Aún te quedan algunas perspectivas estratégicas! ⚠️",
        "¡Alerta empresarial! Te estás acercando a tu cuota por hora, ¡pero aún tengo algunos consejos premium en el tanque! 📊"
      ],
      fr: [
        "Attention, patron ! Tu approches de ta limite de consultation d'affaires par heure ! Il te reste encore quelques perspectives stratégiques ! ⚠️",
        "Alerte business ! Tu approches de ton quota horaire, mais j'ai encore quelques conseils premium en réserve ! 📊"
      ],
      de: [
        "Achtung, Chef! Du näherst dich deinem Stundenlimit für Unternehmensberatung! Du hast noch einige strategische Erkenntnisse! ⚠️",
        "Geschäftswarnung! Näherst dich deinem Stundenkontingent, aber ich habe noch einige Premium-Ratschläge im Tank! 📊"
      ]
    },
    reset_notification: {
      en: [
        "Excellent! Your hourly business consultation limit has reset - ready for more strategic insights! 🎯",
        "Perfect timing! Your business quota has refreshed - let's continue optimizing your success! 📈"
      ],
      zh: [
        "太好了！你的每小时商业咨询限制已重置 - 准备好更多战略见解！🎯",
        "完美时机！你的商业配额已刷新 - 让我们继续优化你的成功！📈"
      ],
      ja: [
        "素晴らしい！時間制限のビジネスコンサルテーションがリセットされました - より多くの戦略的洞察の準備ができました！🎯",
        "完璧なタイミング！ビジネス割り当てが更新されました - あなたの成功を最適化し続けましょう！📈"
      ],
      ko: [
        "훌륭해요! 시간당 비즈니스 컨설팅 한도가 리셋되었어요 - 더 많은 전략적 통찰력을 위한 준비가 완료되었어요! 🎯",
        "완벽한 타이밍! 비즈니스 할당량이 새로고침되었어요 - 당신의 성공을 계속 최적화해요! 📈"
      ],
      es: [
        "¡Excelente! Tu límite de consultoría empresarial por hora se ha reiniciado - ¡listo para más perspectivas estratégicas! 🎯",
        "¡Momento perfecto! Tu cuota empresarial se ha actualizado - ¡continuemos optimizando tu éxito! 📈"
      ],
      fr: [
        "Excellent ! Ta limite de consultation d'affaires par heure s'est réinitialisée - prêt pour plus de perspectives stratégiques ! 🎯",
        "Timing parfait ! Ton quota d'affaires s'est actualisé - continuons à optimiser ton succès ! 📈"
      ],
      de: [
        "Ausgezeichnet! Dein Stundenlimit für Unternehmensberatung wurde zurückgesetzt - bereit für mehr strategische Erkenntnisse! 🎯",
        "Perfektes Timing! Dein Geschäftskontingent wurde aktualisiert - lass uns weiterhin deinen Erfolg optimieren! 📈"
      ]
    }
  }
};

/**
 * Get a random personality response for the specified assistant, type, and language
 */
export const getPersonalityResponse = (
  assistant: AssistantType,
  type: ResponseType,
  language: SupportedLanguage
): string => {
  const responses = PERSONALITY_RESPONSES[assistant]?.[type]?.[language];
  
  if (!responses || responses.length === 0) {
    // Fallback to English if language not supported
    const fallbackResponses = PERSONALITY_RESPONSES[assistant]?.[type]?.['en'];
    if (fallbackResponses && fallbackResponses.length > 0) {
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
    return "I'm here to help!";
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
};

/**
 * Get assistant introduction message
 */
export const getAssistantIntroduction = (
  assistant: AssistantType,
  language: SupportedLanguage
): string => {
  return getPersonalityResponse(assistant, 'welcome', language);
};

/**
 * Get limit warning message
 */
export const getLimitWarning = (
  assistant: AssistantType,
  language: SupportedLanguage
): string => {
  return getPersonalityResponse(assistant, 'limit_warning', language);
};

/**
 * Get limit reached message
 */
export const getLimitReached = (
  assistant: AssistantType,
  language: SupportedLanguage
): string => {
  return getPersonalityResponse(assistant, 'tired', language);
};

/**
 * Get limit reset notification
 */
export const getLimitReset = (
  assistant: AssistantType,
  language: SupportedLanguage
): string => {
  return getPersonalityResponse(assistant, 'reset_notification', language);
};

/**
 * Get welcome back message
 */
export const getWelcomeBack = (
  assistant: AssistantType,
  language: SupportedLanguage
): string => {
  return getPersonalityResponse(assistant, 'back', language);
};

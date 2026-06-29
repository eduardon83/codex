/// <reference types="npm:@types/react@18.3.1" />

// Localized strings for auth emails. PT is the default fallback.

export type Lang = 'pt' | 'en' | 'es' | 'fr'

export const SUPPORTED_LANGS: Lang[] = ['pt', 'en', 'es', 'fr']

export function normaliseLang(input: unknown): Lang {
  if (typeof input !== 'string') return 'pt'
  const l = input.slice(0, 2).toLowerCase() as Lang
  return SUPPORTED_LANGS.includes(l) ? l : 'pt'
}

interface Subjects {
  signup: string
  invite: string
  magiclink: string
  recovery: string
  email_change: string
  reauthentication: string
}

interface CommonStrings {
  subjects: Subjects
  signup_preview: (site: string) => string
  signup_h1: string
  signup_intro: (site: string) => string
  signup_confirm_intro: (recipient: string) => string
  signup_button: string
  signup_footer: string
  invite_preview: (site: string) => string
  invite_h1: string
  invite_text: (site: string) => string
  invite_button: string
  invite_footer: string
  magic_preview: (site: string) => string
  magic_h1: string
  magic_text: (site: string) => string
  magic_button: string
  magic_footer: string
  recovery_preview: (site: string) => string
  recovery_h1: string
  recovery_text: (site: string) => string
  recovery_button: string
  recovery_footer: string
  email_change_preview: (site: string) => string
  email_change_h1: string
  email_change_text_intro: (site: string) => string
  email_change_text_to: string
  email_change_text_action: string
  email_change_button: string
  email_change_footer: string
  reauth_preview: string
  reauth_h1: string
  reauth_text: string
  reauth_footer: string
}

const PT: CommonStrings = {
  subjects: {
    signup: 'Confirma a tua conta Codex',
    invite: 'Foste convidado(a) para o Codex',
    magiclink: 'O teu link de acesso ao Codex',
    recovery: 'Recuperar a tua palavra-passe Codex',
    email_change: 'Confirma a alteração de email',
    reauthentication: 'O teu código de verificação',
  },
  signup_preview: () => 'Confirma a tua conta Codex',
  signup_h1: 'Bem-vindo ao Codex',
  signup_intro: () => 'Estás quase a começar.',
  signup_confirm_intro: () => 'Confirma o teu email para activares a tua conta.',
  signup_button: 'Confirmar email',
  signup_footer: 'Se não criaste esta conta, ignora este email.',
  invite_preview: () => 'Foste convidado(a) para o Codex',
  invite_h1: 'Foste convidado(a)',
  invite_text: () => 'Foste convidado(a) a juntar-te ao Codex. Clica no botão abaixo para aceitar e criar a tua conta.',
  invite_button: 'Aceitar convite',
  invite_footer: 'Se não estavas à espera deste convite, podes ignorar este email com segurança.',
  magic_preview: () => 'O teu link de acesso ao Codex',
  magic_h1: 'Entrar no Codex',
  magic_text: () => 'Clica no botão abaixo para entrares na tua conta.',
  magic_button: 'Entrar',
  magic_footer: 'Este link expira em 1 hora.',
  recovery_preview: () => 'Recuperar a tua palavra-passe Codex',
  recovery_h1: 'Recuperação de palavra-passe',
  recovery_text: () => 'Recebemos um pedido para redefinir a tua palavra-passe. Clica abaixo para escolher uma nova.',
  recovery_button: 'Redefinir palavra-passe',
  recovery_footer: 'Se não pediste isto, podes ignorar este email com segurança.',
  email_change_preview: () => 'Confirma a alteração de email',
  email_change_h1: 'Alteração de email',
  email_change_text_intro: () => 'Confirma este endereço para concluíres a alteração do teu email.',
  email_change_text_to: '',
  email_change_text_action: '',
  email_change_button: 'Confirmar novo email',
  email_change_footer: 'Se não pediste isto, contacta-nos.',
  reauth_preview: 'O teu código de verificação',
  reauth_h1: 'Confirma a reautenticação',
  reauth_text: 'Usa o código abaixo para confirmar a tua identidade:',
  reauth_footer: 'Este código expira em breve. Se não pediste este código, ignora este email.',
}

const EN: CommonStrings = {
  subjects: {
    signup: 'Confirm your Codex account',
    invite: "You've been invited to Codex",
    magiclink: 'Your Codex sign-in link',
    recovery: 'Reset your Codex password',
    email_change: 'Confirm your email change',
    reauthentication: 'Your verification code',
  },
  signup_preview: () => 'Confirm your Codex account',
  signup_h1: 'Welcome to Codex',
  signup_intro: () => "You're almost there.",
  signup_confirm_intro: () => 'Confirm your email to activate your account.',
  signup_button: 'Confirm email',
  signup_footer: "If you didn't create this account, ignore this email.",
  invite_preview: () => "You've been invited to Codex",
  invite_h1: "You've been invited",
  invite_text: () => "You've been invited to join Codex. Click the button below to accept and create your account.",
  invite_button: 'Accept invitation',
  invite_footer: "If you weren't expecting this invitation, you can safely ignore this email.",
  magic_preview: () => 'Your Codex sign-in link',
  magic_h1: 'Sign in to Codex',
  magic_text: () => 'Click the button below to sign in to your account.',
  magic_button: 'Sign in',
  magic_footer: 'This link expires in 1 hour.',
  recovery_preview: () => 'Reset your Codex password',
  recovery_h1: 'Password recovery',
  recovery_text: () => 'We received a request to reset your password. Click below to choose a new one.',
  recovery_button: 'Reset password',
  recovery_footer: "If you didn't request this, you can safely ignore this email.",
  email_change_preview: () => 'Confirm your email change',
  email_change_h1: 'Email change',
  email_change_text_intro: () => 'Confirm this address to complete your email change.',
  email_change_text_to: '',
  email_change_text_action: '',
  email_change_button: 'Confirm new email',
  email_change_footer: "If you didn't request this, contact us.",
  reauth_preview: 'Your verification code',
  reauth_h1: 'Confirm reauthentication',
  reauth_text: 'Use the code below to confirm your identity:',
  reauth_footer: "This code will expire shortly. If you didn't request this, you can safely ignore this email.",
}

const ES: CommonStrings = {
  subjects: {
    signup: 'Confirma tu cuenta Codex',
    invite: 'Has sido invitado(a) a Codex',
    magiclink: 'Tu enlace de acceso a Codex',
    recovery: 'Restablece tu contraseña Codex',
    email_change: 'Confirma el cambio de email',
    reauthentication: 'Tu código de verificación',
  },
  signup_preview: () => 'Confirma tu cuenta Codex',
  signup_h1: 'Bienvenido a Codex',
  signup_intro: () => 'Ya casi estás.',
  signup_confirm_intro: () => 'Confirma tu email para activar tu cuenta.',
  signup_button: 'Confirmar email',
  signup_footer: 'Si no creaste esta cuenta, ignora este email.',
  invite_preview: () => 'Has sido invitado(a) a Codex',
  invite_h1: 'Has sido invitado(a)',
  invite_text: () => 'Has sido invitado(a) a unirte a Codex. Haz clic en el botón para aceptar y crear tu cuenta.',
  invite_button: 'Aceptar invitación',
  invite_footer: 'Si no esperabas esta invitación, puedes ignorar este mensaje con seguridad.',
  magic_preview: () => 'Tu enlace de acceso a Codex',
  magic_h1: 'Entrar en Codex',
  magic_text: () => 'Haz clic en el botón de abajo para entrar en tu cuenta.',
  magic_button: 'Entrar',
  magic_footer: 'Este enlace caduca en 1 hora.',
  recovery_preview: () => 'Restablece tu contraseña Codex',
  recovery_h1: 'Recuperación de contraseña',
  recovery_text: () => 'Recibimos una solicitud para restablecer tu contraseña. Haz clic abajo para elegir una nueva.',
  recovery_button: 'Restablecer contraseña',
  recovery_footer: 'Si no solicitaste esto, puedes ignorar este email con seguridad.',
  email_change_preview: () => 'Confirma el cambio de email',
  email_change_h1: 'Cambio de email',
  email_change_text_intro: () => 'Confirma esta dirección para completar el cambio de email.',
  email_change_text_to: '',
  email_change_text_action: '',
  email_change_button: 'Confirmar nuevo email',
  email_change_footer: 'Si no solicitaste esto, contáctanos.',
  reauth_preview: 'Tu código de verificación',
  reauth_h1: 'Confirma la reautenticación',
  reauth_text: 'Usa el código siguiente para confirmar tu identidad:',
  reauth_footer: 'Este código expirará pronto. Si no lo solicitaste, puedes ignorar este mensaje.',
}

const FR: CommonStrings = {
  subjects: {
    signup: 'Confirmez votre compte Codex',
    invite: 'Vous êtes invité(e) sur Codex',
    magiclink: 'Votre lien de connexion Codex',
    recovery: 'Réinitialisez votre mot de passe Codex',
    email_change: "Confirmez le changement d'email",
    reauthentication: 'Votre code de vérification',
  },
  signup_preview: () => 'Confirmez votre compte Codex',
  signup_h1: 'Bienvenue sur Codex',
  signup_intro: () => 'Vous y êtes presque.',
  signup_confirm_intro: () => 'Confirmez votre email pour activer votre compte.',
  signup_button: "Confirmer l'email",
  signup_footer: "Si vous n'avez pas créé ce compte, ignorez cet email.",
  invite_preview: () => 'Vous êtes invité(e) sur Codex',
  invite_h1: 'Vous êtes invité(e)',
  invite_text: () => "Vous êtes invité(e) à rejoindre Codex. Cliquez sur le bouton ci-dessous pour accepter et créer votre compte.",
  invite_button: "Accepter l'invitation",
  invite_footer: "Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email en toute sécurité.",
  magic_preview: () => 'Votre lien de connexion Codex',
  magic_h1: 'Se connecter à Codex',
  magic_text: () => 'Cliquez sur le bouton ci-dessous pour vous connecter.',
  magic_button: 'Se connecter',
  magic_footer: 'Ce lien expire dans 1 heure.',
  recovery_preview: () => 'Réinitialisez votre mot de passe Codex',
  recovery_h1: 'Récupération du mot de passe',
  recovery_text: () => 'Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez ci-dessous pour en choisir un nouveau.',
  recovery_button: 'Réinitialiser le mot de passe',
  recovery_footer: "Si vous n'avez pas fait cette demande, ignorez cet email.",
  email_change_preview: () => "Confirmez le changement d'email",
  email_change_h1: "Changement d'email",
  email_change_text_intro: () => 'Confirmez cette adresse pour finaliser le changement.',
  email_change_text_to: '',
  email_change_text_action: '',
  email_change_button: 'Confirmer le nouvel email',
  email_change_footer: "Si vous n'avez pas fait cette demande, contactez-nous.",
  reauth_preview: 'Votre code de vérification',
  reauth_h1: "Confirmez la réauthentification",
  reauth_text: 'Utilisez le code ci-dessous pour confirmer votre identité :',
  reauth_footer: "Ce code expirera bientôt. Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email en toute sécurité.",
}

export const STRINGS: Record<Lang, CommonStrings> = { pt: PT, en: EN, es: ES, fr: FR }

export function t(lang: Lang): CommonStrings {
  return STRINGS[lang] || STRINGS.pt
}

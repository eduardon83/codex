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
  // Signup
  signup_preview: (site: string) => string
  signup_h1: string
  signup_intro: (site: string) => string
  signup_confirm_intro: (recipient: string) => string
  signup_button: string
  signup_footer: string
  // Invite
  invite_preview: (site: string) => string
  invite_h1: string
  invite_text: (site: string) => string
  invite_button: string
  invite_footer: string
  // Magic link
  magic_preview: (site: string) => string
  magic_h1: string
  magic_text: (site: string) => string
  magic_button: string
  magic_footer: string
  // Recovery
  recovery_preview: (site: string) => string
  recovery_h1: string
  recovery_text: (site: string) => string
  recovery_button: string
  recovery_footer: string
  // Email change
  email_change_preview: (site: string) => string
  email_change_h1: string
  email_change_text_intro: (site: string) => string
  email_change_text_to: string
  email_change_text_action: string
  email_change_button: string
  email_change_footer: string
  // Reauth
  reauth_preview: string
  reauth_h1: string
  reauth_text: string
  reauth_footer: string
}

const PT: CommonStrings = {
  subjects: {
    signup: 'Confirme o seu email',
    invite: 'Foi convidado(a)',
    magiclink: 'O seu link de acesso',
    recovery: 'Repor a sua palavra-passe',
    email_change: 'Confirme o seu novo email',
    reauthentication: 'O seu código de verificação',
  },
  signup_preview: (s) => `Confirme o seu email no ${s}`,
  signup_h1: 'Confirme o seu email',
  signup_intro: (s) => `Obrigado por se registar em ${s}!`,
  signup_confirm_intro: (r) => `Por favor, confirme o seu endereço de email (${r}) clicando no botão abaixo:`,
  signup_button: 'Verificar email',
  signup_footer: 'Se não criou esta conta, pode ignorar este email em segurança.',
  invite_preview: (s) => `Foi convidado(a) para se juntar a ${s}`,
  invite_h1: 'Foi convidado(a)',
  invite_text: (s) => `Foi convidado(a) para se juntar a ${s}. Clique no botão abaixo para aceitar o convite e criar a sua conta.`,
  invite_button: 'Aceitar convite',
  invite_footer: 'Se não estava à espera deste convite, pode ignorar este email em segurança.',
  magic_preview: (s) => `O seu link de acesso ao ${s}`,
  magic_h1: 'O seu link de acesso',
  magic_text: (s) => `Clique no botão abaixo para entrar em ${s}. Este link expira em breve.`,
  magic_button: 'Entrar',
  magic_footer: 'Se não pediu este link, pode ignorar este email em segurança.',
  recovery_preview: (s) => `Reponha a sua palavra-passe no ${s}`,
  recovery_h1: 'Reponha a sua palavra-passe',
  recovery_text: (s) => `Recebemos um pedido para repor a sua palavra-passe em ${s}. Clique no botão abaixo para escolher uma nova.`,
  recovery_button: 'Repor palavra-passe',
  recovery_footer: 'Se não pediu para repor a sua palavra-passe, pode ignorar este email. A sua palavra-passe não será alterada.',
  email_change_preview: (s) => `Confirme a alteração de email no ${s}`,
  email_change_h1: 'Confirme a alteração de email',
  email_change_text_intro: (s) => `Pediu para alterar o endereço de email em ${s} de`,
  email_change_text_to: 'para',
  email_change_text_action: 'Clique no botão abaixo para confirmar a alteração:',
  email_change_button: 'Confirmar alteração',
  email_change_footer: 'Se não pediu esta alteração, proteja a sua conta de imediato.',
  reauth_preview: 'O seu código de verificação',
  reauth_h1: 'Confirme a reautenticação',
  reauth_text: 'Use o código abaixo para confirmar a sua identidade:',
  reauth_footer: 'Este código expira em breve. Se não pediu este código, pode ignorar este email em segurança.',
}

const EN: CommonStrings = {
  subjects: {
    signup: 'Confirm your email',
    invite: "You've been invited",
    magiclink: 'Your login link',
    recovery: 'Reset your password',
    email_change: 'Confirm your new email',
    reauthentication: 'Your verification code',
  },
  signup_preview: (s) => `Confirm your email for ${s}`,
  signup_h1: 'Confirm your email',
  signup_intro: (s) => `Thanks for signing up for ${s}!`,
  signup_confirm_intro: (r) => `Please confirm your email address (${r}) by clicking the button below:`,
  signup_button: 'Verify email',
  signup_footer: "If you didn't create an account, you can safely ignore this email.",
  invite_preview: (s) => `You've been invited to join ${s}`,
  invite_h1: "You've been invited",
  invite_text: (s) => `You've been invited to join ${s}. Click the button below to accept the invitation and create your account.`,
  invite_button: 'Accept invitation',
  invite_footer: "If you weren't expecting this invitation, you can safely ignore this email.",
  magic_preview: (s) => `Your login link for ${s}`,
  magic_h1: 'Your login link',
  magic_text: (s) => `Click the button below to log in to ${s}. This link will expire shortly.`,
  magic_button: 'Log in',
  magic_footer: "If you didn't request this link, you can safely ignore this email.",
  recovery_preview: (s) => `Reset your password for ${s}`,
  recovery_h1: 'Reset your password',
  recovery_text: (s) => `We received a request to reset your password for ${s}. Click the button below to choose a new password.`,
  recovery_button: 'Reset password',
  recovery_footer: "If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.",
  email_change_preview: (s) => `Confirm your email change for ${s}`,
  email_change_h1: 'Confirm your email change',
  email_change_text_intro: (s) => `You requested to change your email address for ${s} from`,
  email_change_text_to: 'to',
  email_change_text_action: 'Click the button below to confirm this change:',
  email_change_button: 'Confirm email change',
  email_change_footer: "If you didn't request this change, please secure your account immediately.",
  reauth_preview: 'Your verification code',
  reauth_h1: 'Confirm reauthentication',
  reauth_text: 'Use the code below to confirm your identity:',
  reauth_footer: "This code will expire shortly. If you didn't request this, you can safely ignore this email.",
}

const ES: CommonStrings = {
  subjects: {
    signup: 'Confirma tu correo',
    invite: 'Has sido invitado(a)',
    magiclink: 'Tu enlace de acceso',
    recovery: 'Restablece tu contraseña',
    email_change: 'Confirma tu nuevo correo',
    reauthentication: 'Tu código de verificación',
  },
  signup_preview: (s) => `Confirma tu correo en ${s}`,
  signup_h1: 'Confirma tu correo',
  signup_intro: (s) => `¡Gracias por registrarte en ${s}!`,
  signup_confirm_intro: (r) => `Por favor, confirma tu dirección de correo (${r}) haciendo clic en el botón:`,
  signup_button: 'Verificar correo',
  signup_footer: 'Si no creaste una cuenta, puedes ignorar este mensaje con seguridad.',
  invite_preview: (s) => `Has sido invitado(a) a unirte a ${s}`,
  invite_h1: 'Has sido invitado(a)',
  invite_text: (s) => `Has sido invitado(a) a unirte a ${s}. Haz clic en el botón para aceptar la invitación y crear tu cuenta.`,
  invite_button: 'Aceptar invitación',
  invite_footer: 'Si no esperabas esta invitación, puedes ignorar este mensaje con seguridad.',
  magic_preview: (s) => `Tu enlace de acceso a ${s}`,
  magic_h1: 'Tu enlace de acceso',
  magic_text: (s) => `Haz clic en el botón para entrar en ${s}. Este enlace expirará pronto.`,
  magic_button: 'Entrar',
  magic_footer: 'Si no solicitaste este enlace, puedes ignorar este mensaje con seguridad.',
  recovery_preview: (s) => `Restablece tu contraseña en ${s}`,
  recovery_h1: 'Restablece tu contraseña',
  recovery_text: (s) => `Recibimos una solicitud para restablecer tu contraseña en ${s}. Haz clic en el botón para elegir una nueva.`,
  recovery_button: 'Restablecer contraseña',
  recovery_footer: 'Si no pediste restablecer tu contraseña, ignora este mensaje. Tu contraseña no se cambiará.',
  email_change_preview: (s) => `Confirma el cambio de correo en ${s}`,
  email_change_h1: 'Confirma el cambio de correo',
  email_change_text_intro: (s) => `Pediste cambiar tu dirección de correo en ${s} de`,
  email_change_text_to: 'a',
  email_change_text_action: 'Haz clic en el botón para confirmar el cambio:',
  email_change_button: 'Confirmar cambio',
  email_change_footer: 'Si no solicitaste este cambio, protege tu cuenta de inmediato.',
  reauth_preview: 'Tu código de verificación',
  reauth_h1: 'Confirma la reautenticación',
  reauth_text: 'Usa el código siguiente para confirmar tu identidad:',
  reauth_footer: 'Este código expirará pronto. Si no lo solicitaste, puedes ignorar este mensaje.',
}

const FR: CommonStrings = {
  subjects: {
    signup: 'Confirmez votre adresse email',
    invite: 'Vous êtes invité(e)',
    magiclink: 'Votre lien de connexion',
    recovery: 'Réinitialiser votre mot de passe',
    email_change: 'Confirmez votre nouvelle adresse email',
    reauthentication: 'Votre code de vérification',
  },
  signup_preview: (s) => `Confirmez votre adresse email pour ${s}`,
  signup_h1: 'Confirmez votre adresse email',
  signup_intro: (s) => `Merci de vous être inscrit(e) à ${s} !`,
  signup_confirm_intro: (r) => `Veuillez confirmer votre adresse email (${r}) en cliquant sur le bouton ci-dessous :`,
  signup_button: "Vérifier l'email",
  signup_footer: "Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.",
  invite_preview: (s) => `Vous êtes invité(e) à rejoindre ${s}`,
  invite_h1: 'Vous êtes invité(e)',
  invite_text: (s) => `Vous êtes invité(e) à rejoindre ${s}. Cliquez sur le bouton ci-dessous pour accepter l'invitation et créer votre compte.`,
  invite_button: "Accepter l'invitation",
  invite_footer: "Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email en toute sécurité.",
  magic_preview: (s) => `Votre lien de connexion à ${s}`,
  magic_h1: 'Votre lien de connexion',
  magic_text: (s) => `Cliquez sur le bouton pour vous connecter à ${s}. Ce lien expirera bientôt.`,
  magic_button: 'Se connecter',
  magic_footer: "Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet email en toute sécurité.",
  recovery_preview: (s) => `Réinitialisez votre mot de passe sur ${s}`,
  recovery_h1: 'Réinitialisez votre mot de passe',
  recovery_text: (s) => `Nous avons reçu une demande de réinitialisation de votre mot de passe sur ${s}. Cliquez sur le bouton pour en choisir un nouveau.`,
  recovery_button: 'Réinitialiser le mot de passe',
  recovery_footer: "Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email. Votre mot de passe ne sera pas modifié.",
  email_change_preview: (s) => `Confirmez le changement d'email sur ${s}`,
  email_change_h1: "Confirmez le changement d'email",
  email_change_text_intro: (s) => `Vous avez demandé à changer votre adresse email sur ${s} de`,
  email_change_text_to: 'à',
  email_change_text_action: 'Cliquez sur le bouton ci-dessous pour confirmer ce changement :',
  email_change_button: 'Confirmer le changement',
  email_change_footer: "Si vous n'avez pas demandé ce changement, sécurisez votre compte immédiatement.",
  reauth_preview: 'Votre code de vérification',
  reauth_h1: "Confirmez la réauthentification",
  reauth_text: 'Utilisez le code ci-dessous pour confirmer votre identité :',
  reauth_footer: "Ce code expirera bientôt. Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email en toute sécurité.",
}

export const STRINGS: Record<Lang, CommonStrings> = { pt: PT, en: EN, es: ES, fr: FR }

export function t(lang: Lang): CommonStrings {
  return STRINGS[lang] || STRINGS.pt
}

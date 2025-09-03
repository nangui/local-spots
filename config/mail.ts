import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
  default: 'smtp',

  /**
   * Adresse globale pour l'expéditeur
   * Utilisée sauf si une adresse explicite est définie sur l'email
   */
  from: {
    address: env.get('MAIL_FROM_ADDRESS', 'noreply@localspots.com'),
    name: env.get('MAIL_FROM_NAME', 'LocalSpots'),
  },

  /**
   * Adresse globale pour la réponse
   * Utilisée sauf si une adresse explicite est définie sur l'email
   */
  replyTo: {
    address: env.get('MAIL_FROM_ADDRESS', 'noreply@localspots.com'),
    name: env.get('MAIL_FROM_NAME', 'LocalSpots'),
  },

  /**
   * Configuration des transporteurs de mail
   * Chaque transporteur peut utiliser un transport différent
   * ou le même transport avec des options différentes
   */
  mailers: {
    /**
     * Transporteur SMTP principal (développement et production)
     */
    smtp: transports.smtp({
      host: env.get('SMTP_HOST', '127.0.0.1'),
      port: env.get('SMTP_PORT', 1025),
      secure: false,
      auth: env.get('SMTP_USERNAME') && env.get('SMTP_PASSWORD') ? {
        type: 'login',
        user: env.get('SMTP_USERNAME')!,
        pass: env.get('SMTP_PASSWORD')!,
      } : undefined,
      // Configuration pour Mailhog en développement
      ignoreTLS: env.get('NODE_ENV') === 'development',
      requireTLS: false,
    }),

    /**
     * Transporteur SMTP pour Mailhog (développement uniquement)
     */
    mailhog: transports.smtp({
      host: '127.0.0.1',
      port: 1025,
      secure: false,
      ignoreTLS: true,
      requireTLS: false,
    }),
  },
})

export default mailConfig

import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import type User from '#models/user'
import { inject } from '@adonisjs/core'

@inject()
export default class MailService {
  /**
   * Check if we're in test environment
   */
  private isTestEnvironment(): boolean {
    return env.get('NODE_ENV') === 'test'
  }

  /**
   * Envoyer un email de bienvenue
   */
  async sendWelcomeEmail(user: User) {
    // Skip sending emails in test environment
    if (this.isTestEnvironment()) {
      console.log(`[TEST] Skipping welcome email to ${user.email}`)
      return true
    }

    try {
      await mail.send((message) => {
        message
          .to(user.email)
          .subject('Bienvenue sur LocalSpots ! 🎉')
          .html(`
            <h1>🎉 Bienvenue sur LocalSpots !</h1>
            <p>Bonjour ${user.fullName || user.email},</p>
            <p>Merci de vous être inscrit sur LocalSpots !</p>
            <p>Découvrez les meilleurs spots près de chez vous et partagez vos découvertes avec la communauté.</p>
            <p>Cordialement,<br>L'équipe LocalSpots</p>
          `)
          .text(`
            Bienvenue sur LocalSpots !
            
            Bonjour ${user.fullName || user.email},
            
            Merci de vous être inscrit sur LocalSpots !
            
            Découvrez les meilleurs spots près de chez vous et partagez vos découvertes avec la communauté.
            
            Cordialement,
            L'équipe LocalSpots
          `)
      })

      console.log(`Email de bienvenue envoyé à ${user.email}`)
      return true
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'email de bienvenue à ${user.email}:`, error)
      return false
    }
  }

  /**
   * Envoyer un email de vérification
   */
  async sendVerificationEmail(user: User, verificationCode: string) {
    try {
      await mail.send((message) => {
        message
          .to(user.email)
          .subject('Vérifiez votre email - LocalSpots 🔐')
          .htmlView('emails/verify_email_html', {
            user: {
              fullName: user.fullName || user.email
            },
            verificationCode,
            appUrl: env.get('APP_URL', 'http://localhost:3333')
          })
      })

      console.log(`Email de vérification envoyé à ${user.email}`)
      return true
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'email de vérification à ${user.email}:`, error)
      return false
    }
  }

  /**
   * Envoyer un email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(user: User, resetToken: string) {
    try {
      const resetUrl = `${env.get('APP_URL', 'http://localhost:3333')}/reset-password?token=${resetToken}`
      
      await mail.send((message) => {
        message
          .to(user.email)
          .subject('Réinitialisation de votre mot de passe - LocalSpots 🔑')
          .html(`
            <h1>🔑 Réinitialisation de mot de passe</h1>
            <p>Bonjour ${user.fullName || user.email},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe sur LocalSpots.</p>
            <p><a href="${resetUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a></p>
            <p>Si le bouton ne fonctionne pas, copiez ce lien : ${resetUrl}</p>
            <p>Ce lien expire dans 1 heure.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            <p>Cordialement,<br>L'équipe LocalSpots</p>
          `)
          .text(`
            Réinitialisation de mot de passe
            
            Bonjour ${user.fullName || user.email},
            
            Vous avez demandé la réinitialisation de votre mot de passe sur LocalSpots.
            
            Cliquez sur ce lien pour réinitialiser votre mot de passe :
            ${resetUrl}
            
            Ce lien expire dans 1 heure.
            
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            
            Cordialement,
            L'équipe LocalSpots
          `)
      })

      console.log(`Email de réinitialisation de mot de passe envoyé à ${user.email}`)
      return true
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'email de réinitialisation à ${user.email}:`, error)
      return false
    }
  }

  /**
   * Envoyer un email de notification de nouveau spot
   */
  async sendNewSpotNotification(user: User, spotName: string, spotLocation: string) {
    try {
      await mail.send((message) => {
        message
          .to(user.email)
          .subject(`Nouveau spot découvert près de chez vous ! 📍`)
          .html(`
            <h1>📍 Nouveau spot découvert !</h1>
            <p>Bonjour ${user.fullName || user.email},</p>
            <p>Un nouveau spot a été ajouté près de chez vous :</p>
            <h2>${spotName}</h2>
            <p><strong>Localisation :</strong> ${spotLocation}</p>
            <p><a href="${env.get('APP_URL', 'http://localhost:3333')}/spots" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Voir le spot</a></p>
            <p>Découvrez-le et partagez votre avis !</p>
            <p>Cordialement,<br>L'équipe LocalSpots</p>
          `)
      })

      console.log(`Notification de nouveau spot envoyée à ${user.email}`)
      return true
    } catch (error) {
      console.error(`Erreur lors de l'envoi de la notification à ${user.email}:`, error)
      return false
    }
  }

  /**
   * Envoyer un email en utilisant un transporteur spécifique
   */
  async sendWithMailer(mailerName: string, callback: (message: any) => void) {
    try {
      await mail.use(mailerName).send(callback)
      return true
    } catch (error) {
      console.error(`Erreur lors de l'envoi avec le transporteur ${mailerName}:`, error)
      return false
    }
  }

  /**
   * Envoyer un email en arrière-plan (queue)
   */
  async sendLater(callback: (message: any) => void) {
    try {
      await mail.sendLater(callback)
      return true
    } catch (error) {
      console.error('Erreur lors de la mise en queue de l\'email:', error)
      return false
    }
  }
}

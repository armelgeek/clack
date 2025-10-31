import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'false',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendPasswordUpdateEmail(email: string, storeName: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Confirmation de changement de mot de passe`,
        html: `
            <p>Bonjour,</p>
            <p>Nous vous confirmons que votre mot de passe pour accéder aux informations du magasin <strong>${storeName}</strong> a été modifié avec succès.</p>
            <p>Vous pouvez maintenant utiliser votre nouveau mot de passe pour vous connecter à la plateforme.</p>
            
            <p>
                <a href=${process.env.REACT_APP_URL} style="display: inline-block; padding: 10px 20px; background-color: #52b270; color: #ffffff; text-decoration: none; border-radius: 5px;">
                    Se connecter maintenant
                </a>
            </p>

            <p>Si vous n'êtes pas à l'origine de ce changement, veuillez contacter immédiatement le support technique.</p>
            <p>Merci !</p>
        `,
      });
      this.logger.log(`Email envoyé à ${email}`);
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'envoi de l'email à ${email}: ${error.message}`,
      );
    }
  }

  public async sendResetPasswordEmail(
    to: string,
    storeName: string,
    resetUrl: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: to,
        subject: `Réinitialisation de votre mot de passe pour ${storeName}`,
        html: `
                    <p>Bonjour,</p>
                    <p>Quelqu'un a demandé à réinitialiser le mot de passe de votre compte ${storeName}.</p>
                    <p>Si c'était vous, veuillez cliquer sur le lien ci-dessous pour continuer :</p>
                    <p>
                      <a href=${resetUrl} style="display: inline-block; padding: 10px 20px; background-color: #52b270; color: #ffffff; text-decoration: none; border-radius: 5px;">
                        Réinitialiser mon mot de passe
                      </a>
                    </p>
                    <p>Ce lien expirera dans une heure.</p>
                    <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.</p>
                `,
      });

      this.logger.log('E-mail de réinitialisation envoyé');
    } catch (error) {
      this.logger.error(
        "Erreur lors de l'envoi de l'e-mail de réinitialisation:",
        error,
      );
    }
  }
}

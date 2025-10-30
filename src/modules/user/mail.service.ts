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
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendStoreAssignmentEmail(email: string, storeName: string, password: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Vous avez été assigné au magasin "${storeName}"`,
        html: `
          <p>Bonjour,</p>
          <p>Vous avez été assigné au magasin <strong>${storeName}</strong>.</p>
          <p>Veuillez vous connecter à la plateforme pour gérer ce magasin :</p>
          <p>Votre mot de passe : <strong>${password}</strong></p>
          <p><a href="https://staging.store.clicknvape.fr/login">Se connecter à la plateforme</a></p>
          <p>Merci !</p>
        `,
      });
      this.logger.log(`Email envoyé à ${email}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email à ${email}: ${error.message}`);
    }
  }

  async sendDeactivationEmail(email: string, storeName?: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Votre compte a été désactivé',
        html: `
          <p>Bonjour,</p>
          <p>Votre compte ${storeName ? `lié au magasin <strong>${storeName}</strong>` : ''} a été désactivé par un administrateur.</p>
          <p>Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le support.</p>
          <p>Merci,</p>
          <p>L’équipe Click N Vape</p>
        `,
      });
      this.logger.log(`Email de désactivation envoyé à ${email}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email de désactivation à ${email}: ${error.message}`);
    }
  }

  async sendActivationEmail(email: string, storeName?: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Votre compte a été réactivé',
        html: `
          <p>Bonjour,</p>
          <p>Bonne nouvelle ! Votre compte ${
            storeName ? `lié au magasin <strong>${storeName}</strong>` : ''
          } a été réactivé par un administrateur.</p>
          <p>Vous pouvez maintenant vous reconnecter à la plateforme :</p>
          <p><a href="https://staging.store.clicknvape.fr/login">Se connecter à la plateforme</a></p>
          <p>Merci,</p>
          <p>L’équipe Click N Vape</p>
        `,
      });
      this.logger.log(`Email de réactivation envoyé à ${email}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email de réactivation à ${email}: ${error.message}`);
    }
  }
}

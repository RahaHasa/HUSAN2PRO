import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    // For production, use environment variables
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASSWORD, // your password or app password
      },
    });
  }

  async sendResetPasswordCode(email: string, code: string) {
    const mailOptions = {
      from: `"RENT MEYRAM" <${process.env.EMAIL_USER || 'noreply@rentmeyram.kz'}>`,
      to: email,
      subject: 'Құпия сөзді қалпына келтіру коды - RENT MEYRAM',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 2px solid #2563eb; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
            .code { font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎬 RENT MEYRAM</h1>
              <p>Кино жабдықтарын жалға алу қызметі</p>
            </div>
            <div class="content">
              <h2>Құпия сөзді қалпына келтіру</h2>
              <p>Сәлеметсіз бе!</p>
              <p>Сіз RENT MEYRAM жүйесінде құпия сөзді қалпына келтіруді сұрадыңыз.</p>
              <p>Төмендегі кодты пайдаланып, жаңа құпия сөз жасаңыз:</p>
              
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              
              <p><strong>Маңызды:</strong></p>
              <ul>
                <li>Код 15 минут бойы жарамды</li>
                <li>Егер сіз бұл сұранымды жіберген болмасаңыз, бұл хатты елемеңіз</li>
                <li>Кодты басқаларға бермеңіз</li>
              </ul>
              
              <p>Құрметпен,<br><strong>RENT MEYRAM командасы</strong></p>
            </div>
            <div class="footer">
              <p>© 2026 RENT MEYRAM. Барлық құқықтар қорғалған.</p>
              <p>Бұл автоматты түрде жіберілген хат. Жауап бермеңіз.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
RENT MEYRAM - Құпия сөзді қалпына келтіру

Сәлеметсіз бе!

Сіз RENT MEYRAM жүйесінде құпия сөзді қалпына келтіруді сұрадыңыз.

Растау коды: ${code}

Код 15 минут бойы жарамды.

Егер сіз бұл сұранымды жіберген болмасаңыз, бұл хатты елемеңіз.

Құрметпен,
RENT MEYRAM командасы
      `,
    };

    try {
      // Check if email is configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('⚠️  Email не настроен. Код для тестирования:', code);
        return { success: false, demo: true };
      }

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Email отправлен на:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Ошибка отправки email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendSMS(phone: string, code: string) {
    // TODO: Implement SMS sending via SMS provider (Twilio, etc.)
    console.log(`📱 SMS на ${phone}: Ваш код: ${code}`);
    return { success: false, demo: true };
  }

  async sendOrderNotification(email: string, orderDetails: { orderNumber: string; total: number; items: any[] }) {
    const itemsList = orderDetails.items.map((item, index) => 
      `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${index + 1}. ${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.totalPrice} ₸</td>
      </tr>`
    ).join('');

    const mailOptions = {
      from: `"RENT MEYRAM" <${process.env.EMAIL_USER || 'noreply@rentmeyram.kz'}>`,
      to: email,
      subject: `Тапсырыс расталды #${orderDetails.orderNumber} - RENT MEYRAM`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-box { background: white; border: 2px solid #2563eb; border-radius: 10px; padding: 20px; margin: 20px 0; }
            .total { font-size: 24px; font-weight: bold; color: #2563eb; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #2563eb; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 RENT MEYRAM</h1>
              <p>Тапсырысыңыз расталды!</p>
            </div>
            <div class="content">
              <h2>Тапсырыс нөмірі: #${orderDetails.orderNumber}</h2>
              <p>Құрметті клиент!</p>
              <p>Сіздің тапсырысыңыз сәтті рәсімделді және өңделуде.</p>
              
              <div class="order-box">
                <h3>📦 Тапсырыс мазмұны:</h3>
                <table>
                  ${itemsList}
                </table>
                <div class="total">
                  Жалпы сома: ${orderDetails.total} ₸
                </div>
              </div>
              
              <p>Біз сізге жақын арада хабарласамыз.</p>
              <p>Рахмет!</p>
            </div>
            <div class="footer">
              <p>© 2026 RENT MEYRAM. Барлық құқықтар қорғалған.</p>
              <p>Сұрақтарыңыз болса, бізге хабарласыңыз.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('⚠️  Email настройки жоқ');
        return { success: false, demo: true };
      }

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Тапсырыс email жіберілді:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Email жіберу қатесі:', error);
      return { success: false, error: error.message };
    }
  }
}

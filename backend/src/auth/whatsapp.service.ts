import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private client: Client;
  private isReady: boolean = false;

  async onModuleInit() {
    // WhatsApp Web клиентін инициализациялау
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'rent-meyram-bot',
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    // QR код генерациясы
    this.client.on('qr', (qr) => {
      console.log('\n🔵 WhatsApp QR кодын сканерлеңіз:\n');
      qrcode.generate(qr, { small: true });
      console.log('\n📱 Телефонда WhatsApp → Параметрлер → Байланысқан құрылғылар → Құрылғыны байланыстыру\n');
    });

    // Қосылды
    this.client.on('ready', () => {
      console.log('✅ WhatsApp қосылды! +77082475131 нөмірінен хабарламалар жіберуге дайын.');
      this.isReady = true;
    });

    // Ажыратылды
    this.client.on('disconnected', (reason) => {
      console.log('❌ WhatsApp ажыратылды:', reason);
      this.isReady = false;
    });

    // Аутентификация қатесі
    this.client.on('auth_failure', (msg) => {
      console.error('🔴 WhatsApp аутентификация қатесі:', msg);
      this.isReady = false;
    });

    // Клиентті іске қосу
    try {
      await this.client.initialize();
    } catch (error) {
      console.error('WhatsApp инициализация қатесі:', error);
    }
  }

  async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
    // Телефон номерін форматтау (77082475131 -> 77082475131@c.us)
    let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
    
    // Егер 8 немесе +7 болса, 7-ге ауыстыру
    if (formattedPhone.startsWith('8')) {
      formattedPhone = '7' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('7') && formattedPhone.length === 11) {
      // Дұрыс
    } else if (!formattedPhone.startsWith('7')) {
      formattedPhone = '7' + formattedPhone;
    }

    const chatId = formattedPhone + '@c.us';

    const message = ` *RENT MEYRAM*\n\nСіздің растау кодыңыз: *${code}*\n\nБұл кодты ешкіммен бөліспеңіз!\n\n Код 15 минут жарамды.`;

    // Егер WhatsApp қосылмаса
    if (!this.isReady) {
      console.log('⚠️ WhatsApp әлі қосылмады. Код консольда:');
      console.log(`📱 ${phoneNumber} үшін код: ${code}`);
      throw new Error('WhatsApp қосылуын күтіңіз. QR кодты сканерлеңіз.');
    }

    try {
      // Хабарлама жіберу
      await this.client.sendMessage(chatId, message);
      console.log(`✅ WhatsApp код жіберілді: ${phoneNumber}`);
    } catch (error) {
      console.error('WhatsApp жіберу қатесі:', error);
      console.log(`📱 ${phoneNumber} үшін код: ${code}`);
      throw new Error('WhatsApp хабарламасын жіберу мүмкін болмады');
    }
  }

  async sendOrderNotification(phoneNumber: string, orderDetails: { orderNumber: string; total: number; items: any[] }): Promise<void> {
    let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
    
    if (formattedPhone.startsWith('8')) {
      formattedPhone = '7' + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('7')) {
      formattedPhone = '7' + formattedPhone;
    }

    const chatId = formattedPhone + '@c.us';

    const itemsList = orderDetails.items.map((item, index) => 
      `${index + 1}. ${item.name} x${item.quantity} - ${item.totalPrice} ₸`
    ).join('\n');

    const message = `🎉 *RENT MEYRAM - Тапсырыс растау*\n\nТапсырыс нөмірі: *${orderDetails.orderNumber}*\n\n📦 *Тауарлар:*\n${itemsList}\n\n💰 *Жалпы сома:* ${orderDetails.total} ₸\n\nРахмет! Біз сізге жақын арада хабарласамыз.`;

    if (!this.isReady) {
      console.log('⚠️ WhatsApp әлі қосылмады');
      throw new Error('WhatsApp қосылуын күтіңіз');
    }

    try {
      await this.client.sendMessage(chatId, message);
      console.log(`✅ Тапсырыс хабарламасы жіберілді: ${phoneNumber}`);
    } catch (error) {
      console.error('WhatsApp жіберу қатесі:', error);
      throw new Error('WhatsApp хабарламасын жіберу мүмкін болмады');
    }
  }
}

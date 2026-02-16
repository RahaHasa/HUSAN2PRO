import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private client: Client;
  private isReady: boolean = false;

  async onModuleInit() {
    // WhatsApp Web клиент - сессия сохраняется, QR только 1 раз
    try {
      this.client = new Client({
        authStrategy: new LocalAuth({
          dataPath: './whatsapp-session',
        }),
        puppeteer: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      });

      // QR код - только при первом запуске
      this.client.on('qr', (qr) => {
        console.log('\n🔵 ПЕРВЫЙ ЗАПУСК: Отсканируйте QR-код в WhatsApp:\n');
        qrcode.generate(qr, { small: true });
        console.log('\n📱 Телефон → WhatsApp → Настройки → Связанные устройства → Привязать устройство\n');
        console.log('⚡ ВАЖНО: После сканирования сессия сохранится — QR больше не понадобится!\n');
      });
      // Подключено
      this.client.on('ready', () => {
        console.log('✅ WhatsApp подключен! Отправка с номера +77082475131 активна.');
        console.log('💾 Сессия сохранена — перезапуск без QR-кода!');
        this.isReady = true;
      });

      // Отключено
      this.client.on('disconnected', (reason) => {
        console.log('❌ WhatsApp отключен:', reason);
        this.isReady = false;
      });

      // Ошибка авторизации
      this.client.on('auth_failure', (msg) => {
        console.error('🔴 Ошибка авторизации WhatsApp:', msg);
        console.log('💡 Удалите папку whatsapp-session и отсканируйте QR заново');
        this.isReady = false;
      });

      console.log('🔄 WhatsApp инициализация запущена...');
      await this.client.initialize();
    } catch (error) {
      console.error('⚠️ Ошибка инициализации WhatsApp:', error.message);
      console.log('📧 WhatsApp недоступен. Будут отправляться только Email уведомления.');
      this.isReady = false;
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

    const message = `🎬 *RENT MEYRAM*\n\nВаш код подтверждения: *${code}*\n\nНе делитесь этим кодом ни с кем!\n\n⏱ Код действителен 15 минут`;

    // Если WhatsApp не подключен
    if (!this.isReady) {
      console.log('⚠️ WhatsApp еще не подключен. Код в консоли:');
      console.log(`📱 Код для ${phoneNumber}: ${code}`);
      throw new Error('Подождите подключения WhatsApp или отсканируйте QR-код');
    }

    try {
      // Отправка сообщения
      await this.client.sendMessage(chatId, message);
      console.log(`✅ WhatsApp код отправлен: ${phoneNumber}`);
    } catch (error) {
      console.error('Ошибка отправки WhatsApp:', error);
      console.log(`📱 Код для ${phoneNumber}: ${code}`);
      throw new Error('Не удалось отправить WhatsApp сообщение');
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

    const message = `🎉 *RENT MEYRAM - Подтверждение заказа*\n\nНомер заказа: *${orderDetails.orderNumber}*\n\n📦 *Товары:*\n${itemsList}\n\n💰 *Общая сумма:* ${orderDetails.total} ₸\n\nСпасибо! Мы свяжемся с вами в ближайшее время.`;

    if (!this.isReady) {
      console.log('⚠️ WhatsApp еще не подключен');
      throw new Error('Подождите подключения WhatsApp');
    }

    try {
      await this.client.sendMessage(chatId, message);
      console.log(`✅ Уведомление о заказе отправлено: ${phoneNumber}`);
    } catch (error) {
      console.error('Ошибка отправки WhatsApp:', error);
      throw new Error('Не удалось отправить WhatsApp сообщение');
    }
  }
}

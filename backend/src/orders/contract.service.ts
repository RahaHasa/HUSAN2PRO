import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Order } from './order.entity';

@Injectable()
export class ContractService {
  generateContract(order: Order): typeof PDFDocument {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Заголовок документа
    doc.fontSize(18).font('Helvetica-Bold').text('ЖАЛҒА АЛУ ШАРТЫ', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(`(Rental Agreement)`, { align: 'center' });
    doc.moveDown(2);

    // Номер договора и дата
    doc.fontSize(10).text(`Шарт нөмірі / Contract №: ${order.orderNumber}`, { align: 'left' });
    doc.text(`Күні / Date: ${new Date(order.createdAt).toLocaleDateString('kk-KZ')}`, { align: 'left' });
    doc.moveDown(1.5);

    // Стороны договора
    doc.fontSize(14).font('Helvetica-Bold').text('1. ШАРТ ТАРАПТАРЫ / PARTIES', { underline: true });
    doc.moveDown(0.5);

    // Жалға беруші (Арендодатель)
    doc.fontSize(11).font('Helvetica-Bold').text('Жалға беруші / Lessor:');
    doc.font('Helvetica').fontSize(10);
    doc.text('ЖШС "RENT MEYRAM"');
    doc.text('БСН / BIN: 123456789012');
    doc.text('Мекенжайы / Address: Алматы қ., Әл-Фараби д., 77');
    doc.text('Телефон / Phone: +7 708 247 5131');
    doc.text('Email: info@rentmeyram.kz');
    doc.moveDown(1);

    // Жалға алушы (Арендатор)
    doc.fontSize(11).font('Helvetica-Bold').text('Жалға алушы / Lessee:');
    doc.font('Helvetica').fontSize(10);
    doc.text(`Аты-жөні / Full Name: ${order.user?.email || 'Клиент'}`);
    doc.text(`Телефон / Phone: ${order.phone || 'Не указан'}`);
    doc.text(`Email: ${order.user?.email || order.deliveryAddress || 'Не указан'}`);
    doc.text(`Жеткізу мекенжайы / Delivery Address: ${order.deliveryAddress || 'Самовывоз'}`);
    doc.moveDown(1.5);

    // Предмет договора
    doc.fontSize(14).font('Helvetica-Bold').text('2. ШАРТТЫҢ МӘНІ / SUBJECT OF AGREEMENT', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text(
      'Жалға беруші Жалға алушыға мерзімді пайдалануға төмендегі мүлікті береді:',
      { align: 'left' }
    );
    doc.text('The Lessor provides the Lessee with the following property for temporary use:', { align: 'left' });
    doc.moveDown(0.5);

    // Таблица товаров
    const tableTop = doc.y;
    const colWidths = [30, 220, 80, 80, 80];
    const colX = [50, 80, 300, 380, 460];

    // Заголовки таблицы
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('№', colX[0], tableTop, { width: colWidths[0] });
    doc.text('Атауы / Name', colX[1], tableTop, { width: colWidths[1] });
    doc.text('Саны / Qty', colX[2], tableTop, { width: colWidths[2] });
    doc.text('Мерзімі / Period', colX[3], tableTop, { width: colWidths[3] });
    doc.text('Сомасы / Price', colX[4], tableTop, { width: colWidths[4] });

    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

    // Товары
    let currentY = tableTop + 20;
    doc.font('Helvetica').fontSize(9);

    order.items.forEach((item, index) => {
      const startDate = item.startDate ? new Date(item.startDate).toLocaleDateString('kk-KZ', { day: '2-digit', month: '2-digit' }) : '-';
      const endDate = item.endDate ? new Date(item.endDate).toLocaleDateString('kk-KZ', { day: '2-digit', month: '2-digit' }) : '-';
      const period = `${startDate} - ${endDate}`;

      doc.text((index + 1).toString(), colX[0], currentY, { width: colWidths[0] });
      doc.text(item.product?.name || 'Товар', colX[1], currentY, { width: colWidths[1] });
      doc.text(item.quantity.toString(), colX[2], currentY, { width: colWidths[2] });
      doc.text(period, colX[3], currentY, { width: colWidths[3] });
      doc.text(`${item.totalPrice} ₸`, colX[4], currentY, { width: colWidths[4] });

      currentY += 20;
    });

    doc.moveTo(50, currentY).lineTo(545, currentY).stroke();

    // Итого
    currentY += 10;
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('БАРЛЫҒЫ / TOTAL:', colX[3], currentY, { width: colWidths[3] });
    doc.text(`${order.total} ₸`, colX[4], currentY, { width: colWidths[4] });

    doc.moveDown(2);
    currentY = doc.y;

    // Условия
    doc.fontSize(14).font('Helvetica-Bold').text('3. ТӨЛЕМ ШАРТТАРЫ / PAYMENT TERMS', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text('- Төлем аванстық түрде / Payment in advance');
    doc.text('- Төлем түрі: Карточкамен онлайн / Payment method: Online by card');
    doc.text(`- Жалпы сома / Total amount: ${order.total} ₸`);
    doc.moveDown(1.5);

    // Ответственность
    doc.fontSize(14).font('Helvetica-Bold').text('4. ЖАУАПКЕРШІЛІК / LIABILITY');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text('- Жалға алушы мүлікті абайлап пайдалануға міндетті');
    doc.text('  The Lessee is obliged to use the property carefully');
    doc.text('- Зақымдалған жағдайда жөндеу құны өтеледі');
    doc.text('  In case of damage, the repair cost shall be compensated');
    doc.text('- Мерзімінен кешіктірілген қайтарым айыппұл салынады');
    doc.text('  Late return is subject to a penalty fee');
    doc.moveDown(1.5);

    // Подписи
    doc.fontSize(14).font('Helvetica-Bold').text('5. ҚОЛТАҢБАЛАР / SIGNATURES');
    doc.moveDown(1);

    const signatureY = doc.y;
    doc.fontSize(10).font('Helvetica');

    // Жалға беруші
    doc.text('Жалға беруші / Lessor:', 50, signatureY);
    doc.moveTo(50, signatureY + 40).lineTo(250, signatureY + 40).stroke();
    doc.text('ЖШС "RENT MEYRAM"', 50, signatureY + 45, { width: 200 });
    doc.text('Директоры / Director', 50, signatureY + 60);

    // Жалға алушы
    doc.text('Жалға алушы / Lessee:', 320, signatureY);
    doc.moveTo(320, signatureY + 40).lineTo(520, signatureY + 40).stroke();
    doc.text(order.user?.email || 'Клиент', 320, signatureY + 45, { width: 200 });
    doc.text('Қолы / Signature', 320, signatureY + 60);

    // Футер
    doc.fontSize(8).font('Helvetica').fillColor('gray');
    doc.text(
      'Бұл құжат электронды түрде жасалған және қолтаңбасыз жарамды',
      50,
      750,
      { align: 'center', width: 495 }
    );
    doc.text('This document is generated electronically and valid without signature', { align: 'center', width: 495 });

    return doc;
  }
}

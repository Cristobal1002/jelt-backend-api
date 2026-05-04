/**
 * Poblado demo para PostgreSQL (Sequelize).
 *
 * Uso:
 *   node scripts/seed-demo-data.js           # inserta datos (requiere usuario demo; lo crea si no existe)
 *   node scripts/seed-demo-data.js --reset   # borra datos previos del demo y vuelve a insertar
 *
 * Variables opcionales (.env):
 *   SEED_DEMO_EMAIL    (default: demo@jeltinventory.com)
 *   SEED_DEMO_PASSWORD (default: Demo123456)
 *   SEED_DEMO_NAME     (default: Usuario Demo)
 *
 * Requiere DB_* configurado y roles ya existentes (ADMIN), como al arrancar la API con sync.
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Op } from 'sequelize';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(repoRoot, '.env') });

import { sqz } from '../src/config/database.js';
import { initModels } from '../src/models/index.js';
import { Role } from '../src/models/role.model.js';
import { User } from '../src/models/user.model.js';
import { Category } from '../src/models/category.model.js';
import { Supplier } from '../src/models/supplier.model.js';
import { Stockroom } from '../src/models/stockroom.model.js';
import { Article } from '../src/models/article.model.js';
import { SalesHistory } from '../src/models/sales-history.model.js';
import { StockMovement } from '../src/models/stock-movement.model.js';
import { hashPassword } from '../src/utils/crypto.js';
import { STOCK_MOVEMENT_TYPES } from '../src/constants/stock-movement-types.js';

const RESET = process.argv.includes('--reset');

const SEED_EMAIL = process.env.SEED_DEMO_EMAIL || 'demo@jeltinventory.com';
const SEED_PASSWORD = process.env.SEED_DEMO_PASSWORD || 'Demo123456';
const SEED_NAME = process.env.SEED_DEMO_NAME || 'Usuario Demo';

/** NITs solo del seed; se borran en --reset antes de recrear */
const DEMO_SUPPLIER_NITS = [
  '901-DEMO-0001',
  '901-DEMO-0002',
  '901-DEMO-0003',
  '901-DEMO-0004',
  '901-DEMO-0005',
];

function atDay(year, monthIndex, day, hour = 12, minute = 0) {
  return new Date(year, monthIndex, day, hour, minute, 0, 0);
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

async function clearDemoForUser(userId) {
  await StockMovement.destroy({ where: { id_user: userId } });
  await SalesHistory.destroy({ where: { id_user: userId } });
  await Article.destroy({ where: { id_user: userId } });
  await Category.destroy({ where: { id_user: userId } });
  await Stockroom.destroy({ where: { id_user: userId } });
  await Supplier.destroy({ where: { nit: { [Op.in]: DEMO_SUPPLIER_NITS } } });
}

async function main() {
  if (process.env.DB_ENABLED === 'false') {
    console.error('DB_ENABLED=false; habilita la base de datos para ejecutar el seed.');
    process.exit(1);
  }

  await sqz.authenticate();
  initModels(sqz);

  const adminRole = await Role.findOne({ where: { name: 'ADMIN' } });
  if (!adminRole) {
    console.error('No existe rol ADMIN. Arranca la API una vez con DB_SYNC_MODE=alter o crea roles antes.');
    process.exit(1);
  }

  let user = await User.findOne({ where: { email: SEED_EMAIL } });
  if (!user) {
    user = await User.create({
      name: SEED_NAME,
      email: SEED_EMAIL,
      password: await hashPassword(SEED_PASSWORD),
      id_rol: adminRole.id,
      phone: '+57 300 1234567',
      address: 'Bogotá, Colombia',
    });
    console.log(`Usuario demo creado: ${SEED_EMAIL} / ${SEED_PASSWORD}`);
  } else {
    console.log(`Usuario demo existente: ${SEED_EMAIL}`);
  }

  const userId = user.id;

  if (RESET) {
    console.log('Eliminando datos demo anteriores del usuario y proveedores DEMO…');
    await clearDemoForUser(userId);
  } else {
    const existing = await Article.count({ where: { id_user: userId } });
    if (existing > 0) {
      console.warn(
        'Ya hay artículos para este usuario. Usa --reset para limpiar y volver a poblar, o otro SEED_DEMO_EMAIL.'
      );
      process.exit(0);
    }
  }

  const transaction = await sqz.transaction();

  try {
    const categories = await Category.bulkCreate(
      [
        { id_user: userId, name: 'EPP / Bioseguridad', description: 'Tapabocas, guantes, gorros' },
        { id_user: userId, name: 'Inyectables', description: 'Medicamentos inyectables' },
        { id_user: userId, name: 'Dental', description: 'Consumibles odontológicos' },
        { id_user: userId, name: 'Dermatología', description: 'Tópicos y apósitos' },
        { id_user: userId, name: 'Ortopedia', description: 'Férulas, vendajes' },
      ],
      { transaction, returning: true }
    );

    const suppliers = await Supplier.bulkCreate(
      DEMO_SUPPLIER_NITS.map((nit, i) => ({
        name: `Proveedor demo ${i + 1}`,
        nit,
        address: `Calle Demo ${i + 1}, Bogotá`,
        phone: `+57 601 ${5550000 + i}`,
      })),
      { transaction, returning: true }
    );

    const stockrooms = await Stockroom.bulkCreate(
      [
        {
          id_user: userId,
          name: 'Bodega Central',
          address: 'Carrera 7 #71-21, Bogotá',
        },
        {
          id_user: userId,
          name: 'Sucursal Norte',
          address: 'Calle 127 #45-30, Bogotá',
        },
        {
          id_user: userId,
          name: 'Sucursal Occidente',
          address: 'Av. Ciudad de Cali #12-34, Bogotá',
        },
      ],
      { transaction, returning: true }
    );

    const articleDefs = [
      { sku: 'JELT-DEMO-001', name: 'Tapabocas N95 caja x50', cat: 0, sup: 0, room: 0, price: 89000, cost: 52000, stock: 240, reorder: 80, lead: 5 },
      { sku: 'JELT-DEMO-002', name: 'Guantes nitrilo M caja x100', cat: 0, sup: 0, room: 0, price: 42000, cost: 24000, stock: 180, reorder: 100, lead: 4 },
      { sku: 'JELT-DEMO-003', name: 'Gorro quirúrgico paquete x20', cat: 0, sup: 1, room: 1, price: 18000, cost: 9000, stock: 95, reorder: 120, lead: 7 },
      { sku: 'JELT-DEMO-004', name: 'Jeringa 5ml estéril x100', cat: 1, sup: 1, room: 0, price: 125000, cost: 78000, stock: 45, reorder: 60, lead: 10 },
      { sku: 'JELT-DEMO-005', name: 'Suero fisiológico 500ml', cat: 1, sup: 2, room: 0, price: 8500, cost: 4800, stock: 320, reorder: 150, lead: 14 },
      { sku: 'JELT-DEMO-006', name: 'Dexametasona ampolla', cat: 1, sup: 2, room: 2, price: 12000, cost: 6500, stock: 22, reorder: 40, lead: 8 },
      { sku: 'JELT-DEMO-007', name: 'Anestésico local carpule', cat: 3, sup: 3, room: 1, price: 95000, cost: 58000, stock: 200, reorder: 80, lead: 6 },
      { sku: 'JELT-DEMO-008', name: 'Composite dental A2', cat: 3, sup: 3, room: 1, price: 210000, cost: 135000, stock: 38, reorder: 25, lead: 12 },
      { sku: 'JELT-DEMO-009', name: 'Gasas estériles 10x10', cat: 3, sup: 0, room: 2, price: 28000, cost: 15000, stock: 400, reorder: 200, lead: 5 },
      { sku: 'JELT-DEMO-010', name: 'Apósito hidrocoloide', cat: 4, sup: 4, room: 2, price: 45000, cost: 28000, stock: 8, reorder: 30, lead: 9 },
      { sku: 'JELT-DEMO-011', name: 'Crema antibiótica tópica', cat: 4, sup: 4, room: 1, price: 36000, cost: 21000, stock: 55, reorder: 40, lead: 7 },
      { sku: 'JELT-DEMO-012', name: 'Venda elástica 10cm', cat: 4, sup: 0, room: 0, price: 15000, cost: 8000, stock: 150, reorder: 60, lead: 4 },
      { sku: 'JELT-DEMO-013', name: 'Collarín cervical talla M', cat: 4, sup: 1, room: 2, price: 78000, cost: 45000, stock: 15, reorder: 20, lead: 15 },
      { sku: 'JELT-DEMO-014', name: 'Agujas hipodérmicas 21G', cat: 1, sup: 2, room: 0, price: 55000, cost: 32000, stock: 90, reorder: 70, lead: 6 },
      { sku: 'JELT-DEMO-015', name: 'Alcohol antiséptico 1L', cat: 0, sup: 1, room: 1, price: 22000, cost: 12000, stock: 110, reorder: 50, lead: 5 },
      { sku: 'JELT-DEMO-016', name: 'Kit sutura absorbible', cat: 3, sup: 3, room: 0, price: 185000, cost: 110000, stock: 28, reorder: 35, lead: 11 },
      { sku: 'JELT-DEMO-017', name: 'Protector solar FPS50', cat: 4, sup: 4, room: 1, price: 62000, cost: 38000, stock: 72, reorder: 45, lead: 8 },
      { sku: 'JELT-DEMO-018', name: 'Bandas elásticas rehabilitación', cat: 4, sup: 1, room: 2, price: 48000, cost: 26000, stock: 5, reorder: 25, lead: 10 },
    ];

    const articles = await Article.bulkCreate(
      articleDefs.map((a) => ({
        id_user: userId,
        sku: a.sku,
        name: a.name,
        id_category: categories[a.cat].id,
        id_supplier: suppliers[a.sup].id,
        id_stockroom: stockrooms[a.room].id,
        reorder_point: a.reorder,
        lead_time: a.lead,
        description: `Artículo de demostración — ${a.name}`,
        unit_price: a.price,
        unit_cost: a.cost,
        stock: a.stock,
        demand_daily_avg: Number((a.stock / 300).toFixed(4)),
        demand_daily_std: Number((a.stock / 1200).toFixed(4)),
        service_level: 0.95,
        safety_stock: Math.max(5, Math.floor(a.reorder * 0.3)),
      })),
      { transaction, returning: true }
    );

    const startChart = atDay(2025, 0, 6);
    const endChart = new Date();
    const salesRows = [];

    for (let d = new Date(startChart); d <= endChart; d = addDays(d, 1 + (randInt(0, 2) % 2))) {
      const nSales = randInt(1, 4);
      for (let i = 0; i < nSales; i++) {
        const art = articles[randInt(0, articles.length - 1)];
        const room = stockrooms[randInt(0, stockrooms.length - 1)];
        const qty = randInt(1, 12);
        const hour = randInt(9, 18);
        const minute = randInt(0, 59);
        const soldAt = new Date(d);
        soldAt.setHours(hour, minute, 0, 0);

        salesRows.push({
          id_user: userId,
          id_article: art.id,
          id_stockroom: room.id,
          quantity: qty,
          unit_price: art.unit_price,
          sold_at: soldAt,
          metadata: { channel: 'demo', doc: `VTA-DEMO-${soldAt.getTime()}` },
        });
      }
    }

    await SalesHistory.bulkCreate(salesRows, { transaction });

    const movementRows = [];
    let dayCursor = new Date(startChart);

    while (dayCursor <= endChart) {
      if (dayCursor.getDate() <= 3 || dayCursor.getDay() === 1) {
        const art = articles[randInt(0, articles.length - 1)];
        movementRows.push({
          id_user: userId,
          id_article: art.id,
          id_stockroom: art.id_stockroom,
          type: STOCK_MOVEMENT_TYPES.IN,
          quantity: randInt(20, 120),
          moved_at: new Date(dayCursor.getFullYear(), dayCursor.getMonth(), dayCursor.getDate(), 8, randInt(0, 45)),
          reference: `OC-DEMO-${dayCursor.toISOString().slice(0, 10)}`,
        });
      }

      if (randInt(1, 100) <= 55) {
        const art = articles[randInt(0, articles.length - 1)];
        movementRows.push({
          id_user: userId,
          id_article: art.id,
          id_stockroom: stockrooms[randInt(0, stockrooms.length - 1)].id,
          type: STOCK_MOVEMENT_TYPES.OUT,
          quantity: randInt(1, 25),
          moved_at: new Date(dayCursor.getFullYear(), dayCursor.getMonth(), dayCursor.getDate(), 14, randInt(0, 59)),
          reference: `SAL-BOD-DEMO-${dayCursor.getTime()}`,
        });
      }

      if (randInt(1, 100) <= 8) {
        const art = articles[randInt(0, articles.length - 1)];
        movementRows.push({
          id_user: userId,
          id_article: art.id,
          id_stockroom: art.id_stockroom,
          type: STOCK_MOVEMENT_TYPES.ADJUSTMENT,
          quantity: randInt(1, 5),
          moved_at: new Date(dayCursor.getFullYear(), dayCursor.getMonth(), dayCursor.getDate(), 17, 0),
          reference: `AJU-INV-${dayCursor.toISOString().slice(0, 10)}`,
        });
      }

      dayCursor = addDays(dayCursor, 1);
    }

    await StockMovement.bulkCreate(movementRows, { transaction });

    await transaction.commit();

    console.log('Seed demo completado.');
    console.log(`  Categorías: ${categories.length}`);
    console.log(`  Proveedores: ${suppliers.length}`);
    console.log(`  Bodegas: ${stockrooms.length}`);
    console.log(`  Artículos: ${articles.length}`);
    console.log(`  Ventas (historial): ${salesRows.length}`);
    console.log(`  Movimientos: ${movementRows.length}`);
    console.log(`  Login: ${SEED_EMAIL} / ${SEED_PASSWORD}`);
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    process.exit(1);
  } finally {
    await sqz.close();
  }
}

main();

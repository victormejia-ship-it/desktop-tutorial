import { db, migrate } from './connection.js';

// Grupos del Sistema Mexicano de Alimentos Equivalentes (SMAE) y sus
// valores nutrimentales estándar POR EQUIVALENTE (promedio de grupo).
// Fuente: valores de referencia de uso común en la enseñanza de dietética
// en México (Pérez-Lizaur et al., "Sistema Mexicano de Alimentos
// Equivalentes"). Verificar/ajustar contra la edición vigente del manual
// antes de usarlos en un caso clínico real.
const GROUPS = [
  { key: 'verduras', name: 'Verduras', kcal: 25, protein_g: 2, carbs_g: 4, lipids_g: 0 },
  { key: 'frutas', name: 'Frutas', kcal: 60, protein_g: 0, carbs_g: 15, lipids_g: 0 },
  { key: 'cereales_sin_grasa', name: 'Cereales y tubérculos sin grasa', kcal: 70, protein_g: 2, carbs_g: 15, lipids_g: 0 },
  { key: 'cereales_con_grasa', name: 'Cereales y tubérculos con grasa', kcal: 115, protein_g: 2, carbs_g: 15, lipids_g: 5 },
  { key: 'leguminosas', name: 'Leguminosas', kcal: 120, protein_g: 8, carbs_g: 20, lipids_g: 1 },
  { key: 'aoa_muy_bajo', name: 'AOA muy bajo aporte de grasa', kcal: 40, protein_g: 7, carbs_g: 0, lipids_g: 1 },
  { key: 'aoa_bajo', name: 'AOA bajo aporte de grasa', kcal: 55, protein_g: 7, carbs_g: 0, lipids_g: 3 },
  { key: 'aoa_moderado', name: 'AOA moderado aporte de grasa', kcal: 75, protein_g: 7, carbs_g: 0, lipids_g: 5 },
  { key: 'aoa_alto', name: 'AOA alto aporte de grasa', kcal: 100, protein_g: 7, carbs_g: 0, lipids_g: 8 },
  { key: 'leche_descremada', name: 'Leche descremada', kcal: 95, protein_g: 9, carbs_g: 12, lipids_g: 2 },
  { key: 'leche_semidescremada', name: 'Leche semidescremada', kcal: 110, protein_g: 9, carbs_g: 12, lipids_g: 4 },
  { key: 'leche_entera', name: 'Leche entera', kcal: 150, protein_g: 9, carbs_g: 12, lipids_g: 8 },
  { key: 'leche_azucar', name: 'Leche con azúcar', kcal: 200, protein_g: 9, carbs_g: 29, lipids_g: 5 },
  { key: 'aceites_sin_proteina', name: 'Aceites y grasas sin proteína', kcal: 45, protein_g: 0, carbs_g: 0, lipids_g: 5 },
  { key: 'aceites_con_proteina', name: 'Aceites y grasas con proteína', kcal: 70, protein_g: 3, carbs_g: 0, lipids_g: 5 },
  { key: 'azucares_sin_grasa', name: 'Azúcares sin grasa', kcal: 40, protein_g: 0, carbs_g: 10, lipids_g: 0 },
  { key: 'azucares_con_grasa', name: 'Azúcares con grasa', kcal: 85, protein_g: 0, carbs_g: 10, lipids_g: 5 },
  { key: 'libres', name: 'Alimentos libres de energía', kcal: 5, protein_g: 0, carbs_g: 1, lipids_g: 0 },
];

// Alimentos representativos por grupo. kcal/proteína/HC/lípidos heredan el
// valor del grupo (1 equivalente); portion_grams es la medida casera aproximada.
const FOODS = {
  verduras: [
    ['Acelga cruda picada', '1 taza', 85],
    ['Alcachofa cocida', '1/2 pieza mediana', 120],
    ['Apio picado', '1 taza', 120],
    ['Berenjena cocida', '1/2 taza', 90],
    ['Berros', '1 taza', 34],
    ['Betabel cocido', '1/2 taza', 85],
    ['Brócoli cocido', '1/2 taza', 78],
    ['Calabacita cocida', '1/2 taza', 90],
    ['Calabaza de Castilla cocida', '1/2 taza', 100],
    ['Cebolla picada', '1/2 taza', 80],
    ['Champiñones cocidos', '1/2 taza', 78],
    ['Chayote cocido', '1/2 taza', 80],
    ['Chícharos cocidos', '1/2 taza', 80],
    ['Chile poblano asado', '1 pieza', 100],
    ['Col picada', '1 taza', 90],
    ['Col de Bruselas cocida', '1/2 taza', 78],
    ['Coliflor cocida', '1/2 taza', 62],
    ['Ejotes cocidos', '1/2 taza', 63],
    ['Espárragos cocidos', '6 piezas', 90],
    ['Espinaca cruda', '1 taza', 85],
    ['Flor de calabaza cocida', '1 taza', 90],
    ['Huauzontle cocido', '1 taza', 90],
    ['Jícama picada', '1 taza', 120],
    ['Jitomate', '1 pieza mediana', 120],
    ['Lechuga', '1 taza', 56],
    ['Nopales cocidos', '1 taza', 145],
    ['Palmito', '1/2 taza', 80],
    ['Pepino rebanado', '1 taza', 120],
    ['Pimiento morrón', '1 pieza', 100],
    ['Quelites cocidos', '1 taza', 85],
    ['Rábano rebanado', '1 taza', 100],
    ['Setas cocidas', '1/2 taza', 78],
    ['Tomate verde', '1 taza', 120],
    ['Verdolagas cocidas', '1 taza', 90],
    ['Zanahoria cocida', '1/2 taza', 78],
  ],
  frutas: [
    ['Chabacano', '4 piezas', 120],
    ['Chicozapote', '1/2 pieza', 90],
    ['Ciruela', '3 piezas', 100],
    ['Dátil', '3 piezas', 25],
    ['Durazno', '1 pieza mediana', 100],
    ['Fresas', '1 taza', 145],
    ['Granada roja', '1/2 pieza', 100],
    ['Guayaba', '3 piezas', 110],
    ['Higo', '2 piezas', 80],
    ['Kiwi', '1 pieza', 90],
    ['Mamey', '1/3 pieza', 80],
    ['Mandarina', '2 piezas', 120],
    ['Mango', '1/2 pieza mediana', 85],
    ['Manzana', '1 pieza chica', 100],
    ['Maracuyá', '2 piezas', 120],
    ['Melón picado', '1 taza', 160],
    ['Mora azul', '3/4 taza', 100],
    ['Naranja', '1 pieza mediana', 130],
    ['Papaya picada', '1 taza', 140],
    ['Pera', '1 pieza chica', 100],
    ['Perón', '1 pieza chica', 100],
    ['Piña picada', '3/4 taza', 115],
    ['Plátano', '1/2 pieza', 75],
    ['Plátano dominico', '2 piezas', 80],
    ['Sandía picada', '1 taza', 150],
    ['Tejocote', '5 piezas', 100],
    ['Toronja', '1/2 pieza', 165],
    ['Tuna', '2 piezas', 130],
    ['Uvas', '15 piezas', 75],
    ['Zapote negro', '1/2 pieza', 90],
  ],
  cereales_sin_grasa: [
    ['Amaranto reventado', '3 cucharadas', 20],
    ['Arroz cocido', '1/3 taza', 70],
    ['Avena cruda', '3 cucharadas', 25],
    ['Barra de amaranto', '1 pieza chica', 20],
    ['Bolillo sin migajón', '1/2 pieza', 20],
    ['Camote cocido', '1/2 pieza chica', 65],
    ['Cereal de caja sin azúcar', '1/2 taza', 20],
    ['Cuscús cocido', '1/2 taza', 75],
    ['Elote', '1/2 pieza', 85],
    ['Galletas María', '5 piezas', 26],
    ['Harina de maíz para tortilla', '3 cucharadas', 30],
    ['Hojuelas de maíz sin azúcar', '1/2 taza', 20],
    ['Pan árabe (pita)', '1/2 pieza', 25],
    ['Pan de caja blanco', '1 rebanada', 25],
    ['Pan de caja integral', '1 rebanada', 25],
    ['Papa cocida', '1/2 pieza mediana', 90],
    ['Pasta cocida', '1/2 taza', 75],
    ['Plátano macho cocido', '1/3 pieza', 70],
    ['Quinoa cocida', '1/2 taza', 90],
    ['Salvado de trigo', '1/4 taza', 15],
    ['Sopa de pasta cocida', '1/2 taza', 75],
    ['Tapioca cocida', '1/2 taza', 75],
    ['Tortilla de harina chica', '1 pieza', 30],
    ['Tortilla de maíz', '1 pieza', 30],
    ['Tostada horneada', '1 pieza', 20],
  ],
  cereales_con_grasa: [
    ['Churro', '1 pieza chica', 25],
    ['Croissant chico', '1/2 pieza', 20],
    ['Dona chica', '1/2 pieza', 25],
    ['Empanada de horno', '1/2 pieza', 30],
    ['Galletas saladas tipo sándwich', '4 piezas', 28],
    ['Gansito o pastelito', '1/2 pieza', 25],
    ['Hot cake', '1 pieza', 30],
    ['Palomitas naturales con aceite', '3 tazas', 25],
    ['Pan de dulce chico', '1 pieza', 35],
    ['Pan tipo bollo para hamburguesa', '1/2 pieza', 30],
    ['Papas fritas (chips)', '8 piezas', 15],
    ['Tamal sin relleno', '1/2 pieza', 40],
    ['Tostada frita', '1 pieza', 30],
    ['Waffle', '1/2 pieza', 30],
  ],
  leguminosas: [
    ['Alubias cocidas', '1/2 taza', 89],
    ['Chícharo seco cocido', '1/2 taza', 85],
    ['Edamame cocido', '1/2 taza', 85],
    ['Frijol bayo cocido', '1/2 taza', 86],
    ['Frijol negro cocido', '1/2 taza', 86],
    ['Garbanzo cocido', '1/2 taza', 82],
    ['Habas cocidas', '1/2 taza', 85],
    ['Lenteja cocida', '1/2 taza', 99],
    ['Soya texturizada cocida', '1/2 taza', 90],
  ],
  aoa_muy_bajo: [
    ['Atún en agua', '1/3 taza', 43],
    ['Bacalao cocido', '40 g', 40],
    ['Callo de hacha', '40 g', 40],
    ['Camarón cocido', '5 piezas medianas', 40],
    ['Claras de huevo', '3 piezas', 99],
    ['Merluza cocida', '40 g', 40],
    ['Pechuga de pavo', '40 g', 40],
    ['Pulpo cocido', '40 g', 40],
    ['Queso panela', '40 g', 40],
    ['Requesón', '1/4 taza', 55],
    ['Surimi', '40 g', 40],
  ],
  aoa_bajo: [
    ['Atún en aceite (escurrido)', '1/3 taza', 43],
    ['Conejo cocido', '40 g', 40],
    ['Jamón de pavo', '2 rebanadas', 40],
    ['Jamón de pierna', '2 rebanadas', 40],
    ['Pechuga de pollo sin piel', '40 g', 40],
    ['Pescado blanco', '40 g', 40],
    ['Pollo (muslo sin piel)', '40 g', 40],
    ['Queso cottage', '1/4 taza', 55],
    ['Res (falda magra)', '40 g', 40],
    ['Salmón', '40 g', 40],
    ['Sardina en agua', '40 g', 40],
  ],
  aoa_moderado: [
    ['Bistec de res', '40 g', 40],
    ['Carne molida de res', '40 g', 40],
    ['Chorizo de pavo', '30 g', 30],
    ['Huevo entero', '1 pieza', 50],
    ['Jamón serrano', '40 g', 40],
    ['Lomo de cerdo', '40 g', 40],
    ['Milanesa de res (sin empanizar)', '40 g', 40],
    ['Pollo con piel', '40 g', 40],
    ['Queso amarillo', '30 g', 30],
    ['Queso asadero', '30 g', 30],
    ['Queso Oaxaca', '30 g', 30],
    ['Salchicha de pavo', '2 piezas', 50],
  ],
  aoa_alto: [
    ['Carnitas', '40 g', 40],
    ['Chicharrón', '15 g', 15],
    ['Chorizo', '30 g', 30],
    ['Costilla de cerdo', '40 g', 40],
    ['Costilla de res', '40 g', 40],
    ['Longaniza', '30 g', 30],
    ['Queso gouda', '30 g', 30],
    ['Queso manchego', '30 g', 30],
    ['Salami', '40 g', 40],
    ['Salchicha', '2 piezas', 50],
    ['Tocino', '2 rebanadas', 20],
  ],
  leche_descremada: [
    ['Leche descremada', '1 taza (240 ml)', 240],
    ['Leche deslactosada descremada', '1 taza', 240],
    ['Leche en polvo descremada (reconstituida)', '1 taza', 240],
    ['Yogurt griego descremado sin azúcar', '1 taza', 240],
    ['Yogurt natural descremado', '1 taza', 240],
  ],
  leche_semidescremada: [
    ['Leche de soya sin azúcar', '1 taza', 240],
    ['Leche light (2%)', '1 taza', 240],
    ['Leche semidescremada', '1 taza (240 ml)', 240],
    ['Yogurt bebible semidescremado sin azúcar', '1 taza', 240],
    ['Yogurt natural semidescremado', '1 taza', 240],
  ],
  leche_entera: [
    ['Leche de cabra', '1 taza', 240],
    ['Leche entera', '1 taza (240 ml)', 240],
    ['Leche evaporada diluida', '1 taza', 240],
    ['Yogurt griego entero sin azúcar', '1 taza', 240],
    ['Yogurt natural entero', '1 taza', 240],
  ],
  leche_azucar: [
    ['Atole de leche', '1 taza', 240],
    ['Leche saborizada azucarada', '1 taza (240 ml)', 240],
    ['Yogurt bebible azucarado', '1 taza', 240],
    ['Yogurt con fruta azucarado', '1 taza', 240],
  ],
  aceites_sin_proteina: [
    ['Aceite de coco', '1 cucharadita', 5],
    ['Aceite de oliva', '1 cucharadita', 5],
    ['Aceite vegetal (canola/maíz)', '1 cucharadita', 5],
    ['Aderezo ranch', '1 cucharada', 15],
    ['Aguacate', '1/8 pieza', 30],
    ['Crema', '1 cucharada', 15],
    ['Crema para batir', '1 cucharada', 15],
    ['Guacamole', '2 cucharadas', 30],
    ['Manteca vegetal', '1 cucharadita', 5],
    ['Mantequilla', '1 cucharadita', 5],
    ['Margarina', '1 cucharadita', 5],
    ['Mayonesa', '1 cucharadita', 5],
    ['Vinagreta', '1 cucharada', 15],
  ],
  aceites_con_proteina: [
    ['Ajonjolí', '1 cucharada', 9],
    ['Almendras', '6 piezas', 8],
    ['Avellanas', '6 piezas', 8],
    ['Cacahuates', '1 cucharada', 9],
    ['Crema de cacahuate', '1 cucharadita', 8],
    ['Nueces', '4 mitades', 8],
    ['Nuez de la india', '6 piezas', 9],
    ['Pistaches', '15 piezas', 8],
    ['Piñones', '1 cucharada', 9],
    ['Semillas de calabaza (pepitas)', '1 cucharada', 9],
    ['Semillas de girasol', '1 cucharada', 9],
  ],
  azucares_sin_grasa: [
    ['Ate de frutas', '1 cucharada', 20],
    ['Azúcar de mesa', '2 cucharaditas', 10],
    ['Azúcar morena', '2 cucharaditas', 10],
    ['Chicles con azúcar', '3 piezas', 8],
    ['Gomitas', '5 piezas', 15],
    ['Jarabe de maple', '2 cucharaditas', 15],
    ['Mermelada', '1 cucharada', 15],
    ['Miel de abeja', '2 cucharaditas', 14],
    ['Piloncillo', '1 pieza chica', 15],
  ],
  azucares_con_grasa: [
    ['Barra de chocolate pequeña', '1/2 barra', 15],
    ['Buñuelo con miel', '1/2 pieza', 20],
    ['Cajeta', '1 cucharada', 20],
    ['Chocolate de mesa', '1/2 tablilla', 15],
    ['Chocolate en polvo con leche', '2 cucharadas', 15],
    ['Crema de avellana con cacao', '1 cucharada', 20],
    ['Flan', '1/2 rebanada', 40],
    ['Helado de crema', '1/2 taza', 65],
  ],
  libres: [
    ['Agua mineral', '1 taza', 240],
    ['Agua de jamaica sin azúcar', '1 taza', 240],
    ['Café negro', '1 taza', 240],
    ['Canela', 'al gusto', null],
    ['Cátsup', '1 cucharada', 15],
    ['Chicles sin azúcar', '3 piezas', 8],
    ['Consomé de pollo desgrasado', '1 taza', 240],
    ['Consomé de res desgrasado', '1 taza', 240],
    ['Edulcorante artificial', '1 sobre', 1],
    ['Especias', 'al gusto', null],
    ['Gelatina light', '1 taza', 120],
    ['Mostaza', '1 cucharada', 15],
    ['Refresco light', '1 taza', 240],
    ['Salsa inglesa', '1 cucharadita', 5],
    ['Salsa picante', '1 cucharadita', 5],
    ['Té', '1 taza', 240],
    ['Vinagre', 'al gusto', null],
  ],
};

function seed() {
  migrate();

  const insertGroup = db.prepare(`
    INSERT INTO food_groups (key, name, sort_order, kcal, protein_g, carbs_g, lipids_g)
    VALUES (@key, @name, @sort_order, @kcal, @protein_g, @carbs_g, @lipids_g)
    ON CONFLICT(key) DO UPDATE SET
      name = excluded.name,
      sort_order = excluded.sort_order,
      kcal = excluded.kcal,
      protein_g = excluded.protein_g,
      carbs_g = excluded.carbs_g,
      lipids_g = excluded.lipids_g
  `);

  const insertFood = db.prepare(`
    INSERT INTO foods (group_id, name, portion_description, portion_grams, kcal, protein_g, carbs_g, lipids_g)
    VALUES (@group_id, @name, @portion_description, @portion_grams, @kcal, @protein_g, @carbs_g, @lipids_g)
  `);

  const clearFoods = db.prepare(`DELETE FROM foods WHERE group_id = ?`);
  const getGroupId = db.prepare(`SELECT id FROM food_groups WHERE key = ?`);

  const run = db.transaction(() => {
    GROUPS.forEach((g, index) => {
      insertGroup.run({ ...g, sort_order: index });
    });

    for (const [groupKey, items] of Object.entries(FOODS)) {
      const group = getGroupId.get(groupKey);
      if (!group) throw new Error(`Grupo desconocido en FOODS: ${groupKey}`);
      const groupDef = GROUPS.find((g) => g.key === groupKey);

      clearFoods.run(group.id);
      for (const [name, portion_description, portion_grams] of items) {
        insertFood.run({
          group_id: group.id,
          name,
          portion_description,
          portion_grams,
          kcal: groupDef.kcal,
          protein_g: groupDef.protein_g,
          carbs_g: groupDef.carbs_g,
          lipids_g: groupDef.lipids_g,
        });
      }
    }
  });

  run();

  const totalFoods = db.prepare('SELECT COUNT(*) AS c FROM foods').get().c;
  const totalGroups = db.prepare('SELECT COUNT(*) AS c FROM food_groups').get().c;
  console.log(`Seed completo: ${totalGroups} grupos, ${totalFoods} alimentos.`);
}

seed();

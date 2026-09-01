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
    ['Brócoli cocido', '1/2 taza', 78],
    ['Calabacita cocida', '1/2 taza', 90],
    ['Champiñones cocidos', '1/2 taza', 78],
    ['Chayote cocido', '1/2 taza', 80],
    ['Ejotes cocidos', '1/2 taza', 63],
    ['Espinaca cruda', '1 taza', 85],
    ['Jitomate', '1 pieza mediana', 120],
    ['Lechuga', '1 taza', 56],
    ['Nopales cocidos', '1 taza', 145],
    ['Pepino rebanado', '1 taza', 120],
    ['Zanahoria cocida', '1/2 taza', 78],
    ['Coliflor cocida', '1/2 taza', 62],
    ['Betabel cocido', '1/2 taza', 85],
  ],
  frutas: [
    ['Manzana', '1 pieza chica', 100],
    ['Plátano', '1/2 pieza', 75],
    ['Papaya picada', '1 taza', 140],
    ['Piña picada', '3/4 taza', 115],
    ['Mango', '1/2 pieza mediana', 85],
    ['Melón picado', '1 taza', 160],
    ['Naranja', '1 pieza mediana', 130],
    ['Fresas', '1 taza', 145],
    ['Sandía picada', '1 taza', 150],
    ['Uvas', '15 piezas', 75],
    ['Guayaba', '3 piezas', 110],
    ['Pera', '1 pieza chica', 100],
  ],
  cereales_sin_grasa: [
    ['Tortilla de maíz', '1 pieza', 30],
    ['Bolillo sin migajón', '1/2 pieza', 20],
    ['Arroz cocido', '1/3 taza', 70],
    ['Pasta cocida', '1/2 taza', 75],
    ['Avena cruda', '3 cucharadas', 25],
    ['Elote', '1/2 pieza', 85],
    ['Papa cocida', '1/2 pieza mediana', 90],
    ['Pan de caja blanco', '1 rebanada', 25],
    ['Galletas María', '5 piezas', 26],
    ['Camote cocido', '1/2 pieza chica', 65],
  ],
  cereales_con_grasa: [
    ['Tostada frita', '1 pieza', 30],
    ['Pan de dulce chico', '1 pieza', 35],
    ['Galletas saladas tipo sándwich', '4 piezas', 28],
    ['Palomitas naturales con aceite', '3 tazas', 25],
    ['Pan tipo bollo para hamburguesa', '1/2 pieza', 30],
  ],
  leguminosas: [
    ['Frijol cocido', '1/2 taza', 86],
    ['Lenteja cocida', '1/2 taza', 99],
    ['Garbanzo cocido', '1/2 taza', 82],
    ['Habas cocidas', '1/2 taza', 85],
    ['Alubias cocidas', '1/2 taza', 89],
  ],
  aoa_muy_bajo: [
    ['Claras de huevo', '3 piezas', 99],
    ['Atún en agua', '1/3 taza', 43],
    ['Queso panela', '40 g', 40],
    ['Pechuga de pavo', '40 g', 40],
    ['Requesón', '1/4 taza', 55],
  ],
  aoa_bajo: [
    ['Pechuga de pollo sin piel', '40 g', 40],
    ['Pescado blanco', '40 g', 40],
    ['Queso cottage', '1/4 taza', 55],
    ['Jamón de pavo', '2 rebanadas', 40],
  ],
  aoa_moderado: [
    ['Huevo entero', '1 pieza', 50],
    ['Carne molida de res', '40 g', 40],
    ['Queso Oaxaca', '30 g', 30],
    ['Pollo con piel', '40 g', 40],
  ],
  aoa_alto: [
    ['Chorizo', '30 g', 30],
    ['Salchicha', '2 piezas', 50],
    ['Costilla de cerdo', '40 g', 40],
    ['Queso manchego', '30 g', 30],
  ],
  leche_descremada: [
    ['Leche descremada', '1 taza (240 ml)', 240],
    ['Yogurt natural descremado', '1 taza', 240],
  ],
  leche_semidescremada: [
    ['Leche semidescremada', '1 taza (240 ml)', 240],
    ['Yogurt natural semidescremado', '1 taza', 240],
  ],
  leche_entera: [
    ['Leche entera', '1 taza (240 ml)', 240],
    ['Yogurt natural entero', '1 taza', 240],
  ],
  leche_azucar: [
    ['Leche saborizada azucarada', '1 taza (240 ml)', 240],
    ['Yogurt con fruta azucarado', '1 taza', 240],
  ],
  aceites_sin_proteina: [
    ['Aceite vegetal (oliva/canola)', '1 cucharadita', 5],
    ['Mayonesa', '1 cucharadita', 5],
    ['Aguacate', '1/8 pieza', 30],
    ['Mantequilla', '1 cucharadita', 5],
    ['Crema', '1 cucharada', 15],
  ],
  aceites_con_proteina: [
    ['Cacahuates', '1 cucharada', 9],
    ['Almendras', '6 piezas', 8],
    ['Nueces', '4 mitades', 8],
    ['Semillas de girasol', '1 cucharada', 9],
  ],
  azucares_sin_grasa: [
    ['Azúcar de mesa', '2 cucharaditas', 10],
    ['Miel de abeja', '2 cucharaditas', 14],
    ['Mermelada', '1 cucharada', 15],
  ],
  azucares_con_grasa: [
    ['Chocolate de mesa', '1/2 tablilla', 15],
    ['Cajeta', '1 cucharada', 20],
    ['Crema de avellana con cacao', '1 cucharada', 20],
  ],
  libres: [
    ['Café negro', '1 taza', 240],
    ['Té', '1 taza', 240],
    ['Consomé de pollo desgrasado', '1 taza', 240],
    ['Vinagre', 'al gusto', null],
    ['Especias', 'al gusto', null],
    ['Refresco light', '1 taza', 240],
    ['Gelatina light', '1 taza', 120],
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

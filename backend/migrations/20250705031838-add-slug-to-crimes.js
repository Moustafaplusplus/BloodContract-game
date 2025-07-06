// ── backend/migrations/20250705031838-add-slug-to-crimes.js
import { QueryTypes } from 'sequelize';

export async function up(queryInterface, Sequelize) {
  // Check if the column already exists (safe re‑run)
  const table = await queryInterface.describeTable('crimes');
  if (!table.slug) {
    await queryInterface.addColumn('crimes', 'slug', {
      type: Sequelize.STRING,
      allowNull: true, // temp nullable
    });
  }

  // Populate slugs only for rows missing one
  const crimes = await queryInterface.sequelize.query(
    'SELECT id, name, slug FROM crimes',
    { type: QueryTypes.SELECT }
  );

  const seen = new Set(
    crimes.filter(c => c.slug).map(c => c.slug.toLowerCase())
  );

  const slugify = (str) =>
    (str || 'crime')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'crime';

  for (const crime of crimes) {
    if (crime.slug) continue; // already set

    let base = slugify(crime.name);
    let slug = base;
    let i = 1;
    while (seen.has(slug)) slug = `${base}-${i++}`;
    seen.add(slug);

    await queryInterface.sequelize.query(
      'UPDATE crimes SET slug = :slug WHERE id = :id',
      { replacements: { slug, id: crime.id } }
    );
  }

  // Enforce NOT NULL & UNIQUE if not already
  await queryInterface.changeColumn('crimes', 'slug', {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  });
}

export async function down(queryInterface) {
  // Only drop if it exists
  const table = await queryInterface.describeTable('crimes');
  if (table.slug) {
    await queryInterface.removeColumn('crimes', 'slug');
  }
}
// The original 1700000000_created_practice_logs.js migration used the pre-v0.23
// "schema" key, which this PocketBase version (0.39) doesn't recognize — it silently
// created practice_logs with only the auto "id" field, no other columns, open
// (unrestricted) API rules, and — unusually — a raw collection id equal to its own
// name ("practice_logs" for both). That id/name collision trips this version's
// "name must not match an existing collection id" self-check as soon as the collection
// is saved again, so it can't just be patched in place.
//
// Recreate it cleanly instead. The 117 rows that piled up under the broken schema are
// empty placeholders (id only, no other columns) — every create() call silently dropped
// every field PocketBase didn't recognize — so there's no real data being discarded.
migrate((app) => {
  const existing = app.findCollectionByNameOrId('practice_logs');
  if (existing) app.delete(existing);

  const users = app.findCollectionByNameOrId('users');

  const collection = new Collection({
    name: 'practice_logs',
    type: 'base',
  });

  collection.fields.add(
    new TextField({ name: 'exercise_id' }),
    new TextField({ name: 'exercise_title', required: true }),
    new NumberField({ name: 'bpm' }),
    new NumberField({ name: 'duration_seconds' }),
    new NumberField({ name: 'score' }),
    new TextField({ name: 'timestamp' }),
    new RelationField({
      name: 'user',
      collectionId: users.id,
      cascadeDelete: true,
      maxSelect: 1,
      required: true,
    })
  );

  collection.listRule = 'user = @request.auth.id';
  collection.viewRule = 'user = @request.auth.id';
  collection.createRule = "@request.auth.id != '' && user = @request.auth.id";
  collection.updateRule = 'user = @request.auth.id';
  collection.deleteRule = 'user = @request.auth.id';

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId('practice_logs');
  if (collection) return app.delete(collection);
});

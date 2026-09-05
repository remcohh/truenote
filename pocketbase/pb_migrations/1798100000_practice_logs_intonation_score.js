// Adds the intonation_score field to practice_logs: alongside the existing `score`
// (note accuracy — right note sounding, any tuning within the nearest-note range),
// this tracks what fraction of correctly-played notes also landed tightly in tune.
migrate((app) => {
  const collection = app.findCollectionByNameOrId('practice_logs');

  collection.fields.add(
    new NumberField({ name: 'intonation_score' })
  );

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId('practice_logs');
  collection.fields.removeByName('intonation_score');
  return app.save(collection);
});

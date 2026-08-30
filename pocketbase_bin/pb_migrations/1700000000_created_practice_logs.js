// PocketBase JavaScript Migration to create the practice_logs collection automatically

migrate((app) => {
  const collection = new Collection({
    "id": "practice_logs",
    "name": "practice_logs",
    "type": "base",
    "system": false,
    "schema": [
      {
        "name": "exercise_id",
        "type": "text"
      },
      {
        "name": "exercise_title",
        "type": "text",
        "required": true
      },
      {
        "name": "bpm",
        "type": "number"
      },
      {
        "name": "duration_seconds",
        "type": "number"
      },
      {
        "name": "score",
        "type": "number"
      },
      {
        "name": "timestamp",
        "type": "text"
      }
    ],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": ""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("practice_logs");
  if (collection) {
    return app.delete(collection);
  }
});

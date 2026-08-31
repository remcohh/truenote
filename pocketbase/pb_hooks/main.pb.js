// PocketBase Custom JavaScript Hooks
// Learn more at: https://pocketbase.io/docs/js-overview/

onBootstrap((e) => {
    e.next()
    console.log("⚡ PocketBase TrueNote App hooks loaded!")
})

// Example custom endpoint: GET /api/truenote/status
routerAdd("GET", "/api/truenote/status", (c) => {
    return c.json(200, {
        "status": "online",
        "app": "TrueNote Music Exercise App",
        "version": "1.0.0"
    })
})

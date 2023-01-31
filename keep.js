browser.menus.create({
    id: "keep",
    title: "Keep this",
    contexts: ["link"]
});

browser.menus.create({
    id: "show_links",
    title: "Show links",
    contexts: ['all']
})

browser.menus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'keep') {
        const { links } = await browser.storage.local.get()
        await browser.storage.local.set({links: [
            ...(links || []),
            {
                url: info.linkUrl,
                text: info.linkText || info.linkUrl,
            }
        ]})
    }

    if (info.menuItemId === "show_links") {
        browser.tabs.create({
            active: true,
            url: '/show.html',
        })
    }
});
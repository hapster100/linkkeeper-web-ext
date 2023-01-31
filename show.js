async function getLinks() {
    return (await browser.storage.local.get()).links || []
}

async function setLinks(links) {
    return await browser.storage.local.set({links})
}

async function removeLink(link) {
    await setLinks((await getLinks()).filter(x => x.url !== link.url))
}

async function getSettinngs() {
    return (await browser.storage.local.get()).settings || {
        blank: true,
        remove: false,
    }
}

async function setSettings(keys) {

    return await browser.storage.local.set({
        settings: {
            ...await getSettinngs(),
            ...keys
        }
    })
}

function create(tag = 'div', classes = [], attrs = {}) {
    const el = document.createElement(tag)
    
    for(const [attrName, attrValue] of Object.entries(attrs)) {
        el[attrName] = attrValue    
    }

    for(const c of classes) {
        el.classList.add(c)
    }

    return el
}

function textcut(text, len) {
    if (text.length > len) {
        return text.slice(0, len) + '...'
    }
    return text
}

function item(link, { blank, remove }) {
    const removeAndRender = async function() {
        await removeLink(link)
        await render()
    }
    
    const li = create('li')
    const a = create('a', [], {
        innerText: textcut(link.text, 40),
        href: link.url,
        target: blank ? '_blank' : '',
        title: link.text,
        onclick: remove ? removeAndRender : () => {}
    })
    const button = create('button', ['remove'], {
        innerText: 'Remove',
        onclick: removeAndRender
    })

    li.append(a, button)
    return li
}

function list(links, settings) {
    const ul = create('ul')
    for(const link of links) {
        ul.append(item(link, settings))
    }
    return ul
}

function clearButton() {
    const button = create(
        'button',['remove', 'remove-all'], {
        innerText: 'Remove All',
        onclick: async function() {
            await setLinks([])
            await render()
        }
    })
    return button
}

function toggleButton(active, onclick, title) {
    const wrapper = create('div', ['toggle-btn-wrap'])
    const box = create(
        'div', ['toggle-btn-box'],
        { onclick }
    )
    const circle = create('div', 
        [
            'toggle-btn-circle',
            'toggle-btn-circle-'+(active ? 'on': 'off')
        ]
    )
    const desc = create('span', ['toggle-btn-title'], {
        innerText: title
    })

    box.append(circle)
    wrapper.append(box)
    wrapper.append(desc)
    
    return wrapper
}

function blankButton({ blank }) {
    const onclick = async function() {
        await setSettings({blank: !blank})
        await render()
    }
    return toggleButton(
        blank,
        onclick,
        'New Tab?'
    )
}

function removeButton({ remove }) {
    const onclick = async function() {
        await setSettings({remove: !remove})
        await render()
    }
    return toggleButton(
        remove,
        onclick,
        'Remove?'
    )
}

function settingsPanel(settings) {
    const wrapper = create('div', ['settings'])
    wrapper.append(
        blankButton(settings),
        removeButton(settings)
    )
    return wrapper
}

async function render() {
    const links = await getLinks()
    const settings = await getSettinngs()

    const root = document.getElementById('root')
    root.innerHTML = ''
    root.append(settingsPanel(settings))
    if (links.length > 0) {
        root.append(list(links, settings), clearButton())
    } else {
        root.append(create('h1', [], {
            innerText: "Nothing here..."
        }))
    }
}

async function init() {
    await render()
}

init()

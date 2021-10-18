const _langNames = {
    eng: 'English',
    spa: 'Spanish',
    osp: 'Old Spanish',
    lat: 'Latin',
    fra: 'French',
    zho: 'Chinese',
    jpn: 'Japanese',
    kor: 'Korean',
    // yue: 'Cantonese',
    'ine-pro': 'Proto-Indo-European',
    grc: 'Ancient Greek',
    fro: 'Old French',
} as const

export type LangNames = typeof _langNames

export const langNames = Object.fromEntries(
    Object.entries(_langNames).sort(([kA, a], [kB, b]) =>
        kA === 'eng' ? -Infinity : kB === 'eng' ? Infinity : a.localeCompare(b),
    ),
) as LangNames

export type LangCode = keyof LangNames

export const baseLang: LangCode = 'eng'

const getDisplayName = (() => {
    try {
        return new (Intl as any).DisplayNames(['en'], { type: 'language' })
    } catch {
        return {
            of: (x: string) => x,
        }
    }
})()

export const getLangName = (code: string): string => {
    return langNames[code as LangCode] || getDisplayName.of(code)
}

/**

# Scraped from the following resources:

## Step 1 - Wiktionary frequent languages

https://en.wiktionary.org/wiki/Wiktionary:Statistics

```js
const rows = [...document.querySelector('tbody').querySelectorAll('tr')]

const x = rows
	.map((row) =>
		[...row.querySelectorAll('td')]
			.slice(0, 2)
			.map((x) => x.textContent.replace(/\(.*\d.*\)\s*$/, '').trim()),
	)
	.map(([lang, num]) => ({ lang, num: +num }))
	.sort((a, b) => b.num - a.num)
	.map((x) => x.lang)
	.slice(0, 350)

JSON.stringify(x)
```

## Step 2 - EtyTree source for ISO 639-3 codes

https://raw.githubusercontent.com/esterpantaleo/etymology/ad2062ee3714ab0845d00388b29a052ad26021c8/resources/data/iso-639-3.tab

```js
const frequentLangs = [[[PASTE FROM ABOVE RESULTS]]]

const _langNames = document
	.querySelector('pre')
	.textContent.split('\n')
	.filter((x) => x.trim())
	.map((x) => x.split('\t'))
	.map((x) => {
		const codes = x.slice(0, 1).filter((x) => x.trim())
		const name = x[6]

		return { codes, name }
	})
	.reduce((acc, { codes, name }) => {
		for (const code of codes) {
			acc[code] = name.replace(/\(.*\d.*\)$/, '').trim()
		}

		return acc
	}, Object.create(null))

const overrides = {
	ell: 'Greek', // not "Modern Greek"
}

const langNames = Object.assign(
	Object.fromEntries(
		Object.entries(_langNames).sort(([kA, a], [kB, b]) =>
			kA === 'eng'
				? -Infinity
				: kB === 'eng'
				? Infinity
				: a.localeCompare(b),
		),
	),
	overrides,
)

langNames.ell = 'Greek' // hard code - not "Modern Greek"

const langNamesReverse = Object.fromEntries(
	Object.entries(langNames).map((x) => x.reverse()),
)

Object.fromEntries(
	frequentLangs
		.map((lang) => [langNamesReverse[lang], lang])
		.filter(([x]) => x),
)
```

*/

export const langCodesToNames = {
    eng: 'English',
    zho: 'Chinese',
    ita: 'Italian',
    fin: 'Finnish',
    jpn: 'Japanese',
    spa: 'Spanish',
    fra: 'French',
    deu: 'German',
    pol: 'Polish',
    lat: 'Latin',
    por: 'Portuguese',
    rus: 'Russian',
    hbs: 'Serbo-Croatian',
    ron: 'Romanian',
    nld: 'Dutch',
    kor: 'Korean',
    enm: 'Middle English',
    ces: 'Czech',
    hun: 'Hungarian',
    mkd: 'Macedonian',
    ara: 'Arabic',
    ell: 'Greek',
    vie: 'Vietnamese',
    swe: 'Swedish',
    grc: 'Ancient Greek',
    cat: 'Catalan',
    nno: 'Norwegian Nynorsk',
    nob: 'Norwegian Bokmål',
    gle: 'Irish',
    glg: 'Galician',
    dan: 'Danish',
    hye: 'Armenian',
    tha: 'Thai',
    hin: 'Hindi',
    isl: 'Icelandic',
    epo: 'Esperanto',
    ceb: 'Cebuano',
    san: 'Sanskrit',
    tur: 'Turkish',
    tgl: 'Tagalog',
    ind: 'Indonesian',
    tel: 'Telugu',
    kat: 'Georgian',
    fas: 'Persian',
    bul: 'Bulgarian',
    heb: 'Hebrew',
    lav: 'Latvian',
    gla: 'Scottish Gaelic',
    ang: 'Old English',
    aze: 'Azerbaijani',
    ukr: 'Ukrainian',
    sqi: 'Albanian',
    tam: 'Tamil',
    kaz: 'Kazakh',
    cym: 'Welsh',
    glv: 'Manx',
    urd: 'Urdu',
    fao: 'Faroese',
    est: 'Estonian',
    lit: 'Lithuanian',
    syc: 'Classical Syriac',
    ido: 'Ido',
    ltz: 'Luxembourgish',
    fro: 'Old French',
    yid: 'Yiddish',
    mya: 'Burmese',
    slk: 'Slovak',
    ast: 'Asturian',
    ady: 'Adyghe',
    nav: 'Navajo',
    pli: 'Pali',
    mlt: 'Maltese',
    non: 'Old Norse',
    asm: 'Assamese',
    afr: 'Afrikaans',
    sme: 'Northern Sami',
    mon: 'Mongolian',
    oci: 'Occitan',
    ben: 'Bengali',
    zul: 'Zulu',
    bak: 'Bashkir',
    ota: 'Ottoman Turkish',
    mlg: 'Malagasy',
    guj: 'Gujarati',
    sco: 'Scots',
    bel: 'Belarusian',
    sga: 'Old Irish',
    frm: 'Middle French',
    got: 'Gothic',
    bod: 'Tibetan',
    phl: 'Phalura',
    eus: 'Basque',
    xho: 'Xhosa',
    dum: 'Middle Dutch',
    vec: 'Venetian',
    haw: 'Hawaiian',
    que: 'Quechua',
    pdt: 'Plautdietsch',
    vep: 'Veps',
    vol: 'Volapük',
    kmr: 'Northern Kurdish',
    goh: 'Old High German',
    nci: 'Classical Nahuatl',
    mal: 'Malayalam',
    mar: 'Marathi',
    crh: 'Crimean Tatar',
    tlh: 'Klingon',
    cim: 'Cimbrian',
    ajp: 'South Levantine Arabic',
    jbo: 'Lojban',
    cop: 'Coptic',
    fur: 'Friulian',
    mnc: 'Manchu',
    hau: 'Hausa',
    osx: 'Old Saxon',
    zha: 'Zhuang',
    scn: 'Sicilian',
    pdc: 'Pennsylvania German',
    lao: 'Lao',
    qya: 'Quenya',
    ary: 'Moroccan Arabic',
    hil: 'Hiligaynon',
    tpi: 'Tok Pisin',
    jav: 'Javanese',
    nor: 'Norwegian',
    lld: 'Ladin',
    chr: 'Cherokee',
    dsb: 'Lower Sorbian',
    lad: 'Ladino',
    tgk: 'Tajik',
    bre: 'Breton',
    izh: 'Ingrian',
    kan: 'Kannada',
    mah: 'Marshallese',
    uzb: 'Uzbek',
    cor: 'Cornish',
    kum: 'Kumyk',
    mri: 'Maori',
    hrx: 'Hunsrik',
    kas: 'Kashmiri',
    sun: 'Sundanese',
    yol: 'Yola',
    nhn: 'Central Nahuatl',
    aar: 'Afar',
    kik: 'Kikuyu',
    lij: 'Ligurian',
    kea: 'Kabuverdianu',
    tat: 'Tatar',
    acw: 'Hijazi Arabic',
    srn: 'Sranan Tongo',
    wln: 'Walloon',
    grt: 'Garo',
    dlm: 'Dalmatian',
    srd: 'Sardinian',
    yor: 'Yoruba',
    arn: 'Mapudungun',
    chv: 'Chuvash',
    kbd: 'Kabardian',
    orm: 'Oromo',
    nap: 'Neapolitan',
    smj: 'Lule Sami',
    odt: 'Old Dutch',
    cic: 'Chickasaw',
    mag: 'Magahi',
    nds: 'Low German',
    chk: 'Chuukese',
    som: 'Somali',
    mnw: 'Mon',
    kyj: 'Karao',
    che: 'Chechen',
    arg: 'Aragonese',
    uga: 'Ugaritic',
    ckv: 'Kavalan',
    sux: 'Sumerian',
    amh: 'Amharic',
    csb: 'Kashubian',
    lzz: 'Laz',
    ami: 'Amis',
    szl: 'Silesian',
    krl: 'Karelian',
    myv: 'Erzya',
    lut: 'Lushootseed',
    tuk: 'Turkmen',
    ipk: 'Inupiaq',
    kld: 'Gamilaraay',
    egl: 'Emilian',
    bam: 'Bambara',
    unm: 'Unami',
    mga: 'Middle Irish',
    okm: 'Middle Korean',
    sah: 'Yakut',
    tzm: 'Central Atlas Tamazight',
    nch: 'Central Huasteca Nahuatl',
    mrw: 'Maranao',
    ewe: 'Ewe',
    akk: 'Akkadian',
    tft: 'Ternate',
    afb: 'Gulf Arabic',
    urk: "Urak Lawoi'",
    shn: 'Shan',
    cho: 'Choctaw',
    kpv: 'Komi-Zyrian',
    oss: 'Ossetian',
    tir: 'Tigrinya',
    yog: 'Yogad',
    cos: 'Corsican',
    vro: 'Võro',
    hsb: 'Upper Sorbian',
    smn: 'Inari Sami',
    sms: 'Skolt Sami',
    vot: 'Votic',
    nhe: 'Eastern Huasteca Nahuatl',
    osp: 'Old Spanish',
    arz: 'Egyptian Arabic',
    awg: 'Anguthimri',
    alt: 'Southern Altai',
    lkt: 'Lakota',
    tet: 'Tetum',
    ban: 'Balinese',
    wol: 'Wolof',
    bal: 'Baluchi',
    oge: 'Old Georgian',
    ojp: 'Old Japanese',
    chl: 'Cahuilla',
    fij: 'Fijian',
    mdf: 'Moksha',
    lin: 'Lingala',
    lmo: 'Lombard',
    ofs: 'Old Frisian',
    sje: 'Pite Sami',
    kls: 'Kalasha',
    mch: 'Maquiritari',
    nhg: 'Tetelcingo Nahuatl',
    kmk: 'Limos Kalinga',
    apw: 'Western Apache',
    ist: 'Istriot',
    inh: 'Ingush',
    sna: 'Shona',
    orh: 'Oroqen',
    dak: 'Dakota',
    ccc: 'Chamicuro',
    olo: 'Livvi',
    mak: 'Makasar',
    sat: 'Santali',
    mwl: 'Mirandese',
    pjt: 'Pitjantjatjara',
    ase: 'American Sign Language',
    smo: 'Samoan',
    aot: 'Atong (India)',
    axm: 'Middle Armenian',
    ckb: 'Central Kurdish',
    lud: 'Ludian',
    iku: 'Inuktitut',
    kjh: 'Khakas',
    xag: 'Aghwan',
    cnk: 'Khumi Chin',
} as const

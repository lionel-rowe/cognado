import { flow } from 'fp-ts/lib/function'
import { underscorify } from '../utils/formatters'

const disallowedAsciis = new RegExp(
    '[' +
        Array.from({ length: 0x80 }, (_, i) => String.fromCodePoint(i))
            .filter((x) => encodeURIComponent(x) !== x)
            .map((x) => x.codePointAt(0) || 0)
            .reduce((acc, cur) => {
                const last = acc[acc.length - 1]

                if (!last || cur > last[last.length - 1] + 1) {
                    acc.push([cur])
                } else {
                    last[1] = cur
                }

                return acc
            }, [] as ([number] | [number, number])[])
            .map((x) =>
                x.map((y) => '\\x' + y.toString(16).padStart(2, '0')).join('-'),
            )
            .join('') +
        ']',
    'g',
)

// TODO - properly escape rather than just strip
// - how does SPARQL want them escaped? O_o
export const escapeForSparqlUrl = flow(
    underscorify,
    (x) => x.replace(disallowedAsciis, ''),
    (x) => x.normalize('NFC'),
)

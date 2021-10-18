import { HTMLProps, useState } from 'react'
import { usePopper } from 'react-popper'
import { WordData } from '../core/cognates'
import { fetchWiktionaryDefinitionHtml } from '../core/getWikiContent'
import { Spinner } from './Spinner'

export const Link = ({
    url,
    word,
    langName,
    langCode,
    ...htmlProps
}: WordData & HTMLProps<HTMLAnchorElement>) => {
    const [
        referenceElement,
        setReferenceElement,
    ] = useState<HTMLElement | null>(null)
    const [popperElement, setPopperElement] = useState<HTMLElement | null>(null)

    const { styles, attributes } = usePopper(referenceElement, popperElement, {
        placement: 'bottom',
    })

    const [popoverHtml, setPopoverHtml] = useState<string | null>(null)

    const [loading, setLoading] = useState<boolean>(false)

    const title = `${word} (${langName})`

    return (
        <span ref={setReferenceElement}>
            <a
                {...htmlProps}
                target='_blank'
                rel='noreferrer noopener'
                href={url}
                onMouseEnter={async () => {
                    if (!popoverHtml) {
                        setLoading(true)

                        const html = await fetchWiktionaryDefinitionHtml(
                            word,
                            langCode,
                        )

                        setLoading(false)

                        setPopoverHtml(html ?? '')
                    }
                }}
            >
                {title}
            </a>

            {
                <div
                    ref={setPopperElement}
                    style={styles.popper}
                    {...attributes.popper}
                    className='popover'
                >
                    {loading ? (
                        <Spinner />
                    ) : (
                        <>
                            <div>
                                <strong>{title}</strong>
                            </div>
                            <br />
                            <div
                                dangerouslySetInnerHTML={{
                                    __html:
                                        popoverHtml === ''
                                            ? '<span class="grayed-out">No definitions found</span>'
                                            : popoverHtml ?? '',
                                }}
                            />
                        </>
                    )}
                </div>
            }
        </span>
    )
}

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PersonJsonLd } from '@/components/pitstop/PersonJsonLd';
import { getProfile } from '@/content';

const HOSTILE = 'Evil </script><b>pwned</b> & <!-- x -->';

function render(fullName: string) {
  const profile = { ...getProfile('pt'), fullName };
  return renderToStaticMarkup(<PersonJsonLd profile={profile} locale="pt" />);
}

/** The text between the first `<script ...>` and the first `</script>`. */
function jsonBlock(markup: string) {
  const match = markup.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  expect(match, 'a closed ld+json script element').not.toBeNull();
  return match![1];
}

describe('PersonJsonLd script content', () => {
  it('cannot be closed early by a "</script>" inside the data', () => {
    const markup = render(HOSTILE);

    // The only "</script" in the markup is the element's own closing tag.
    expect(markup.match(/<\/script/gi)).toHaveLength(1);
    expect(markup).not.toContain('</script><b>');
    expect(markup.endsWith('</script>')).toBe(true);
  });

  it('writes "<" as the six characters \\u003c', () => {
    const block = jsonBlock(render(HOSTILE));

    expect(block).not.toContain('<');
    expect(block).toContain('\\u003c/script>\\u003cb>pwned\\u003c/b>');
  });

  it('is still valid JSON that round-trips the original text', () => {
    const data = JSON.parse(jsonBlock(render(HOSTILE)));

    expect(data['@type']).toBe('Person');
    expect(data.name).toBe(HOSTILE);
  });
});

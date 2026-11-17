const CYRILLIC_TO_LATIN: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ѓ: 'gj', е: 'e', ж: 'zh', з: 'z', ѕ: 'dz',
    и: 'i', ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm', н: 'n', њ: 'nj', о: 'o', п: 'p',
    р: 'r', с: 's', т: 't', ќ: 'kj', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', џ: 'dzh',
    ш: 'sh', й: 'j', ё: 'e', ы: 'y', э: 'e', ю: 'yu', я: 'ya', ь: '', ъ: '', ђ: 'dj', ћ: 'c',
};

export const FALLBACK_SLUG = 'restaurant';

export function slugify(input: string): string {
    const transliterated = Array.from(input.toLowerCase())
        .map((ch) => CYRILLIC_TO_LATIN[ch] ?? ch)
        .join('');

    return transliterated
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60)
        .replace(/-+$/g, '');
}

export async function uniqueSlug(name: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
    const base = slugify(name) || FALLBACK_SLUG;
    let candidate = base;
    let counter = 2;
    while (await exists(candidate)) {
        candidate = `${base}-${counter}`;
        counter++;
    }
    return candidate;
}

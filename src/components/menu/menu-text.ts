export type MenuLang = 'en' | 'mk';

export const MENU_TEXT = {
    en: {
        tagline: 'Explore our dishes',
        emptyMenu: 'This menu has no items yet.',
        poweredBy: 'Powered by MenuScan',
        switchLanguage: 'Switch to Macedonian',
        soldOut: 'Sold out',
        vegetarian: 'Vegetarian',
        vegan: 'Vegan',
        spicy: 'Spicy',
        allergens: 'Allergens',
        minutes: 'min',
    },
    mk: {
        tagline: 'Истражете ги нашите јадења',
        emptyMenu: 'Ова мени сè уште нема ставки.',
        poweredBy: 'Овозможено од MenuScan',
        switchLanguage: 'Switch to English',
        soldOut: 'Распродадено',
        vegetarian: 'Вегетаријанско',
        vegan: 'Веганско',
        spicy: 'Луто',
        allergens: 'Алергени',
        minutes: 'мин',
    },
} as const;

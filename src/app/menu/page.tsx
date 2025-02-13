interface MenuItem {
    _id: string;
    nameMK: string;
    nameEN: string;
    price: number;
    category: string;
    isAvailable: boolean;
}

async function getMenuItems(): Promise<MenuItem[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/menu`, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error('Failed to fetch menu items');
    }
    return res.json();
}

export default async function MenuPage() {
    const menuItems = await getMenuItems();

    // Type assertion here since we know category is string
    const categories = Array.from(
        new Set(menuItems.map((item: MenuItem) => item.category))
    ) as string[];

    const getCategoryName = (category: string): string => {
        switch (category) {
            case 'hot-drinks':
                return 'Топли Пијалоци';
            case 'cold-drinks':
                return 'Ладни Пијалоци';
            case 'food':
                return 'Храна';
            default:
                return category;
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-8">Нашето Мени</h1>

            {categories.map((category) => (
                <div key={category} className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        {getCategoryName(category)}
                    </h2>

                    <div className="space-y-4">
                        {menuItems
                            .filter((item) => item.category === category)
                            .map((item) => (
                                <div key={item._id} className="bg-white rounded-lg shadow-sm p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-medium">{item.nameMK}</h3>
                                            <p className="text-sm text-gray-500">{item.nameEN}</p>
                                        </div>
                                        <div className="font-bold">
                                            {item.price} ден.
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
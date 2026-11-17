interface JumpTarget {
    _id: string;
    name: string;
    icon: string;
}

interface Props {
    sections: JumpTarget[];
    label: string;
}

export default function CategoryJumpBar({ sections, label }: Props) {
    if (sections.length < 2) {
        return null;
    }

    return (
        <nav aria-label={label} className="sticky top-0 z-20 -mx-4 sm:mx-0 bg-gray-50/95 backdrop-blur border-b sm:border sm:rounded-xl">
            <ul className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
                {sections.map((section) => (
                    <li key={section._id} className="shrink-0">
                        <a
                            href={`#category-${section._id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                        >
                            {section.icon && <span aria-hidden="true">{section.icon}</span>}
                            {section.name}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

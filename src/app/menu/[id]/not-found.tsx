export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Menu Not Found</h1>
                <p className="text-gray-600 mb-8">
                    Sorry, we couldn't find the menu you're looking for.
                </p>
                <div className="text-7xl mb-8">🍽️</div>
                <a
                    href="/"
                    className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Go Home
                </a>
            </div>
        </div>
    );
}
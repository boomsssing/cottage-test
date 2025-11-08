// 2025 Culinary Class Schedule - Single Source of Truth
// All classes with dates, times, seats, and descriptions

const CLASSES_SCHEDULE = [
    // Thanksgiving Sides
    {
        id: 1,
        type: 'thanksgiving',
        name: 'Thanksgiving Sides',
        date: '2025-11-13',
        time: '7:00-10:00 PM',
        maxSeats: 8,
        bookedSeats: 0,
        price: 85,
        description: 'Mascarpone Chive Mashed Potatoes • Bacon Balsamic Brussel Sprouts • Parker House Rolls • Butternut Squash Pecan Tarts • Amaretto Seared Mushrooms'
    },
    {
        id: 2,
        type: 'thanksgiving',
        name: 'Thanksgiving Sides',
        date: '2025-11-20',
        time: '7:00-9:00 PM',
        maxSeats: 8,
        bookedSeats: 0,
        price: 85,
        description: 'Mascarpone Chive Mashed Potatoes • Bacon Balsamic Brussel Sprouts • Parker House Rolls • Butternut Squash Pecan Tarts • Amaretto Seared Mushrooms'
    },

    // Classic Italian American III
    {
        id: 3,
        type: 'classic-italian-3',
        name: 'Classic Italian American III',
        date: '2025-11-14',
        time: '6:00-9:00 PM',
        maxSeats: 8,
        bookedSeats: 0,
        price: 85,
        description: 'Pasta Fagioli Soup • Chicken Francese • Mushroom Risotto • Fried Sicilian Zeppole'
    },

    // Fresh Scratch Pasta
    {
        id: 4,
        type: 'fresh-pasta',
        name: 'Fresh Scratch Pasta',
        date: '2025-11-21',
        time: '6:00-9:00 PM',
        maxSeats: 8,
        bookedSeats: 0,
        price: 85,
        description: 'Gnocchi • Fettucine • Pappardelle • Tortellini • Fresh Pomodoro Sauce • Cannoli'
    },

    // Holiday Chocolate Desserts
    {
        id: 5,
        type: 'holiday-desserts',
        name: 'Holiday Chocolate Desserts',
        date: '2025-11-27',
        time: '6:00-9:00 PM',
        maxSeats: 8,
        bookedSeats: 0,
        price: 85,
        description: 'Chocolate Cranberry Paté • Chocolate Truffles • Christmas Blondies • Chocolate Chip Cookie Stuffed Fudge Brownies'
    },
    {
        id: 6,
        type: 'holiday-desserts',
        name: 'Holiday Chocolate Desserts',
        date: '2025-12-05',
        time: '6:00-9:00 PM',
        maxSeats: 8,
        bookedSeats: 0,
        price: 85,
        description: 'Chocolate Cranberry Paté • Chocolate Truffles • Christmas Blondies • Chocolate Chip Cookie Stuffed Fudge Brownies'
    },

    // Holiday Appetizers - December 4th and December 12th
    {
        id: 7,
        type: 'holiday-appetizers',
        name: 'Holiday Appetizers',
        date: '2025-12-04',
        time: '7:00-10:00 PM',
        maxSeats: 7,
        bookedSeats: 1,
        price: 85,
        description: 'Miniature Beef Wellingtons • Sausage Mascarpone Stuffed Mushrooms • Fresh Hummus and Parmesan Pita Chips • Miniature Arancini Rice Balls • Sausage Spinach Pie'
    },
    {
        id: 8,
        type: 'holiday-appetizers',
        name: 'Holiday Appetizers',
        date: '2025-12-12',
        time: '7:00-10:00 PM',
        maxSeats: 8,
        bookedSeats: 0,
        price: 85,
        description: 'Miniature Beef Wellingtons • Sausage Mascarpone Stuffed Mushrooms • Fresh Hummus and Parmesan Pita Chips • Miniature Arancini Rice Balls • Sausage Spinach Pie'
    },

    // Easy Breads
    {
        id: 9,
        type: 'easy-breads',
        name: 'Easy Breads',
        date: '2025-12-11',
        time: '7:00-10:00 PM',
        maxSeats: 8,
        bookedSeats: 0,
        price: 85,
        description: 'Focaccia • Rustic French Boule • Ciabatta • Brazilian Cheese Rolls • Homemade Butter'
    },

    // International Winter Soups
    {
        id: 10,
        type: 'winter-soups',
        name: 'International Winter Soups',
        date: '2025-12-19',
        time: '6:00-9:00 PM',
        maxSeats: 8,
        bookedSeats: 0,
        price: 85,
        description: 'Chicken Matzoh Ball • Pasta Fagioli • Sopa De Pollo (Mexican Chicken Soup) • Hungarian Goulyas Soup • Beef Barley'
    }
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CLASSES_SCHEDULE };
}

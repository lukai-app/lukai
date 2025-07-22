enum DefaultIncomeCategory {
  SALARY = 'SALARY',
  STOCK_PROFIT = 'STOCK_PROFIT',
  BONUSES = 'BONUSES',
  RENTAL = 'RENTAL',
  BUSINESS = 'BUSINESS',
  INVESTMENT = 'INVESTMENT',
  INTEREST = 'INTEREST',
  DEPOSIT = 'DEPOSIT'
}

type IncomeCategories = {
  [key in DefaultIncomeCategory]: {
    en_name: string;
    es_name: string;
    color: string;
    en_description: string;
    es_description: string;
    type: keyof typeof DefaultIncomeCategory;
    url: string;
    image_id: string;
  };
};

export const incomeCategories: IncomeCategories = {
  SALARY: {
    en_name: 'Salary',
    es_name: 'Salario',
    color: '#4CAF50',
    en_description:
      'Income from salary, wages, or other compensation from employment.',
    es_description:
      'Ingresos de salario, sueldos u otra compensación por empleo.',
    type: 'SALARY',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/moneybag-xl5o90hpjPt0XfyuE217G7cqndzmYh.png',
    image_id: 'a60c2cd1-29b3-4a52-98be-9cfceb022af4'
  },
  STOCK_PROFIT: {
    en_name: 'Stock profit',
    es_name: 'Ganancia de acciones',
    color: '#FFC107',
    en_description:
      'Income from the sale of stocks, bonds, or other investments.',
    es_description:
      'Ingresos por la venta de acciones, bonos u otras inversiones.',
    type: 'STOCK_PROFIT',
    url: ' https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/chart_with_upwards_trend-uK0C38jnsqCvQzzWzugnXhk4IlovZR.png',
    image_id: '059995f1-155b-43c7-8865-a0d2c6a533f0'
  },
  BONUSES: {
    en_name: 'Bonuses',
    es_name: 'Bonos',
    color: '#FF9800',
    en_description: 'Income from bonuses, gifts, or other unexpected earnings.',
    es_description:
      'Ingresos de bonificaciones, regalos u otros ingresos inesperados.',
    type: 'BONUSES',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/tada-oO4KPQCXJwPI6XAl4PNn5RcA2MUAd3.png',
    image_id: 'ab6f8c4c-9ac1-4984-9934-7c564c3de84b'
  },
  RENTAL: {
    en_name: 'Rental',
    es_name: 'Alquiler',
    color: '#795548',
    en_description:
      'Income from rental properties, such as real estate or equipment.',
    es_description:
      'Ingresos de propiedades en alquiler, como bienes raíces o equipos.',
    type: 'RENTAL',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/house-ceFK04AXtkd47sbJYJaSoq6EGP4HWl.png',
    image_id: 'a1e4e24d-d0ba-40b9-b466-e277af7e222b'
  },
  BUSINESS: {
    en_name: 'Business',
    es_name: 'Negocio',
    color: '#2196F3',
    en_description:
      'Income from a business, such as sales, services, or products.',
    es_description:
      'Ingresos de un negocio, como ventas, servicios o productos.',
    type: 'BUSINESS',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/office-zuvwdKRpYt7PeChvhtN5poQCtS9JfL.png',
    image_id: 'a079f146-c478-4625-9c7a-954bfd48738c'
  },
  INVESTMENT: {
    en_name: 'Investment',
    es_name: 'Inversión',
    color: '#388E3C',
    en_description:
      'Income from investments, such as dividends, interest, or capital gains.',
    es_description:
      'Ingresos de inversiones, como dividendos, intereses o ganancias de capital.',
    type: 'INVESTMENT',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/mortar_board-A2anrDWCzAEjsh1ShGcxzf6sVn5gc9.png',
    image_id: 'c3faf999-0544-4f63-838b-725a27f2ed31'
  },
  INTEREST: {
    en_name: 'Interest',
    es_name: 'Interés',
    color: '#00BCD4',
    en_description:
      'Income from interest earned on savings accounts, investments, or loans.',
    es_description:
      'Ingresos de intereses ganados en cuentas de ahorro, inversiones o préstamos.',
    type: 'INTEREST',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/money_with_wings-GCG6JrwjkYmtgi5mMuNjeagQueYQJW.png',
    image_id: 'a3443254-2d37-46fc-9467-66a4f66082cb'
  },
  DEPOSIT: {
    en_name: 'Deposit',
    es_name: 'Depósito inicial',
    color: '#4CAF50',
    en_description: 'Initial balance when creating a financial account',
    es_description: 'Saldo de apertura al crear una cuenta financiera',
    type: 'DEPOSIT',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/deposit-1748447841326.png',
    image_id: 'PxSxxa0V9wVhcXxw'
  }
};

enum DefaultExpenseCategory {
  PETS = 'PETS',
  HEALTH = 'HEALTH',
  EDUCATION = 'EDUCATION',
  CLOTHES = 'CLOTHES',
  GAMES = 'GAMES',
  SPORT = 'SPORT',
  CINEMA = 'CINEMA',
  TRANSPORT = 'TRANSPORT',
  FOOD = 'FOOD',
  BOOKS = 'BOOKS',
  DECORATION = 'DECORATION',
  FITNESS = 'FITNESS',
  TECH_GADGETS = 'TECH_GADGETS',
  UTILITIES_AND_SERVICES = 'UTILITIES_AND_SERVICES',
  PERSONAL_CARE = 'PERSONAL_CARE',
  FUN = 'FUN',
  GIFTS = 'GIFTS',
  INVESTMENTS = 'INVESTMENTS',
  FAMILY = 'FAMILY',
  HOBBIES = 'HOBBIES',
  RENT = 'RENT',
  SUPERMARKET = 'SUPERMARKET',
  SUBSCRIPTIONS = 'SUBSCRIPTIONS',
  TRAVEL = 'TRAVEL',
  unknown = 'unknown'
}

type ExpenseCategories = {
  [key in DefaultExpenseCategory]: {
    en_name: string;
    es_name: string;
    en_description: string;
    es_description: string;
    color: string;
    type: keyof typeof DefaultExpenseCategory;
    url: string;
    image_id: string;
  };
};

/* Uploaded robot_face.png to https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/robot_face-QVMfhJw45KtEztyodmBMqV5hvuKuQj.png
Uploaded sparkles.png to https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/sparkles-vcTrd6yv77bGBw6qYWgLJhxsVnp3N3.png
Uploaded muscle.png to https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/muscle-SMLruS5loloiwgGOMTEaL5S72kr3Jg.png */

export const expenseCategories: ExpenseCategories = {
  PETS: {
    en_name: 'Pets',
    es_name: 'Mascotas',
    en_description:
      'Expenses related to pet care, including food, veterinary services, grooming, and accessories.',
    es_description:
      'Gastos relacionados con el cuidado de mascotas, como comida, servicios veterinarios, peluquería y accesorios.',
    color: '#FFB74D',
    type: 'PETS',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/dog-ksDv11XkkLElJPgfoQiBEEWFcsiKCZ.png',
    image_id: '72b97c68-7e89-47ba-af7e-404a46ba2dbc'
  },
  HEALTH: {
    en_name: 'Health',
    es_name: 'Salud',
    color: '#4CAF50',
    en_description:
      'Expenses for healthcare, such as doctor visits, medications, insurance, and medical treatments',
    es_description:
      'Gastos de atención médica, como visitas al médico, medicamentos, seguros y tratamientos médicos',
    type: 'HEALTH',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/hospital-6IzFwMyxHn03IjOsR3lUYvc5RAjsc2.png',
    image_id: '32921670-9897-4a57-b973-bf5266a83603'
  },
  EDUCATION: {
    en_name: 'Education',
    es_name: 'Educación',
    color: '#64B5F6',
    en_description:
      'Expenses related to education, such as tuition, books, materials, and courses.',
    es_description:
      'Gastos relacionados con la educación, como matrícula, libros, materiales y cursos.',
    type: 'EDUCATION',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/mortar_board-A2anrDWCzAEjsh1ShGcxzf6sVn5gc9.png',
    image_id: '1bd5425f-3e0f-46d5-8e77-c2db04ddbdb1'
  },
  CLOTHES: {
    en_name: 'Clothes',
    es_name: 'Ropa',
    color: '#E91E63',
    en_description:
      'Expenses related to clothing, such as shoes, accessories, and garments.',
    es_description:
      'Gastos relacionados con la ropa, como zapatos, accesorios y prendas de vestir.',
    type: 'CLOTHES',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/dress-AkeR8EoBJwCS6qtUTh57ZLcm8Q6dzJ.png',
    image_id: 'a8c885a1-27f7-4033-8684-56366a85ce07'
  },
  GAMES: {
    en_name: 'Games',
    es_name: 'Juegos',
    color: '#9C27B0',
    en_description:
      'Expenses related to games, such as video games, board games, and gaming accessories.',
    es_description:
      'Gastos relacionados con juegos, como videojuegos, juegos de mesa y accesorios de juego.',
    type: 'GAMES',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/video_game-rmdr944zSy0yG022bkA9eTYF4S0hDG.png',
    image_id: '2832ce49-b07e-4d21-b87e-7c46e3dbed54'
  },
  SPORT: {
    en_name: 'Sport',
    es_name: 'Deporte',
    color: '#FF9800',
    en_description:
      'Expenses related to sports, such as gym memberships, equipment, and sports clothing.',
    es_description:
      'Gastos relacionados con el deporte, como membresías de gimnasio, equipo y ropa deportiva.',
    type: 'SPORT',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/soccer-BNseGqMqn9YjpzL0wmznOyT3q7qiry.png',
    image_id: '05fda425-caee-48f6-8512-3abc1371874c'
  },
  CINEMA: {
    en_name: 'Cinema',
    es_name: 'Cine',
    color: '#607D8B',
    en_description:
      'Expenses related to cinema, such as movie tickets, popcorn, and drinks.',
    es_description:
      'Gastos relacionados con el cine, como entradas de cine, palomitas y bebidas.',
    type: 'CINEMA',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/popcorn-O2CYzSEFX9Q3qRXPJS2Nec5wG2hZp3.png',
    image_id: '7aa93b4a-a451-4231-87fa-e68d55cefbc1'
  },
  TRANSPORT: {
    en_name: 'Transport',
    es_name: 'Transporte',
    color: '#03A9F4',
    en_description:
      'Expenses related to transportation, such as bus tickets, gasoline, and parking.',
    es_description:
      'Gastos relacionados con el transporte, como boletos de autobús, gasolina y estacionamiento.',
    type: 'TRANSPORT',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/car-KKxtTOP42UWJT68Ta6iXQmtwbDpIHg.png',
    image_id: 'a5a9c39a-731a-4761-be96-28fef36b6938'
  },
  FOOD: {
    en_name: 'Food',
    es_name: 'Comida',
    color: '#FF5722',
    en_description:
      'Expenses related to food, such as groceries, restaurants, and takeout.',
    es_description:
      'Gastos relacionados con la comida, como comestibles, restaurantes y comida para llevar.',
    type: 'FOOD',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/hamburger-82s0wuWab90KQSshFoj2ZTDfK6Ij0q.png',
    image_id: '25ffadc5-41cf-478b-b94e-d9016c0ac72b'
  },
  BOOKS: {
    en_name: 'Books',
    es_name: 'Libros',
    color: '#8D6E63',
    en_description:
      'Expenses related to books, such as novels, textbooks, and audiobooks.',
    es_description:
      'Gastos relacionados con libros, como novelas, libros de texto y audiolibros.',
    type: 'BOOKS',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/books-USGHMABA7yrUmQSmRTnDD6J7i7cSEq.png',
    image_id: '8bd16820-63ca-4393-8626-01afeaaefcda'
  },
  DECORATION: {
    en_name: 'Decoration',
    es_name: 'Decoración',
    color: '#795548',
    en_description:
      'Expenses related to decoration, such as furniture, art, and home decor.',
    es_description:
      'Gastos relacionados con la decoración, como muebles, arte y decoración del hogar.',
    type: 'DECORATION',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/sparkles-vcTrd6yv77bGBw6qYWgLJhxsVnp3N3.png',
    image_id: 'c17ce4db-8e36-4f5c-8d4f-5a8dac1e8b70'
  },
  FITNESS: {
    en_name: 'Fitness',
    es_name: 'Fitness',
    color: '#FF7043',
    en_description:
      'Expenses related to fitness, such as gym memberships, equipment, and workout clothing.',
    es_description:
      'Gastos relacionados con el fitness, como membresías de gimnasio, equipo y ropa de entrenamiento.',
    type: 'FITNESS',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/muscle-SMLruS5loloiwgGOMTEaL5S72kr3Jg.png',
    image_id: 'efbd99ea-6918-4d7d-852d-55444ebc6573'
  },
  TECH_GADGETS: {
    en_name: 'Tech gadgets',
    es_name: 'Gadgets tecnológicos',
    color: '#2196F3',
    en_description:
      'Expenses related to technology, such as smartphones, laptops, and accessories.',
    es_description:
      'Gastos relacionados con la tecnología, como teléfonos inteligentes, computadoras portátiles y accesorios.',
    type: 'TECH_GADGETS',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/robot_face-QVMfhJw45KtEztyodmBMqV5hvuKuQj.png',
    image_id: 'c77da437-f7e0-4027-b238-a82cf0532ac4'
  },
  UTILITIES_AND_SERVICES: {
    en_name: 'Utilities and services',
    es_name: 'Servicios',
    color: '#009688',
    en_description:
      'Expenses related to utilities and services, such as electricity, water, and internet.',
    es_description:
      'Gastos relacionados con servicios públicos y servicios, como electricidad, agua e internet.',
    type: 'UTILITIES_AND_SERVICES',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/shield-U8bgI1jKVRYqsjhmC8mWDSC4DPbhWL.png',
    image_id: 'f16111c3-2f07-4e47-bfcb-4596696e760d'
  },
  PERSONAL_CARE: {
    en_name: 'Personal care',
    es_name: 'Cuidado personal',
    color: '#F06292',
    en_description:
      'Expenses related to personal care, such as cosmetics, haircuts, and beauty products.',
    es_description:
      'Gastos relacionados con el cuidado personal, como cosméticos, cortes de pelo y productos de belleza.',
    type: 'PERSONAL_CARE',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/herb-y5YhaeTAW9H0Um0jNIPuK6rzZXwcSG.png',
    image_id: 'f2de923c-37ff-48bd-be64-1d84bbdb698c'
  },
  FUN: {
    en_name: 'Fun',
    es_name: 'Diversión',
    color: '#FFC107',
    en_description:
      'Expenses related to entertainment, such as concerts, movies, and events.',
    es_description:
      'Gastos relacionados con el entretenimiento, como conciertos, películas y eventos.',
    type: 'FUN',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/tada-J4pcxudLwKCGZp3HqgaE6XMrn6Reng.png',
    image_id: 'af17e703-f89a-4988-9f37-78a7586da5b0'
  },
  GIFTS: {
    en_name: 'Gifts',
    es_name: 'Regalos',
    color: '#F44336',
    en_description:
      'Expenses related to gifts, such as birthdays, holidays, and special occasions.',
    es_description:
      'Gastos relacionados con regalos, como cumpleaños, vacaciones y ocasiones especiales.',
    type: 'GIFTS',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/gift-wNS8SNxp68YU6Vhgfzwi1TsfNVo5gE.png',
    image_id: 'wNS8SNxp68YU6Vhgfzwi1TsfNVo5gE'
  },
  INVESTMENTS: {
    en_name: 'Investments',
    es_name: 'Inversiones',
    color: '#388E3C',
    en_description:
      'Expenses related to investments, such as stocks, funds, and real estate.',
    es_description:
      'Gastos relacionados con inversiones, como acciones, fondos y bienes raíces.',
    type: 'INVESTMENTS',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/moneybag-mK3VMjkOsId6JH47qQvGvJeAgd9jnR.png',
    image_id: 'mK3VMjkOsId6JH47qQvGvJeAgd9jnR'
  },
  FAMILY: {
    en_name: 'Family',
    es_name: 'Familia',
    color: '#AB47BC',
    en_description:
      'Expenses related to family, such as children, parents, and relatives.',
    es_description:
      'Gastos relacionados con la familia, como hijos, padres y parientes.',
    type: 'FAMILY',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/house_with_garden-enFlnAKgzBHKoYq6h66T3cKRA7ReOG.png',
    image_id: 'enFlnAKgzBHKoYq6h66T3cKRA7ReOG'
  },
  HOBBIES: {
    en_name: 'Hobbies',
    es_name: 'Hobbies',
    color: '#3F51B5',
    en_description:
      'Expenses related to hobbies, such as crafts, sports, and activities.',
    es_description:
      'Gastos relacionados con pasatiempos, como manualidades, deportes y actividades.',
    type: 'HOBBIES',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/art-PKqDI06pHkhDTfl0vDXVpPklLy6Klz.png',
    image_id: 'PKqDI06pHkhDTfl0vDXVpPklLy6Klz'
  },
  RENT: {
    en_name: 'Rent',
    es_name: 'Alquiler',
    color: '#6D4C41',
    en_description:
      'Expenses related to rent, such as housing, office space, and storage.',
    es_description:
      'Gastos relacionados con el alquiler, como vivienda, oficinas y almacenamiento.',
    type: 'RENT',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/old_key-8Rfvoz4VIBvRCuKDdxLcIf52WN0Ieb.png',
    image_id: '8Rfvoz4VIBvRCuKDdxLcIf52WN0Ieb'
  },
  SUPERMARKET: {
    en_name: 'Supermarket',
    es_name: 'Supermercado',
    color: '#FF8A65',
    en_description:
      'Expenses related to the supermarket, such as groceries, household items, and cleaning supplies.',
    es_description:
      'Gastos relacionados con el supermercado, como comestibles, artículos para el hogar y productos de limpieza.',
    type: 'SUPERMARKET',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/shopping_trolley-cQNOSlcRRHPAheKqKd7KnLQiY1e6o2.png',
    image_id: 'cQNOSlcRRHPAheKqKd7KnLQiY1e6o2'
  },
  SUBSCRIPTIONS: {
    en_name: 'Subscriptions',
    es_name: 'Suscripciones',
    color: '#536DFE',
    en_description:
      'Expenses related to subscriptions, such as streaming services, magazines, and software.',
    es_description:
      'Gastos relacionados con suscripciones, como servicios de transmisión, revistas y software.',
    type: 'SUBSCRIPTIONS',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/credit_card-kiT3BFuC6ki9kopeM7Fo2PNNxHa1kw.png',
    image_id: 'kiT3BFuC6ki9kopeM7Fo2PNNxHa1kw'
  },
  TRAVEL: {
    en_name: 'Travel',
    es_name: 'Viajes',
    color: '#00BCD4',
    en_description:
      'Expenses related to travel, such as flights, hotels, and tours.',
    es_description:
      'Gastos relacionados con los viajes, como vuelos, hoteles y tours.',
    type: 'TRAVEL',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/airplane-oVElT4R9lMuCOHngg6jSouCunsFid4.png',
    image_id: 'oVElT4R9lMuCOHngg6jSouCunsFid4'
  },
  unknown: {
    en_name: 'Unknown',
    es_name: 'Desconocido',
    color: '#9E9E9E',
    en_description: 'Unknown category',
    es_description: 'Categoría desconocida',
    type: 'unknown',
    url: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/question-I89zfmUutK0WU4nmaGCNsk53ExqBDY.png',
    image_id: '7ba06d93-16c9-4f4b-ae76-06ff46b7c9c6'
  }
};

export enum NeedOrWantExpense {
  NEED = 'NEED',
  WANT = 'WANT'
}

export const defaultColors = [
  '#FFC0CB',
  '#FF5252',
  '#FFEB3B',
  '#FFCDD2',
  '#FF5722',
  '#8BC34A',
  '#9C27B0',
  '#3F51B5',
  '#FF9800',
  '#F06292',
  '#795548',
  '#009688',
  '#607D8B',
  '#CDDC39',
  '#00BCD4',
  '#E91E63',
  '#4CAF50',
  '#C2185B',
  '#388E3C',
  '#673AB7',
  '#FF1744',
  '#4DB6AC',
  '#9E9E9E',
  '#2196F3',
  '#9FA8DA',
  '#4CAF50',
  '#FFC107',
  '#FF9800',
  '#795548',
  '#2196F3',
  '#388E3C',
  '#00BCD4'
];

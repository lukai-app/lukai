import { env } from '@/env';
import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  ChartBarIcon,
  ChatBubbleLeftEllipsisIcon,
} from '@heroicons/react/24/outline';

export enum ValidLangs {
  en = 'en',
  es = 'es',
}

export const validLangs: Record<keyof typeof ValidLangs, string> = {
  en: 'en',
  es: 'es',
};

export const dictionary = {
  es: {
    landing: {
      hero: {
        headline:
          'Toma el control de tus finanzas con nuestro rastreador de gastos de WhatsApp fácil de usar',
        subheading:
          'Simplifica tus finanzas con lenguaje natural. Rastrea tus gastos sin problemas con nuestro bot de WhatsApp con inteligencia artificial',
        cta: 'Comienza a registrar gastos',
        // https://wa.me/1XXXXXXXXXX?text=I'm%20interested%20in%20your%20car%20for%20sale but the thex will be: "Hola!! Quiero empezar a registrar mis gastos con treats." the text must be url encoded
        ctaLink:
          'https://wa.me/51977504342?text=Hola!!%20Quiero%20empezar%20a%20registrar%20mis%20gastos%20con%20treats.',
        secondaryCta: 'Aprende más',
        secondaryCtaLink: `${env.NEXT_PUBLIC_URL}/es/#product`,
        login: 'Iniciar sesión',
        loginLink: `${env.NEXT_PUBLIC_URL}/es/home`,
      },
      problem: {
        title: '¿Perdiendo el control de tus gastos?',
        subheading: 'Empieza a registrar tus gastos hoy',
        body: '¿Cansado de manejar múltiples aplicaciones y hojas de cálculo para rastrear tus gastos? Nuestro rastreador de gastos de WhatsApp hace que sea fácil mantenerse al día con tus hábitos de gasto.',
      },
      solution: {
        title:
          'Simplifica el seguimiento de gastos con nuestro bot de WhatsApp',
        features: [
          {
            icon: ChatBubbleLeftEllipsisIcon,
            name: 'Registro de gastos con tus propias palabras.',
            description:
              'Usa el chat para agregar gastos, como "Gasté $20 en comestibles" o "Pagué $50 por un corte de pelo".',
          },
          {
            icon: CloudArrowUpIcon,
            name: 'Clasificación automática en categorías.',
            description:
              'Nuestro bot con AI clasifica automáticamente tus gastos para un registro fácil.',
          },
          {
            icon: ChartBarIcon,
            name: 'Resumen de gastos con rangos de tiempo personalizados.',
            description:
              'Obtén una visión clara de tus hábitos de gasto con nuestros paneles interactivos.',
          },
          {
            icon: ArrowPathIcon,
            name: 'Información en tiempo real de gastos.',
            description: 'Registra gastos en tiempo real',
          },
        ],
        cta: 'Pruebalo ahora - Registra 10 gastos gratis',
      },
      pricing: {
        title: 'Planes',
        description: 'Simple. Seguimiento de gastos sin esfuerzo para todos.',
        plans: [
          {
            id: 'monthly',
            mostPopular: true,
            name: 'Mensual',
            price: '$4.99',
            description:
              'Puedes registrar 10 gastos gratis y luego comenzar la prueba gratuita de 14 días',
            features: [
              'Registro de gastos en lenguaje natural',
              'Clasificación automática en categorías',
              'Resumen del panel con rangos de tiempo personalizados',
              'Información en tiempo real de gastos',
            ],
            cta: 'Registra tu primer gasto',
            ctalink:
              'https://wa.me/51977504342?text=Hola!!%20Quiero%20empezar%20a%20registrar%20mis%20gastos%20con%20treats.',
          },
        ],
      },
      faqs: {
        title: 'Preguntas frecuentes',
        items: [
          {
            id: 'q1',
            question: '¿Qué es treats y cómo funciona?',
            answer:
              'Apolo es un bot de WhatsApp diseñado para un seguimiento de gastos sin esfuerzo. Simplemente puedes chatear con el bot en lenguaje natural, como "Gasté 20 dólares en una chaqueta", y registrará el monto, la descripción y clasificará el gasto por ti.',
          },
          {
            id: 'q2',
            question:
              '¿Cómo clasifica Apolo los gastos usando lenguaje natural?',
            answer:
              'Apolo utiliza IA para comprender y clasificar los gastos basándose en el lenguaje natural. El sistema está capacitado para reconocer patrones y contexto, asegurando una categorización precisa.',
          },
          {
            id: 'q3',
            question:
              '¿Cómo accedo a mi resumen de gastos y al panel de control?',
            answer:
              'Puede iniciar sesión [here] con su teléfono móvil para ver una descripción general completa de sus gastos, gráficos categorizados y una lista de sus transacciones.',
            link: `${env.NEXT_PUBLIC_URL}/es/home`,
          },
          {
            id: 'q4',
            question: '¿Cómo funciona la prueba gratuita de 14 días?',
            answer:
              'Puedes comenzar a registrar gastos de forma gratuita y después de agregar el décimo gasto, ingresarás a un período de prueba gratuito de 14 días. Durante este tiempo, podrás explorar todas las funciones sin ningún compromiso.',
          },
          {
            id: 'q5',
            question: '¿Qué sucede después de que finaliza la prueba gratuita?',
            answer:
              'Después de la prueba gratuita de 14 días, se le pedirá que se suscriba para tener acceso continuo a las delicias. Le enviaremos recordatorios a medida que el período de prueba se acerque a su fin. Si decides no continuar, el bot no estará disponible para ti.',
          },
          {
            id: 'q6',
            question: '¿Cómo me suscribo después de la prueba gratuita?',
            answer:
              'Para suscribirte, serás dirigido a una página segura donde podrás ingresar los datos de tu tarjeta de crédito. Después del pago, tendrás acceso ininterrumpido a las golosinas. Usamos Lemon squeeze, un proveedor de pago seguro.',
          },
        ],
      },
      cta: {
        title: 'Simplifica tus finanzas',
        subtitle: 'Empieza a registrar tus gastos hoy',
        description:
          'Apolo es un bot de WhatsApp diseñado para un seguimiento de gastos sin esfuerzo. Puedes chatear con el bot con tus propias palabras, como "Gasté 20 dólares en una chaqueta", y registrará el monto, la descripción y clasificará el gasto por ti.',
        cta: 'Pruebalo ahora - Registra 10 gastos gratis',
        ctalink:
          'https://wa.me/51977504342?text=Hola!!%20Quiero%20empezar%20a%20registrar%20mis%20gastos%20con%20treats.',
      },
      footer: {
        solutions: {
          title: 'Soluciones',
          items: [
            {
              name: 'Registro de gastos con WhatsApp',
              link: `${env.NEXT_PUBLIC_URL}/es/#product`,
            },
            {
              name: 'Clasificación automática de gastos',
              link: `${env.NEXT_PUBLIC_URL}/es/#product`,
            },
            {
              name: 'Panel de control de gastos',
              link: `${env.NEXT_PUBLIC_URL}/es/#product`,
            },
          ],
        },
        support: {
          title: 'Soporte',
          items: [
            {
              name: 'Precios',
              link: `${env.NEXT_PUBLIC_URL}/es/#pricing`,
            },
            {
              name: 'Preguntas frecuentes',
              link: `${env.NEXT_PUBLIC_URL}/es/#faqs`,
            },
          ],
        },
        legal: {
          title: 'Legal',
          items: [
            {
              name: 'Política de privacidad',
              link: `${env.NEXT_PUBLIC_URL}/privacy.html`,
            },
            {
              name: 'Términos de servicio',
              link: `${env.NEXT_PUBLIC_URL}/terms.html`,
            },
          ],
        },
        socials: {
          title: 'Síguenos en redes',
          items: [],
        },
      },
      navigation: [
        {
          name: 'Producto',
          link: `${env.NEXT_PUBLIC_URL}/es/#product`,
        },
        {
          name: 'Pricing',
          link: `${env.NEXT_PUBLIC_URL}/es/#pricing`,
        },
        {
          name: 'FAQs',
          link: `${env.NEXT_PUBLIC_URL}/es/#faqs`,
        },
      ],
    },
    layout: {
      tabs: {
        home: 'Home',
        billing: 'Facturación',
        log: 'Historial',
        budget: 'Presupuesto',
      },
      freeTrial: {
        title: 'Inicia tu prueba gratuita de 14 días',
        subtitle:
          'Puedes registrar hasta 10 gastos, luego de eso podrás suscribirte para continuar usando treats.',
        alert: 'Llevas EXPENSE_COUNT gastos registrados',
        ctaText: 'Iniciar periodo de prueba',
        ctaLoadingText: 'Preparando checkout',
      },
      subscriptionStatus: {
        active: {
          title: 'Tu suscripción está activa',
          subtitle:
            'Continúa registrando gastos y lleva un control de tus finanzas.',
          ctaText: 'Registrar nuevo gasto',
        },
        on_trial: {
          title: 'Tu prueba gratuita está activa',
          subtitle:
            'Continúa registrando gastos y lleva un control de tus finanzas.',
          ctaText: 'Registrar nuevo gasto',
        },
        paused: {
          title: 'Tu suscripción está pausada',
          subtitle:
            'Puedes reanudar tu suscripción en cualquier momento para continuar usando treats.',
          ctaText: 'Ir al portal de facturación',
        },
        past_due: {
          title: 'Tu suscripción está vencida',
          subtitle:
            'Puedes reanudar tu suscripción en cualquier momento para continuar usando treats.',
          ctaText: 'Ir al portal de facturación',
        },
        unpaid: {
          title: 'Tu suscripción está vencida',
          subtitle:
            'Puedes reanudar tu suscripción en cualquier momento para continuar usando treats.',
          ctaText: 'Ir al portal de facturación',
        },
        cancelled: {
          title: 'Tu suscripción está cancelada',
          subtitle:
            'Puedes reanudar tu suscripción en cualquier momento para continuar usando treats.',
          ctaText: 'Ir al portal de facturación',
        },
        expired: {
          title: 'Tu suscripción está vencida',
          subtitle:
            'Puedes reanudar tu suscripción en cualquier momento para continuar usando treats.',
          ctaText: 'Ir al portal de facturación',
        },
      },
    },
    home: {
      greeting: 'Hola',
      timeframe: 'Así van tus gastos de',
      total: 'Total',
      average: 'Gasto/RANGE promedio',
      totalList: 'Lista de gastos',
    },
    expenseList: {
      list: 'Lista',
      table: 'Tabla',
    },
    daterange: {
      timeframes: {
        'this-week': 'Esta semana',
        'this-month': 'Este mes',
        '7d': 'Últimos 7 días',
        '30d': 'Últimos 30 días',
        '3M': 'Últimos 3 meses',
        '6M': 'Últimos 6 meses',
        '1y': 'Último año',
      },
    },
    budget: {
      title: 'Presupuesto',
      empty: {
        title: 'Establece un presupuesto',
        subtitle:
          'Establece un presupuesto para controlar tus gastos, alcanzar metas financieras y tener una comprensión clara de tus gastos mensuales.',
        cta: 'Crear presupuesto',
      },
      existing: {
        title: 'Presupuesto restante para MASK días',
        spent: 'gastado',
        set: 'establecido',
        categories: 'Categorías',
        of: 'de',
        over: 'de más',
        left: 'restante',
        update: 'Actualizar',
        time: 'Presupuesto para',
        set_of: 'en categorías de',
        budget_per_category:
          'Puedes establecer un presupuesto para cada categoría.',
        cancel: 'Cancelar',
        updating: 'Actualizando',
      },
      blockDescription: (
        <p className="text-sm">
          El presupuesto es el proceso de crear un plan para gastar tu dinero.
          Este plan de gasto se llama presupuesto. <br /> <br /> Crear este plan
          de gasto te permite determinar de antemano si tendrás suficiente
          dinero para hacer las cosas que necesitas hacer o te gustaría hacer.
        </p>
      ),
    },
    needsWantsSavings: {
      title: '50/30/20 - Necesidades, Deseos, Ahorros',
      empty: {
        title: 'Establece una meta de necesidades, deseos y ahorros',
        subtitle: 'Controla tus gastos y alcanza tus objetivos financieros.',
        cta: 'Establecer metas',
      },
      existing: {
        time: 'Clasificación de Necesidades, deseos y ahorros para',
        update: 'Actualizar',
        cancel: 'Cancelar',
        updating: 'Actualizando',
        editByPercentage: 'Editar por porcentaje',
        editByAmount: 'Editar por cantidad',
        category: 'Categoria',
        amount: 'Monto',
      },
      table: {
        description: 'Descripción',
        budget: 'Presupuesto',
        actual: 'Real',
        needs: 'Necesidades',
        wants: 'Deseos',
        savings: 'Ahorros',
      },
      blockDescription: (
        <p className="text-sm">
          La regla 50/30/20 es una forma simple de presupuestar que no implica
          categorías detalladas de presupuesto. En lugar de eso, gastas el 50%
          de tus ingresos en necesidades, el 30% en deseos y el 20% en ahorros o
          pagar deudas.
        </p>
      ),
    },
    calendar: {
      title: 'Calendario',
      blockDescription: (
        <p className="text-sm">
          Un calendario muestra los días del mes, con fondos que varían según la
          cantidad de dinero gastado cada día. Esto te permite ver de un vistazo
          cuánto estás gastando cada día y planificar tus gastos en
          consecuencia.
        </p>
      ),
    },
    categories: {
      title: 'Categorías',
      blockDescription: (
        <p className="text-sm">
          Las categorías te ayudan a entender dónde va tu dinero. Este bloque te
          muestra un desglose de tus gastos por categoría.
        </p>
      ),
    },
    blocks: {
      historicalChart: {
        title: 'Grafico Historico',
        subtitle: 'Grafico historico de tus gastos',
      },
      expenseList: {
        title: 'Lista de Gastos',
        subtitle: 'Lista de gastos del mes',
      },
      calendarPonderation: {
        title: 'Calendario',
      },
      budget: {
        title: 'Presupuesto',
        subtitle: 'Presupuesto del mes',
      },
      needsWantsSavingsTable: {
        title: 'Necesidades, Deseos y Ahorros',
        subtitle: 'Tabla de Necesidades, Deseos y Ahorros',
      },
      needsWantsSavingsDonut: {
        title: 'Necesidades, Deseos y Ahorros',
        subtitle: 'Donut de Necesidades, Deseos y Ahorros',
      },
      categoriesDonutTable: {
        title: 'Categorias',
        subtitle: 'Donut de Categorias',
      },
    },
    addBlock: {
      cta: 'Agregar bloque',
      title: 'Personaliza tu panel financiero',
      description: 'Agrega los bloques que mejor se adapten a tus necesidades',
    },
    addExpense: {
      title: 'Cuéntanos sobre tu gasto',
      description:
        'La IA te ayudará a categorizar tu gasto, establecer el monto y agregar una nota.',
      placeholder: 'Ejemplo: Gasté $20 en comestibles',
      cancel: 'Cancelar',
      add: 'Agregar gasto',
      adding: 'Agregando gasto',
    },
  },
  en: {
    landing: {
      hero: {
        headline:
          'Take control of your finances with our easy-to-use WhatsApp expense tracker',
        subheading:
          'Simplify your finances using natural language. Track expenses seamlessly with our AI-powered WhatsApp bot',
        cta: 'Start tracking expenses',
        ctaLink:
          'https://wa.me/51977504342?text=Hi!!%20How%20can%20I%20start%20to%20use%20treats?',
        secondaryCta: 'Learn more',
        secondaryCtaLink: `${env.NEXT_PUBLIC_URL}/#product`,
        login: 'Login',
        loginLink: `${env.NEXT_PUBLIC_URL}/en/home`,
      },
      problem: {
        title: 'Losing track of your spending?',
        subheading: 'Start tracking your expenses today',
        body: 'Tired of juggling multiple apps and spreadsheets to track your expenses? Our WhatsApp expense tracker makes it easy to keep up with your spending habits',
      },
      solution: {
        title: 'Simplify expense tracking with our WhatsApp bot.',
        features: [
          {
            icon: ChatBubbleLeftEllipsisIcon,
            name: 'Expense Registration in Natural Language.',
            description:
              'Use the chat to add expenses, such as "I spent $20 on groceries" or "Paid $50 for a haircut."',
          },
          {
            icon: CloudArrowUpIcon,
            name: 'Automated Classification into Categories.',
            description:
              'Our AI-powered bot automatically categorizes your expenses for easy analysis.',
          },
          {
            icon: ChartBarIcon,
            name: 'Dashboard Overview with Custom Time Ranges.',
            description:
              'Get a clear overview of your spending habits with our interactive dashboards.',
          },
          {
            icon: ArrowPathIcon,
            name: 'Real-time Expense Insights.',
            description: 'Track expenses in real time with our WhatsApp bot.',
          },
        ],
        cta: 'Try It Now - Register 10 Expenses for Free',
      },
      pricing: {
        title: 'Pricing Plans',
        description:
          'Simple. Affordable. Effortless expense tracking for everyone.',
        plans: [
          {
            id: 'monthly',
            mostPopular: true,
            name: 'Monthly',
            price: '$4.99',
            description:
              'Register 10 expenses for free then start the 14-Day Free Trial',
            features: [
              'Expense Registration in Natural Language',
              'Automated Classification into Categories',
              'Dashboard Overview with Custom Time Ranges',
              'Real-time Expense Insights',
            ],
            cta: 'Track your first expense',
            ctalink:
              'https://wa.me/51977504342?text=Hi!!%20How%20can%20I%20start%20to%20use%20treats?',
          },
        ],
      },
      faqs: {
        title: 'Frequently Asked Questions',
        items: [
          {
            id: 'q1',
            question: 'What is treats, and how does it work?',
            answer:
              'Apolo is a WhatsApp bot designed for effortless expense tracking. You can simply chat with the bot in natural language, like "I spent 20 dollars on a jacket," and it will register the amount, description, and categorize the expense for you.',
          },
          {
            id: 'q2',
            question:
              'How does treats classify expenses using natural language?',
            answer:
              'Apolo utilizes AI to understand and classify expenses based on natural language input. The system is trained to recognize patterns and context, ensuring accurate categorization.',
          },
          {
            id: 'q3',
            question: 'How do I access my expense overview and dashboard?',
            answer:
              'You can login [here] with your mobile phone to view a comprehensive overview of your expenses, categorized charts, and a list of your transactions.',
            link: `${env.NEXT_PUBLIC_URL}/en/home`,
          },
          {
            id: 'q4',
            question: 'How does the 14-day free trial work?',
            answer:
              "You can start registering expenses for free and after the 10th expense is added, you'll enter a 14-day free trial period. During this time, you can explore all the features without any commitment.",
          },
          {
            id: 'q5',
            question: 'What happens after the free trial ends?',
            answer:
              "After the 14-day free trial, you will be prompted to subscribe for continued access to treats. We'll send reminders as the trial period approaches its end. If you decide won’t continue, the bot won’t be available for you.",
          },
          {
            id: 'q6',
            question: 'How do I subscribe after the free trial?',
            answer:
              "To subscribe, you'll be directed to a secure page where you can enter your credit card details. After payment, you'll have uninterrupted access to treats. We use Lemon squeeze, a secure payment provider.",
          },
        ],
      },
      cta: {
        title: 'Simplify your finances',
        subtitle: 'Start tracking your expenses today',
        description:
          "Apolo is a WhatsApp bot designed for effortless expense tracking. You can simply chat with the bot in natural language, like 'I spent 20 dollars on a jacket,' and it will register the amount, description, and categorize the expense for you.",
        cta: 'Try It Now - Register 10 Expenses for Free',
        ctalink:
          'https://wa.me/51977504342?text=Hi!!%20How%20can%20I%20start%20to%20use%20treats?',
      },
      footer: {
        solutions: {
          title: 'Solutions',
          items: [
            {
              name: 'Expense Tracking with WhatsApp',
              link: `${env.NEXT_PUBLIC_URL}/#product`,
            },
            {
              name: 'Automated Expense Classification',
              link: `${env.NEXT_PUBLIC_URL}/#product`,
            },
            {
              name: 'Expense Dashboard',
              link: `${env.NEXT_PUBLIC_URL}/#product`,
            },
          ],
        },
        support: {
          title: 'Support',
          items: [
            {
              name: 'Pricing',
              link: `${env.NEXT_PUBLIC_URL}/#pricing`,
            },
            {
              name: 'FAQs',
              link: `${env.NEXT_PUBLIC_URL}/#faqs`,
            },
          ],
        },
        legal: {
          title: 'Legal',
          items: [
            {
              name: 'Privacy Policy',
              link: `${env.NEXT_PUBLIC_URL}/privacy.html`,
            },
            {
              name: 'Terms of Service',
              link: `${env.NEXT_PUBLIC_URL}/terms.html`,
            },
          ],
        },
        socials: {
          title: 'Follow us',
          items: [],
        },
      },
      navigation: [
        {
          name: 'Product',
          link: `${env.NEXT_PUBLIC_URL}/#product`,
        },
        {
          name: 'Pricing',
          link: `${env.NEXT_PUBLIC_URL}/#pricing`,
        },
        {
          name: 'FAQs',
          link: `${env.NEXT_PUBLIC_URL}/#faqs`,
        },
      ],
    },
    layout: {
      tabs: {
        home: 'Home',
        billing: 'Billing',
        log: 'Log',
        budget: 'Budget',
      },
      freeTrial: {
        title: 'Start your 14-day free trial',
        subtitle:
          'You can register up to 10 expenses, after that you can subscribe to continue using treats.',
        alert: 'You have EXPENSE_COUNT expenses registered',
        ctaText: 'Start free trial',
        ctaLoadingText: 'Preparing checkout',
      },
      subscriptionStatus: {
        active: {
          title: 'Your subscription is active',
          subtitle:
            'Continue tracking expenses and keep up with your finances.',
          ctaText: 'Register new expense',
        },
        on_trial: {
          title: 'Your free trial is active',
          subtitle:
            'Continue tracking expenses and keep up with your finances.',
          ctaText: 'Register new expense',
        },
        paused: {
          title: 'Your subscription is paused',
          subtitle:
            'You can resume your subscription at any time to continue using treats.',
          ctaText: 'Go to billing portal',
        },
        past_due: {
          title: 'Your subscription is past due',
          subtitle:
            'You can resume your subscription at any time to continue using treats.',
          ctaText: 'Go to billing portal',
        },
        unpaid: {
          title: 'Your subscription is unpaid',
          subtitle:
            'You can resume your subscription at any time to continue using treats.',
          ctaText: 'Go to billing portal',
        },
        cancelled: {
          title: 'Your subscription is cancelled',
          subtitle:
            'You can resume your subscription at any time to continue using treats.',
          ctaText: 'Go to billing portal',
        },
        expired: {
          title: 'Your subscription is expired',
          subtitle:
            'You can resume your subscription at any time to continue using treats.',
          ctaText: 'Go to billing portal',
        },
      },
    },
    home: {
      greeting: 'Hello',
      timeframe: 'This is your spending for',
      total: 'Total',
      average: 'Average spending per RANGE',
      totalList: 'List of expenses',
    },
    expenseList: {
      list: 'List',
      table: 'Table',
    },
    daterange: {
      timeframes: {
        'this-week': 'This week',
        'this-month': 'This month',
        '7d': 'Last 7 days',
        '30d': 'Last 30 days',
        '3M': 'Last 3 months',
        '6M': 'Last 6 months',
      },
    },
    budget: {
      title: 'Budget',
      empty: {
        title: 'Set a budget',
        subtitle:
          'Set a budget to control your spending, achieve financial goals, and gain a clear understanding of your monthly expenses.',
        cta: 'Create budget',
      },
      existing: {
        title: 'Budget left for MASK days',
        spent: 'spent',
        set: 'set budget',
        categories: 'Categories',
        of: 'of',
        over: 'over',
        left: 'left',
        update: 'Update',
        time: 'Budget for',
        set_of: 'in categories of',
        budget_per_category: 'You can set a budget for each category.',
        cancel: 'Cancel',
        updating: 'Updating',
      },
      blockDescription: (
        <p className="text-sm">
          Budgeting is the process of creating a plan to spend your money. This
          spending plan is called a budget. <br /> <br /> Creating this spending
          plan allows you to determine in advance whether you will have enough
          money to do the things you need to do or would like to do.
        </p>
      ),
    },
    needsWantsSavings: {
      title: '50/30/20 - Needs, Wants, Savings',
      empty: {
        title: 'Set a Needs, Wants, and Savings goal',
        subtitle:
          'Control your spending and achieve your financial objectives.',
        cta: 'Set goals',
      },
      existing: {
        time: 'Classification of Needs, Wants and Savings for',
        update: 'Update',
        cancel: 'Cancel',
        updating: 'Updating',
        editByPercentage: 'Edit by percentage',
        editByAmount: 'Edit by amount',
        category: 'Category',
        amount: 'Amount',
      },
      table: {
        description: 'Description',
        budget: 'Budget',
        actual: 'Actual',
        needs: 'Needs',
        wants: 'Wants',
        savings: 'Savings',
      },
      blockDescription: (
        <p className="text-sm">
          The 50/30/20 rule is a simple way to budget that doesn’t involve
          detailed budgeting categories. Instead, you spend 50% of your income
          on needs, 30% on wants, and 20% on savings or paying off debt.
        </p>
      ),
    },
    calendar: {
      title: 'Calendar',
      blockDescription: (
        <p className="text-sm">
          A calendar displays the days of the month, with backgrounds varying
          based on the amount of money spent each day. This allows you to see at
          a glance how much you are spending each day, and to plan your spending
          accordingly.
        </p>
      ),
    },
    categories: {
      title: 'Categories',
      blockDescription: (
        <p className="text-sm">
          Categories help you to understand where your money is going. This
          block shows you a breakdown of your spending by category.
        </p>
      ),
    },
    blocks: {
      historicalChart: {
        title: 'Historical Chart',
        subtitle: 'Historical chart of your expenses',
      },
      expenseList: {
        title: 'Expense List',
        subtitle: 'List of expenses for the month',
      },
      calendarPonderation: {
        title: 'Calendar',
      },
      budget: {
        title: 'Budget',
        subtitle: 'Budget for the month',
      },
      needsWantsSavingsTable: {
        title: 'Needs, Wants and Savings',
        subtitle: 'Needs, Wants and Savings table',
      },
      needsWantsSavingsDonut: {
        title: 'Needs, Wants and Savings',
        subtitle: 'Needs, Wants and Savings donut',
      },
      categoriesDonutTable: {
        title: 'Categories',
        subtitle: 'Categories donut',
      },
    },
    addBlock: {
      cta: 'Add block',
      title: 'Customize your financial dashboard',
      description: 'Add the blocks that best fit your needs',
    },
    addExpense: {
      title: 'Tell us about your expense',
      description:
        'The AI will help you categorize your expense, set the amount, and add a note.',
      placeholder: 'I spent $50 on groceries',
      cancel: 'Cancel',
      add: 'Add Expense',
      adding: 'Adding Expense',
    },
  },
};

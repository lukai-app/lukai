'use client';
import { getWhatsappBotLinkWithMessage } from '@/lib/constants/chat';

const templates = [
  {
    id: 1,
    img: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/hamburger-82s0wuWab90KQSshFoj2ZTDfK6Ij0q.png',
    name: '10 USD en delivery',
    message: 'gasté 10 dólares en delivery',
  },
  {
    id: 2,
    img: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/hamburger-82s0wuWab90KQSshFoj2ZTDfK6Ij0q.png',
    name: '6 USD en un Starbucks',
    message: 'gasté 6 dólares en un Starbucks',
  },
  {
    id: 3,
    img: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/shopping_trolley-cQNOSlcRRHPAheKqKd7KnLQiY1e6o2.png',
    name: '15 USD en mercado',
    message: 'gasté 15 dólares en mercado',
  },
  {
    id: 4,
    img: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/credit_card-kiT3BFuC6ki9kopeM7Fo2PNNxHa1kw.png',
    name: '2.99 USD en apolo',
    message: 'gasté 2.99 dólares en apolo',
  },
  {
    id: 5,
    name: '8 USD en gym',
    img: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/muscle-SMLruS5loloiwgGOMTEaL5S72kr3Jg.png',
    message: 'gasté 8 dólares en gym',
  },
  {
    id: 6,
    name: '20 USD en salida con amigos',
    img: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/tada-J4pcxudLwKCGZp3HqgaE6XMrn6Reng.png',
    message: 'gasté 20 dólares en salida con amigos',
  },
  {
    id: 7,
    name: '100 USD en alquiler',
    img: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/old_key-8Rfvoz4VIBvRCuKDdxLcIf52WN0Ieb.png',
    message: 'gasté 100 dólares en alquiler',
  },
  {
    id: 8,
    name: '12 USD en transporte',
    img: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/car-KKxtTOP42UWJT68Ta6iXQmtwbDpIHg.png',
    message: 'gasté 12 dólares en transporte',
  },
  {
    id: 9,
    name: '30 USD en compras online',
    img: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/robot_face-QVMfhJw45KtEztyodmBMqV5hvuKuQj.png',
    message: 'gasté 30 dólares en compras online',
  },
  {
    id: 10,
    name: '50 USD en ahorro',
    img: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/moneybag-mK3VMjkOsId6JH47qQvGvJeAgd9jnR.png',
    message: 'gasté 50 dólares en ahorro',
  },
];

export const PrefilledTemplates: React.FC = () => {
  // Get template with id 4
  const template4 = templates.find((t) => t.id === 4)!;

  // Get other templates excluding id 4
  const otherTemplates = templates.filter((t) => t.id !== 4);

  // Randomly select 3 templates
  const randomTemplates = [...otherTemplates]
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  // Combine template4 with random templates
  const selectedTemplates = [template4, ...randomTemplates];

  return (
    <div className="flex gap-2.5 flex-wrap justify-center">
      {selectedTemplates.map((template) => (
        <button
          key={template.id}
          onClick={() => {
            window.open(
              getWhatsappBotLinkWithMessage(template.message),
              '_blank'
            );
          }}
          className="duration-125 text-xs flex shrink-0 cursor-pointer items-center gap-1 rounded-full bg-[#272725] px-4 py-2 transition-colors ease-in-out hover:border-[#272725] border-[#40403F]"
        >
          <img
            src={template.img}
            alt={template.name}
            className="w-4 h-4 mb-[2px]"
          />
          {template.name}
        </button>
      ))}
    </div>
  );
};

import { MenuItemType } from '@paljs/ui/types';

const items: MenuItemType[] = [
  {
    title: 'Home Page',
    icon: { name: 'home' },
    link: { href: '/dashboard' },
  },
  {
    title: 'Mensagens',
    icon: { name: 'star-outline' },
    children: [
      {
        title: 'Chat',
        link: { href: '/extra-components/chat' },
      },
      {
        title: 'Histórico de Mensagens',
        link: { href: '/extra-components/cards' },
      }
    ],
  },
];

export default items;

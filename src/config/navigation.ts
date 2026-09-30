/**
 * One nav tree for Hilton Family Law — header, footer, and practice promo band.
 */

export interface NavLink {
  label: string;
  href: string;
  description?: string;
  /** astro-icon name, e.g. 'lucide:wrench'. */
  icon?: string;
  /** Open in new tab (external). */
  external?: boolean;
}

export interface MegaColumn {
  heading?: string;
  links: NavLink[];
}

export interface MegaPanel {
  kind: 'mega';
  columns: MegaColumn[];
  featured?: {
    title: string;
    body: string;
    href: string;
    cta: string;
  };
}

export interface LinkListPanel {
  kind: 'links';
  links: NavLink[];
}

export interface NavItem {
  label: string;
  /** Present when the top-level item is itself a destination. */
  href?: string;
  panel?: MegaPanel | LinkListPanel;
}

export interface NavigationConfig {
  primary: NavItem[];
  /** Right-hand call to action in the header. */
  cta?: { label: string; href: string };
  /** Recurring “Areas of Practice” umbrella band (home + interior). */
  practicePromo: NavLink[];
  footer: { heading: string; links: NavLink[] }[];
  legal: NavLink[];
}

const services: NavLink[] = [
  { label: 'Child Custody', href: '/services/child-custody/' },
  {
    label: 'Child Support and Spousal Support',
    href: '/services/child-and-spousal-support/',
  },
  { label: 'Property Division', href: '/services/property-division/' },
  { label: 'Retirement', href: '/services/retirement/' },
  { label: 'Domestic Violence', href: '/services/domestic-violence/' },
  { label: 'Modifications', href: '/services/modifications/' },
  { label: 'Enforcement', href: '/services/enforcement/' },
  { label: 'Set Asides', href: '/services/set-asides/' },
];

export const navigation: NavigationConfig = {
  primary: [
    { label: 'Home', href: '/' },
    {
      label: 'Our Lawyers',
      panel: {
        kind: 'links',
        links: [
          { label: 'Amy Hilton', href: '/our-lawyers/amy-hilton/' },
          { label: 'Hemma Gill', href: '/our-lawyers/hemma-gill/' },
        ],
      },
    },
    {
      label: 'Areas Of Practice',
      panel: {
        kind: 'links',
        links: services,
      },
    },
    { label: 'News', href: '/news/' },
    { label: 'Endorsements', href: '/endorsements/' },
    { label: 'Contact', href: '/contact/' },
  ],

  cta: { label: 'Contact', href: '/contact/' },

  practicePromo: [
    { label: 'Custody and Visitation', href: '/services/child-custody/' },
    {
      label: 'Child Support and Paternity',
      href: '/services/child-and-spousal-support/',
    },
    { label: 'Property Division', href: '/services/property-division/' },
    { label: 'Domestic Violence', href: '/services/domestic-violence/' },
  ],

  footer: [
    {
      heading: 'Main Menu',
      links: [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/our-lawyers/amy-hilton/' },
        { label: 'News', href: '/news/' },
        { label: 'Contact', href: '/contact/' },
        { label: 'Endorsements', href: '/endorsements/' },
      ],
    },
    {
      heading: 'Areas of Practice',
      links: [
        { label: 'Child Custody and Visitation', href: '/services/child-custody/' },
        {
          label: 'Child Support and Paternity',
          href: '/services/child-and-spousal-support/',
        },
        { label: 'Domestic Violence', href: '/services/domestic-violence/' },
        { label: 'Property Division', href: '/services/property-division/' },
      ],
    },
    {
      heading: '',
      links: [
        { label: 'Retirement', href: '/services/retirement/' },
        {
          label: 'Modifications of Child Custody',
          href: '/services/modifications/',
        },
        { label: 'Enforcement of agreements', href: '/services/enforcement/' },
        { label: 'Set Asides', href: '/services/set-asides/' },
      ],
    },
  ],

  legal: [],
};

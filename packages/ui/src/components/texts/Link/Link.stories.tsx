import { Meta, StoryObj } from '@storybook/react';
import { Link } from './Link';

const config = {
  title: 'Components/Texts/Link',
  component: Link,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: {
        type: 'text',
      },
      description: 'Link text content',
    },
    href: {
      control: {
        type: 'text',
      },
      description: 'Link destination URL',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'muted'],
      description: 'Link variant style',
    },
    isExternal: {
      control: {
        type: 'boolean',
      },
      description: 'Whether to open link in new tab',
    },
    disabled: {
      control: {
        type: 'boolean',
      },
      description: 'Disabled state',
    },
  },
} satisfies Meta<typeof Link>;
export default config;

type Story = StoryObj<typeof config>;
export const Basic: Story = {
  args: {
    children: 'Google',
    href: 'https://www.google.com',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Google',
    href: 'https://www.google.com',
    variant: 'secondary',
  },
};

export const Muted: Story = {
  args: {
    children: 'Google',
    href: 'https://www.google.com',
    variant: 'muted',
  },
};

export const External: Story = {
  args: {
    children: 'Google',
    href: 'https://www.google.com',
    isExternal: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Google',
    href: 'https://www.google.com',
    disabled: true,
  },
};

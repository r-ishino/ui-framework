import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
      description: 'Button variant style',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    children: {
      control: 'text',
      description: 'Button text content',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Medium Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const AllVariants: Story = {
  args: {
    children: 'Button',
  },
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  args: {
    children: 'Button',
  },
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

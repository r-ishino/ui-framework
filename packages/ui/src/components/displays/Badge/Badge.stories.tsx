import { Meta } from '@storybook/react';
import { ReactNode } from 'react';
import { Badge } from './Badge';

const meta = {
  title: 'Components/Displays/Badge',
  component: Badge,
} satisfies Meta<typeof Badge>;
export default meta;

export const Basic = (): ReactNode => <Badge>ラベル</Badge>;

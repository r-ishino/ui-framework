import type { ReactElement, ReactNode } from 'react';
import { css, cx } from '@linaria/core';
import { styled } from '@linaria/react';
import type { HTMLAttributes } from 'react';
import { borderRadius, color } from '../../../tokens';

export type BadgeProps = {
  frontIcon?: ReactNode;
  important?: boolean;
  children: string;
} & HTMLAttributes<HTMLSpanElement>;

const BadgeSpan = styled.span`
  display: inline-flex;
  min-width: fit-content;
  padding: 4px;
  justify-content: center;
  align-items: center;
  font-size: 0.75rem;
  line-height: 1;
  border-radius: ${borderRadius.s};
`;

const normalStyle = css`
  color: ${color.gray800};
  background-color: ${color.white};
  border: 1px solid ${color.border};
`;

const importantStyle = css`
  color: ${color.primaryBlueGray};
  background-color: ${color.primaryBlueGray100};
  border: 1px solid ${color.primaryBlueGray100};
`;

export const Badge = ({
  important = false,
  children,
  className,
  ...props
}: BadgeProps): ReactElement => (
  <BadgeSpan
    className={cx(important ? importantStyle : normalStyle, className)}
    {...props}
  >
    {children}
  </BadgeSpan>
);

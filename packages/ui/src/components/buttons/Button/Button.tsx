'use client';

import { css, cx } from '@linaria/core';
import { useState } from 'react';
import type {
  ComponentProps,
  MouseEvent,
  ReactElement,
  ReactNode,
} from 'react';

export type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
} & ComponentProps<'button'>;

const baseButton = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Variants
const primaryVariant = css`
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;

  &:hover:not(:disabled) {
    background-color: #2563eb;
  }

  &:active:not(:disabled) {
    background-color: #1d4ed8;
  }
`;

const secondaryVariant = css`
  background-color: #6b7280;
  color: white;
  border-color: #6b7280;

  &:hover:not(:disabled) {
    background-color: #4b5563;
  }

  &:active:not(:disabled) {
    background-color: #374151;
  }
`;

const outlineVariant = css`
  background-color: transparent;
  color: #3b82f6;
  border-color: #3b82f6;

  &:hover:not(:disabled) {
    background-color: #eff6ff;
  }

  &:active:not(:disabled) {
    background-color: #dbeafe;
  }
`;

// Sizes
const smallSize = css`
  padding: 6px 12px;
  font-size: 14px;
`;

const mediumSize = css`
  padding: 8px 16px;
  font-size: 16px;
`;

const largeSize = css`
  padding: 12px 24px;
  font-size: 18px;
`;

const variantStyles = {
  primary: primaryVariant,
  secondary: secondaryVariant,
  outline: outlineVariant,
};

const sizeStyles = {
  sm: smallSize,
  md: mediumSize,
  lg: largeSize,
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  onClick: _onClick,
  ...props
}: ButtonProps): ReactElement => {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async (
    event: MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    setIsLoading(true);
    await _onClick?.(event);
    setIsLoading(false);
  };

  return (
    <button
      className={cx(
        baseButton,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

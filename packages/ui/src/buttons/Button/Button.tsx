import { styled } from '@linaria/react';
import type { ComponentProps, ReactNode } from 'react';

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

interface StyledButtonProps {
  $variant: string;
  $size: string;
}

const StyledButton = styled.button<StyledButtonProps>`
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

  /* Variants */
  ${(props: StyledButtonProps) =>
    props.$variant === 'primary'
      ? `
    background-color: #3b82f6;
    color: white;
    border-color: #3b82f6;

    &:hover:not(:disabled) {
      background-color: #2563eb;
    }

    &:active:not(:disabled) {
      background-color: #1d4ed8;
    }
  `
      : ''}

  ${(props: StyledButtonProps) =>
    props.$variant === 'secondary'
      ? `
    background-color: #6b7280;
    color: white;
    border-color: #6b7280;

    &:hover:not(:disabled) {
      background-color: #4b5563;
    }

    &:active:not(:disabled) {
      background-color: #374151;
    }
  `
      : ''}

  ${(props: StyledButtonProps) =>
    props.$variant === 'outline'
      ? `
    background-color: transparent;
    color: #3b82f6;
    border-color: #3b82f6;

    &:hover:not(:disabled) {
      background-color: #eff6ff;
    }

    &:active:not(:disabled) {
      background-color: #dbeafe;
    }
  `
      : ''}

  /* Sizes */
  ${(props: StyledButtonProps) =>
    props.$size === 'sm'
      ? `
    padding: 6px 12px;
    font-size: 14px;
  `
      : ''}

  ${(props: StyledButtonProps) =>
    props.$size === 'md'
      ? `
    padding: 8px 16px;
    font-size: 16px;
  `
      : ''}

  ${(props: StyledButtonProps) =>
    props.$size === 'lg'
      ? `
    padding: 12px 24px;
    font-size: 18px;
  `
      : ''}
`;

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  ref,
  ...props
}: ButtonProps) {
  return (
    <StyledButton ref={ref} $variant={variant} $size={size} {...props}>
      {children}
    </StyledButton>
  );
}

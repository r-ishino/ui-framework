'use client';

import React from 'react';
import { css, cx } from '@linaria/core';
import { color } from '../../../tokens';

type Variant = 'primary' | 'secondary' | 'muted';
export type LinkProps = {
  variant?: Variant;
  customLink?: React.ReactElement<
    React.AnchorHTMLAttributes<HTMLAnchorElement>
  >;
  isExternal?: boolean;
  href: string;
  disabled?: boolean;
  frontIcon?: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

const linkStyle = css`
  overflow-wrap: anywhere;
  word-break: normal;
  line-break: strict;
  line-height: 1.6;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const variantStyles = {
  primary: css`
    color: ${color.semanticLink};
    &:hover {
      color: ${color.semanticLink500};
      text-decoration: underline;
    }
  `,
  secondary: css`
    color: ${color.gray700};
    text-decoration: underline;
    text-decoration-color: ${color.gray500};
    &:hover {
      color: ${color.gray600};
    }
  `,
  muted: css`
    color: ${color.subText};
    &:hover {
      color: ${color.gray700};
    }
  `,
} as const satisfies {
  [key in Variant]: string;
};

const disabledStyle = css`
  opacity: 0.4;
  color: ${color.semanticLink};
  &:hover {
    color: ${color.semanticLink};
    text-decoration: none;
    cursor: default;
  }
`;

export const Link: React.FC<LinkProps> = ({
  variant = 'primary',
  className,
  customLink,
  children,
  href,
  onClick,
  disabled,
  tabIndex,
  ...props
}: LinkProps) => {
  const childrenDom = <>{children}</>;
  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ): void => {
    if (disabled) {
      e.preventDefault();
    }
    if (onClick != null) onClick(e);
  };
  const classNames: string = cx(
    className,
    linkStyle,
    variantStyles[variant],
    disabled && disabledStyle
  );
  if (customLink !== undefined) {
    return React.cloneElement<React.AnchorHTMLAttributes<HTMLAnchorElement>>(
      customLink,
      {
        className: classNames,
        children: childrenDom,
        onClick: handleClick,
        tabIndex: disabled ? -1 : tabIndex,
        'aria-disabled': disabled,
        ...props,
      }
    );
  }
  return (
    <a
      aria-disabled={disabled}
      className={classNames}
      href={href}
      onClick={handleClick}
      tabIndex={disabled ? -1 : tabIndex}
      {...props}
    >
      {childrenDom}
    </a>
  );
};
